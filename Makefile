.PHONY: help
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Install required tools
	@echo "Installing buf..."
	@command -v buf >/dev/null 2>&1 || (echo "Please install buf: https://buf.build/docs/installation" && exit 1)
	@echo "Installing runn..."
	@command -v runn >/dev/null 2>&1 || go install github.com/k1LoW/runn/cmd/runn@latest
	@echo "Installing markdownlint-cli..."
	@command -v markdownlint >/dev/null 2>&1 || npm install -g markdownlint-cli
	@echo "Setup complete!"

.PHONY: proto-lint
proto-lint: ## Run buf lint
	cd proto && buf lint

.PHONY: proto-generate
proto-generate: ## Generate Go and TypeScript code from proto files
	cd proto && buf dep update && buf generate

.PHONY: proto-check
proto-check: proto-lint ## Check proto files (lint only, no breaking check on main branch)
	@echo "Proto checks passed!"

.PHONY: md-lint
md-lint: ## Run markdownlint
	markdownlint '**/*.md' --ignore node_modules --ignore 'ts/node_modules' --ignore go --ignore __private

.PHONY: test
test: ## Run Go unit tests
	go test -v -race -coverprofile=coverage.out ./...

.PHONY: test-coverage
test-coverage: test ## Show test coverage
	go tool cover -html=coverage.out

.PHONY: build
build: ## Build the server
	go build -o bin/server ./go/server

.PHONY: run-server
run-server: build ## Run the server
	./bin/server

.PHONY: integration-test
integration-test: ## Run integration tests (requires server to be running)
	cd integration/runn && runn run create_user_json.yml

.PHONY: integration-test-full
integration-test-full: ## Build, run server, test, then stop server
	@echo "Building server..."
	@$(MAKE) build
	@echo "Starting server in background..."
	@./bin/server & echo $$! > .server.pid
	@sleep 2
	@echo "Running integration tests..."
	@$(MAKE) integration-test || (kill `cat .server.pid` && rm .server.pid && exit 1)
	@echo "Stopping server..."
	@kill `cat .server.pid` && rm .server.pid
	@echo "Integration tests passed!"

.PHONY: ci
ci: ## Run all CI checks with formatted output
	@bash scripts/ci.sh

.PHONY: docs
docs: ## Generate documentation
	@echo "Generating HTML documentation..."
	cd proto && buf generate --template buf.gen.docs.yaml
	@echo "Documentation generated in docs/generated/"
	@echo "Note: Check that protovalidate constraints are visible in the generated docs"

.PHONY: ts-install
ts-install: ## Install TypeScript dependencies
	cd ts && npm install

.PHONY: ts-test
ts-test: ## Run TypeScript tests
	cd ts && npm test

.PHONY: ts-build
ts-build: ## Build TypeScript code
	cd ts && npm run build

.PHONY: ts-typecheck
ts-typecheck: ## TypeScript type checking
	cd ts && npm run typecheck

.PHONY: ts-examples
ts-examples: ## Run TypeScript examples
	cd ts && npm run examples:validation-error
	cd ts && npm run examples:decode-error
	cd ts && npm run examples:reason-conversion

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf bin coverage.out .server.pid
	rm -rf go/gen ts/gen ts/node_modules docs/generated

.PHONY: install-hooks
install-hooks: ## Install git pre-push hook
	@echo "Installing pre-push hook..."
	@mkdir -p .git/hooks
	@cp scripts/pre-push .git/hooks/pre-push
	@chmod +x .git/hooks/pre-push
	@echo "Pre-push hook installed!"
