## Goal
Add a strict content static-analyzer (linter) to the build pipeline to prevent malformed snippets or collections from being generated into the site content. 

## Expected Behavior
You must implement a new module at exactly `#src/lib/contentUtils/contentLinter.js`. This file must export a default object or class named `ContentLinter`.

Your `ContentLinter` must provide the following method:
`async function lint(snippets: Array<Snippet>): Promise<boolean>`

This method MUST resolve `true` on success. On failure, it MUST reject by throwing an `Error`. The thrown error message must begin with exactly this top-level prefix: `'Content Linter Validation Failed'`.

The linter must enforce the following validation rules on every snippet. If any rules are violated, the exact rule-specific phrases listed below must be included in the aggregated error message:
1. **Title**: The snippet must have a `title`. If missing, the error must contain: `'Snippet is missing a title'`.
2. **Tags**: The `snippet.tags` property will be passed as a semicolon-delimited string (e.g. `'javascript;node'`). You must parse it and verify every tag exists as a key in `settings.tags` (imported from `#src/config/settings.js`).
3. **Description**: `descriptionHtml` must be present. When stripped of its HTML tags, the plain text length must be at most 500 characters. If it exceeds this, the error must contain: `'Description text is too long'`.
4. **Links**: The snippet's HTML content must not contain any hardcoded localhost URLs. If found, the error must contain: `'Content contains hardcoded localhost URLs'`.

## Constraints
* Do not disable or break existing content generation. 
* The linter should aggregate all snippet violations across all rules before throwing its final Error.
