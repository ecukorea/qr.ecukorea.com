import { QRCodeGenerator, QRCodeGenerationError } from '../qr-code-generator';

// Mock the qrcode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn()
}));

import QRCode from 'qrcode';

describe('QRCodeGenerator', () => {
  let generator: QRCodeGenerator;
  const mockToDataURL = QRCode.toDataURL as jest.MockedFunction<typeof QRCode.toDataURL>;

  beforeEach(() => {
    generator = new QRCodeGenerator();
    jest.clearAllMocks();
  });

  describe('generateQR', () => {
    it('should generate QR code for valid URL', async () => {
      const testUrl = 'https://example.com/abc123';
      const expectedDataUrl = 'data:image/png;base64,mockQRCode';
      
      mockToDataURL.mockResolvedValue(expectedDataUrl);

      const result = await generator.generateQR(testUrl);

      expect(result).toBe(expectedDataUrl);
      expect(mockToDataURL).toHaveBeenCalledWith(testUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    });

    it('should use cached QR code when available', async () => {
      const testUrl = 'https://example.com/abc123';
      const expectedDataUrl = 'data:image/png;base64,mockQRCode';
      
      mockToDataURL.mockResolvedValue(expectedDataUrl);

      // First call should generate
      const result1 = await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(1);
      expect(result2).toBe(result1);
    });

    it('should use custom options when provided', async () => {
      const testUrl = 'https://example.com/abc123';
      const customOptions = {
        width: 512,
        margin: 4,
        color: { dark: '#FF0000', light: '#00FF00' },
        errorCorrectionLevel: 'H' as const
      };
      
      mockToDataURL.mockResolvedValue('data:image/png;base64,customQRCode');

      await generator.generateQR(testUrl, customOptions);

      expect(mockToDataURL).toHaveBeenCalledWith(testUrl, customOptions);
    });

    it('should throw QRCodeGenerationError for invalid URL', async () => {
      await expect(generator.generateQR('')).rejects.toThrow(QRCodeGenerationError);
      await expect(generator.generateQR(null as any)).rejects.toThrow(QRCodeGenerationError);
      await expect(generator.generateQR(undefined as any)).rejects.toThrow(QRCodeGenerationError);
    });

    it('should handle QRCode library errors', async () => {
      const testUrl = 'https://example.com/abc123';
      const libraryError = new Error('QRCode library error');
      
      mockToDataURL.mockRejectedValue(libraryError);

      await expect(generator.generateQR(testUrl)).rejects.toThrow(QRCodeGenerationError);
      
      try {
        await generator.generateQR(testUrl);
      } catch (error) {
        expect(error).toBeInstanceOf(QRCodeGenerationError);
        expect((error as QRCodeGenerationError).originalError).toBe(libraryError);
      }
    });

    it('should complete within 3 seconds (performance requirement)', async () => {
      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      const startTime = Date.now();
      await generator.generateQR(testUrl);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('generateQRResult', () => {
    it('should generate complete QR result with metadata', async () => {
      const originalUrl = 'https://example.com/very-long-url';
      const shortUrl = 'https://short.ly/abc123';
      const id = 'abc123';
      const expectedDataUrl = 'data:image/png;base64,mockQRCode';
      
      mockToDataURL.mockResolvedValue(expectedDataUrl);

      const result = await generator.generateQRResult(originalUrl, shortUrl, id);

      expect(result).toEqual({
        qrCodeDataUrl: expectedDataUrl,
        shortUrl,
        originalUrl,
        id
      });
      expect(mockToDataURL).toHaveBeenCalledWith(shortUrl, expect.any(Object));
    });

    it('should handle errors in generateQRResult', async () => {
      const originalUrl = 'https://example.com/test';
      const shortUrl = 'https://short.ly/abc123';
      const id = 'abc123';
      
      mockToDataURL.mockRejectedValue(new Error('Generation failed'));

      await expect(generator.generateQRResult(originalUrl, shortUrl, id))
        .rejects.toThrow(QRCodeGenerationError);
    });
  });

  describe('displayQR', () => {
    let mockContainer: HTMLElement;

    beforeEach(() => {
      // Setup DOM
      document.body.innerHTML = '<div id="test-container"></div>';
      mockContainer = document.getElementById('test-container')!;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should display QR code in container', () => {
      const qrCodeDataUrl = 'data:image/png;base64,mockQRCode';
      
      generator.displayQR('test-container', qrCodeDataUrl);

      const img = mockContainer.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.src).toBe(qrCodeDataUrl);
      expect(img?.alt).toBe('QR Code');
    });

    it('should clear existing content before displaying', () => {
      mockContainer.innerHTML = '<p>Existing content</p>';
      const qrCodeDataUrl = 'data:image/png;base64,mockQRCode';
      
      generator.displayQR('test-container', qrCodeDataUrl);

      expect(mockContainer.querySelector('p')).toBeNull();
      expect(mockContainer.querySelector('img')).toBeTruthy();
    });

    it('should throw error for non-existent container', () => {
      const qrCodeDataUrl = 'data:image/png;base64,mockQRCode';
      
      expect(() => generator.displayQR('non-existent', qrCodeDataUrl))
        .toThrow(QRCodeGenerationError);
    });
  });

  describe('clearQR', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="test-container"><img src="test.png" /></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should clear container content', () => {
      const container = document.getElementById('test-container')!;
      expect(container.children.length).toBe(1);
      
      generator.clearQR('test-container');
      
      expect(container.innerHTML).toBe('');
    });

    it('should throw error for non-existent container', () => {
      expect(() => generator.clearQR('non-existent'))
        .toThrow(QRCodeGenerationError);
    });
  });

  describe('generateAndDisplay', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="test-container"></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should generate and display QR code in one operation', async () => {
      const testUrl = 'https://example.com/abc123';
      const expectedDataUrl = 'data:image/png;base64,mockQRCode';
      
      mockToDataURL.mockResolvedValue(expectedDataUrl);

      await generator.generateAndDisplay(testUrl, 'test-container');

      const container = document.getElementById('test-container')!;
      const img = container.querySelector('img');
      expect(img?.src).toBe(expectedDataUrl);
    });

    it('should handle generation errors', async () => {
      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockRejectedValue(new Error('Generation failed'));

      await expect(generator.generateAndDisplay(testUrl, 'test-container'))
        .rejects.toThrow(QRCodeGenerationError);
    });

    it('should handle display errors', async () => {
      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      await expect(generator.generateAndDisplay(testUrl, 'non-existent'))
        .rejects.toThrow(QRCodeGenerationError);
    });
  });

  describe('Error handling', () => {
    it('should create QRCodeGenerationError with proper properties', () => {
      const originalError = new Error('Original error');
      const qrError = new QRCodeGenerationError('Test message', originalError);

      expect(qrError.name).toBe('QRCodeGenerationError');
      expect(qrError.message).toBe('Test message');
      expect(qrError.originalError).toBe(originalError);
    });

    it('should handle non-Error objects as original errors', async () => {
      mockToDataURL.mockRejectedValue('String error');

      try {
        await generator.generateQR('https://example.com');
      } catch (error) {
        expect(error).toBeInstanceOf(QRCodeGenerationError);
        expect((error as QRCodeGenerationError).originalError).toBeInstanceOf(Error);
      }
    });
  });

  describe('QR Code format requirements', () => {
    it('should generate QR code in standard format (data URL)', async () => {
      const testUrl = 'https://example.com/abc123';
      const expectedDataUrl = 'data:image/png;base64,mockQRCode';
      
      mockToDataURL.mockResolvedValue(expectedDataUrl);

      const result = await generator.generateQR(testUrl);

      expect(result).toMatch(/^data:image\/(png|svg\+xml);base64,/);
    });

    it('should generate QR code with complete shortened URL including domain', async () => {
      const completeShortUrl = 'https://short.ly/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      await generator.generateQR(completeShortUrl);

      expect(mockToDataURL).toHaveBeenCalledWith(completeShortUrl, expect.any(Object));
      // Verify the URL passed to QRCode library includes protocol and domain
      const calledUrl = mockToDataURL.mock.calls[0][0];
      expect(calledUrl).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('caching functionality', () => {
    it('should cache QR codes with different options separately', async () => {
      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      // Generate with default options
      await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(1);

      // Generate with different options should create new QR code
      await generator.generateQR(testUrl, { width: 512 });
      expect(mockToDataURL).toHaveBeenCalledTimes(2);

      // Generate with default options again should use cache
      await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(2);
    });

    it('should clear cache when requested', async () => {
      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      // Generate and cache
      await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(1);

      // Clear cache
      generator.clearCache();

      // Should generate again
      await generator.generateQR(testUrl);
      expect(mockToDataURL).toHaveBeenCalledTimes(2);
    });

    it('should provide cache statistics', async () => {
      const stats = generator.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(100);

      const testUrl = 'https://example.com/abc123';
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      await generator.generateQR(testUrl);

      const newStats = generator.getCacheStats();
      expect(newStats.size).toBe(1);
    });

    it('should preload QR codes for multiple URLs', async () => {
      const urls = [
        'https://example.com/1',
        'https://example.com/2',
        'https://example.com/3'
      ];
      
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockQRCode');

      await generator.preloadQRCodes(urls);

      expect(mockToDataURL).toHaveBeenCalledTimes(3);
    });

    it('should handle preload errors gracefully', async () => {
      const urls = ['https://example.com/1', 'invalid-url'];
      
      mockToDataURL
        .mockResolvedValueOnce('data:image/png;base64,mockQRCode')
        .mockRejectedValueOnce(new Error('Invalid URL'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await generator.preloadQRCodes(urls);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});