# Validation Examples

このディレクトリには、protovalidateのバリデーションエラー処理に関する実行可能な例が含まれています。

## ファイル一覧

### validation_error_structure.go

protovalidateのValidationErrorの内部構造を確認する例。

**実行方法:**
```bash
go run examples/validation_error_structure.go
```

**内容:**
- ValidationErrorの詳細構造を表示
- 各Violationのフィールド（RuleId, Message, Field, Ruleなど）を確認
- 単一エラーと複数エラーの両方を検証

### decode_error_details.go

APIレスポンスの`details[].value`フィールド（Base64エンコードされたProtobuf）をデコードする例。

**実行方法:**
```bash
go run examples/decode_error_details.go
```

**内容:**
- Base64でエンコードされた`google.rpc.BadRequest`をデコード
- `field`, `description`, `reason`を含むFieldViolationを表示
- 実際のAPIレスポンスから取得したvalueを使用

### reason_conversion.go

protovalidateの`rule_id`をGoogle API標準の`reason`（UPPER_SNAKE_CASE）に変換する例。

**実行方法:**
```bash
go run examples/reason_conversion.go
```

**内容:**
- rule_id → reason の変換ロジック
- UPPER_SNAKE_CASEパターンのバリデーション
- 実際の変換例を表示

**変換ルール:**
1. ドット(`.`)をアンダースコア(`_`)に置換
2. 全て大文字に変換
3. パターン: `[A-Z][A-Z0-9_]+[A-Z0-9]`
4. 最大63文字

**変換例:**
- `string.min_len` → `STRING_MIN_LEN`
- `string.email` → `STRING_EMAIL`
- `password_mismatch` → `PASSWORD_MISMATCH`

## 関連ドキュメント

- [Protovalidate公式サイト](https://protovalidate.com/)
- [Google API Error Details](https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto)
- [buf.validate API docs](https://buf.build/bufbuild/protovalidate/docs/main:buf.validate)
