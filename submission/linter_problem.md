Title: Feature Request: Add Content Linter to Build Pipeline

Problem Description:
The current content pipeline lacks static analysis, meaning snippets with invalid formatting or non-existent tags can be deployed. We need to introduce a strict `ContentLinter` module to intercept the build pipeline and abort it if formatting rules are violated.

Create a new static analysis module `src/lib/contentUtils/contentLinter.js` that exports a `ContentLinter` class. This class must implement an `async lint(snippets)` method that processes all extracted snippet data right before they are mapped in `src/lib/contentUtils/contentUtils.js`'s `prepareContent` method.

Your `ContentLinter` must enforce the following strict formatting rules on every snippet:
1. **Title Validation**: The snippet must have a `title`. If present, the title must be no longer than 80 characters.
2. **Tag Validation**: The snippet must define at least one tag. Every tag applied must strictly exist as a key within the global `settings.tags` object imported from `#src/config/settings.js`.
3. **Description Validation**: `descriptionHtml` must be present. When stripped of its HTML tags, the plain text text must be between 10 and 500 characters.
4. **Link Validation**: The snippet's `fullDescriptionHtml` must not contain any hardcoded localhost URLs (e.g., `href="http://localhost:3000..."`).

If any snippet violates one or more rules, the Linter must aggregate all violations across all snippets and throw a formatted `Error` containing a summary of the failing snippet IDs and their exact violations. 

To complete this ticket:
1. Build the new `ContentLinter` class at `src/lib/contentUtils/contentLinter.js`.
2. Hook it into the pipeline inside `src/lib/contentUtils/contentUtils.js` by awaiting `ContentLinter.lint(snippets)` right after `extractData` completes.
