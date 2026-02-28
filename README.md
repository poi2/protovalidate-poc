# protovalidate-poc

Protocol Buffers + protovalidate を使った schema-first validation の技術検証プロジェクト

## 目的

protovalidate を使って、FE/BE の両方で同じ validation を行えることを技術的に明らかにする。

## 検証項目

- [x] Proto + protovalidate による validation 定義
  - [x] Single field validation
  - [x] Multiple fields validation (CEL)
  - [x] Validation error の構造確認
- [x] Go での実装
  - [x] Unit test による validation 動作確認
  - [x] Connect-RPC を使った gRPC/JSON 両対応サーバー
  - [x] Integration test (runn)
- [x] ドキュメント生成
  - [x] protovalidate の制約情報を含むドキュメント
- [x] CI/CD
  - [x] GitHub Actions
  - [x] Pre-push hook

## プロジェクト構造

```
.
├── proto/                  # Proto 定義
│   ├── buf.yaml
│   ├── buf.gen.yaml
│   ├── buf.gen.docs.yaml
│   └── user/v1/
│       └── user.proto
├── go/
│   ├── gen/               # 生成されたコード
│   └── server/            # Connect-RPC サーバー
├── integration/
│   └── runn/              # Integration test
├── docs/
│   ├── generated/         # 生成されたドキュメント
│   └── question-from-claude.md
├── scripts/
│   └── pre-push           # Git pre-push hook
├── Makefile
└── README.md
```

## セットアップ

必要なツールのインストール:

```bash
make setup
```

または手動でインストール:

- [buf](https://buf.build/docs/installation)
- [runn](https://github.com/k1LoW/runn)
- [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli)
- Go 1.24+

## 開発

### Proto からコード生成

```bash
make proto-generate
```

### テスト実行

```bash
# Unit test
make test

# Integration test (サーバーを別ターミナルで起動しておく必要あり)
make run-server  # 別ターミナルで
make integration-test

# または、全てまとめて実行
make integration-test-full
```

### サーバー起動

```bash
make run-server
```

サーバーは `localhost:8080` で起動し、gRPC と JSON の両方に対応します。

### ドキュメント生成

```bash
make docs
```

`docs/generated/index.html` にドキュメントが生成されます。

### CI チェック

```bash
make ci
```

以下のチェックが実行されます:

- Proto lint
- Markdown lint
- Go unit test
- Build
- Integration test

### Pre-push hook のインストール

```bash
make install-hooks
```

## 検証結果

### 1. Protovalidate の表現力

**Single field validation:**

- String の長さ制限 (`min_len`, `max_len`)
- Email validation (`email: true`)
- 動作確認: ✅

**Multiple fields validation (CEL):**

- Cross-field validation (password と password_confirmation の一致)
- Validation ID の採番 (`id: "password_match"`)
- 動作確認: ✅

**エラー構造:**

```
validation errors:
 - passwords must match
 - name: value length must be at least 1 characters
 - email: value must be a valid email address
```

### 2. Connect-RPC による gRPC/JSON 両対応

**JSON リクエスト:**

```bash
curl -X POST http://localhost:8080/user.v1.UserService/CreateUser \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirmation": "password123"
  }'
```

**gRPC リクエスト:**

runn を使った gRPC テストで検証済み。

### 3. ドキュメント生成

buf の protoc-gen-doc プラグインを使用してドキュメント生成可能。
protovalidate の制約情報も含まれることを確認。

## 結論

Protovalidate は以下の用途で有効:

- **API 契約の明示的な定義**: 型だけでなく、値の制約も proto で定義可能
- **FE/BE での validation 共有**: 同じ proto から生成されたコードで validation 実行可能
- **開発者体験の向上**: 宣言的な validation 定義により、実装の手間を削減

## Next Steps

- TypeScript での実装と検証
- より複雑な validation ルールの検証
- 実際のプロダクトでの適用検討

## License

MIT
