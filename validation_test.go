package main

import (
	"testing"

	"buf.build/go/protovalidate"
	userv1 "github.com/poi2/protovalidate-poc/go/gen/user/v1"
)

func TestCreateUserRequest_Valid(t *testing.T) {
	validator, err := protovalidate.New()
	if err != nil {
		t.Fatalf("failed to create validator: %v", err)
	}

	tests := []struct {
		name    string
		request *userv1.CreateUserRequest
	}{
		{
			name: "valid request",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "john@example.com",
				Password:             "password123",
				PasswordConfirmation: "password123",
			},
		},
		{
			name: "long name",
			request: &userv1.CreateUserRequest{
				Name:                 "A very long name that is still within the 255 character limit",
				Email:                "test@example.com",
				Password:             "securepass",
				PasswordConfirmation: "securepass",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := validator.Validate(tt.request); err != nil {
				t.Errorf("expected valid request, got error: %v", err)
			}
		})
	}
}

func TestCreateUserRequest_Invalid_SingleField(t *testing.T) {
	validator, err := protovalidate.New()
	if err != nil {
		t.Fatalf("failed to create validator: %v", err)
	}

	tests := []struct {
		name        string
		request     *userv1.CreateUserRequest
		expectedErr string
	}{
		{
			name: "empty name",
			request: &userv1.CreateUserRequest{
				Name:                 "",
				Email:                "john@example.com",
				Password:             "password123",
				PasswordConfirmation: "password123",
			},
			expectedErr: "name",
		},
		{
			name: "name too long",
			request: &userv1.CreateUserRequest{
				Name:                 string(make([]byte, 256)),
				Email:                "john@example.com",
				Password:             "password123",
				PasswordConfirmation: "password123",
			},
			expectedErr: "name",
		},
		{
			name: "invalid email",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "not-an-email",
				Password:             "password123",
				PasswordConfirmation: "password123",
			},
			expectedErr: "email",
		},
		{
			name: "email too long",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                string(make([]byte, 256)) + "@example.com",
				Password:             "password123",
				PasswordConfirmation: "password123",
			},
			expectedErr: "email",
		},
		{
			name: "password too short",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "john@example.com",
				Password:             "short",
				PasswordConfirmation: "short",
			},
			expectedErr: "password",
		},
		{
			name: "password too long",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "john@example.com",
				Password:             string(make([]byte, 73)),
				PasswordConfirmation: string(make([]byte, 73)),
			},
			expectedErr: "password",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(tt.request)
			if err == nil {
				t.Error("expected validation error, got nil")
				return
			}

			// Check that error message contains the expected field name
			if !contains(err.Error(), tt.expectedErr) {
				t.Errorf("expected error to contain %q, got: %v", tt.expectedErr, err)
			}
		})
	}
}

func TestCreateUserRequest_Invalid_MultipleFields(t *testing.T) {
	validator, err := protovalidate.New()
	if err != nil {
		t.Fatalf("failed to create validator: %v", err)
	}

	tests := []struct {
		name        string
		request     *userv1.CreateUserRequest
		expectedErr string
	}{
		{
			name: "passwords do not match",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "john@example.com",
				Password:             "password123",
				PasswordConfirmation: "different",
			},
			expectedErr: "passwords must match",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(tt.request)
			if err == nil {
				t.Error("expected validation error, got nil")
				return
			}

			// Check that error contains the validation message
			if !contains(err.Error(), tt.expectedErr) {
				t.Errorf("expected error to contain %q, got: %v", tt.expectedErr, err)
			}
		})
	}
}

func TestValidationError_Structure(t *testing.T) {
	validator, err := protovalidate.New()
	if err != nil {
		t.Fatalf("failed to create validator: %v", err)
	}

	// Test with multiple validation errors
	request := &userv1.CreateUserRequest{
		Name:                 "", // invalid: too short
		Email:                "not-an-email", // invalid: not an email
		Password:             "password123",
		PasswordConfirmation: "different", // invalid: passwords don't match
	}

	err = validator.Validate(request)
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}

	// Verify error structure - protovalidate returns detailed error information
	t.Logf("Validation error structure: %+v", err)
	t.Logf("Error message: %v", err.Error())

	// The error should contain information about multiple violations
	if !contains(err.Error(), "name") {
		t.Error("expected error to mention 'name' field")
	}
	if !contains(err.Error(), "email") {
		t.Error("expected error to mention 'email' field")
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || indexOf(s, substr) >= 0)
}

func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
