/**
 * Performance monitoring utility for tracking cache effectiveness and QR generation performance
 * Implements requirements 4.1, 4.4 for performance optimization
 */

export interface PerformanceMetrics {
  qrGenerationTime: number[];
  cacheHitRate: number;
  totalRequests: number;
  cacheHits: number;
  averageGenerationTime: number;
  sheetsRequestCount: number;
  sheetsCacheHitRate: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    qrGenerationTime: [],
    cacheHitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    averageGenerationTime: 0,
    sheetsRequestCount: 0,
    sheetsCacheHitRate: 0,
  };

  private qrStartTimes = new Map<string, number>();
  private sheetsStartTimes = new Map<string, number>();

  /**
   * Starts timing a QR code generation
   */
  startQRGeneration(id: string): void {
    this.qrStartTimes.set(id, performance.now());
  }

  /**
   * Ends timing a QR code generation and records the duration
   */
  endQRGeneration(id: string, fromCache: boolean = false): void {
    const startTime = this.qrStartTimes.get(id);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.qrStartTimes.delete(id);

    this.metrics.qrGenerationTime.push(duration);
    this.metrics.totalRequests++;

    if (fromCache) {
      this.metrics.cacheHits++;
    }

    // Keep only last 100 measurements for rolling average
    if (this.metrics.qrGenerationTime.length > 100) {
      this.metrics.qrGenerationTime.shift();
    }

    this.updateMetrics();
  }

  /**
   * Records a sheets data request
   */
  recordSheetsRequest(fromCache: boolean = false): void {
    this.metrics.sheetsRequestCount++;
    if (fromCache) {
      // Update sheets cache hit rate calculation
    }
  }

  /**
   * Updates calculated metrics
   */
  private updateMetrics(): void {
    this.metrics.cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
      : 0;

    this.metrics.averageGenerationTime = this.metrics.qrGenerationTime.length > 0
      ? this.metrics.qrGenerationTime.reduce((sum, time) => sum + time, 0) / this.metrics.qrGenerationTime.length
      : 0;
  }

  /**
   * Gets current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Checks if performance requirements are being met
   */
  checkPerformanceRequirements(): {
    qrGenerationWithinLimit: boolean;
    cacheEffective: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Requirement 4.1: QR code generation within 3 seconds
    const qrGenerationWithinLimit = this.metrics.averageGenerationTime < 3000;
    if (!qrGenerationWithinLimit) {
      recommendations.push('QR code generation is taking longer than 3 seconds. Consider optimizing QR generation or increasing cache duration.');
    }

    // Cache effectiveness check
    const cacheEffective = this.metrics.cacheHitRate > 20; // At least 20% cache hit rate
    if (!cacheEffective && this.metrics.totalRequests > 10) {
      recommendations.push('Cache hit rate is low. Consider increasing cache duration or preloading common QR codes.');
    }

    return {
      qrGenerationWithinLimit,
      cacheEffective,
      recommendations,
    };
  }

  /**
   * Resets all metrics
   */
  reset(): void {
    this.metrics = {
      qrGenerationTime: [],
      cacheHitRate: 0,
      totalRequests: 0,
      cacheHits: 0,
      averageGenerationTime: 0,
      sheetsRequestCount: 0,
      sheetsCacheHitRate: 0,
    };
    this.qrStartTimes.clear();
    this.sheetsStartTimes.clear();
  }

  /**
   * Logs performance summary to console
   */
  logPerformanceSummary(): void {
    const metrics = this.getMetrics();
    const requirements = this.checkPerformanceRequirements();

    console.group('Performance Summary');
    console.log(`Average QR Generation Time: ${metrics.averageGenerationTime.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Performance Requirements Met: ${requirements.qrGenerationWithinLimit && requirements.cacheEffective}`);
    
    if (requirements.recommendations.length > 0) {
      console.log('Recommendations:');
      requirements.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
    
    console.groupEnd();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();