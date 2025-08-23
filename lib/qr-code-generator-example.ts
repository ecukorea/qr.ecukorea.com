import { QRCodeGenerator, QRCodeGenerationError } from './qr-code-generator';

/**
 * Example usage of the QRCodeGenerator class
 * This demonstrates how to integrate QR code generation into the URL shortener application
 */

// Initialize the QR code generator
const qrGenerator = new QRCodeGenerator();

/**
 * Example 1: Basic QR code generation
 */
export async function basicQRGeneration() {
  try {
    const shortUrl = 'https://short.ly/abc123';
    const qrCodeDataUrl = await qrGenerator.generateQR(shortUrl);
    
    console.log('QR Code generated successfully:', qrCodeDataUrl);
    return qrCodeDataUrl;
  } catch (error) {
    if (error instanceof QRCodeGenerationError) {
      console.error('QR Generation Error:', error.message);
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
    }
    throw error;
  }
}

/**
 * Example 2: QR code generation with custom options
 */
export async function customQRGeneration() {
  try {
    const shortUrl = 'https://short.ly/xyz789';
    const customOptions = {
      width: 512,
      margin: 4,
      color: {
        dark: '#2563eb', // Blue
        light: '#ffffff'  // White
      },
      errorCorrectionLevel: 'H' as const // High error correction
    };
    
    const qrCodeDataUrl = await qrGenerator.generateQR(shortUrl, customOptions);
    console.log('Custom QR Code generated:', qrCodeDataUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate custom QR code:', error);
    throw error;
  }
}

/**
 * Example 3: Generate complete QR result with metadata
 */
export async function generateCompleteQRResult() {
  try {
    const originalUrl = 'https://example.com/very-long-url-that-needs-shortening';
    const shortUrl = 'https://short.ly/def456';
    const id = 'def456';
    
    const result = await qrGenerator.generateQRResult(originalUrl, shortUrl, id);
    
    console.log('Complete QR Result:', {
      id: result.id,
      originalUrl: result.originalUrl,
      shortUrl: result.shortUrl,
      qrCodeGenerated: result.qrCodeDataUrl.length > 0
    });
    
    return result;
  } catch (error) {
    console.error('Failed to generate QR result:', error);
    throw error;
  }
}

/**
 * Example 4: Display QR code in DOM (browser environment)
 */
export async function displayQRInDOM() {
  // This would typically be called in a browser environment
  if (typeof document === 'undefined') {
    console.log('DOM example requires browser environment');
    return;
  }
  
  try {
    const shortUrl = 'https://short.ly/ghi789';
    
    // Generate and display in one operation
    await qrGenerator.generateAndDisplay(shortUrl, 'qr-container');
    
    console.log('QR code displayed in DOM element with ID: qr-container');
  } catch (error) {
    if (error instanceof QRCodeGenerationError) {
      console.error('Display Error:', error.message);
      // Show user-friendly error message
      const errorContainer = document.getElementById('error-message');
      if (errorContainer) {
        errorContainer.textContent = 'Failed to generate QR code. Please try again.';
      }
    }
    throw error;
  }
}

/**
 * Example 5: Form integration example
 */
export async function handleQRFormSubmission(formData: { url: string; description?: string }) {
  try {
    // This would typically integrate with the sheets data service
    // For now, we'll simulate the shortened URL creation
    const id = Math.random().toString(36).substring(2, 8); // Simple ID generation
    const shortUrl = `https://short.ly/${id}`;
    
    // Generate QR code result
    const qrResult = await qrGenerator.generateQRResult(
      formData.url,
      shortUrl,
      id
    );
    
    // Display the QR code
    if (typeof document !== 'undefined') {
      await qrGenerator.generateAndDisplay(shortUrl, 'qr-display');
      
      // Update UI with results
      const shortUrlElement = document.getElementById('short-url-display');
      if (shortUrlElement) {
        shortUrlElement.textContent = shortUrl;
      }
    }
    
    return qrResult;
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Show user-friendly error message
    if (typeof document !== 'undefined') {
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.textContent = 'Failed to generate QR code. Please check your URL and try again.';
      }
    }
    
    throw error;
  }
}

/**
 * Example 6: Error handling patterns
 */
export async function demonstrateErrorHandling() {
  const testCases = [
    { url: '', description: 'Empty URL' },
    { url: null as any, description: 'Null URL' },
    { url: 'invalid-url', description: 'Invalid URL format' },
    { url: 'https://valid-url.com', description: 'Valid URL' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.description}`);
      const result = await qrGenerator.generateQR(testCase.url);
      console.log(`✓ Success: ${testCase.description}`);
    } catch (error) {
      if (error instanceof QRCodeGenerationError) {
        console.log(`✗ Expected error for ${testCase.description}: ${error.message}`);
      } else {
        console.log(`✗ Unexpected error for ${testCase.description}:`, error);
      }
    }
  }
}

// Export the generator instance for use in other modules
export { qrGenerator };

// Example usage in a typical application flow:
/*
// 1. User submits URL form
// 2. Validate URL (using URLValidator)
// 3. Store in Google Sheets (using SheetsDataService)
// 4. Generate QR code (using QRCodeGenerator)
// 5. Display results to user

async function completeWorkflow(userUrl: string) {
  try {
    // Step 1: Validate URL (would use URLValidator)
    // Step 2: Store in sheets and get ID (would use SheetsDataService)
    const id = 'abc123'; // Simulated
    const shortUrl = `https://short.ly/${id}`;
    
    // Step 3: Generate and display QR code
    const qrResult = await qrGenerator.generateQRResult(userUrl, shortUrl, id);
    await qrGenerator.displayQR('qr-container', qrResult.qrCodeDataUrl);
    
    return qrResult;
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}
*/