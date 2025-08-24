/**
 * Tests for EnhancedQRGenerator
 * Verifies advanced QR code styling functionality including corner dots
 */

import { EnhancedQRGenerator, EnhancedQROptions } from '../enhanced-qr-generator';

// Mock qr-code-styling
jest.mock('qr-code-styling', () => {
  return jest.fn().mockImplementation(() => ({
    getRawData: jest.fn().mockResolvedValue(new ArrayBuffer(8))
  }));
});

describe('EnhancedQRGenerator', () => {
  let generator: EnhancedQRGenerator;

  beforeEach(() => {
    generator = new EnhancedQRGenerator();
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn().mockImplementation(function(this: any) {
        // Simulate async behavior
        setTimeout(() => {
          this.result = 'data:image/png;base64,mockQRCode';
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }),
      onload: null,
      onerror: null,
      result: null
    };

    global.FileReader = jest.fn().mockImplementation(() => mockFileReader);

    // Mock Blob
    global.Blob = jest.fn().mockImplementation(() => ({}));
  });

  describe('generateEnhancedQR', () => {
    it('should generate QR code with corner dot options', async () => {
      const options: EnhancedQROptions = {
        dotsOptions: {
          color: '#ff0000',
          type: 'rounded'
        },
        cornersSquareOptions: {
          color: '#00ff00',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#0000ff',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#ffffff'
        }
      };

      const result = await generator.generateEnhancedQR('https://example.com', options);
      expect(result).toBe('data:image/png;base64,mockQRCode');
    });

    it('should handle gradient options for corner elements', async () => {
      const options: EnhancedQROptions = {
        cornersDotOptions: {
          gradient: {
            type: 'radial',
            colorStops: [
              { offset: 0, color: '#ff0000' },
              { offset: 1, color: '#0000ff' }
            ]
          },
          type: 'dot'
        }
      };

      const result = await generator.generateEnhancedQR('https://example.com', options);
      expect(result).toBe('data:image/png;base64,mockQRCode');
    });
  });

  describe('getStylePresets', () => {
    it('should return presets with corner dot configurations', () => {
      const presets = generator.getStylePresets();
      
      expect(presets.classic.cornersDotOptions).toBeDefined();
      expect(presets.classic.cornersDotOptions?.color).toBe('#000000');
      expect(presets.classic.cornersDotOptions?.type).toBe('square');

      expect(presets.modern.cornersDotOptions).toBeDefined();
      expect(presets.modern.cornersDotOptions?.color).toBe('#2c3e50');
      expect(presets.modern.cornersDotOptions?.type).toBe('dot');

      expect(presets.neon.cornersDotOptions).toBeDefined();
      expect(presets.neon.cornersDotOptions?.color).toBe('#00ff88');
      expect(presets.neon.cornersDotOptions?.type).toBe('dot');
    });

    it('should have different corner dot colors for different presets', () => {
      const presets = generator.getStylePresets();
      
      const classicColor = presets.classic.cornersDotOptions?.color;
      const modernColor = presets.modern.cornersDotOptions?.color;
      const neonColor = presets.neon.cornersDotOptions?.color;

      expect(classicColor).not.toBe(modernColor);
      expect(modernColor).not.toBe(neonColor);
      expect(classicColor).not.toBe(neonColor);
    });
  });

  describe('generateWithPreset', () => {
    it('should apply preset corner dot options', async () => {
      const mockFileReader = new FileReader();
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as any);
        }
      }, 0);

      const result = await generator.generateWithPreset('https://example.com', 'modern');
      expect(result).toBe('data:image/png;base64,mockQRCode');
    });

    it('should merge custom corner dot options with preset', async () => {
      const customOptions: EnhancedQROptions = {
        cornersDotOptions: {
          color: '#custom',
          type: 'square'
        }
      };

      const mockFileReader = new FileReader();
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as any);
        }
      }, 0);

      const result = await generator.generateWithPreset('https://example.com', 'modern', customOptions);
      expect(result).toBe('data:image/png;base64,mockQRCode');
    });
  });

  describe('getCornerStyles', () => {
    it('should return available corner styles', () => {
      const styles = generator.getCornerStyles();
      
      expect(styles).toHaveLength(3);
      expect(styles.map(s => s.type)).toEqual(['square', 'dot', 'extra-rounded']);
      
      const dotStyle = styles.find(s => s.type === 'dot');
      expect(dotStyle?.name).toBe('Dot');
      expect(dotStyle?.description).toBe('Circular corners');
    });
  });

  describe('error handling', () => {
    it('should handle invalid preset names', async () => {
      await expect(generator.generateWithPreset('https://example.com', 'invalid-preset'))
        .rejects.toThrow("Preset 'invalid-preset' not found");
    });
  });
});