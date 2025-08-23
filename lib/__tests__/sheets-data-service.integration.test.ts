/**
 * Integration tests for SheetsDataService
 * Tests actual CSV parsing with realistic data formats
 */

import { SheetsDataService } from '../sheets-data-service';

describe('SheetsDataService Integration Tests', () => {
  let service: SheetsDataService;

  beforeEach(() => {
    service = new SheetsDataService();
    service.clearCache();
  });

  it('should handle realistic CSV data with various edge cases', () => {
    // Realistic CSV data that might come from Google Sheets
    const csvData = `id,to,description
abc123,https://example.com,Simple test link
def456,https://www.google.com/search?q=test+query,Google search with parameters
ghi789,https://github.com/user/repo,"GitHub repo, with comma in description"
jkl012,https://very-long-domain-name.example.org/path/to/resource?param1=value1&param2=value2,Very long URL with parameters
mno345,https://subdomain.example.com:8080/api/v1/endpoint,URL with port and API path
pqr678,https://example.com/path with spaces,URL with spaces (should be encoded)
stu901,https://example.com,
vwx234,https://example.com/emoji-🚀-test,URL with emoji`;

    const result = service.parseCSVData(csvData);

    expect(result).toHaveLength(8);
    
    // Test various URL formats are preserved
    expect(result[1].to).toBe('https://www.google.com/search?q=test+query');
    expect(result[2].description).toBe('GitHub repo, with comma in description');
    expect(result[3].to).toBe('https://very-long-domain-name.example.org/path/to/resource?param1=value1&param2=value2');
    expect(result[4].to).toBe('https://subdomain.example.com:8080/api/v1/endpoint');
    expect(result[6].description).toBe('');
    expect(result[7].to).toBe('https://example.com/emoji-🚀-test');
  });

  it('should handle CSV with Windows line endings', () => {
    const csvData = `id,to,description\r\nabc123,https://example.com,Test link\r\ndef456,https://google.com,Another test`;

    const result = service.parseCSVData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('abc123');
    expect(result[1].id).toBe('def456');
  });

  it('should handle CSV with mixed quote styles and escaping', () => {
    const csvData = `id,to,description
abc123,https://example.com,"Description with ""quotes"" inside"
def456,https://google.com,"Multi-line
description with newline"
ghi789,https://github.com,Normal description`;

    const result = service.parseCSVData(csvData);

    expect(result).toHaveLength(3);
    expect(result[0].description).toBe('Description with "quotes" inside');
    expect(result[1].description).toBe('Multi-line\ndescription with newline');
    expect(result[2].description).toBe('Normal description');
  });

  it('should handle CSV with extra whitespace', () => {
    const csvData = `  id  ,  to  ,  description  
  abc123  ,  https://example.com  ,  Test link  
  def456  ,  https://google.com  ,    `;

    const result = service.parseCSVData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('abc123');
    expect(result[0].to).toBe('https://example.com');
    expect(result[0].description).toBe('Test link');
    expect(result[1].description).toBe('');
  });

  it('should handle CSV with different column orders', () => {
    const csvData = `description,id,to
Test link,abc123,https://example.com
Another test,def456,https://google.com`;

    const result = service.parseCSVData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'abc123',
      to: 'https://example.com',
      description: 'Test link'
    });
  });
});