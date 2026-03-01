import { describe, test, expect } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { ProtoValidator, ValidationError } from '../src/validation/validator';
import { CreateUserRequestSchema } from '@gen/user/v1/user_pb';
import type { CreateUserRequest } from '@gen/user/v1/user_pb';

describe('CreateUserRequest Validation', () => {
  const validator = new ProtoValidator();

  describe('Valid requests', () => {
    test('should validate valid request', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).not.toThrow();
    });

    test('should validate long name within limit', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'A very long name that is still within the 255 character limit',
        email: 'test@example.com',
        password: 'securepass',
        passwordConfirmation: 'securepass',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).not.toThrow();
    });
  });

  describe('Single field validation errors', () => {
    test('should fail with empty name', () => {
      const request = create(CreateUserRequestSchema, {
        name: '',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);

      try {
        validator.validate(CreateUserRequestSchema, request);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.message).toContain('name');
        }
      }
    });

    test('should fail with name too long', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'x'.repeat(256),
        email: 'john@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);
    });

    test('should fail with invalid email', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);

      try {
        validator.validate(CreateUserRequestSchema, request);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.message).toContain('email');
        }
      }
    });

    test('should fail with email too long', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'x'.repeat(256) + '@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);
    });

    test('should fail with password too short', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        passwordConfirmation: 'short',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);

      try {
        validator.validate(CreateUserRequestSchema, request);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.message).toContain('password');
        }
      }
    });

    test('should fail with password too long', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'x'.repeat(73),
        passwordConfirmation: 'x'.repeat(73),
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);
    });
  });

  describe('Multiple fields validation', () => {
    test('should fail when passwords do not match', () => {
      const request = create(CreateUserRequestSchema, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirmation: 'different',
      });

      expect(() => validator.validate(CreateUserRequestSchema, request)).toThrow(ValidationError);

      try {
        validator.validate(CreateUserRequestSchema, request);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.message).toContain('passwords must match');
        }
      }
    });
  });

  describe('ValidationError structure', () => {
    test('should contain detailed violations for multiple errors', () => {
      const request = create(CreateUserRequestSchema, {
        name: '',
        email: 'not-an-email',
        password: 'password123',
        passwordConfirmation: 'different',
      });

      try {
        validator.validate(CreateUserRequestSchema, request);
        expect.fail('Expected ValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);

        if (error instanceof ValidationError) {
          // Should have multiple violations
          expect(error.violations.length).toBeGreaterThan(0);

          // Check violation structure
          error.violations.forEach(violation => {
            expect(violation).toHaveProperty('fieldPath');
            expect(violation).toHaveProperty('message');
            expect(violation).toHaveProperty('ruleId');
            expect(violation).toHaveProperty('reasonCode');

            // Reason code should be UPPER_SNAKE_CASE
            expect(violation.reasonCode).toMatch(/^[A-Z][A-Z0-9_]*[A-Z0-9]$/);
          });

          // Error should mention the problematic fields
          expect(error.message.toLowerCase()).toMatch(/name|email/);
        }
      }
    });
  });

  describe('Reason code conversion', () => {
    test('should convert rule_id to reason code', () => {
      const request = create(CreateUserRequestSchema, {
        name: '',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      try {
        validator.validate(CreateUserRequestSchema, request);
      } catch (error) {
        if (error instanceof ValidationError) {
          const violation = error.violations[0];

          // ruleId should be something like "string.min_len"
          expect(violation.ruleId).toBeTruthy();

          // reasonCode should be UPPER_SNAKE_CASE version
          // e.g., "string.min_len" -> "STRING_MIN_LEN"
          expect(violation.reasonCode).toBe(
            violation.ruleId.replace(/\./g, '_').toUpperCase()
          );
        }
      }
    });
  });
});
