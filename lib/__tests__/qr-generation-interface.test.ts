import { QRCodeGenerator } from '../qr-code-generator'
import { URLValidator } from '../url-validator'

// Mock the qrcode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqrcode')
}))

describe('QR Generation Interface Integration', () => {
  test('complete QR generation workflow', async () => {
    // Initialize services (same as in React component)
    const qrGenerator = new QRCodeGenerator()
    const urlValidator = new URLValidator()

    // Test URL
    const testUrl = 'https://example.com'

    // Step 1: Validate and normalize URL
    const validation = urlValidator.validateAndNormalize(testUrl)
    expect(validation.isValid).toBe(true)
    expect(validation.normalizedUrl).toBe(testUrl)

    // Step 2: Generate QR code directly from the original URL
    // Note: We're not creating shortened URLs yet since Google Sheets storage isn't implemented
    const qrCodeDataUrl = await qrGenerator.generateQR(validation.normalizedUrl, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'M'
    })

    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/)

    // Step 3: Create result object (same structure as React state)
    const result = {
      qrCode: `<img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />`,
      originalUrl: validation.normalizedUrl
    }

    expect(result.qrCode).toContain('<img src="')
    expect(result.originalUrl).toBe(testUrl)
  })

  test('handles validation errors correctly', () => {
    const urlValidator = new URLValidator()

    // Test empty URL
    const emptyValidation = urlValidator.validateAndNormalize('')
    expect(emptyValidation.isValid).toBe(false)
    expect(emptyValidation.errorMessage).toBe('Please enter a URL')

    // Test invalid URL
    const invalidValidation = urlValidator.validateAndNormalize('not-a-url')
    expect(invalidValidation.isValid).toBe(false)
    expect(invalidValidation.errorMessage).toContain('URL must start with http:// or https://')
  })

  test('normalizes URLs without protocol', () => {
    const urlValidator = new URLValidator()

    const validation = urlValidator.validateAndNormalize('example.com')
    expect(validation.isValid).toBe(true)
    expect(validation.normalizedUrl).toBe('https://example.com')
  })

  test('generates QR codes for various URL formats', async () => {
    const qrGenerator = new QRCodeGenerator()
    const urlValidator = new URLValidator()

    const testUrls = [
      'https://example.com',
      'http://google.com',
      'https://github.com/user/repo',
      'example.com' // This should be normalized to https://example.com
    ]

    for (const url of testUrls) {
      const validation = urlValidator.validateAndNormalize(url)
      expect(validation.isValid).toBe(true)

      const qrCodeDataUrl = await qrGenerator.generateQR(validation.normalizedUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      })

      expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/)
    }
  })
})