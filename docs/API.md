# API Reference

Generated from proto files.

## Table of Contents

- [Validation Error Codes](#validation-error-codes)
- [Messages](#messages)
- [Services](#services)

---

## Validation Error Codes

All validation errors include a `reason` field with an UPPER_SNAKE_CASE code.

| Reason Code | Description |
|-------------|-------------|
| `USER_NAME_NOT_EMPTY` | name cannot be empty (custom CEL rule) |
| `STRING_MIN_LEN` | value length must be at least 1 characters |
| `STRING_MAX_LEN` | value length must be at most 255 characters |
| `STRING_EMAIL` | value must be a valid email address |
| `PASSWORD_MISMATCH` | passwords must match |

---

## Messages

### User

User represents a user entity

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` |  |
| `created_at` | `google.protobuf.Timestamp` |  |
| `updated_at` | `google.protobuf.Timestamp` |  |


### CreateUserRequest

CreateUserRequest is the request message for creating a user

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `password_confirmation` | `string` | User's full name |

**Validation rules for `password_confirmation`:**

- reason: "USER_NAME_NOT_EMPTY" - name cannot be empty (custom CEL rule)
- reason: "STRING_MIN_LEN" - value length must be at least 1 characters
- reason: "STRING_MAX_LEN" - value length must be at most 255 characters
User's email address
Validation errors:
- reason: "STRING_EMAIL" - value must be a valid email address
- reason: "STRING_MAX_LEN" - value length must be at most 255 characters
User's password
Validation errors:
- reason: "STRING_MIN_LEN" - value length must be at least 8 characters
- reason: "STRING_MAX_LEN" - value length must be at most 72 characters
Password confirmation (must match password field)


### CreateUserResponse

CreateUserResponse is the response message for creating a user

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User` |  |


---

## Services

### UserService

UserService provides user-related operations

**Methods:**

#### CreateUser

- **Request:** `CreateUserRequest`
- **Response:** `CreateUserResponse`


