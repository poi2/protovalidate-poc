package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"buf.build/go/protovalidate"
	"connectrpc.com/connect"
	"connectrpc.com/grpcreflect"
	userv1 "github.com/poi2/protovalidate-poc/go/gen/user/v1"
	"github.com/poi2/protovalidate-poc/go/gen/user/v1/userv1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
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

func (s *userServer) CreateUser(
	ctx context.Context,
	req *connect.Request[userv1.CreateUserRequest],
) (*connect.Response[userv1.CreateUserResponse], error) {
	// Validate the request
	if err := s.validator.Validate(req.Msg); err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
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
