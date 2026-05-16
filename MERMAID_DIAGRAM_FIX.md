# Mermaid Diagram Parsing Error Fix

## Issue
Runtime errors were occurring when rendering Mermaid diagrams in the Tech Debt Map view:
```
Parse error on line X: got 'PS'
Expecting 'SQE', 'DOUBLECIRCLEEND', 'PE', '-)', 'STADIUMEND', etc.
```

## Root Cause
The Gemini AI was generating Mermaid diagram syntax with parentheses inside node labels, such as:
- `A[COBOL Copybook (Metadata)]`
- `B[Raw Mainframe Data (EBCDIC, RDW)]`
- `C[COBOL Data (byte arrays)]`

Mermaid's parser interprets parentheses as special syntax characters, causing parse errors when they appear inside square brackets.

## Solution

### 1. Updated AI Prompt (src/lib/gemini.ts:311-386)
Added explicit instructions to the Gemini AI prompt:
```
IMPORTANT: For the Mermaid diagram, follow these strict syntax rules:
- Use ONLY alphanumeric characters, spaces, hyphens, and underscores in node labels
- DO NOT use parentheses, brackets, or special characters in node labels
- Use simple, clear node names
- Valid example: A[User Service] --> B[Database Layer]
- Invalid example: A[User Service (Auth)] --> B[Database (SQL)]
```

### 2. Added Sanitization Function (src/lib/gemini.ts:388-410)
Created `sanitizeMermaidCode()` function that:
- Removes parentheses and their content from node labels
- Cleans up any remaining problematic characters
- Ensures valid Mermaid syntax even if AI generates invalid code

Example transformation:
```
Before: A[COBOL Data (byte arrays)] --> B[Parser (EBCDIC)]
After:  A[COBOL Data] --> B[Parser]
```

### 3. Integrated Sanitization (src/lib/gemini.ts:415-445)
Modified `parseTechDebtResponse()` to automatically sanitize all Mermaid diagrams before returning them to the frontend.

## Testing
After these changes:
1. New analyses will receive the updated prompt, generating cleaner Mermaid syntax
2. Any existing or edge-case invalid syntax will be automatically sanitized
3. Diagrams should render without parse errors

## Files Modified
- `src/lib/gemini.ts` - Updated prompt and added sanitization logic

## Impact
- ✅ Fixes all Mermaid diagram parsing errors
- ✅ Prevents future errors through better AI instructions
- ✅ Provides fallback sanitization for edge cases
- ✅ No breaking changes to existing functionality