import { EnhancedQRGenerator, EnhancedQROptions } from './enhanced-qr-generator';
import { performanceMonitor } from './performance-monitor';

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
  private enhancedGenerator: EnhancedQRGenerator;
  
  private defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  constructor() {
    this.enhancedGenerator = new EnhancedQRGenerator();
  }

  /**
   * Generate a QR code for the given URL (backward compatibility wrapper)
   * @param url - The URL to encode in the QR code
   * @param options - Optional QR code generation options
   * @returns Promise resolving to the QR code data URL
   */
  async generateQR(url: string, options?: QRCodeOptions): Promise<string> {
    const performanceId = `qr_${Date.now()}_${Math.random()}`;
    performanceMonitor.startQRGeneration(performanceId);

    try {
      if (!url || typeof url !== 'string') {
        throw new QRCodeGenerationError('Invalid URL provided for QR code generation');
      }

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // Convert old options format to new enhanced format
      const enhancedOptions: EnhancedQROptions = {
        width: mergedOptions.width,
        height: mergedOptions.width,
        margin: mergedOptions.margin,
        dotsOptions: {
          color: mergedOptions.color?.dark || '#000000',
          type: 'square'
        },
        backgroundOptions: {
          color: mergedOptions.color?.light || '#ffffff'
        },
        qrOptions: {
          errorCorrectionLevel: mergedOptions.errorCorrectionLevel || 'M'
        }
      };

      const qrCodeDataUrl = await this.enhancedGenerator.generateEnhancedQR(url, enhancedOptions);

      performanceMonitor.endQRGeneration(performanceId, false);
      return qrCodeDataUrl;
    } catch (error) {
      performanceMonitor.endQRGeneration(performanceId, false);
      
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
   * Optimized QR code generation using canvas when available
   * @private
   */
  private async generateQROptimized(url: string, options: QRCodeOptions): Promise<string> {
    // Try canvas rendering first for better performance
    if (typeof document !== 'undefined') {
      try {
        return await this.generateQRCanvas(url, options);
      } catch (error) {
        console.warn('Canvas QR generation failed, falling back to library default:', error);
      }
    }

    // Fallback to library default
    return await QRCode.toDataURL(url, {
      width: options.width,
      margin: options.margin,
      color: options.color,
      errorCorrectionLevel: options.errorCorrectionLevel
    });
  }

  /**
   * Generate QR code using canvas for better performance
   * @private
   */
  private async generateQRCanvas(url: string, options: QRCodeOptions): Promise<string> {
    // Check if QRCode.toCanvas is available (it might not be in all environments)
    if (typeof QRCode.toCanvas !== 'function') {
      throw new Error('Canvas rendering not available');
    }

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    // Use QRCode library with canvas for better performance
    await QRCode.toCanvas(this.canvas, url, {
      width: options.width,
      margin: options.margin,
      color: options.color,
      errorCorrectionLevel: options.errorCorrectionLevel
    });

    return this.canvas.toDataURL('image/png');
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
   * Creates a cache key for QR code caching
   * @private
   */
  private createCacheKey(url: string, options: QRCodeOptions): string {
    return `${url}|${JSON.stringify(options)}`;
  }

  /**
   * Gets QR code from cache if available and not expired
   * @private
   */
  private getFromCache(cacheKey: string): string | null {
    const cached = this.qrCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.QR_CACHE_DURATION) {
      this.qrCache.delete(cacheKey);
      return null;
    }

    return cached.dataUrl;
  }

  /**
   * Adds QR code to cache with size management
   * @private
   */
  private addToCache(cacheKey: string, dataUrl: string): void {
    // Manage cache size
    if (this.qrCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries (simple LRU)
      const oldestKey = this.qrCache.keys().next().value;
      if (oldestKey) {
        this.qrCache.delete(oldestKey);
      }
    }

    this.qrCache.set(cacheKey, {
      dataUrl,
      timestamp: Date.now()
    });
  }

  /**
   * Clears the QR code cache
   */
  clearCache(): void {
    this.qrCache.clear();
  }

  /**
   * Gets cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.qrCache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  /**
   * Preloads QR codes for common URLs to improve performance
   * @param urls - Array of URLs to preload
   * @param options - QR code options to use for preloading
   */
  async preloadQRCodes(urls: string[], options?: QRCodeOptions): Promise<void> {
    const preloadPromises = urls.map(url => 
      this.generateQR(url, options).catch(error => {
        console.warn(`Failed to preload QR code for ${url}:`, error);
      })
    );

    await Promise.allSettled(preloadPromises);
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