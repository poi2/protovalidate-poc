/**
 * Protovalidate TypeScript implementation
 * Go実装と同じproto定義を使用したvalidation
 */

// Validation
export { ProtoValidator, ValidationError, type Violation } from './validation/validator';

// Error handling
export { toReasonCode, isValidReasonCode } from './error/reason';
export {
  extractErrorDetails,
  decodeBadRequest,
  extractFieldViolations,
  type ConnectErrorDetail,
  type FieldViolation,
} from './error/decoder';

// Generated types (re-export for convenience)
export { CreateUserRequestSchema, CreateUserResponseSchema, UserSchema } from '@gen/user/v1/user_pb';
export type { CreateUserRequest, CreateUserResponse, User } from '@gen/user/v1/user_pb';
