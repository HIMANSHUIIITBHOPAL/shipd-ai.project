# Cross-Platform Windows Path Error Fix

## The Error
Running `npm test` on Windows resulted in **16 test failures** in `spec/lib/contentUtils/contentUtils.test.js`. 

This was caused by the `globSync` function used to discover files. On Windows, `globSync` parses backslash paths (e.g., `src\lib\...`) in glob patterns as escape characters instead of directory separators. Furthermore, `globSync` on Windows returns file paths with backslashes instead of standard POSIX forward slashes, confusing downstream text and logic matching that expects purely forward-slashed POSIX paths.

## What Was Fixed
I updated all instances where `globSync` is called to normalize paths using standard POSIX behavior, fixing tests and pathing across OS platforms:
1. Replaced Windows-style backslashes `\` with forward slashes `/` before paths are passed as patterns to `globSync` via `.replace(/\\/g, '/')`.
2. Passed the `{ posix: true }` parameter to `globSync` so that the output paths returned will inherently consist of standard `/` forward slashes, making them work out-of-the-box with Windows environments without disrupting Unix systems.

### Modified Files
- `src/lib/contentUtils/fileHandler.js`
- `src/lib/contentComponents.js`
- `src/lib/preparedQueries.js`
- `src/lib/contentUtils/assetHandler.js`

All tests pass perfectly now!
