/**
 * Example: Decode error details
 * Base64エンコードされたエラー詳細のデコードを実演
 *
 * Note: This is a placeholder implementation.
 * Full implementation requires google.rpc.BadRequest proto generation.
 */

import { decodeBadRequest } from '../src/error/decoder';

console.log('=== Decode Error Details Example ===\n');

const examples = [
  {
    name: 'Single error (PASSWORD_MISMATCH)',
    value: 'CikSFHBhc3N3b3JkcyBtdXN0IG1hdGNoGhFQQVNTV09SRF9NSVNNQVRDSA==',
  },
  {
    name: 'Multiple errors (name, email, password)',
    value:
      'CkIKBG5hbWUSKnZhbHVlIGxlbmd0aCBtdXN0IGJlIGF0IGxlYXN0IDEgY2hhcmFjdGVycxoOU1RSSU5HX01JTl9MRU4KOgoFZW1haWwSI3ZhbHVlIG11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzGgxTVFJJTkdfRU1BSUwKRgoIcGFzc3dvcmQSKnZhbHVlIGxlbmd0aCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycxoOU1RSSU5HX01JTl9MRU4=',
  },
];

for (const ex of examples) {
  console.log(`=== ${ex.name} ===\n`);
  console.log(`Base64 value: ${ex.value.substring(0, 50)}...`);
  console.log(`Length: ${ex.value.length} characters\n`);

  try {
    const decoded = decodeBadRequest(ex.value);
    console.log('Decoded BadRequest:');
    console.log(JSON.stringify(decoded, null, 2));

    console.log('\n--- Note ---');
    console.log('This is a placeholder implementation.');
    console.log('To fully decode google.rpc.BadRequest, you need to:');
    console.log('1. Generate google/rpc/error_details.proto types');
    console.log('2. Use fromBinary() with the generated BadRequest schema');
    console.log('3. See the Go implementation in examples/decode_error_details.go');
  } catch (error) {
    console.error('Decode error:', error);
  }

  console.log();
}

console.log('=== Manual Base64 Decode (for demonstration) ===\n');

const base64Value = examples[0].value;
const binaryData = Buffer.from(base64Value, 'base64');
console.log(`Binary data length: ${binaryData.length} bytes`);
console.log(`Binary data (hex): ${binaryData.toString('hex').substring(0, 100)}...`);
console.log('\nTo properly decode this protobuf data, we need the BadRequest schema.');
console.log('This would be generated from google/rpc/error_details.proto');
