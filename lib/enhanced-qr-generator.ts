/**
 * Enhanced QR Code Generator with styling capabilities
 * Uses qr-code-styling library for advanced QR code customization
 */

import QRCodeStyling from 'qr-code-styling';

export interface EnhancedQROptions {
  // Basic QR options
  width?: number;
  height?: number;
  margin?: number;
  
  // QR data and error correction
  data?: string;
  qrOptions?: {
    typeNumber?: number;
    mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  };
  
  // Dots styling (the main QR pattern)
  dotsOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{
        offset: number;
        color: string;
      }>;
    };
    type?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
  };
  
  // Corners square styling (the three large squares)
  cornersSquareOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{
        offset: number;
        color: string;
      }>;
    };
    type?: 'square' | 'dot' | 'extra-rounded';
  };
  
  // Corner dots styling (the dots inside corner squares)
  cornersDotOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{
        offset: number;
        color: string;
      }>;
    };
    type?: 'square' | 'dot';
  };
  
  // Background options
  backgroundOptions?: {
    color?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      rotation?: number;
      colorStops?: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
  
  // Image/logo options
  image?: string;
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    crossOrigin?: string;
    margin?: number;
  };
  
  // Output format
  format?: 'png' | 'jpeg' | 'svg' | 'webp';
  quality?: number;
}

export class EnhancedQRGenerator {
  private qrCodeStyling: QRCodeStyling | null = null;

  /**
   * Generate QR code with enhanced styling using qr-code-styling
   */
  async generateEnhancedQR(data: string, options: EnhancedQROptions = {}): Promise<string> {
    const {
      width = 300,
      height = 300,
      margin = 20,
      format = 'png',
      quality = 0.92
    } = options;

    // Create QR code styling configuration
    const qrConfig: any = {
      width,
      height,
      data,
      margin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte' as const,
        errorCorrectionLevel: 'M' as const,
        ...options.qrOptions
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 20,
        ...options.imageOptions
      },
      dotsOptions: {
        color: '#000000',
        type: 'square' as const,
        ...options.dotsOptions
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'square' as const,
        ...options.cornersSquareOptions
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'square' as const,
        ...options.cornersDotOptions
      },
      backgroundOptions: {
        color: '#ffffff',
        ...options.backgroundOptions
      }
    };

    // Add image if provided
    if (options.image) {
      qrConfig.image = options.image;
    }

    // Create QR code instance
    this.qrCodeStyling = new QRCodeStyling(qrConfig);

