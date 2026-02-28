// Package main demonstrates how to inspect protovalidate ValidationError structure
package main

import (
	"fmt"

	"buf.build/go/protovalidate"
	userv1 "github.com/poi2/protovalidate-poc/go/gen/user/v1"
)

func main() {
	validator, err := protovalidate.New()
	if err != nil {
		panic(err)
	}

	examples := []struct {
		name    string
		request *userv1.CreateUserRequest
	}{
		{
			name: "Password mismatch",
			request: &userv1.CreateUserRequest{
				Name:                 "John Doe",
				Email:                "john@example.com",
				Password:             "password123",
				PasswordConfirmation: "different",
			},
		},
		{
			name: "Multiple field errors",
			request: &userv1.CreateUserRequest{
				Name:                 "", // empty name
				Email:                "not-an-email", // invalid email
				Password:             "short", // too short
				PasswordConfirmation: "short",
			},
		},
	}

	for _, ex := range examples {
		fmt.Printf("=== %s ===\n\n", ex.name)
		testValidation(validator, ex.request)
		fmt.Println()
	}
}

func testValidation(validator protovalidate.Validator, req *userv1.CreateUserRequest) {
	err := validator.Validate(req)
	if err == nil {
		fmt.Println("No validation errors")
		return
	}

	fmt.Printf("Error type: %T\n", err)
	fmt.Printf("Error: %v\n\n", err)

	if valErr, ok := err.(*protovalidate.ValidationError); ok {
		fmt.Printf("Number of violations: %d\n\n", len(valErr.Violations))
		for i, violation := range valErr.Violations {
			fmt.Printf("Violation %d:\n", i+1)
			fmt.Printf("  String: %s\n", violation.String())
			if violation.Proto != nil {
				if violation.Proto.Field != nil {
					fmt.Printf("  Field: %v\n", violation.Proto.Field)
				}
				if violation.Proto.Rule != nil {
					fmt.Printf("  Rule: %v\n", violation.Proto.Rule)
				}
				if violation.Proto.RuleId != nil {
					fmt.Printf("  RuleId: %s\n", *violation.Proto.RuleId)
				}
				if violation.Proto.Message != nil {
					fmt.Printf("  Message: %s\n", *violation.Proto.Message)
				}
				if violation.Proto.ForKey != nil {
					fmt.Printf("  ForKey: %v\n", *violation.Proto.ForKey)
				}
			}
			fmt.Println()
		}
	}
}
