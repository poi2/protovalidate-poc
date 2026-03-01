import { createValidator as createProtoValidator, ValidationError as ProtoValidationError, type Violation as ProtoViolation } from '@bufbuild/protovalidate';
import type { DescMessage, MessageShape } from '@bufbuild/protobuf';
import { toReasonCode } from '../error/reason';

/**
 * ProtoValidator wraps @bufbuild/protovalidate validator
 */
export class ProtoValidator {
  private validator = createProtoValidator();

  /**
   * Validate a message against its schema
   * @throws {ValidationError} if validation fails
   */
  validate<Desc extends DescMessage>(
    schema: Desc,
    message: MessageShape<Desc>
  ): void {
    const result = this.validator.validate(schema, message);

    if (result.kind === 'invalid') {
      throw new ValidationError(result.violations);
    }

    if (result.kind === 'error') {
      throw result.error;
    }
  }
}

/**
 * ValidationError represents validation failures
 * Go実装のValidationErrorに相当
 */
export class ValidationError extends Error {
  public readonly violations: Violation[];

  constructor(violations: ProtoViolation[]) {
    // Build error message with field paths
    const messages = violations.map(v => {
      const fieldPath = v.field.toString();
      const msg = v.message || 'validation failed';
      return fieldPath ? `${fieldPath}: ${msg}` : msg;
    });
    super(`validation error: ${messages.join(', ')}`);
    this.name = 'ValidationError';

    // Convert protovalidate Violation to our Violation interface
    this.violations = violations.map(v => ({
      fieldPath: v.field.toString(),
      message: v.message,
      ruleId: v.ruleId,
      reasonCode: toReasonCode(v.ruleId),
    }));
  }
}

/**
 * Violation represents a single validation failure
 * Go実装のViolationに相当
 */
export interface Violation {
  /**
   * Field path that failed validation (e.g., "name", "email")
   */
  fieldPath: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Rule ID from protovalidate (e.g., "string.min_len", "string.email")
   */
  ruleId: string;

  /**
   * Reason code in UPPER_SNAKE_CASE (e.g., "STRING_MIN_LEN", "STRING_EMAIL")
   */
  reasonCode: string;
}
