import { ConnectError } from '@connectrpc/connect';
import { fromBinary, type DescMessage } from '@bufbuild/protobuf';

/**
 * ConnectError detail structure
 */
export interface ConnectErrorDetail {
  type: string;
  value: string; // base64 encoded
  debug?: unknown;
}

/**
 * Field violation from google.rpc.BadRequest
 */
export interface FieldViolation {
  field: string;
  description: string;
  reason?: string;
}

/**
 * Extract error details from ConnectError
 * ConnectErrorからエラー詳細を抽出
 */
export function extractErrorDetails(error: ConnectError): ConnectErrorDetail[] {
  return error.details.map(detail => {
    if ('type' in detail && 'value' in detail) {
      // Incoming detail
      return {
        type: detail.type,
        value: Buffer.from(detail.value).toString('base64'),
        debug: detail.debug,
      };
    }
    // Outgoing detail - should not happen on client side
    return {
      type: 'unknown',
      value: '',
    };
  });
}

/**
 * Decode base64 value to BadRequest-like structure
 * Base64値をBadRequest相当の構造にデコード
 *
 * Note: This is a simplified implementation.
 * For full type safety, generate google.rpc.BadRequest from proto files.
 */
export function decodeBadRequest(base64Value: string): {
  fieldViolations: FieldViolation[];
} {
  try {
    const binaryData = Buffer.from(base64Value, 'base64');
    // This is a placeholder - in production, use generated BadRequest schema
    // For now, we'll parse the protobuf manually or return empty structure
    return {
      fieldViolations: [],
    };
  } catch (error) {
    throw new Error(`Failed to decode BadRequest: ${error}`);
  }
}

/**
 * Extract field violations from ConnectError
 * ConnectErrorからフィールドバリデーションエラーを抽出
 */
export function extractFieldViolations(error: ConnectError): FieldViolation[] {
  const violations: FieldViolation[] = [];

  for (const detail of error.details) {
    if ('type' in detail && detail.type === 'google.rpc.BadRequest') {
      // Try to decode the detail
      // For now, this is a placeholder implementation
      // In production, use proper BadRequest schema
      continue;
    }
  }

  return violations;
}
