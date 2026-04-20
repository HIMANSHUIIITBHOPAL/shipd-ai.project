Add a validation step to `prepareContent` that checks extracted data before export.

Validate all extracted snippets and collections:

- **Title**: Every item must have a non-empty name or title. Snippet titles must be no longer than 80 characters.
- **Tags**: Every tag in a snippet's tag string must exist in the repository's global settings.
- **URLs**: Snippet HTML content must not contain hardcoded "localhost" links.

If any validation fails, throw an Error. The error message must start with: `"Content Linter Validation Failed"`.
