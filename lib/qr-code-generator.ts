import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeResult {
  qrCodeDataUrl: string;
  shortUrl: string;
  originalUrl: string;
  id: string;
}

export class QRCodeGenerationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'QRCodeGenerationError';
  }
}

export class QRCodeGenerator {
  private defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  /**
   * Generate a QR code for the given URL
   * @param url - The URL to encode in the QR code
   * @param options - Optional QR code generation options
   * @returns Promise resolving to the QR code data URL
   */
  async generateQR(url: string, options?: QRCodeOptions): Promise<string> {
    try {
      if (!url || typeof url !== 'string') {
        throw new QRCodeGenerationError('Invalid URL provided for QR code generation');
      }

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });

      return qrCodeDataUrl;
    } catch (error) {
      if (error instanceof QRCodeGenerationError) {
        throw error;
      }
      
      throw new QRCodeGenerationError(
        'Failed to generate QR code. Please try again.',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Generate a complete QR code result with metadata
   * @param originalUrl - The original URL to shorten
   * @param shortUrl - The shortened URL
   * @param id - The unique ID for the shortened URL
   * @param options - Optional QR code generation options
   * @returns Promise resolving to complete QR code result
   */
  async generateQRResult(
    originalUrl: string,
    shortUrl: string,
    id: string,
    options?: QRCodeOptions
  ): Promise<QRCodeResult> {
    try {
      const qrCodeDataUrl = await this.generateQR(shortUrl, options);
      
      return {
        qrCodeDataUrl,
        shortUrl,
        originalUrl,
        id
      };
    } catch (error) {
      if (error instanceof QRCodeGenerationError) {
        throw error;
      }
      
      throw new QRCodeGenerationError(
        'Failed to generate QR code result',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Display QR code in a DOM element
   * @param containerId - The ID of the container element
   * @param qrCodeDataUrl - The QR code data URL to display
   */
  displayQR(containerId: string, qrCodeDataUrl: string): void {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new QRCodeGenerationError(`Container element with ID '${containerId}' not found`);
      }

      // Clear existing content
      container.innerHTML = '';

      // Create and append image element
      const img = document.createElement('img');
      img.src = qrCodeDataUrl;
      img.alt = 'QR Code';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      container.appendChild(img);
    } catch (error) {
      if (error instanceof QRCodeGenerationError) {
        throw error;
      }
      
      throw new QRCodeGenerationError(
        'Failed to display QR code',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Clear QR code from a DOM element
   * @param containerId - The ID of the container element to clear
   */
  clearQR(containerId: string): void {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new QRCodeGenerationError(`Container element with ID '${containerId}' not found`);
      }

      container.innerHTML = '';
    } catch (error) {
      throw new QRCodeGenerationError(
        'Failed to clear QR code',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Generate and display QR code in one operation
   * @param url - The URL to encode
   * @param containerId - The ID of the container element
   * @param options - Optional QR code generation options
   */
  async generateAndDisplay(url: string, containerId: string, options?: QRCodeOptions): Promise<void> {
    try {
      const qrCodeDataUrl = await this.generateQR(url, options);
      this.displayQR(containerId, qrCodeDataUrl);
    } catch (error) {
      if (error instanceof QRCodeGenerationError) {
        throw error;
      }
      
      throw new QRCodeGenerationError(
        'Failed to generate and display QR code',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}