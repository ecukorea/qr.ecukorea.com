import { URLValidator } from './url-validator';

/**
 * Example usage of the URLValidator class
 * This demonstrates how to validate and normalize URLs for the QR code generator
 */

const validator = new URLValidator();

// Example URLs to test
const testUrls = [
  'example.com',                    // Missing protocol
  'https://example.com',            // Valid HTTPS URL
  'http://www.example.com/path',    // Valid HTTP URL with path
  'ftp://example.com',              // Invalid protocol
  '',                               // Empty string
  'not-a-url',                      // Invalid format
  'https://api.example.com/v1/users?id=123' // Complex valid URL
];

console.log('URL Validation Examples:\n');

testUrls.forEach(url => {
  console.log(`Testing: "${url}"`);
  
  // Method 1: Individual methods
  const isValid = validator.isValidUrl(url);
  const normalized = validator.normalizeUrl(url);
  const message = validator.getValidationMessage(url);
  
  console.log(`  Valid: ${isValid}`);
  console.log(`  Normalized: "${normalized}"`);
  if (!isValid) {
    console.log(`  Error: ${message}`);
  }
  
  // Method 2: Combined validation and normalization
  const result = validator.validateAndNormalize(url);
  console.log(`  Combined result: ${JSON.stringify(result, null, 2)}`);
  
  console.log('---');
});

// Example usage in a form validation context
export function validateUrlInput(userInput: string): {
  success: boolean;
  url?: string;
  error?: string;
} {
  const result = validator.validateAndNormalize(userInput);
  
  if (result.isValid) {
    return {
      success: true,
      url: result.normalizedUrl
    };
  } else {
    return {
      success: false,
      error: result.errorMessage
    };
  }
}