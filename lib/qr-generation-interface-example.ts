/**
 * Example usage of the QR Generation Interface
 * This demonstrates how the main interface components work together
 */

import { QRCodeGenerator } from './qr-code-generator'
import { URLValidator } from './url-validator'
import { SheetsDataService } from './sheets-data-service'

// Example of how the main QR generation interface works
export async function demonstrateQRGenerationInterface() {
  console.log('=== QR Generation Interface Demo ===\n')

  // Initialize services (same as in the React component)
  const qrGenerator = new QRCodeGenerator()
  const urlValidator = new URLValidator()
  const sheetsService = new SheetsDataService()

  // Example URLs to test
  const testUrls = [
    'https://example.com',
    'http://google.com',
    'https://github.com/user/repo',
    'invalid-url', // This should fail validation
    '', // This should also fail validation
  ]

  for (const url of testUrls) {
    console.log(`\n--- Testing URL: "${url}" ---`)
    
    try {
      // Step 1: Validate and normalize URL (same as form submission)
      const validation = urlValidator.validateAndNormalize(url)
      
      if (!validation.isValid) {
        console.log(`❌ Validation failed: ${validation.errorMessage}`)
        continue
      }
      
      console.log(`✅ URL validated: ${validation.normalizedUrl}`)
      
      // Step 2: Generate QR code directly from the original URL
      // Note: We're not creating shortened URLs yet since Google Sheets storage isn't implemented
      const qrCodeDataUrl = await qrGenerator.generateQR(validation.normalizedUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      })
      
      console.log(`📱 QR Code generated: ${qrCodeDataUrl.substring(0, 50)}...`)
      
      // Step 3: Display result (same structure as React state)
      const result = {
        qrCode: `<img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />`,
        originalUrl: validation.normalizedUrl
      }
      
      console.log(`✨ Result ready for display:`)
      console.log(`   - Original URL: ${result.originalUrl}`)
      console.log(`   - QR Code: Ready for display`)
      console.log(`   - Note: URL shortening will be available once Google Sheets integration is complete`)
      
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  console.log('\n=== Demo Complete ===')
}

// Note: Unique ID generation will be implemented when URL shortening is added

// Example of form validation logic
export function demonstrateFormValidation() {
  console.log('\n=== Form Validation Demo ===\n')
  
  const urlValidator = new URLValidator()
  
  const testCases = [
    { url: '', description: 'Empty URL' },
    { url: 'https://example.com', description: 'Valid HTTPS URL' },
    { url: 'http://example.com', description: 'Valid HTTP URL' },
    { url: 'example.com', description: 'URL without protocol' },
    { url: 'not-a-url', description: 'Invalid URL format' },
    { url: 'ftp://example.com', description: 'Unsupported protocol' },
  ]
  
  testCases.forEach(({ url, description }) => {
    console.log(`\n--- ${description}: "${url}" ---`)
    
    const validation = urlValidator.validateAndNormalize(url)
    
    if (validation.isValid) {
      console.log(`✅ Valid - Normalized: ${validation.normalizedUrl}`)
    } else {
      console.log(`❌ Invalid - Error: ${validation.errorMessage}`)
    }
  })
  
  console.log('\n=== Validation Demo Complete ===')
}

// Example of copy to clipboard functionality
export function demonstrateCopyFunctionality() {
  console.log('\n=== Copy to Clipboard Demo ===\n')
  
  const originalUrl = 'https://example.com'
  
  console.log(`URL to copy: ${originalUrl}`)
  console.log('In the browser, this would use:')
  console.log('  await navigator.clipboard.writeText(originalUrl)')
  console.log('  // Show success message: "Copied to clipboard!"')
  console.log('  // Hide message after 3 seconds')
  
  console.log('\n=== Copy Demo Complete ===')
}

// Run all demos if this file is executed directly
if (require.main === module) {
  (async () => {
    await demonstrateQRGenerationInterface()
    demonstrateFormValidation()
    demonstrateCopyFunctionality()
  })().catch(console.error)
}