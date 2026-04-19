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

  const getBadSnippet = (overrides = {}) => ({
    id: 'test-snippet',
    title: 'Valid Title',
    tags: 'javascript',
    descriptionHtml: '<p>Valid desc</p>',
    fullDescriptionHtml: '<p>Content</p>',
    ...overrides,
  });

  const runPipeline = async (snippets) => {
    Extractor.extractData.mockResolvedValue({
      collections: [],
      snippets,
      languages: [],
      collectionSnippets: []
    });
    const utils = new ContentUtils();
    await utils.prepareContent(true);
  };

  it('should pass pipeline for perfectly valid data', async () => {
    await expect(runPipeline([getBadSnippet()])).resolves.not.toThrow();
  });

  it('should abort pipeline on title validation failures', async () => {
    await expect(runPipeline([getBadSnippet({ title: '' })])).rejects.toThrow(/Content Linter Validation Failed/);
    await expect(runPipeline([getBadSnippet({ title: 'A'.repeat(81) })])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should abort pipeline on missing or invalid tags', async () => {
    await expect(runPipeline([getBadSnippet({ tags: '' })])).rejects.toThrow(/Content Linter Validation Failed/);
    await expect(runPipeline([getBadSnippet({ tags: 'javascript;made-up-tag' })])).rejects.toThrow(/Content Linter Validation Failed/);
  });

  it('should abort pipeline on prohibited localhost URLs', async () => {
    await expect(runPipeline([getBadSnippet({ fullDescriptionHtml: '<a href="http://localhost:3000/bad">Click me</a>' })])).rejects.toThrow(/Content Linter Validation Failed/);
  });
});
