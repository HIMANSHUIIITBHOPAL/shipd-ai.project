# Fix Cross-Platform Path Handling in Content Pipeline's globSync Calls

## Problem

The `30-seconds-of-code` content pipeline uses Node.js `globSync` from the `glob` package extensively throughout its content extraction and processing system. Currently, all `globSync` calls pass OS-native paths directly and do not normalize the returned file paths to use POSIX-style forward slashes (`/`). This causes the following failures when running on Windows:

1. **Glob patterns containing backslashes are misinterpreted** — On Windows, path strings built via template literals (e.g. `${contentDir}/snippets/**/s/*.md`) may contain backslash segments, which `globSync` treats as escape characters rather than directory separators, causing zero matches.

2. **Returned file paths use backslashes** — Even when patterns work, `globSync` returns Windows-style paths like `spec\fixtures\content\snippets\js\s\array-compare` instead of `spec/fixtures/content/snippets/js/s/array-compare`. Since downstream code (snippet ID extraction, collection snippet matching, test assertions) relies on forward-slash (`/`) path separators for string operations like `.replace()`, `.split('/')`, and equality checks, all those operations break silently or produce incorrect results.

## Affected Files

The bug manifests in every file that calls `globSync`:

- **`src/lib/contentUtils/fileHandler.js`** — `FileHandler.read()` uses `globSync(globPattern)` to discover content files (YAML, MD, JSON). The returned paths are passed to `readFile()` and also used as `filePath` in frontmatter parsing, which feeds into snippet ID generation.

- **`src/lib/contentComponents.js`** — `ContentComponents.processStyles()` uses `globSync` to find `.scss` files for compilation. The returned paths feed into `sass.compile()` and string replacement for output destinations.

- **`src/lib/preparedQueries.js`** — `PreparedQueries.duplicateReferences()` uses `globSync(settings.paths.languagesGlob)` to find language YAML files.

- **`src/lib/contentUtils/assetHandler.js`** — `AssetHandler.processAssets()` uses `globSync` in two places: once to find already-converted assets, and once to find unconverted assets. The returned paths are split on `/` to extract directory names and used in string replacements.

## Expected Behavior

- All `globSync` calls should normalize their input patterns to use forward slashes before passing them to glob.
- All `globSync` calls should return POSIX-style forward-slash paths regardless of the operating system.
- The test suite (`npm test`) should pass on both Linux and Windows, with all 183 tests passing and 1 skipped.

## How to Reproduce

1. Clone the repository and run `npm install`
2. Run `npm test` (or `npx vitest run`)
3. Observe 16 test failures in `spec/lib/contentUtils/contentUtils.test.js`

The failures show snippet IDs like `spec\\fixtures\\content\\snippets\\js\\s\\array-compare` instead of the expected `js/s/array-compare`, collection snippet counts being wrong (10 instead of 13), and `Cannot read properties of undefined` errors from failed `.find()` lookups.

## Investigation Guidance

- Start by running the test suite and examining the failing test output carefully. The error messages reveal the path format mismatch.
- Trace how snippet IDs are generated: `fileHandler.js` returns glob results → `modelWorkers/snippet.js` uses `filePath.replace(snippetPrefix, '').slice(0, -3)` to generate the ID. If `filePath` has backslashes but `snippetPrefix` has forward slashes, the replace fails and the full path leaks into the ID.
- The `glob` package (v11+) supports a `{ posix: true }` option that forces forward-slash output regardless of OS. The glob patterns themselves must also be normalized before being passed in.
- Verify your fix by running `npx vitest run` — all tests except one (which is intentionally skipped) should pass.

## Constraints

- The fix should be minimal and targeted — only modify the `globSync` call sites.
- Do not modify test files or fixtures.
- The solution must maintain backward compatibility with Linux/macOS (where paths already use forward slashes).
