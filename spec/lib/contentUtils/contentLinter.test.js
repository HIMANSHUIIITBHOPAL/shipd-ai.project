import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentUtils from '#src/lib/contentUtils/contentUtils.js';
import * as Extractor from '#src/lib/contentUtils/extractor.js';

vi.mock('#src/lib/contentUtils/extractor.js', () => ({
  extractData: vi.fn(),
}));

describe('Pipeline Content Linter Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const getValidSnippet = (overrides = {}) => ({
    id: 'test-snippet',
    title: 'Valid Title',
    tags: 'javascript',
    descriptionHtml: '<p>Valid desc</p>',
    fullDescriptionHtml: '<p>Content</p>',
    ...overrides,
  });

  const getValidCollection = (overrides = {}) => ({
    id: 'test-collection',
    name: 'Valid Collection',
    description: 'This is a valid collection description.',
    ...overrides,
  });

  const runPipeline = async (snippets, collections = [getValidCollection()]) => {
    Extractor.extractData.mockResolvedValue({
      collections,
      snippets,
      languages: [],
      collectionSnippets: []
    });
    const utils = new ContentUtils();
    await utils.prepareContent(true);
  };

  it('should pass pipeline for perfectly valid data', async () => {
    await expect(runPipeline([getValidSnippet()])).resolves.not.toThrow();
  });

  it('should abort pipeline on title validation failures', async () => {
    // Missing title
    await expect(runPipeline([getValidSnippet({ title: '' })])).rejects.toThrow(/Content Linter Validation Failed/);
    // Too long title (81 chars)
    await expect(runPipeline([getValidSnippet({ title: 'A'.repeat(81) })])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should abort pipeline on missing or invalid tags', async () => {
    // Missing tags
    await expect(runPipeline([getValidSnippet({ tags: '' })])).rejects.toThrow(/Content Linter Validation Failed/);
    // Invalid tag
    await expect(runPipeline([getValidSnippet({ tags: 'javascript;made-up-tag' })])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should abort pipeline on prohibited localhost URLs', async () => {
    await expect(runPipeline([getValidSnippet({ fullDescriptionHtml: '<a href="http://localhost:3000/bad">Click me</a>' })])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should abort pipeline on collection validation failures', async () => {
    // Collection missing name
    await expect(runPipeline([getValidSnippet()], [getValidCollection({ name: '' })])).rejects.toThrow(/Content Linter Validation Failed/);
  });
});
