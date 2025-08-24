/**
 * Simple QR Code Generator for SSG
 * Uses basic qrcode library without complex dependencies
 */

'use client';

import QRCode from 'qrcode';

export interface SimpleQROptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class SimpleQRGenerator {
  private defaultOptions: SimpleQROptions = {
    width: 300,
    margin: 20,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };

  async generateQR(data: string, options?: SimpleQROptions): Promise<string> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toDataURL(data, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  getStylePresets(): Record<string, SimpleQROptions> {
    return {
      classic: {
        color: { dark: '#000000', light: '#ffffff' }
      },
      modern: {
        color: { dark: '#2c3e50', light: '#ecf0f1' }
      },
      vibrant: {
        color: { dark: '#e74c3c', light: '#ffffff' }
      },
      neon: {
        color: { dark: '#00ff88', light: '#000000' }
      },
      business: {
        color: { dark: '#1a365d', light: '#f7fafc' }
      },
      ocean: {
        color: { dark: '#3498db', light: '#ffffff' }
      }
    };
  }

  async generateWithPreset(data: string, presetName: string): Promise<string> {
    const presets = this.getStylePresets();
    const preset = presets[presetName];
    
    if (!preset) {
      throw new Error(`Preset '${presetName}' not found`);
    }

    return this.generateQR(data, preset);
  }
}