#!/bin/bash

# CI script with colorized output
# Automatically detects if running in CI environment and disables colors

set -e

# Color detection: disable colors in CI or non-interactive terminals
if [[ -t 1 ]] && [[ "${CI}" != "true" ]]; then
  # Interactive terminal and not in CI - use colors
  BLUE='\033[0;34m'
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  # CI environment or non-interactive - no colors
  BLUE=''
  GREEN=''
  RED=''
  YELLOW=''
  BOLD=''
  NC=''
fi

# Helper functions
step_start() {
  echo -e "${BLUE}[${1}]${NC} ${BOLD}Starting...${NC}"
}

step_success() {
  echo -e "${GREEN}[${1}]${NC} ${GREEN}✓ Success${NC}"
  echo ""
}

step_skip() {
  echo -e "${YELLOW}[${1}]${NC} ${YELLOW}⊘ Skipped${NC}"
  echo ""
}

step_run() {
  echo -e "  ${BLUE}→${NC} $1"
}

# Main CI steps
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Running CI Checks${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Proto check
step_start "Proto Check"
step_run "Running buf lint"
make proto-lint > /dev/null 2>&1
step_success "Proto Check"

# Markdown lint
step_start "Markdown Lint"
step_run "Running markdownlint"
make md-lint > /dev/null 2>&1
step_success "Markdown Lint"

# Go tests
step_start "Go Tests"
step_run "Running go test with race detector"
make test > /dev/null 2>&1
step_success "Go Tests"

# Build
step_start "Build"
step_run "Building server binary"
make build > /dev/null 2>&1
step_success "Build"

# Integration tests
step_start "Integration Tests"
step_run "Starting server and running integration tests"
make integration-test-full > /dev/null 2>&1
step_success "Integration Tests"

# TypeScript type check
step_start "TypeScript Type Check"
step_run "Running tsc --noEmit"
make ts-typecheck > /dev/null 2>&1
step_success "TypeScript Type Check"

# TypeScript tests
step_start "TypeScript Tests"
step_run "Running vitest"
make ts-test > /dev/null 2>&1
step_success "TypeScript Tests"

# Summary
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✓ All CI checks passed!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
