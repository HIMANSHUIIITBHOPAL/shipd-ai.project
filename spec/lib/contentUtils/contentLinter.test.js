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

  const expectLinterFailure = async (snippets, expectedPhrases) => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    try {
      await ContentLinter.lint(snippets);
      expect.fail('Linter should have thrown an error but passed.');
    } catch (err) {
      // Must start with exactly the requested prefix
      expect(err.message.startsWith('Content Linter Validation Failed')).toBe(true);
      
      expectedPhrases.forEach(phrase => {
        expect(err.message).toContain(phrase);
      });
    }
  };

  it('should pass for a valid snippet', async () => {
    expect(ContentLinter, 'ContentLinter module has not been implemented!').not.toBeNull();
    const result = await ContentLinter.lint([getValidSnippet()]);
    expect(result).toBe(true);
  });

  it('should handle title validation and edge cases', async () => {
    await expectLinterFailure([getValidSnippet({ title: null })], ['Snippet is missing a title']);
    await expectLinterFailure([getValidSnippet({ title: undefined })], ['Snippet is missing a title']);
    await expectLinterFailure([getValidSnippet({ title: '' })], ['Snippet is missing a title']);
    const longTitleText = 'A'.repeat(81);
    await expectLinterFailure([getValidSnippet({ title: longTitleText })], ['Title exceeds maximum length']);
  });

  it('should handle tag validation', async () => {
    await expectLinterFailure([getValidSnippet({ tags: null })], ['Snippet is missing tags']);
    await expectLinterFailure([getValidSnippet({ tags: undefined })], ['Snippet is missing tags']);
    await expectLinterFailure([getValidSnippet({ tags: '' })], ['Snippet is missing tags']);
    await expectLinterFailure([getValidSnippet({ tags: 'javascript;made-up-tag' })], ['Invalid tag used']);
  });

  it('should handle description validation (length bounds and missing)', async () => {
    const longDesc = 'A'.repeat(501);
    await expectLinterFailure([getValidSnippet({ descriptionHtml: `<p>${longDesc}</p>` })], ['Description text is too long']);
    await expectLinterFailure([getValidSnippet({ descriptionHtml: '<p>A</p>' })], ['Description text is too short']);
    await expectLinterFailure([getValidSnippet({ descriptionHtml: null })], ['Snippet is missing a short description']);
    await expectLinterFailure([getValidSnippet({ descriptionHtml: undefined })], ['Snippet is missing a short description']);
  });

  it('should handle localhost links', async () => {
    await expectLinterFailure([getValidSnippet({ fullDescriptionHtml: '<a href="http://localhost:3000/bad">Click me</a>' })], ['Content contains hardcoded localhost URLs']);
  });

  it('should aggregate multiple violations across multiple snippets', async () => {
    const snippet1 = getValidSnippet({ title: '', tags: null }); // Two errors
    const snippet2 = getValidSnippet({ descriptionHtml: `<p>${'A'.repeat(501)}</p>` }); // One error

    await expectLinterFailure([snippet1, snippet2], [
      'Snippet is missing a title',
      'Snippet is missing tags',
      'Description text is too long'
    ]);
  });
});
