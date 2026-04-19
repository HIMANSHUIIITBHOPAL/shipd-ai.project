# Solution Explanation: Cross-Platform Path Normalization Fix

## Approach

### Investigation

1. **Ran the test suite** (`npx vitest run`) and observed 16 failures in `spec/lib/contentUtils/contentUtils.test.js`, with all other 14 test files passing.

2. **Analyzed the error messages** — the failures revealed a clear pattern:
   - Snippet IDs were being generated as `spec\\fixtures\\content\\snippets\\js\\s\\array-compare` instead of `js/s/array-compare`
   - Collection snippet counts were wrong (10 instead of 13) because matching by `snippetId` failed due to backslash paths
   - Several `Cannot read properties of undefined (reading 'content')` errors from `.find()` returning `undefined` when looking up snippets by their expected forward-slash IDs

3. **Traced the data flow** — snippet IDs are generated in `src/lib/contentUtils/modelWorkers/snippet.js` line 29:
   ```js
   const id = filePath.replace(snippetPrefix, '').slice(0, -3);
   ```
   Here, `filePath` comes from `globSync` (via `FileHandler.read()`), and `snippetPrefix` is defined as `'spec/fixtures/content/snippets/'` (with forward slashes). On Windows, `globSync` returns paths with backslashes, so `filePath.replace(snippetPrefix, '')` produces no replacement and the entire path leaks into the ID.

4. **Identified all `globSync` call sites** using `grep` — found 4 files with 5 total calls.

### Root Cause

The `glob` package's `globSync` function, when running on Windows:
- Treats backslashes in patterns as escape characters (not directory separators)
- Returns file paths with OS-native backslash separators

The codebase assumes POSIX-style forward slashes everywhere for string manipulation (`.replace()`, `.split('/')`, equality comparisons).

### Solution

Applied a two-part fix to every `globSync` call site:

1. **Input normalization**: `.replace(/\\/g, '/')` on the glob pattern to convert any Windows backslashes to forward slashes before they're interpreted as escape characters.

2. **Output normalization**: `{ posix: true }` option passed to `globSync` to force forward-slash output regardless of the operating system.

This approach is:
- **Backward compatible** — on Linux/macOS, `.replace(/\\/g, '/')` is a no-op (no backslashes to replace), and `{ posix: true }` produces the same output as the default.
- **Minimal** — only the `globSync` call sites are modified; no changes to downstream logic, tests, or fixtures.
- **Correct** — uses the `glob` package's official API (`posix: true`, available since v9+) rather than ad-hoc path manipulation on returned results.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/contentUtils/fileHandler.js` | Fixed `globSync` in `FileHandler.read()` |
| `src/lib/contentComponents.js` | Fixed `globSync` in `ContentComponents.processStyles()` |
| `src/lib/preparedQueries.js` | Fixed `globSync` in `PreparedQueries.duplicateReferences()` |
| `src/lib/contentUtils/assetHandler.js` | Fixed 2 `globSync` calls in `AssetHandler.processAssets()` |

### Verification

After applying the patch, running `npx vitest run` shows:
- **15 test files passed** (15)
- **183 tests passed**, 1 skipped (intentionally — the Shiki code highlighter test)
- **0 failures**
