# Claude からの質問・課題

開発中に発生した質問や課題をここに記録します。

## 質問リスト

### 1. protovalidate-go のモジュールパス変更について

- 問題: protovalidate-go のモジュールパスが `github.com/bufbuild/protovalidate-go` から `buf.build/go/protovalidate` に変更されている
- 解決: 新しいパス `buf.build/go/protovalidate` を使用
- 参考: [Protovalidate Go quickstart](https://protovalidate.com/quickstart-go/)

## 決定事項

- Go のみで実装開始（TS は Go 完了後）
- Transport: JSON + gRPC 両方対応
- Integration test: runn を使用
- CI: GitHub Actions + pre-push hook
