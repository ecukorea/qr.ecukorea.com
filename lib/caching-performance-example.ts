/**
 * Example demonstrating the new caching and performance optimization features
 * This shows how to use the enhanced SheetsDataService and QRCodeGenerator
 */

import { SheetsDataService } from './sheets-data-service';
import { QRCodeGenerator } from './qr-code-generator';
import { performanceMonitor } from './performance-monitor';

/**
 * Example usage of the enhanced caching and performance features
 */
export class CachingPerformanceExample {
  private sheetsService: SheetsDataService;
  private qrGenerator: QRCodeGenerator;

  constructor() {
    this.sheetsService = new SheetsDataService();
    this.qrGenerator = new QRCodeGenerator();
  }

  /**
   * Demonstrates the caching capabilities
   */
  async demonstrateCaching(): Promise<void> {
    console.log('=== Caching Demonstration ===');

    // Check initial cache status
    const initialStatus = this.sheetsService.getCacheStatus();
    console.log('Initial cache status:', initialStatus);

    // Preload cache for better performance
    console.log('Preloading cache...');
    await this.sheetsService.preloadCache();

    // Check cache status after preload
    const afterPreloadStatus = this.sheetsService.getCacheStatus();
    console.log('Cache status after preload:', afterPreloadStatus);

    // Demonstrate fast subsequent requests (served from cache)
    console.log('Making multiple requests (should be served from cache):');
    const start = Date.now();
    
    for (let i = 0; i < 5; i++) {
      await this.sheetsService.fetchSheetData();
    }
    
    const end = Date.now();
    console.log(`5 requests completed in ${end - start}ms (cached)`);

    // Demonstrate QR code caching
    console.log('\n=== QR Code Caching ===');
    const testUrls = [
      'https://example.com/test1',
      'https://example.com/test2',
      'https://example.com/test1', // Duplicate - should be cached
    ];

    console.log('Generating QR codes (first time):');
    const qrStart = Date.now();
    
    for (const url of testUrls) {
      await this.qrGenerator.generateQR(url);
    }
    
    const qrEnd = Date.now();
    console.log(`QR generation completed in ${qrEnd - qrStart}ms`);

    // Show cache statistics
    const qrStats = this.qrGenerator.getCacheStats();
    console.log('QR Cache stats:', qrStats);
  }

  /**
   * Demonstrates performance monitoring
   */
  async demonstratePerformanceMonitoring(): Promise<void> {
    console.log('\n=== Performance Monitoring ===');

    // Generate some QR codes to collect metrics
    const urls = [
      'https://example.com/perf1',
      'https://example.com/perf2',
      'https://example.com/perf3',
    ];

    for (const url of urls) {
      await this.qrGenerator.generateQR(url);
    }

    // Check performance requirements
    const requirements = performanceMonitor.checkPerformanceRequirements();
    console.log('Performance requirements check:', requirements);

    // Log performance summary
    performanceMonitor.logPerformanceSummary();
  }

  /**
   * Demonstrates cache invalidation strategies
   */
  async demonstrateCacheInvalidation(): Promise<void> {
    console.log('\n=== Cache Invalidation ===');

    // Load initial data
    await this.sheetsService.fetchSheetData();
    console.log('Initial data loaded');

    // Force refresh (invalidates cache)
    console.log('Forcing cache refresh...');
    await this.sheetsService.refreshCache();
    console.log('Cache refreshed');

    // Clear all caches
    console.log('Clearing all caches...');
    this.sheetsService.clearCache();
    this.qrGenerator.clearCache();
    console.log('All caches cleared');

    // Reset performance metrics
    performanceMonitor.reset();
    console.log('Performance metrics reset');
  }

  /**
   * Demonstrates preloading for performance optimization
   */
  async demonstratePreloading(): Promise<void> {
    console.log('\n=== Preloading Demonstration ===');

    // Preload common QR codes
    const commonUrls = [
      'https://example.com/home',
      'https://example.com/about',
      'https://example.com/contact',
    ];

    console.log('Preloading common QR codes...');
    await this.qrGenerator.preloadQRCodes(commonUrls);
    console.log('QR codes preloaded');

    // Now these should be served from cache instantly
    console.log('Generating preloaded QR codes (should be instant):');
    const start = Date.now();
    
    for (const url of commonUrls) {
      await this.qrGenerator.generateQR(url);
    }
    
    const end = Date.now();
    console.log(`Preloaded QR codes generated in ${end - start}ms`);
  }

  /**
   * Runs all demonstrations
   */
  async runAllDemonstrations(): Promise<void> {
    try {
      await this.demonstrateCaching();
      await this.demonstratePerformanceMonitoring();
      await this.demonstrateCacheInvalidation();
      await this.demonstratePreloading();
      
      console.log('\n=== All demonstrations completed successfully! ===');
    } catch (error) {
      console.error('Error during demonstration:', error);
    }
  }
}

// Example usage
export async function runCachingPerformanceExample(): Promise<void> {
  const example = new CachingPerformanceExample();
  await example.runAllDemonstrations();
}

// Export for use in other modules
export { CachingPerformanceExample };