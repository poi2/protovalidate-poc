// Package main demonstrates how to decode error details from API responses
package main

import (
	"encoding/base64"
	"fmt"
	"log"

	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

func main() {
	examples := []struct {
		name  string
		value string
	}{
		{
			name:  "Single error (PASSWORD_MISMATCH)",
			value: "CikSFHBhc3N3b3JkcyBtdXN0IG1hdGNoGhFQQVNTV09SRF9NSVNNQVRDSA==",
		},
		{
			name:  "Multiple errors (name, email, password)",
			value: "CkIKBG5hbWUSKnZhbHVlIGxlbmd0aCBtdXN0IGJlIGF0IGxlYXN0IDEgY2hhcmFjdGVycxoOU1RSSU5HX01JTl9MRU4KOgoFZW1haWwSI3ZhbHVlIG11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzGgxTVFJJTkdfRU1BSUwKRgoIcGFzc3dvcmQSKnZhbHVlIGxlbmd0aCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycxoOU1RSSU5HX01JTl9MRU4=",
		},
	}

	for _, ex := range examples {
		fmt.Printf("=== %s ===\n\n", ex.name)
		decodeValue(ex.value)
		fmt.Println()
	}
}

func decodeValue(valueBase64 string) {
	// Base64デコード
	valueBytes, err := base64.StdEncoding.DecodeString(valueBase64)
	if err != nil {
		log.Fatalf("Failed to decode base64: %v", err)
	}

	fmt.Printf("Base64デコード後のバイト数: %d bytes\n", len(valueBytes))

	// Protobufメッセージとしてデコード
	badReq := &errdetails.BadRequest{}
	if err := proto.Unmarshal(valueBytes, badReq); err != nil {
		log.Fatalf("Failed to unmarshal protobuf: %v", err)
	}

	// 人間が読める形式で出力
	fmt.Println("Protobufメッセージの内容:")
	jsonBytes, err := protojson.MarshalOptions{
		Multiline: true,
		Indent:    "  ",
	}.Marshal(badReq)
	if err != nil {
		log.Fatalf("Failed to marshal to JSON: %v", err)
	}
	fmt.Println(string(jsonBytes))

	fmt.Println("\nフィールドの詳細:")
	for i, fv := range badReq.FieldViolations {
		fmt.Printf("  Violation %d:\n", i+1)
		fmt.Printf("    Field: %q\n", fv.Field)
		fmt.Printf("    Description: %q\n", fv.Description)
		fmt.Printf("    Reason: %q\n", fv.Reason)
	}
}
