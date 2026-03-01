#!/usr/bin/env node

/**
 * Generate Markdown API reference from proto files
 *
 * This script reads proto files and generates structured Markdown documentation
 * including validation rules and reason codes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const protoFile = path.join(projectRoot, 'proto/user/v1/user.proto');
const outputFile = path.join(projectRoot, 'docs/API.md');

// Read proto file
const protoContent = fs.readFileSync(protoFile, 'utf-8');

// Extract reason codes from comments
function extractReasonCodes(content) {
  const reasonCodes = [];
  const reasonPattern = /reason:\s*"([^"]+)"\s*-\s*([^\n]+)/g;

  let match;
  while ((match = reasonPattern.exec(content)) !== null) {
    const [, reason, description] = match;
    if (!reasonCodes.find(r => r.reason === reason)) {
      reasonCodes.push({ reason, description: description.trim() });
    }
  }

  return reasonCodes;
}

// Extract messages
function extractMessages(content) {
  const messages = [];
  // Match message blocks more carefully
  const messagePattern = /\/\/\s*([^\n]+)\nmessage\s+(\w+)\s*\{/g;

  let match;
  while ((match = messagePattern.exec(content)) !== null) {
    const [, comment, name] = match;
    const startIdx = match.index + match[0].length;

    // Find matching closing brace
    let braceCount = 1;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }

    const body = content.substring(startIdx, endIdx);
    const fields = [];

    // Parse fields line by line
    const lines = body.split('\n');
    let currentComment = [];
    let inAnnotation = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Collect comment lines
      if (trimmed.startsWith('//')) {
        currentComment.push(trimmed.replace(/^\/\/\s*/, ''));
        continue;
      }

      // Track if we're inside an annotation block
      if (trimmed.includes('[(buf.validate')) {
        inAnnotation = true;
      }
      if (inAnnotation && trimmed.includes('}];')) {
        inAnnotation = false;
        continue;
      }
      if (inAnnotation) {
        continue;
      }

      // Match field definition
      const fieldMatch = trimmed.match(/^(?:repeated\s+)?(\w+(?:\.\w+\.?\w*)?)\s+(\w+)\s*=\s*(\d+)/);
      if (fieldMatch) {
        const [, type, fieldName, number] = fieldMatch;
        fields.push({
          name: fieldName,
          type,
          number: parseInt(number),
          comment: currentComment.join('\n').trim()
        });
        currentComment = [];
      }
    }

    messages.push({
      name,
      comment: comment.trim(),
      fields
    });
  }

  return messages;
}

// Extract services
function extractServices(content) {
  const services = [];
  const servicePattern = /\/\/\s*([^\n]+)\nservice\s+(\w+)\s*{([^}]+)}/gs;

  let match;
  while ((match = servicePattern.exec(content)) !== null) {
    const [, comment, name, body] = match;

    const methods = [];
    const methodPattern = /rpc\s+(\w+)\s*\((\w+)\)\s*returns\s*\((\w+)\)/g;

    let methodMatch;
    while ((methodMatch = methodPattern.exec(body)) !== null) {
      const [, methodName, request, response] = methodMatch;
      methods.push({ name: methodName, request, response });
    }

    services.push({
      name,
      comment: comment.trim(),
      methods
    });
  }

  return services;
}

// Generate Markdown
function generateMarkdown() {
  const reasonCodes = extractReasonCodes(protoContent);
  const messages = extractMessages(protoContent);
  const services = extractServices(protoContent);

  let md = `# API Reference

Generated from proto files.

## Table of Contents

- [Validation Error Codes](#validation-error-codes)
- [Messages](#messages)
- [Services](#services)

---

## Validation Error Codes

All validation errors include a \`reason\` field with an UPPER_SNAKE_CASE code.

| Reason Code | Description |
|-------------|-------------|
`;

  reasonCodes.forEach(({ reason, description }) => {
    md += `| \`${reason}\` | ${description} |\n`;
  });

  md += `\n---\n\n## Messages\n\n`;

  messages.forEach(({ name, comment, fields }) => {
    md += `### ${name}\n\n`;
    if (comment) {
      md += `${comment}\n\n`;
    }

    if (fields.length > 0) {
      md += `**Fields:**\n\n`;
      md += `| Field | Type | Description |\n`;
      md += `|-------|------|-------------|\n`;

      fields.forEach(({ name, type, comment }) => {
        const cleanComment = comment.replace(/Validation errors:[^]*$/s, '').trim();
        md += `| \`${name}\` | \`${type}\` | ${cleanComment} |\n`;
      });
      md += `\n`;

      // Extract validation rules
      fields.forEach(({ name, comment }) => {
        const validationMatch = comment.match(/Validation errors:([\s\S]*)/);
        if (validationMatch) {
          const rules = validationMatch[1].trim();
          if (rules) {
            md += `**Validation rules for \`${name}\`:**\n\n${rules}\n\n`;
          }
        }
      });
    }

    md += `\n`;
  });

  md += `---\n\n## Services\n\n`;

  services.forEach(({ name, comment, methods }) => {
    md += `### ${name}\n\n`;
    if (comment) {
      md += `${comment}\n\n`;
    }

    if (methods.length > 0) {
      md += `**Methods:**\n\n`;

      methods.forEach(({ name, request, response }) => {
        md += `#### ${name}\n\n`;
        md += `- **Request:** \`${request}\`\n`;
        md += `- **Response:** \`${response}\`\n\n`;
      });
    }

    md += `\n`;
  });

  return md;
}

// Write output
const markdown = generateMarkdown();
fs.writeFileSync(outputFile, markdown, 'utf-8');

console.log(`✓ API documentation generated: ${outputFile}`);
