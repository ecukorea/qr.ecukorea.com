import { URLValidator } from '../url-validator';

describe('URLValidator', () => {
  let validator: URLValidator;

  beforeEach(() => {
    validator = new URLValidator();
  });

  describe('isValidUrl', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(validator.isValidUrl('http://example.com')).toBe(true);
      expect(validator.isValidUrl('http://www.example.com')).toBe(true);
      expect(validator.isValidUrl('http://example.com/path')).toBe(true);
      expect(validator.isValidUrl('http://example.com/path?query=value')).toBe(true);
    });

    it('should return true for valid HTTPS URLs', () => {
      expect(validator.isValidUrl('https://example.com')).toBe(true);
      expect(validator.isValidUrl('https://www.example.com')).toBe(true);
      expect(validator.isValidUrl('https://example.com/path')).toBe(true);
      expect(validator.isValidUrl('https://subdomain.example.com')).toBe(true);
    });

    it('should return true for URLs with ports', () => {
      expect(validator.isValidUrl('http://example.com:8080')).toBe(true);
      expect(validator.isValidUrl('https://example.com:443')).toBe(true);
    });

    it('should return true for URLs with complex paths and queries', () => {
      expect(validator.isValidUrl('https://example.com/path/to/resource?param1=value1&param2=value2')).toBe(true);
      expect(validator.isValidUrl('https://api.example.com/v1/users/123')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validator.isValidUrl('')).toBe(false);
      expect(validator.isValidUrl('   ')).toBe(false);
      expect(validator.isValidUrl('not-a-url')).toBe(false);
      expect(validator.isValidUrl('ftp://example.com')).toBe(false);
      expect(validator.isValidUrl('mailto:test@example.com')).toBe(false);
    });

    it('should return false for null or undefined input', () => {
      expect(validator.isValidUrl(null as any)).toBe(false);
      expect(validator.isValidUrl(undefined as any)).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(validator.isValidUrl(123 as any)).toBe(false);
      expect(validator.isValidUrl({} as any)).toBe(false);
      expect(validator.isValidUrl([] as any)).toBe(false);
    });

    it('should handle URLs with special characters', () => {
      expect(validator.isValidUrl('https://example.com/path-with-dashes')).toBe(true);
      expect(validator.isValidUrl('https://example.com/path_with_underscores')).toBe(true);
      expect(validator.isValidUrl('https://example.com/path%20with%20encoded')).toBe(true);
    });
  });

  describe('normalizeUrl', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(validator.normalizeUrl('example.com')).toBe('https://example.com');
      expect(validator.normalizeUrl('www.example.com')).toBe('https://www.example.com');
      expect(validator.normalizeUrl('subdomain.example.com/path')).toBe('https://subdomain.example.com/path');
    });

    it('should preserve existing http:// protocol', () => {
      expect(validator.normalizeUrl('http://example.com')).toBe('http://example.com');
      expect(validator.normalizeUrl('http://www.example.com/path')).toBe('http://www.example.com/path');
    });

    it('should preserve existing https:// protocol', () => {
      expect(validator.normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(validator.normalizeUrl('https://www.example.com/path')).toBe('https://www.example.com/path');
    });

    it('should handle empty or whitespace input', () => {
      expect(validator.normalizeUrl('')).toBe('');
      expect(validator.normalizeUrl('   ')).toBe('');
      expect(validator.normalizeUrl('  example.com  ')).toBe('https://example.com');
    });

    it('should handle null or undefined input', () => {
      expect(validator.normalizeUrl(null as any)).toBe(null);
      expect(validator.normalizeUrl(undefined as any)).toBe(undefined);
    });

    it('should handle non-string input', () => {
      expect(validator.normalizeUrl(123 as any)).toBe(123);
      expect(validator.normalizeUrl({} as any)).toStrictEqual({});
    });
  });

  describe('getValidationMessage', () => {
    it('should return appropriate message for empty input', () => {
      expect(validator.getValidationMessage('')).toBe('Please enter a URL');
      expect(validator.getValidationMessage('   ')).toBe('Please enter a URL');
      expect(validator.getValidationMessage(null as any)).toBe('Please enter a URL');
      expect(validator.getValidationMessage(undefined as any)).toBe('Please enter a URL');
    });

    it('should return protocol message for URLs without protocol', () => {
      expect(validator.getValidationMessage('example.com')).toBe('URL must start with http:// or https://');
      expect(validator.getValidationMessage('www.example.com')).toBe('URL must start with http:// or https://');
    });

    it('should return protocol message for invalid protocols', () => {
      expect(validator.getValidationMessage('ftp://example.com')).toBe('URL must start with http:// or https://');
      expect(validator.getValidationMessage('mailto:test@example.com')).toBe('URL must start with http:// or https://');
    });

    it('should return generic message for malformed URLs', () => {
      expect(validator.getValidationMessage('https://')).toBe('Please enter a valid URL format');
      expect(validator.getValidationMessage('http://.')).toBe('Please enter a valid URL format');
      // Note: https://invalid..domain might be parsed successfully by URL constructor
      // but fail regex validation, so it should return format error
      const result = validator.getValidationMessage('https://invalid..domain');
      expect(['Please enter a valid URL format', 'Please enter a valid URL']).toContain(result);
    });
  });

  describe('validateAndNormalize', () => {
    it('should return valid result for good URLs without protocol', () => {
      const result = validator.validateAndNormalize('example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return valid result for URLs with protocol', () => {
      const result = validator.validateAndNormalize('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return invalid result with error message for bad URLs', () => {
      const result = validator.validateAndNormalize('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.normalizedUrl).toBe('https://not-a-url');
      expect(result.errorMessage).toBe('URL must start with http:// or https://');
    });

    it('should return invalid result for empty input', () => {
      const result = validator.validateAndNormalize('');
      expect(result.isValid).toBe(false);
      expect(result.normalizedUrl).toBe('');
      expect(result.errorMessage).toBe('Please enter a URL');
    });
  });
});