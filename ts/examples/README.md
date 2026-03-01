# TypeScript Examples

このディレクトリには、TypeScript実装のprotovalidateの使用例が含まれています。

## Examples一覧

### 1. reasonConversion.ts

protovalidate rule_id から UPPER_SNAKE_CASE reason code への変換を実演します。

```bash
npm run examples:reason-conversion
```

**デモ内容:**

- rule_id（例: `string.min_len`）からreason code（`STRING_MIN_LEN`）への変換
- reason codeのバリデーション

### 2. validationErrorStructure.ts

ValidationErrorの構造とviolationsの内容を実演します。

```bash
npm run examples:validation-error
```

**デモ内容:**

- 複数のバリデーションエラーを持つリクエストの作成
- ValidationErrorオブジェクトの構造
- 各violationのフィールド（fieldPath, message, ruleId, reasonCode）

### 3. decodeErrorDetails.ts

Base64エンコードされたエラー詳細のデコードを実演します。

```bash
npm run examples:decode-error
```

**デモ内容:**

- Base64エンコードされたgoogle.rpc.BadRequestのデコード
- エラー詳細の解析

**注意:** 現在の実装はプレースホルダーです。完全な実装には `google/rpc/error_details.proto` の型生成が必要です。

## 全てのExamplesを実行

```bash
npm run examples:validation-error
npm run examples:decode-error
npm run examples:reason-conversion
```

または、Makefileを使用:

```bash
make ts-examples
```

## Go実装との比較

これらのExamplesは、Goディレクトリの `examples/` にあるコードと対応しています:

| TypeScript | Go |
| ---------- | ----- |
| reasonConversion.ts | reason_conversion_example.go |
| validationErrorStructure.ts | validation_error_structure.go |
| decodeErrorDetails.ts | decode_error_details.go |

同じproto定義から生成されたコードを使用しているため、ValidationErrorの構造やreason codeの変換ロジックはGo実装と一貫性があります。

## 技術的な詳細

### Validation実行

TypeScriptでのvalidation実行は以下のように行います:

```typescript
import { create } from '@bufbuild/protobuf';
import { ProtoValidator } from './src/validation/validator';
import { CreateUserRequestSchema } from '@gen/user/v1/user_pb';

const validator = new ProtoValidator();

const request = create(CreateUserRequestSchema, {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
});

try {
  validator.validate(CreateUserRequestSchema, request);
  console.log('Validation passed!');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.violations);
  }
}
```

### Reason Code変換

```typescript
import { toReasonCode } from './src/error/reason';

const ruleId = 'string.min_len';
const reasonCode = toReasonCode(ruleId); // "STRING_MIN_LEN"
```

### ValidationErrorの構造

```typescript
interface Violation {
  fieldPath: string;    // e.g., "name", "email"
  message: string;      // Human-readable error message
  ruleId: string;       // e.g., "string.min_len", "string.email"
  reasonCode: string;   // e.g., "STRING_MIN_LEN", "STRING_EMAIL"
}

class ValidationError extends Error {
  violations: Violation[];
}
```

## 制限事項

現在の実装には以下の制限があります:

1. **google.rpc.BadRequestのデコード**: 完全な実装には追加のproto生成設定が必要です
2. **Connect RPCクライアント**: サーバーとの通信例は含まれていません（PoCの範囲外）

これらの制限にもかかわらず、核心となるvalidation機能は完全に動作し、Go実装と同じvalidationルールを使用できることを実証しています。
