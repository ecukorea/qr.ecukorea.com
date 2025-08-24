/**
 * QR Code Styler Component - Similar to qrfy.com interface
 * Provides a UI for customizing QR code appearance
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EnhancedQRGenerator, EnhancedQROptions } from '../lib/enhanced-qr-generator';

interface QRStylerProps {
  data: string;
  onQRGenerated?: (dataUrl: string) => void;
}

export default function QRStyler({ data, onQRGenerated }: QRStylerProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'logo' | 'advanced'>('style');
  
  // QR Options State
  const [options, setOptions] = useState<EnhancedQROptions>({
    width: 300,
    height: 300,
    margin: 20,
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
    },
    qrOptions: {
      errorCorrectionLevel: 'M'
    }
  });

  const generatorRef = useRef<EnhancedQRGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = new EnhancedQRGenerator();
  }, []);

  useEffect(() => {
    generateQR();
  }, [data, options]);

  const generateQR = async () => {
    if (!data || !generatorRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generatorRef.current.generateEnhancedQR(data, options);
      setQrDataUrl(dataUrl);
      onQRGenerated?.(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOptions = (newOptions: Partial<EnhancedQROptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const applyPreset = async (presetName: string) => {
    if (!generatorRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await generatorRef.current.generateWithPreset(data, presetName);
      setQrDataUrl(dataUrl);
      onQRGenerated?.(dataUrl);
      
      // Update options to reflect preset
      const presets = generatorRef.current.getStylePresets();
      const preset = presets[presetName];
      if (preset) {
        setOptions(prev => ({ ...prev, ...preset }));
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const logoSrc = e.target?.result as string;
      updateOptions({
        image: logoSrc,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 20
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* QR Code Preview */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">QR Code Preview</h2>
          
          <div className="relative bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300">
            {isGenerating ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Generated QR Code" 
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center text-gray-500">
                QR Code will appear here
              </div>
            )}
          </div>

          {/* Download Button */}
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="qr-code.png"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download QR Code
            </a>
          )}
        </div>

        {/* Styling Controls */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Customize Your QR Code</h2>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'style', label: 'Style' },
              { id: 'colors', label: 'Colors' },
              { id: 'logo', label: 'Logo' },
              { id: 'advanced', label: 'Advanced' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Style Tab */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Presets</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'classic', label: 'Classic', color: '#000000' },
                  { name: 'modern', label: 'Modern', color: '#2c3e50' },
                  { name: 'vibrant', label: 'Vibrant', color: '#ff6b6b' },
                  { name: 'neon', label: 'Neon', color: '#00ff88' },
                  { name: 'business', label: 'Business', color: '#1a365d' },
                  { name: 'ocean', label: 'Ocean', color: '#667eea' },
                  { name: 'dots', label: 'Dots', color: '#7b68ee' },
                  { name: 'classy', label: 'Classy', color: '#8b5cf6' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.name)}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors text-left"
                  >
                    <div 
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: preset.color }}
                    ></div>
                    <span className="text-sm font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dot Style
                  </label>
                  <select
                    value={options.dotsOptions?.type || 'square'}
                    onChange={(e) => updateOptions({ 
                      dotsOptions: { 
                        ...options.dotsOptions, 
                        type: e.target.value as any 
                      } 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="square">Square</option>
                    <option value="dots">Dots (Circular)</option>
                    <option value="rounded">Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corner Square Style
                  </label>
                  <select
                    value={options.cornersSquareOptions?.type || 'square'}
                    onChange={(e) => updateOptions({ 
                      cornersSquareOptions: { 
                        ...options.cornersSquareOptions, 
                        type: e.target.value as any 
                      } 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corner Dot Style
                  </label>
                  <select
                    value={options.cornersDotOptions?.type || 'square'}
                    onChange={(e) => updateOptions({ 
                      cornersDotOptions: { 
                        ...options.cornersDotOptions, 
                        type: e.target.value as any 
                      } 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Customization</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dots Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.dotsOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        dotsOptions: { 
                          ...options.dotsOptions, 
                          color: e.target.value,
                          gradient: undefined // Clear gradient when setting solid color
                        } 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.dotsOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        dotsOptions: { 
                          ...options.dotsOptions, 
                          color: e.target.value,
                          gradient: undefined
                        } 
                      })}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corner Squares Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.cornersSquareOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        cornersSquareOptions: { 
                          ...options.cornersSquareOptions, 
                          color: e.target.value,
                          gradient: undefined
                        } 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.cornersSquareOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        cornersSquareOptions: { 
                          ...options.cornersSquareOptions, 
                          color: e.target.value,
                          gradient: undefined
                        } 
                      })}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.backgroundOptions?.color || '#ffffff'}
                      onChange={(e) => updateOptions({ 
                        backgroundOptions: { 
                          ...options.backgroundOptions, 
                          color: e.target.value 
                        } 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.backgroundOptions?.color || '#ffffff'}
                      onChange={(e) => updateOptions({ 
                        backgroundOptions: { 
                          ...options.backgroundOptions, 
                          color: e.target.value 
                        } 
                      })}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!options.dotsOptions?.gradient}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateOptions({
                          dotsOptions: {
                            ...options.dotsOptions,
                            color: undefined, // Clear solid color when using gradient
                            gradient: {
                              type: 'linear',
                              rotation: 45,
                              colorStops: [
                                { offset: 0, color: '#ff6b6b' },
                                { offset: 1, color: '#4ecdc4' }
                              ]
                            }
                          }
                        });
                      } else {
                        updateOptions({ 
                          dotsOptions: {
                            ...options.dotsOptions,
                            gradient: undefined,
                            color: '#000000'
                          }
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Use Gradient for Dots</span>
                </label>

                {options.dotsOptions?.gradient && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gradient Type
                      </label>
                      <select
                        value={options.dotsOptions.gradient.type || 'linear'}
                        onChange={(e) => updateOptions({
                          dotsOptions: {
                            ...options.dotsOptions,
                            gradient: { 
                              ...options.dotsOptions!.gradient!, 
                              type: e.target.value as 'linear' | 'radial' 
                            }
                          }
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                    </div>

                    {options.dotsOptions.gradient.type === 'linear' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rotation (degrees)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={options.dotsOptions.gradient.rotation || 0}
                          onChange={(e) => updateOptions({
                            dotsOptions: {
                              ...options.dotsOptions,
                              gradient: { 
                                ...options.dotsOptions!.gradient!, 
                                rotation: parseInt(e.target.value) 
                              }
                            }
                          })}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{options.dotsOptions.gradient.rotation || 0}°</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Color
                        </label>
                        <input
                          type="color"
                          value={options.dotsOptions.gradient.colorStops?.[0]?.color || '#ff6b6b'}
                          onChange={(e) => {
                            const colorStops = [...(options.dotsOptions!.gradient!.colorStops || [])];
                            colorStops[0] = { offset: 0, color: e.target.value };
                            updateOptions({
                              dotsOptions: {
                                ...options.dotsOptions,
                                gradient: { 
                                  ...options.dotsOptions!.gradient!, 
                                  colorStops 
                                }
                              }
                            });
                          }}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Color
                        </label>
                        <input
                          type="color"
                          value={options.dotsOptions.gradient.colorStops?.[1]?.color || '#4ecdc4'}
                          onChange={(e) => {
                            const colorStops = [...(options.dotsOptions!.gradient!.colorStops || [])];
                            colorStops[1] = { offset: 1, color: e.target.value };
                            updateOptions({
                              dotsOptions: {
                                ...options.dotsOptions,
                                gradient: { 
                                  ...options.dotsOptions!.gradient!, 
                                  colorStops 
                                }
                              }
                            });
                          }}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Logo & Image</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, PNG with transparent background
                </p>
              </div>

              {options.image && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo Size
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.1"
                        value={options.imageOptions?.imageSize || 0.4}
                        onChange={(e) => updateOptions({
                          imageOptions: { 
                            ...options.imageOptions, 
                            imageSize: parseFloat(e.target.value) 
                          }
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">
                        {Math.round((options.imageOptions?.imageSize || 0.4) * 100)}% of QR size
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo Margin
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={options.imageOptions?.margin || 20}
                        onChange={(e) => updateOptions({
                          imageOptions: { 
                            ...options.imageOptions, 
                            margin: parseInt(e.target.value) 
                          }
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{options.imageOptions?.margin || 20}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.imageOptions?.hideBackgroundDots !== false}
                        onChange={(e) => updateOptions({
                          imageOptions: { 
                            ...options.imageOptions, 
                            hideBackgroundDots: e.target.checked 
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Hide dots behind logo</span>
                    </label>
                  </div>

                  <button
                    onClick={() => updateOptions({ 
                      image: undefined,
                      imageOptions: undefined 
                    })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Advanced Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    value={options.width || 300}
                    onChange={(e) => updateOptions({ width: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{options.width || 300}px</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={options.margin || 20}
                    onChange={(e) => updateOptions({ margin: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{options.margin || 20}px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Correction Level
                </label>
                <select
                  value={options.qrOptions?.errorCorrectionLevel || 'M'}
                  onChange={(e) => updateOptions({ 
                    qrOptions: {
                      ...options.qrOptions,
                      errorCorrectionLevel: e.target.value as any
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher levels allow for more damage but create denser QR codes
                </p>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={options.format || 'png'}
                  onChange={(e) => updateOptions({ format: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="svg">SVG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}