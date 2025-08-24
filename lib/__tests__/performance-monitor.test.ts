/**
 * Tests for PerformanceMonitor
 * Verifies performance tracking and metrics calculation
 */

import { PerformanceMonitor } from '../performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('QR generation timing', () => {
    it('should track QR generation time', () => {
      const id = 'test-qr-1';
      
      monitor.startQRGeneration(id);
      // Simulate some processing time
      monitor.endQRGeneration(id, false);

      const metrics = monitor.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.qrGenerationTime.length).toBe(1);
      expect(metrics.averageGenerationTime).toBeGreaterThan(0);
    });

    it('should track cache hits correctly', () => {
      monitor.startQRGeneration('test-1');
      monitor.endQRGeneration('test-1', true);
      
      monitor.startQRGeneration('test-2');
      monitor.endQRGeneration('test-2', false);

      const metrics = monitor.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheHitRate).toBe(50);
    });

    it('should handle missing start time gracefully', () => {
      monitor.endQRGeneration('non-existent-id', false);
      
      const metrics = monitor.getMetrics();
      expect(metrics.totalRequests).toBe(0);
    });

    it('should maintain rolling average of last 100 measurements', () => {
      // Add 150 measurements
      for (let i = 0; i < 150; i++) {
        monitor.startQRGeneration(`test-${i}`);
        monitor.endQRGeneration(`test-${i}`, false);
      }

      const metrics = monitor.getMetrics();
      expect(metrics.qrGenerationTime.length).toBe(100);
      expect(metrics.totalRequests).toBe(150);
    });
  });

  describe('sheets request tracking', () => {
    it('should record sheets requests', () => {
      monitor.recordSheetsRequest(false);
      monitor.recordSheetsRequest(true);

      const metrics = monitor.getMetrics();
      expect(metrics.sheetsRequestCount).toBe(2);
    });
  });

  describe('performance requirements checking', () => {
    it('should identify when QR generation is within time limit', () => {
      // Simulate fast generation
      monitor.startQRGeneration('fast');
      monitor.endQRGeneration('fast', false);

      const requirements = monitor.checkPerformanceRequirements();
      expect(requirements.qrGenerationWithinLimit).toBe(true);
    });

    it('should provide recommendations for poor cache performance', () => {
      // Simulate many requests with no cache hits
      for (let i = 0; i < 20; i++) {
        monitor.startQRGeneration(`test-${i}`);
        monitor.endQRGeneration(`test-${i}`, false);
      }

      const requirements = monitor.checkPerformanceRequirements();
      expect(requirements.cacheEffective).toBe(false);
      expect(requirements.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify effective caching', () => {
      // Simulate good cache hit rate
      for (let i = 0; i < 10; i++) {
        monitor.startQRGeneration(`test-${i}`);
        monitor.endQRGeneration(`test-${i}`, i < 5); // 50% cache hit rate
      }

      const requirements = monitor.checkPerformanceRequirements();
      expect(requirements.cacheEffective).toBe(true);
    });
  });

  describe('metrics management', () => {
    it('should reset all metrics', () => {
      monitor.startQRGeneration('test');
      monitor.endQRGeneration('test', false);
      monitor.recordSheetsRequest(false);

      monitor.reset();

      const metrics = monitor.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.sheetsRequestCount).toBe(0);
      expect(metrics.qrGenerationTime.length).toBe(0);
    });

    it('should calculate cache hit rate correctly', () => {
      // 3 cache hits out of 5 requests = 60%
      for (let i = 0; i < 5; i++) {
        monitor.startQRGeneration(`test-${i}`);
        monitor.endQRGeneration(`test-${i}`, i < 3);
      }

      const metrics = monitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(60);
    });

    it('should handle zero requests gracefully', () => {
      const metrics = monitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.averageGenerationTime).toBe(0);
    });
  });

  describe('logging', () => {
    it('should log performance summary without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();

      monitor.startQRGeneration('test');
      monitor.endQRGeneration('test', false);
      
      monitor.logPerformanceSummary();

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });
});