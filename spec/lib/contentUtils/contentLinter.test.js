import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';

describe('ContentLinter', () => {
  let ContentLinter = null;

  beforeAll(async () => {
    // Dynamically import the linter module. If it hasn't been implemented yet 
    // (i.e. running on base commit without solution patch), this will fail gracefully.
    try {
      const module = await import('#src/lib/contentUtils/contentLinter.js');
      ContentLinter = module.default;
    } catch (err) {
      ContentLinter = null;
    }
  });

  it('should pass for a valid snippet', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const validSnippet = {
      id: 'valid-snippet',
      title: 'A Valid Snippet',
      tags: 'javascript;node',
      descriptionHtml: '<p>This is a perfectly valid short description of a snippet.</p>',
      fullDescriptionHtml: '<p>No bad links here.</p>'
    };

    const result = await ContentLinter.lint([validSnippet]);
    expect(result).toBe(true);
  });

  it('should throw an error for invalid tags', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const invalidTagsSnippet = {
      id: 'invalid-tags',
      title: 'Invalid Tags Snippet',
      tags: 'javascript;made-up-tag',
      descriptionHtml: '<p>Description is perfectly fine here.</p>',
      fullDescriptionHtml: '<p>Content</p>'
    };

    await expect(ContentLinter.lint([invalidTagsSnippet])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should throw an error for overly long descriptions', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const longDesc = 'A'.repeat(501);
    const invalidDescSnippet = {
      id: 'invalid-desc',
      title: 'Long Description Snippet',
      tags: 'css',
      descriptionHtml: `<p>${longDesc}</p>`,
      fullDescriptionHtml: '<p>Content</p>'
    };

    await expect(ContentLinter.lint([invalidDescSnippet])).rejects.toThrow(/Description text is too long/);
  });

  it('should throw an error if missing title', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const noTitleSnippet = {
      id: 'no-title',
      title: '',
      tags: 'html',
      descriptionHtml: '<p>Valid desc</p>',
      fullDescriptionHtml: '<p>Content</p>'
    };

    await expect(ContentLinter.lint([noTitleSnippet])).rejects.toThrow(/Snippet is missing a title/);
  });

  it('should throw an error for localhost links', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const badLinkSnippet = {
      id: 'bad-link',
      title: 'Bad Link Snippet',
      tags: 'php',
      descriptionHtml: '<p>Valid desc</p>',
      fullDescriptionHtml: '<a href="http://localhost:3000/bad">Click me</a>'
    };

    await expect(ContentLinter.lint([badLinkSnippet])).rejects.toThrow(/Content contains hardcoded localhost URLs/);
  });
});
