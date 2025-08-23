/**
 * Tests for SheetsDataService
 * Verifies CSV parsing logic and error handling
 */

import { SheetsDataService, URLRecord } from '../sheets-data-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('SheetsDataService', () => {
  let service: SheetsDataService;

  beforeEach(() => {
    service = new SheetsDataService();
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('parseCSVData', () => {
    it('should parse valid CSV data correctly', () => {
      const csvData = `id,to,description
abc123,https://example.com,Test link
def456,https://google.com,Google search
ghi789,https://github.com,GitHub homepage`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'abc123',
        to: 'https://example.com',
        description: 'Test link'
      });
      expect(result[1]).toEqual({
        id: 'def456',
        to: 'https://google.com',
        description: 'Google search'
      });
      expect(result[2]).toEqual({
        id: 'ghi789',
        to: 'https://github.com',
        description: 'GitHub homepage'
      });
    });

    it('should handle CSV with quoted fields containing commas', () => {
      const csvData = `id,to,description
abc123,https://example.com,"Test link, with comma"
def456,https://google.com,"Another, test"`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('Test link, with comma');
      expect(result[1].description).toBe('Another, test');
    });

    it('should handle empty description fields', () => {
      const csvData = `id,to,description
abc123,https://example.com,
def456,https://google.com,Test`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('');
      expect(result[1].description).toBe('Test');
    });

    it('should skip rows with missing required fields', () => {
      const csvData = `id,to,description
abc123,https://example.com,Valid row
,https://google.com,Missing ID
def456,,Missing URL
ghi789,https://github.com,Valid row 2`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('abc123');
      expect(result[1].id).toBe('ghi789');
    });

    it('should skip rows with invalid URLs', () => {
      const csvData = `id,to,description
abc123,https://example.com,Valid URL
def456,not-a-url,Invalid URL
ghi789,https://github.com,Valid URL 2`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(2);
      expect(result[0].to).toBe('https://example.com');
      expect(result[1].to).toBe('https://github.com');
    });

    it('should throw error for empty CSV data', () => {
      expect(() => service.parseCSVData('')).toThrow('Invalid CSV data: empty or non-string input');
      expect(() => service.parseCSVData('   ')).toThrow('Invalid CSV data: must contain at least header and one data row');
    });

    it('should throw error for missing required columns', () => {
      const csvData = `id,url,desc
abc123,https://example.com,Test`;

      expect(() => service.parseCSVData(csvData)).toThrow('Missing required column: to');
    });

    it('should throw error when no valid records found', () => {
      const csvData = `id,to,description
,invalid-url,No valid data`;

      expect(() => service.parseCSVData(csvData)).toThrow('No valid records found in CSV data');
    });

    it('should handle case-insensitive headers', () => {
      const csvData = `ID,TO,DESCRIPTION
abc123,https://example.com,Test link`;

      const result = service.parseCSVData(csvData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'abc123',
        to: 'https://example.com',
        description: 'Test link'
      });
    });
  });

  describe('fetchSheetData', () => {
    it('should fetch and parse data successfully', async () => {
      const mockCsvData = `id,to,description
abc123,https://example.com,Test link`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockCsvData)
      });

      const result = await service.fetchSheetData();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'abc123',
        to: 'https://example.com',
        description: 'Test link'
      });
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(service.fetchSheetData()).rejects.toThrow('Google Sheet not found: 404 Not Found. Please check the sheet ID.');
    });

    it('should throw error when response is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('')
      });

      await expect(service.fetchSheetData()).rejects.toThrow('Received empty response from Google Sheets. The sheet may be empty or inaccessible.');
    });

    it('should use cached data when available and fresh', async () => {
      const mockCsvData = `id,to,description
abc123,https://example.com,Test link`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockCsvData)
      });

      // First call should fetch
      const result1 = await service.fetchSheetData();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await service.fetchSheetData();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(result1);
    });
  });

  describe('findUrlById', () => {
    it('should find URL by ID', async () => {
      const mockCsvData = `id,to,description
abc123,https://example.com,Test link
def456,https://google.com,Google search`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockCsvData)
      });

      const result = await service.findUrlById('def456');

      expect(result).toEqual({
        id: 'def456',
        to: 'https://google.com',
        description: 'Google search'
      });
    });

    it('should return null when ID not found', async () => {
      const mockCsvData = `id,to,description
abc123,https://example.com,Test link`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockCsvData)
      });

      const result = await service.findUrlById('nonexistent');

      expect(result).toBeNull();
    });
  });
});