/**
 * Convert protovalidate rule_id to UPPER_SNAKE_CASE
 * Go実装のtoReasonCode関数に相当
 *
 * "string.min_len" -> "STRING_MIN_LEN"
 * "password_mismatch" -> "PASSWORD_MISMATCH"
 */
export function toReasonCode(ruleId: string): string {
  if (!ruleId) return '';
  return ruleId.replace(/\./g, '_').toUpperCase();
}

/**
 * Validate if a string is a valid reason code format
 * 有効なreasonコードフォーマットかチェック
 */
export function isValidReasonCode(s: string): boolean {
  if (!s || s.length < 2) return false;
  return /^[A-Z][A-Z0-9_]*[A-Z0-9]$/.test(s);
}
