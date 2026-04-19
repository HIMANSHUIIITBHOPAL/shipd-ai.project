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
    MAX_DESC_LENGTH: 500,
    MIN_DESC_LENGTH: 10,
  };

  static async lint(snippets) {
    const violations = [];
    const validTags = Object.keys(settings.tags);

    for (const snippet of snippets) {
      const snippetViolations = [];

      // Run modular validators
      const titleRes = this.validateTitle(snippet.title);
      if (!titleRes.isValid) snippetViolations.push(...titleRes.error);

      const tagsRes = this.validateTags(snippet.tags, validTags);
      if (!tagsRes.isValid) snippetViolations.push(...tagsRes.error);

      const descRes = this.validateDescription(snippet.descriptionHtml);
      if (!descRes.isValid) snippetViolations.push(...descRes.error);

      const linkRes = this.validateLinks(snippet.fullDescriptionHtml);
      if (!linkRes.isValid) snippetViolations.push(...linkRes.error);

      if (snippetViolations.length > 0) {
        violations.push({ snippetId: snippet.id, errors: snippetViolations });
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
      errors.push('Snippet is missing a title.');
    } else if (title.length > this.RULES.MAX_TITLE_LENGTH) {
      errors.push(`Title exceeds maximum length of ${this.RULES.MAX_TITLE_LENGTH} characters.`);
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static validateTags(tagsString, validTags) {
    const errors = [];
    if (!tagsString) {
      errors.push('Snippet is missing tags.');
      return new ValidationResult(false, errors);
    }
    
    // In our model extraction, tags are joined by semicolon
    const tags = tagsString.split(';');
    for (const tag of tags) {
      if (!validTags.includes(tag.trim())) {
         errors.push(`Invalid tag used: "${tag}". Must be defined in settings.tags.`);
      }
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static validateDescription(descriptionHtml) {
    const errors = [];
    if (!descriptionHtml) {
      errors.push('Snippet is missing a short description/excerpt.');
      return new ValidationResult(false, errors);
    }
    // Strip HTML to check real text length safely
    const textOnly = descriptionHtml.replace(/<[^>]*>?/gm, '').trim();
    if (textOnly.length > this.RULES.MAX_DESC_LENGTH) {
      errors.push(`Description text is too long (${textOnly.length} chars). Max allowed is ${this.RULES.MAX_DESC_LENGTH}.`);
    }
    if (textOnly.length < this.RULES.MIN_DESC_LENGTH) {
      errors.push(`Description text is too short (${textOnly.length} chars). Min allowed is ${this.RULES.MIN_DESC_LENGTH}.`);
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static validateLinks(htmlContent) {
    const errors = [];
    if (!htmlContent) return new ValidationResult(true, []);
    
    // Simple regex to catch localhost links which shouldn't be in prod content
    const localhostRegex = /href=["']?http:\/\/localhost:/gi;
    let match;
    while ((match = localhostRegex.exec(htmlContent)) !== null) {
      errors.push('Content contains hardcoded localhost URLs which are invalid in production.');
    }
    return new ValidationResult(errors.length === 0, errors);
  }

  static formatAndThrow(violations) {
    let errorMessage = '\n\n=== Content Linter Validation Failed ===\n';
    errorMessage += `Linter found exactly ${violations.length} snippet(s) containing strictly invalid formatting:\n\n`;
    
    for (const violation of violations) {
      errorMessage += `[Snippet ID: ${violation.snippetId}]\n`;
      for (const err of violation.errors) {
        errorMessage += `  -> ERROR: ${err}\n`;
      }
      errorMessage += '\n';
    }

    errorMessage += 'ABORTING: Please fix all listed styling and rule violations before generating content.\n';
    throw new LinterError(errorMessage, violations);
  }
}