    // Generate and return data URL
    return new Promise((resolve, reject) => {
      try {
        if (format === 'svg') {
          this.qrCodeStyling!.getRawData('svg').then((buffer: ArrayBuffer) => {
            if (buffer) {
              const decoder = new TextDecoder();
              const svgString = decoder.decode(buffer);
              const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
              resolve(dataUrl);
            } else {
              reject(new Error('Failed to generate SVG QR code'));
            }
          }).catch(reject);
        } else {
          // For PNG, JPEG, WEBP
          const fileType = format === 'jpeg' ? 'jpg' : format;
          this.qrCodeStyling!.getRawData(fileType).then((buffer: ArrayBuffer) => {
            if (buffer) {
              const blob = new Blob([buffer], { 
                type: format === 'jpeg' ? 'image/jpeg' : `image/${format}` 
              });
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error(`Failed to generate ${format.toUpperCase()} QR code`));
            }
          }).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create gradient configuration for qr-code-styling
   */
  private createGradient(colors: string[], type: 'linear' | 'radial' = 'linear', rotation: number = 0) {
    const colorStops = colors.map((color, index) => ({
      offset: index / (colors.length - 1),
      color
    }));

    return {
      type,
      rotation,
      colorStops
    };
  }

  /**
   * Generate QR code with specific dot style
   */
  async generateWithDotStyle(
    data: string, 
    dotStyle: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded',
    options: EnhancedQROptions = {}
  ): Promise<string> {
    const enhancedOptions: EnhancedQROptions = {
      ...options,
      dotsOptions: {
        ...options.dotsOptions,
        type: dotStyle
      }
    };

    return this.generateEnhancedQR(data, enhancedOptions);
  }

  /**
   * Get predefined style presets using qr-code-styling format
   */
  getStylePresets(): Record<string, EnhancedQROptions> {
    return {
      classic: {
        dotsOptions: {
          color: '#000000',
          type: 'square'
        },
        cornersSquareOptions: {
          color: '#000000',
          type: 'square'
        },
        cornersDotOptions: {
          color: '#000000',
          type: 'square'
        },
        backgroundOptions: {
          color: '#ffffff'
        }
      },

      modern: {
        dotsOptions: {
          color: '#2c3e50',
          type: 'rounded'
        },
        cornersSquareOptions: {
          color: '#34495e',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#2c3e50',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#ecf0f1'
        }
      },

      vibrant: {
        dotsOptions: {
          gradient: this.createGradient(['#ff6b6b', '#4ecdc4'], 'linear', 45),
          type: 'rounded'
        },
        cornersSquareOptions: {
          gradient: this.createGradient(['#ff6b6b', '#4ecdc4'], 'linear', 45),
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#ff6b6b',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#ffffff'
        }
      },

      neon: {
        dotsOptions: {
          color: '#00ff88',
          type: 'dots'
        },
        cornersSquareOptions: {
          color: '#00ff88',
          type: 'dot'
        },
        cornersDotOptions: {
          color: '#00ff88',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#000000'
        }
      },

      business: {
        dotsOptions: {
          color: '#1a365d',
          type: 'classy'
        },
        cornersSquareOptions: {
          color: '#2d3748',
          type: 'square'
        },
        cornersDotOptions: {
          color: '#1a365d',
          type: 'square'
        },
        backgroundOptions: {
          color: '#f7fafc'
        }
      },

      ocean: {
        dotsOptions: {
          gradient: this.createGradient(['#667eea', '#764ba2'], 'radial'),
          type: 'rounded'
        },
        cornersSquareOptions: {
          gradient: this.createGradient(['#667eea', '#764ba2'], 'radial'),
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#667eea',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#ffffff'
        }
      },

      dots: {
        dotsOptions: {
          color: '#7b68ee',
          type: 'dots'
        },
        cornersSquareOptions: {
          color: '#7b68ee',
          type: 'dot'
        },
        cornersDotOptions: {
          color: '#7b68ee',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#f8f9fa'
        }
      },

      classy: {
        dotsOptions: {
          color: '#8b5cf6',
          type: 'classy-rounded'
        },
        cornersSquareOptions: {
          color: '#7c3aed',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#8b5cf6',
          type: 'dot'
        },
        backgroundOptions: {
          color: '#faf5ff'
        }
      }
    };
  }

  /**
   * Generate QR code with preset style
   */
  async generateWithPreset(data: string, presetName: string, customOptions: EnhancedQROptions = {}): Promise<string> {
    const presets = this.getStylePresets();
    const preset = presets[presetName];
    
    if (!preset) {
      throw new Error(`Preset '${presetName}' not found`);
    }

    // Deep merge preset with custom options
    const options: EnhancedQROptions = {
      ...preset,
      ...customOptions,
      dotsOptions: {
        ...preset.dotsOptions,
        ...customOptions.dotsOptions
      },
      cornersSquareOptions: {
        ...preset.cornersSquareOptions,
        ...customOptions.cornersSquareOptions
      },
      cornersDotOptions: {
        ...preset.cornersDotOptions,
        ...customOptions.cornersDotOptions
      },
      backgroundOptions: {
        ...preset.backgroundOptions,
        ...customOptions.backgroundOptions
      }
    };

    return this.generateEnhancedQR(data, options);
  }

  /**
   * Generate QR code with logo
   */
  async generateWithLogo(data: string, logoSrc: string, options: EnhancedQROptions = {}): Promise<string> {
    const logoOptions: EnhancedQROptions = {
      ...options,
      image: logoSrc,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 20,
        ...options.imageOptions
      }
    };

    return this.generateEnhancedQR(data, logoOptions);
  }

  /**
   * Get available dot styles
   */
  getDotStyles(): Array<{
    name: string;
    type: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
    description: string;
  }> {
    return [
      {
        name: 'Square',
        type: 'square',
        description: 'Classic square dots'
      },
      {
        name: 'Dots',
        type: 'dots',
        description: 'Circular dots'
      },
      {
        name: 'Rounded',
        type: 'rounded',
        description: 'Rounded square dots'
      },
      {
        name: 'Extra Rounded',
        type: 'extra-rounded',
        description: 'Very rounded dots'
      },
      {
        name: 'Classy',
        type: 'classy',
        description: 'Elegant style dots'
      },
      {
        name: 'Classy Rounded',
        type: 'classy-rounded',
        description: 'Elegant rounded dots'
      }
    ];
  }

  /**
   * Get available corner styles
   */
  getCornerStyles(): Array<{
    name: string;
    type: 'square' | 'dot' | 'extra-rounded';
    description: string;
  }> {
    return [
      {
        name: 'Square',
        type: 'square',
        description: 'Square corners'
      },
      {
        name: 'Dot',
        type: 'dot',
        description: 'Circular corners'
      },
      {
        name: 'Extra Rounded',
        type: 'extra-rounded',
        description: 'Rounded corners'
      }
    ];
  }
}

// Utility functions for QR styling
export class QRStylingUtils {
  
  /**
   * Generate color palette for QR codes
   */
  static generateColorPalette(baseColor: string): string[] {
    // Simple color palette generation
    const colors = [baseColor];
    
    // Add lighter and darker variations
    colors.push(this.lightenColor(baseColor, 20));
    colors.push(this.darkenColor(baseColor, 20));
    
    return colors;
  }

  /**
   * Lighten a hex color
   */
  static lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Darken a hex color
   */
  static darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }

  /**
   * Validate hex color
   */
  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}