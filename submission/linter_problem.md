Add a validation step to `prepareContent`.

Validate all snippets and collections:

- **Title**: Every item must have a non-empty name or title. Snippet titles must be no longer than 80 characters.
- **Tags**: Snippets must have at least one tag, and every tag must exist in the repository's global settings.
- **URLs**: Snippet HTML content must not contain "localhost" links.

If any validation fails, throw an Error. The error message must start with: `"Content Linter Validation Failed"`.
