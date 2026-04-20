import settings from '#src/config/settings.js';

class LinterError extends Error {
  constructor(message, violations) {
    super(message);
    this.name = 'LinterError';
    this.violations = violations;
  }
}

class ValidationResult {
  constructor(isValid, error = null) {
    this.isValid = isValid;
    this.error = error;
  }
}

export default class ContentLinter {
  static RULES = {
    MAX_TITLE_LENGTH: 80,
  };

  /**
   * Lint snippets and collections.
   * @param {Array} snippets 
   * @param {Array} collections 
   */
  static async lint(snippets, collections) {
    const violations = [];
    const validTags = Object.keys(settings.tags);

    // Validate Snippets
    for (const snippet of snippets) {
      const snippetViolations = [];

      // Title validation
      const titleRes = this.validateTitle(snippet?.title);
      if (!titleRes.isValid) snippetViolations.push(...titleRes.error);

      // Tags validation
      const tagsRes = this.validateTags(snippet?.tags, validTags);
      if (!tagsRes.isValid) snippetViolations.push(...tagsRes.error);

      // Link validation
      const linkRes = this.validateLinks(snippet?.fullDescriptionHtml);
      if (!linkRes.isValid) snippetViolations.push(...linkRes.error);

      if (snippetViolations.length > 0) {
        violations.push({ id: `Snippet ${snippet?.id || 'unknown'}`, errors: snippetViolations });
      }
    }

    // Validate Collections
    for (const collection of collections) {
      const colViolations = [];
      const titleRes = this.validateTitle(collection?.name);
      if (!titleRes.isValid) colViolations.push(...titleRes.error);

      if (colViolations.length > 0) {
        violations.push({ id: `Collection ${collection?.id || 'unknown'}`, errors: colViolations });
      }
    }

    if (violations.length > 0) {
      this.formatAndThrow(violations);
    }
    return true;
  }

  static validateTitle(title) {
    const errors = [];
    if (!title || title.trim().length === 0) {
      errors.push('Item is missing a non-empty name/title.');
    } else if (title.length > this.RULES.MAX_TITLE_LENGTH) {
      errors.push(`Title exceeds maximum length of ${this.RULES.MAX_TITLE_LENGTH} characters.`);
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static validateTags(tagsString, validTags) {
    const errors = [];
    if (!tagsString || tagsString.trim().length === 0) {
      errors.push('Snippet is missing tags.');
      return new ValidationResult(false, errors);
    }
    
    // In our model extraction, tags are joined by semicolon
    const tags = tagsString.split(';');
    for (const tag of tags) {
      if (!validTags.includes(tag.trim())) {
         errors.push(`Invalid tag used: "${tag}".`);
      }
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static validateLinks(htmlContent) {
    const errors = [];
    if (!htmlContent) return new ValidationResult(true, []);
    
    // Simple regex to catch localhost links which shouldn't be in prod content
    const localhostRegex = /href=["']?http:\/\/localhost:/gi;
    if (localhostRegex.test(htmlContent)) {
      errors.push('Content contains hardcoded localhost URLs.');
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static formatAndThrow(violations) {
    let errorMessage = 'Content Linter Validation Failed\n\n';
    
    for (const violation of violations) {
      errorMessage += `[${violation.id}]\n`;
      for (const err of violation.errors) {
        errorMessage += `  -> ERROR: ${err}\n`;
      }
      errorMessage += '\n';
    }

    throw new LinterError(errorMessage, violations);
  }
}
