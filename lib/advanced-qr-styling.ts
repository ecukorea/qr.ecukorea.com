/**
 * Advanced QR Code Styling capabilities similar to qrfy.com
 * This demonstrates what's possible with enhanced QR styling libraries
 */

// Note: This would require installing qr-code-styling library
// npm install qr-code-styling

export interface AdvancedQROptions {
  // Basic options
  width?: number;
  height?: number;
  margin?: number;
  
  // Data options
  data?: string;
  
  // Image options (logo/center image)
  image?: {
    source?: string;
    width?: number;
    height?: number;
    margin?: number;
    imageSize?: number;
    crossOrigin?: string;
  };
  
  // Dots styling (the QR squares)
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
  
  // Corners square styling
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
  
  // Corner dots styling
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
  
  // Quality and format
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    crossOrigin?: string;
    margin?: number;
  };
  
  qrOptions?: {
    typeNumber?: number;
    mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  };
}

/**
 * Advanced QR Code Generator with styling capabilities
 * Similar to qrfy.com functionality
 */
export class AdvancedQRGenerator {
  
  /**
   * Generate a styled QR code with advanced options
   */
  async generateStyledQR(url: string, options: AdvancedQROptions): Promise<string> {
    // This would use qr-code-styling library
    // For now, showing the interface and what's possible
    
    const defaultOptions: AdvancedQROptions = {
      width: 300,
      height: 300,
      margin: 10,
      data: url,
      
      dotsOptions: {
        color: "#000000",
        type: "rounded"
      },
      
      cornersSquareOptions: {
        color: "#000000",
        type: "extra-rounded"
      },
      
      cornersDotOptions: {
        color: "#000000",
        type: "dot"
      },
      
      backgroundOptions: {
        color: "#ffffff"
      },
      
      qrOptions: {
        errorCorrectionLevel: 'M'
      }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Implementation would go here using qr-code-styling
    // For demonstration, returning a placeholder
    return "data:image/png;base64,placeholder";
  }
  
  /**
   * Predefined styling presets similar to qrfy.com
   */
  getStylePresets(): Record<string, AdvancedQROptions> {
    return {
      classic: {
        dotsOptions: {
          color: "#000000",
          type: "square"
        },
        cornersSquareOptions: {
          color: "#000000",
          type: "square"
        },
        backgroundOptions: {
          color: "#ffffff"
        }
      },
      
      rounded: {
        dotsOptions: {
          color: "#1a73e8",
          type: "rounded"
        },
        cornersSquareOptions: {
          color: "#1a73e8",
          type: "extra-rounded"
        },
        cornersDotOptions: {
          color: "#1a73e8",
          type: "dot"
        },
        backgroundOptions: {
          color: "#ffffff"
        }
      },
      
      gradient: {
        dotsOptions: {
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: [
              { offset: 0, color: "#ff6b6b" },
              { offset: 1, color: "#4ecdc4" }
            ]
          },
          type: "rounded"
        },
        cornersSquareOptions: {
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: [
              { offset: 0, color: "#ff6b6b" },
              { offset: 1, color: "#4ecdc4" }
            ]
          },
          type: "extra-rounded"
        },
        backgroundOptions: {
          color: "#ffffff"
        }
      },
      
      dots: {
        dotsOptions: {
          color: "#7b68ee",
          type: "dots"
        },
        cornersSquareOptions: {
          color: "#7b68ee",
          type: "dot"
        },
        cornersDotOptions: {
          color: "#7b68ee",
          type: "dot"
        },
        backgroundOptions: {
          color: "#f8f9fa"
        }
      },
      
      neon: {
        dotsOptions: {
          color: "#00ff88",
          type: "extra-rounded"
        },
        cornersSquareOptions: {
          color: "#00ff88",
          type: "extra-rounded"
        },
        cornersDotOptions: {
          color: "#00ff88",
          type: "dot"
        },
        backgroundOptions: {
          color: "#000000"
        }
      }
    };
  }
  
  /**
   * Generate QR code with logo/image overlay
   */
  async generateQRWithLogo(url: string, logoUrl: string, options?: AdvancedQROptions): Promise<string> {
    const qrOptions: AdvancedQROptions = {
      ...options,
      image: {
        source: logoUrl,
        width: 60,
        height: 60,
        margin: 8,
        imageSize: 0.4, // 40% of QR code size
        ...options?.image
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 8,
        ...options?.imageOptions
      }
    };
    
    return this.generateStyledQR(url, qrOptions);
  }
}

/**
 * QR Code styling presets and utilities
 */
export class QRStylePresets {
  
  /**
   * Get color schemes for QR codes
   */
  static getColorSchemes() {
    return {
      business: {
        primary: "#2c3e50",
        secondary: "#34495e",
        background: "#ffffff"
      },
      vibrant: {
        primary: "#e74c3c",
        secondary: "#f39c12",
        background: "#ffffff"
      },
      nature: {
        primary: "#27ae60",
        secondary: "#2ecc71",
        background: "#f8f9fa"
      },
      ocean: {
        primary: "#3498db",
        secondary: "#2980b9",
        background: "#ecf0f1"
      },
      sunset: {
        primary: "#e67e22",
        secondary: "#d35400",
        background: "#fdf2e9"
      }
    };
  }
  
  /**
   * Get gradient presets
   */
  static getGradientPresets() {
    return {
      fire: {
        type: "linear" as const,
        rotation: 45,
        colorStops: [
          { offset: 0, color: "#ff9a9e" },
          { offset: 1, color: "#fecfef" }
        ]
      },
      ocean: {
        type: "linear" as const,
        rotation: 135,
        colorStops: [
          { offset: 0, color: "#667eea" },
          { offset: 1, color: "#764ba2" }
        ]
      },
      sunset: {
        type: "radial" as const,
        colorStops: [
          { offset: 0, color: "#ff8a80" },
          { offset: 1, color: "#ff5722" }
        ]
      }
    };
  }
}

/**
 * QR Code animation and effects (for future implementation)
 */
export interface QRAnimationOptions {
  type?: 'fade' | 'scale' | 'rotate' | 'pulse';
  duration?: number;
  delay?: number;
  easing?: string;
}

export class QRAnimationEffects {
  
  /**
   * Apply CSS animations to QR code container
   */
  static applyAnimation(containerId: string, animation: QRAnimationOptions): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const { type = 'fade', duration = 500, delay = 0, easing = 'ease-in-out' } = animation;
    
    container.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
    
    switch (type) {
      case 'fade':
        container.style.opacity = '0';
        setTimeout(() => container.style.opacity = '1', 10);
        break;
      case 'scale':
        container.style.transform = 'scale(0)';
        setTimeout(() => container.style.transform = 'scale(1)', 10);
        break;
      case 'rotate':
        container.style.transform = 'rotate(-180deg)';
        setTimeout(() => container.style.transform = 'rotate(0deg)', 10);
        break;
      case 'pulse':
        container.style.animation = `pulse ${duration}ms ${easing} ${delay}ms`;
        break;
    }
  }
}