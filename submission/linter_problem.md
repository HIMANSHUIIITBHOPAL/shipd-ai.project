## Goal
Improve the content build pipeline by adding a strict static validation layer that intercepts and validates the data objects before they are finalized for site generation.

## Expected Behavior
You belong to the content team and need to ensure that the data extracted from the repository is consistently formatted and complete. 

Currently, the `prepareContent` pipeline orchestrates the extraction of snippets and collections. You must integrate a validation step into this pipeline that checks the extracted objects before they are passed down to mapping and export logic.

Specifically, your integrated solution must enforce these rules:
- **Presence Check**: Every item (Snippet or Collection) must have a non-empty name/title. 
- **Length Constraint**: Snippet titles must specifically be no longer than 80 characters.
- **Tag Integrity**: For snippets, the semi-colon delimited tag string must be validated against the global repository settings. Every tag used must exist as a valid key in the settings.
- **Link Safety**: Snippet HTML content (descriptions) must not contain any hardcoded "localhost" URLs.

**Failure Handling**:
If any validation fails, the pipeline must be aborted immediately by throwing an Error. To ensure the CI/CD pipeline tracks this correctly, the error message MUST start with the prefix: `"Content Linter Validation Failed"`.

The implementation should be integrated organically into the existing data flow, ensuring that validation happens as part of the extraction lifecycle.
