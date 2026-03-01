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
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}[${1}]${NC} ${BOLD}Starting...${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

step_success() {
  echo -e "${GREEN}[${1}]${NC} ${GREEN}✓ Success${NC}"
}

# Main CI header
echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}${BOLD}  Running CI Checks${NC}"
echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Proto check
step_start "Proto Check"
make proto-lint
step_success "Proto Check"

# Markdown lint
step_start "Markdown Lint"
make md-lint
step_success "Markdown Lint"

# Go tests
step_start "Go Tests"
make test
step_success "Go Tests"

# Build
step_start "Build"
make build
step_success "Build"

# Integration tests
step_start "Integration Tests"
make integration-test-full
step_success "Integration Tests"

# TypeScript type check
step_start "TypeScript Type Check"
make ts-typecheck
step_success "TypeScript Type Check"

# TypeScript tests
step_start "TypeScript Tests"
make ts-test
step_success "TypeScript Tests"

# Summary
echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  ✓ All CI checks passed!${NC}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
