// Package main demonstrates rule_id to reason code conversion
package main

import (
	"fmt"
	"strings"
)

// toReasonCode converts protovalidate rule_id to Google API standard UPPER_SNAKE_CASE
// e.g., "string.min_len" -> "STRING_MIN_LEN", "password_mismatch" -> "PASSWORD_MISMATCH"
func toReasonCode(ruleID string) string {
	if ruleID == "" {
		return ""
	}
	// Replace dots with underscores and convert to uppercase
	s := strings.ReplaceAll(ruleID, ".", "_")
	return strings.ToUpper(s)
}

// matchesUPPER_SNAKE_CASE checks if a string matches the pattern [A-Z][A-Z0-9_]+[A-Z0-9]
func matchesUPPER_SNAKE_CASE(s string) bool {
	if s == "" || len(s) < 2 {
		return false
	}

	// First character must be uppercase letter
	if s[0] < 'A' || s[0] > 'Z' {
		return false
	}

	// Last character must be uppercase letter or digit
	last := s[len(s)-1]
	if !((last >= 'A' && last <= 'Z') || (last >= '0' && last <= '9')) {
		return false
	}

	// Middle characters must be uppercase letter, digit, or underscore
	for i := 1; i < len(s)-1; i++ {
		c := s[i]
		if !((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_') {
			return false
		}
	}

	return true
}

func main() {
	examples := []string{
		"password_mismatch",
		"string.min_len",
		"string.max_len",
		"string.email",
		"custom.rule.nested",
		"user.name.not_empty",
		"",
	}

	fmt.Println("Rule ID to Reason Code Conversion")
	fmt.Println("==================================\n")

	for _, ruleID := range examples {
		reason := toReasonCode(ruleID)
		matches := matchesUPPER_SNAKE_CASE(reason)
		fmt.Printf("%-30s -> %-30s (valid: %v)\n",
			fmt.Sprintf("%q", ruleID),
			fmt.Sprintf("%q", reason),
			matches)
	}

	fmt.Println("\nConversion Rules:")
	fmt.Println("  1. Replace '.' with '_'")
	fmt.Println("  2. Convert to uppercase")
	fmt.Println("  3. Must match pattern: [A-Z][A-Z0-9_]+[A-Z0-9]")
	fmt.Println("  4. Maximum length: 63 characters")
}
