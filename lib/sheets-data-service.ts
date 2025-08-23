/**
 * Service for fetching and parsing data from Google Sheets CSV export
 * Implements requirements 3.1, 3.2, 3.4
 */

export interface URLRecord {
  id: string;
  to: string;
  description: string;
}

/**
 * Custom error types for better error handling
 */
export class SheetsServiceError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'SheetsServiceError';
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, SheetsServiceError.prototype);
  }
}

export class SheetsNetworkError extends SheetsServiceError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'SheetsNetworkError';
    Object.setPrototypeOf(this, SheetsNetworkError.prototype);
  }
}

export class SheetsDataError extends SheetsServiceError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'SheetsDataError';
    Object.setPrototypeOf(this, SheetsDataError.prototype);
  }
}

export class SheetsAuthError extends SheetsServiceError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'SheetsAuthError';
    Object.setPrototypeOf(this, SheetsAuthError.prototype);
  }
}

export class SheetsDataService {
  private readonly SHEET_ID = '1WPO2Hs53oFtPExN3kZLFfJtsRclE1ZA3uat59elqXwg';
  private readonly CSV_URL: string;
  private cachedData: URLRecord[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.CSV_URL = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv`;
  }

  /**
   * Fetches sheet data from Google Sheets CSV export
   * Implements caching to reduce API calls
   * @returns Promise<URLRecord[]> Array of URL records
   * @throws Error when fetch fails or data is invalid
   */
  async fetchSheetData(): Promise<URLRecord[]> {
    // Return cached data if still valid
    const now = Date.now();
    if (this.cachedData && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      const response = await fetch(this.CSV_URL, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 403) {
          throw new SheetsAuthError(`Google Sheets access denied: ${response.status} ${response.statusText}. The sheet may not be publicly accessible.`);
        } else if (response.status === 404) {
          throw new SheetsDataError(`Google Sheet not found: ${response.status} ${response.statusText}. Please check the sheet ID.`);
        } else if (response.status >= 500) {
          throw new SheetsServiceError(`Google Sheets service error: ${response.status} ${response.statusText}. Please try again later.`);
        } else {
          throw new SheetsNetworkError(`Failed to fetch sheet data: ${response.status} ${response.statusText}`);
        }
      }

      const csvText = await response.text();
      
      if (!csvText || csvText.trim().length === 0) {
        throw new SheetsDataError('Received empty response from Google Sheets. The sheet may be empty or inaccessible.');
      }

      const parsedData = this.parseCSVData(csvText);
      
      // Update cache
      this.cachedData = parsedData;
      this.lastFetchTime = now;
      
      return parsedData;
    } catch (error) {
      // If we have cached data and fetch fails, return cached data for network errors
      if (this.cachedData && (error instanceof SheetsNetworkError || error instanceof SheetsServiceError)) {
        console.warn('Failed to fetch fresh data, returning cached data:', error);
        return this.cachedData;
      }
      
      // Re-throw custom errors as-is
      if (error instanceof SheetsServiceError) {
        throw error;
      }
      
      // Handle network/fetch errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SheetsNetworkError('Network error: Unable to connect to Google Sheets. Please check your internet connection.', error);
      }
      
      // Handle other errors
      if (error instanceof Error) {
        throw new SheetsServiceError(`Google Sheets fetch failed: ${error.message}`, error);
      }
      
      throw new SheetsServiceError('Unknown error occurred while fetching Google Sheets data');
    }
  }

  /**
   * Finds a URL record by its ID
   * @param id The ID to search for
   * @returns Promise<URLRecord | null> The found record or null
   */
  async findUrlById(id: string): Promise<URLRecord | null> {
    try {
      const data = await this.fetchSheetData();
      return data.find(record => record.id === id) || null;
    } catch (error) {
      console.error('Error finding URL by ID:', error);
      throw error;
    }
  }

  /**
   * Parses CSV text data into JavaScript objects
   * Expected format: id,to,description (with header row)
   * @param csvText Raw CSV text from Google Sheets
   * @returns URLRecord[] Array of parsed URL records
   * @throws Error when CSV format is invalid
   */
  parseCSVData(csvText: string): URLRecord[] {
    if (!csvText || typeof csvText !== 'string') {
      throw new SheetsDataError('Invalid CSV data: empty or non-string input');
    }

    // Parse the entire CSV into rows, handling quoted fields that may contain newlines
    const rows = this.parseCSVRows(csvText);
    
    if (rows.length < 2) {
      throw new SheetsDataError('Invalid CSV data: must contain at least header and one data row');
    }

    // Parse header row to validate structure
    const headers = rows[0];
    
    // Validate expected columns (case-insensitive)
    const expectedHeaders = ['id', 'to', 'description'];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    for (const expectedHeader of expectedHeaders) {
      if (!normalizedHeaders.includes(expectedHeader)) {
        throw new SheetsDataError(`Missing required column: ${expectedHeader}. Found columns: ${headers.join(', ')}`);
      }
    }

    // Find column indices
    const idIndex = normalizedHeaders.indexOf('id');
    const toIndex = normalizedHeaders.indexOf('to');
    const descriptionIndex = normalizedHeaders.indexOf('description');

    const records: URLRecord[] = [];

    // Parse data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      
      // Skip empty rows
      if (!values || values.every(v => !v.trim())) {
        continue;
      }

      try {
        // Ensure we have enough columns
        if (values.length <= Math.max(idIndex, toIndex, descriptionIndex)) {
          console.warn(`Skipping row ${i + 1}: insufficient columns`);
          continue;
        }

        const id = values[idIndex]?.trim();
        const to = values[toIndex]?.trim();
        const description = values[descriptionIndex]?.trim() || '';

        // Validate required fields
        if (!id || !to) {
          console.warn(`Skipping row ${i + 1}: missing required fields (id: "${id}", to: "${to}")`);
          continue;
        }

        // Validate URL format
        if (!this.isValidUrl(to)) {
          console.warn(`Skipping row ${i + 1}: invalid URL format: "${to}"`);
          continue;
        }

        records.push({
          id,
          to,
          description
        });
      } catch (error) {
        console.warn(`Error parsing row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }

    if (records.length === 0) {
      throw new SheetsDataError('No valid records found in CSV data');
    }

    return records;
  }

  /**
   * Parses CSV text into rows, handling quoted fields that may contain newlines
   * @param csvText Complete CSV text
   * @returns string[][] Array of rows, each containing field values
   */
  private parseCSVRows(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < csvText.length) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // Row separator (handle both \n and \r\n)
        currentRow.push(currentField);
        if (currentRow.some(field => field.trim())) {
          // Only add non-empty rows
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        
        // Skip \r\n sequence
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    }

    // Add the last field and row
    currentRow.push(currentField);
    if (currentRow.some(field => field.trim())) {
      rows.push(currentRow);
    }

    return rows;
  }

  /**
   * Parses a single CSV line, handling quoted values and commas
   * @param line CSV line to parse
   * @returns string[] Array of field values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Validates if a string is a valid URL
   * @param url String to validate
   * @returns boolean True if valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clears the cached data (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetchTime = 0;
  }
}