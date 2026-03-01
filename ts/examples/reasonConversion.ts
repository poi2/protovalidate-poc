/**
 * Example: Reason code conversion
 * protovalidate rule_id から UPPER_SNAKE_CASE reason code への変換を実演
 */

import { toReasonCode, isValidReasonCode } from '../src/error/reason';

console.log('=== Reason Code Conversion Examples ===\n');

const examples = [
  'string.min_len',
  'string.max_len',
  'string.email',
  'password_mismatch',
  'int32.gt',
  'repeated.min_items',
];

console.log('Rule ID -> Reason Code:');
examples.forEach(ruleId => {
  const reasonCode = toReasonCode(ruleId);
  const isValid = isValidReasonCode(reasonCode);
  console.log(`  ${ruleId.padEnd(25)} -> ${reasonCode.padEnd(25)} (valid: ${isValid})`);
});

console.log('\n=== Validation Examples ===\n');

const validReasonCodes = ['STRING_MIN_LEN', 'PASSWORD_MISMATCH', 'A1'];
const invalidReasonCodes = ['', 'a', 'lower_case', 'ENDS_WITH_', '_STARTS_WITH'];

console.log('Valid reason codes:');
validReasonCodes.forEach(code => {
  console.log(`  ${code.padEnd(20)} -> ${isValidReasonCode(code)}`);
});

console.log('\nInvalid reason codes:');
invalidReasonCodes.forEach(code => {
  console.log(`  ${JSON.stringify(code).padEnd(20)} -> ${isValidReasonCode(code)}`);
});
