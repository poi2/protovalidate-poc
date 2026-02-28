package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"buf.build/go/protovalidate"
	"connectrpc.com/connect"
	"connectrpc.com/grpcreflect"
	userv1 "github.com/poi2/protovalidate-poc/go/gen/user/v1"
	"github.com/poi2/protovalidate-poc/go/gen/user/v1/userv1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// userServer implements the UserService
type userServer struct {
	validator protovalidate.Validator
}

func newUserServer() (*userServer, error) {
	validator, err := protovalidate.New()
	if err != nil {
		return nil, fmt.Errorf("failed to create validator: %w", err)
	}
	return &userServer{
		validator: validator,
	}, nil
}

// toReasonCode converts protovalidate rule_id to Google API standard UPPER_SNAKE_CASE
// e.g., "string.min_len" -> "STRING_MIN_LEN", "password_match" -> "PASSWORD_MATCH"
func toReasonCode(ruleID string) string {
	if ruleID == "" {
		return ""
	}
	// Replace dots with underscores and convert to uppercase
	s := strings.ReplaceAll(ruleID, ".", "_")
	return strings.ToUpper(s)
}

func (s *userServer) handleValidationError(err error) error {
	// protovalidateのValidationErrorを詳細に解析
	connectErr := connect.NewError(connect.CodeInvalidArgument, err)

	// ValidationErrorから詳細を取得
	if valErr, ok := err.(*protovalidate.ValidationError); ok {
		// BadRequestとして詳細を構造化
		// ref: https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto
		badReq := &errdetails.BadRequest{}

		for _, violation := range valErr.Violations {
			if violation.Proto == nil {
				continue
			}

			fieldPath := ""
			if violation.Proto.Field != nil {
				// Field pathからフィールド名を取得
				for _, elem := range violation.Proto.Field.Elements {
					if elem.FieldName != nil {
						if fieldPath != "" {
							fieldPath += "."
						}
						fieldPath += *elem.FieldName
					}
				}
			}

			message := ""
			if violation.Proto.Message != nil {
				message = *violation.Proto.Message
			}

			ruleId := ""
			if violation.Proto.RuleId != nil {
				ruleId = *violation.Proto.RuleId
			}

			fieldViolation := &errdetails.BadRequest_FieldViolation{
				Field:       fieldPath,
				Description: message,
				Reason:      toReasonCode(ruleId), // Convert to UPPER_SNAKE_CASE
			}
			badReq.FieldViolations = append(badReq.FieldViolations, fieldViolation)
		}

		// エラー詳細を追加
		if detail, err := connect.NewErrorDetail(badReq); err == nil {
			connectErr.AddDetail(detail)
		}
	}

	return connectErr
}

func (s *userServer) CreateUser(
	ctx context.Context,
	req *connect.Request[userv1.CreateUserRequest],
) (*connect.Response[userv1.CreateUserResponse], error) {
	// Validate the request
	if err := s.validator.Validate(req.Msg); err != nil {
		return nil, s.handleValidationError(err)
	}

	// Create a new user (simplified - in real app, would save to DB)
	now := timestamppb.New(time.Now())
	user := &userv1.User{
		Id:        "user-123", // In real app, would generate a proper ID
		Name:      req.Msg.Name,
		Email:     req.Msg.Email,
		CreatedAt: now,
		UpdatedAt: now,
	}

	return connect.NewResponse(&userv1.CreateUserResponse{
		User: user,
	}), nil
}

func main() {
	server, err := newUserServer()
	if err != nil {
		log.Fatalf("failed to create server: %v", err)
	}

	mux := http.NewServeMux()
	path, handler := userv1connect.NewUserServiceHandler(server)
	mux.Handle(path, handler)

	// Add gRPC reflection
	reflector := grpcreflect.NewStaticReflector(
		"user.v1.UserService",
	)
	mux.Handle(grpcreflect.NewHandlerV1(reflector))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))

	addr := ":8080"
	log.Printf("Server listening on %s", addr)
	log.Printf("Supports both gRPC and Connect protocols over HTTP/2")

	// Use h2c (HTTP/2 Cleartext) to support gRPC without TLS
	h2s := &http2.Server{}
	h1s := &http.Server{
		Addr:    addr,
		Handler: h2c.NewHandler(mux, h2s),
	}

	if err := h1s.ListenAndServe(); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
