/**
 * Example: ValidationError structure
 * ValidationErrorの構造とviolationsの内容を実演
 */

import { create } from '@bufbuild/protobuf';
import { ProtoValidator, ValidationError } from '../src/validation/validator';
import { CreateUserRequestSchema } from '@gen/user/v1/user_pb';

console.log('=== ValidationError Structure Example ===\n');

const validator = new ProtoValidator();

// Create an invalid request with multiple validation errors
const invalidRequest = create(CreateUserRequestSchema, {
  name: '',                          // Too short
  email: 'not-an-email',             // Invalid email
  password: 'password123',
  passwordConfirmation: 'different', // Password mismatch
});

console.log('Invalid request:');
console.log(JSON.stringify(invalidRequest, null, 2));
console.log();

try {
  validator.validate(CreateUserRequestSchema, invalidRequest);
  console.log('No validation errors (unexpected)');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('ValidationError caught!');
    console.log(`\nError message: ${error.message}`);
    console.log(`\nNumber of violations: ${error.violations.length}`);
    console.log('\nViolation details:');

    error.violations.forEach((violation, index) => {
      console.log(`\n  Violation ${index + 1}:`);
      console.log(`    Field Path:  ${violation.fieldPath}`);
      console.log(`    Message:     ${violation.message}`);
      console.log(`    Rule ID:     ${violation.ruleId}`);
      console.log(`    Reason Code: ${violation.reasonCode}`);
    });

    console.log('\n=== JSON representation ===');
    console.log(JSON.stringify(error.violations, null, 2));
  } else {
    console.error('Unexpected error:', error);
  }
}
