import { describe, it, expect } from 'vitest';
import FileHandler from '#src/lib/contentUtils/fileHandler.js';

describe('Cross-Platform globSync Normalization', () => {
  it('should resolve files correctly when passed Windows-style backslash paths', () => {
    // Windows-style pattern with backslashes that breaks unpatched glob calls
    const pattern = `spec\\fixtures\\content\\snippets\\**\\*.md`;
    const files = FileHandler.read(pattern);
    
    expect(files).toBeDefined();
    expect(files).not.toBeNull();
    // FileHandler.read returns a map or array of parsed file data 
    // Usually it returns an array if length > 1, or single item. Let's just check length > 0
    if (Array.isArray(files)) {
        expect(files.length).toBeGreaterThan(0);
    } else {
        expect(Object.keys(files).length).toBeGreaterThan(0);
    }
  });
});
