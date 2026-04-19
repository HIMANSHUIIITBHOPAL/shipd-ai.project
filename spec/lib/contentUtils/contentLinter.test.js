import { describe, it, expect, beforeAll } from 'vitest';

describe('ContentLinter', () => {
  let ContentLinter = null;

  beforeAll(async () => {
    try {
      const module = await import('#src/lib/contentUtils/contentLinter.js');
      ContentLinter = module.default;
    } catch (err) {
      ContentLinter = null;
    }
  });

  const getValidSnippet = (overrides = {}) => ({
    id: 'valid-snippet',
    title: 'A Valid Snippet',
    tags: 'javascript;node',
    descriptionHtml: '<p>This is a perfectly valid short description of a snippet.</p>',
    fullDescriptionHtml: '<p>No bad links here.</p>',
    ...overrides,
  });

  it('should pass for a valid snippet', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const result = await ContentLinter.lint([getValidSnippet()]);
    expect(result).toBe(true);
  });

  it('should handle title validation and edge cases', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const noTitle = getValidSnippet({ title: '' });
    const longTitleText = 'A'.repeat(81);
    const longTitle = getValidSnippet({ title: longTitleText });

    await expect(ContentLinter.lint([noTitle])).rejects.toThrow(/Snippet is missing a title/);
    await expect(ContentLinter.lint([longTitle])).rejects.toThrow(/Title exceeds maximum length/);
  });

  it('should handle tag validation', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const missingTags = getValidSnippet({ tags: '' });
    const invalidTags = getValidSnippet({ tags: 'javascript;made-up-tag' });

    await expect(ContentLinter.lint([missingTags])).rejects.toThrow(/Snippet is missing tags/);
    await expect(ContentLinter.lint([invalidTags])).rejects.toThrow(/Validation Failed/); // Generalized check
  });

  it('should handle description validation (length bounds)', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const longDesc = 'A'.repeat(501);
    const invalidDescSnippet = getValidSnippet({ descriptionHtml: `<p>${longDesc}</p>` });
    const shortDescSnippet = getValidSnippet({ descriptionHtml: '<p>A</p>' });
    const noDescSnippet = getValidSnippet({ descriptionHtml: null });

    await expect(ContentLinter.lint([invalidDescSnippet])).rejects.toThrow(/Description text is too long/);
    await expect(ContentLinter.lint([shortDescSnippet])).rejects.toThrow(/Description text is too short/);
    await expect(ContentLinter.lint([noDescSnippet])).rejects.toThrow(/Snippet is missing a short description/);
  });

  it('should handle localhost links', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const badLinkSnippet = getValidSnippet({ fullDescriptionHtml: '<a href="http://localhost:3000/bad">Click me</a>' });

    await expect(ContentLinter.lint([badLinkSnippet])).rejects.toThrow(/Content contains hardcoded localhost URLs/);
  });

  it('should aggregate multiple violations across multiple snippets', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const snippet1 = getValidSnippet({ title: '', tags: '' }); // Two errors
    const snippet2 = getValidSnippet({ descriptionHtml: `<p>${'A'.repeat(501)}</p>` }); // One error

    try {
      await ContentLinter.lint([snippet1, snippet2]);
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).toMatch(/Content Linter Validation Failed/);
      expect(err.message).toMatch(/Snippet is missing a title/);
      expect(err.message).toMatch(/Snippet is missing tags/);
      expect(err.message).toMatch(/Description text is too long/);
    }
  });
});
