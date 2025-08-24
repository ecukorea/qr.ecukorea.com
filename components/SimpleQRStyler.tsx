/**
 * Simple QR Code Styler Component for SSG
 * Provides basic QR code customization without complex dependencies
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SimpleQRGenerator, SimpleQROptions } from './SimpleQRGenerator';

interface SimpleQRStylerProps {
  data: string;
  onQRGenerated?: (dataUrl: string) => void;
}

export default function SimpleQRStyler({ data, onQRGenerated }: SimpleQRStylerProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'advanced'>('style');
  
  // QR Options State
  const [options, setOptions] = useState<SimpleQROptions>({
    width: 300,
    margin: 20,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });

  const generatorRef = useRef<SimpleQRGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = new SimpleQRGenerator();
  }, []);

  useEffect(() => {
    generateQR();
  }, [data, options]);

  const generateQR = async () => {
    if (!data || !generatorRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generatorRef.current.generateQR(data, options);
      setQrDataUrl(dataUrl);
      onQRGenerated?.(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOptions = (newOptions: Partial<SimpleQROptions>) => {
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* QR Code Preview */}
        <div className="flex flex-col items-center lg:sticky lg:top-6 lg:self-start">
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
                  { name: 'vibrant', label: 'Vibrant', color: '#e74c3c' },
                  { name: 'neon', label: 'Neon', color: '#00ff88' },
                  { name: 'business', label: 'Business', color: '#1a365d' },
                  { name: 'ocean', label: 'Ocean', color: '#3498db' }
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
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Customization</h3>
              
              {/* Random Color Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // Generate random colors
                    const generateRandomColor = () => {
                      const letters = '0123456789ABCDEF';
                      let color = '#';
                      for (let i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                      }
                      return color;
                    };

                    const randomColors = {
                      dark: generateRandomColor(),
                      light: generateRandomColor()
                    };

                    // Apply random colors
                    updateOptions({
                      color: {
                        dark: randomColors.dark,
                        light: randomColors.light
                      }
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm-6-6c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm0-6c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm6 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm6 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm0 6c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm0 6c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1z"/>
                  </svg>
                  <span className="font-medium">Random Color Combo</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foreground Color (QR Pattern)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.color?.dark || '#000000'}
                      onChange={(e) => updateOptions({ 
                        color: { 
                          ...options.color, 
                          dark: e.target.value 
                        } 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.color?.dark || '#000000'}
                      onChange={(e) => updateOptions({ 
                        color: { 
                          ...options.color, 
                          dark: e.target.value 
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
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.color?.light === 'transparent'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateOptions({ 
                              color: { 
                                ...options.color, 
                                light: 'transparent' 
                              } 
                            });
                          } else {
                            updateOptions({ 
                              color: { 
                                ...options.color, 
                                light: '#ffffff' 
                              } 
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Transparent Background</span>
                    </label>
                    
                    {options.color?.light !== 'transparent' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={options.color?.light || '#ffffff'}
                          onChange={(e) => updateOptions({ 
                            color: { 
                              ...options.color, 
                              light: e.target.value 
                            } 
                          })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={options.color?.light || '#ffffff'}
                          onChange={(e) => updateOptions({ 
                            color: { 
                              ...options.color, 
                              light: e.target.value 
                            } 
                          })}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="#ffffff"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Color Combinations</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { dark: '#000000', light: '#ffffff', name: 'Classic' },
                    { dark: '#2c3e50', light: '#ecf0f1', name: 'Modern' },
                    { dark: '#e74c3c', light: '#ffffff', name: 'Red' },
                    { dark: '#3498db', light: '#ffffff', name: 'Blue' },
                    { dark: '#2ecc71', light: '#ffffff', name: 'Green' },
                    { dark: '#f39c12', light: '#ffffff', name: 'Orange' },
                    { dark: '#9b59b6', light: '#ffffff', name: 'Purple' },
                    { dark: '#00ff88', light: '#000000', name: 'Neon' }
                  ].map((combo, index) => (
                    <button
                      key={index}
                      onClick={() => updateOptions({ color: combo })}
                      className="p-2 border border-gray-200 rounded hover:border-blue-400 transition-colors"
                      title={combo.name}
                    >
                      <div className="w-full h-6 rounded flex">
                        <div 
                          className="flex-1 rounded-l"
                          style={{ backgroundColor: combo.dark }}
                        ></div>
                        <div 
                          className="flex-1 rounded-r border-l"
                          style={{ backgroundColor: combo.light }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                  value={options.errorCorrectionLevel || 'M'}
                  onChange={(e) => updateOptions({ errorCorrectionLevel: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Low (7%) - Smallest QR code</option>
                  <option value="M">Medium (15%) - Balanced</option>
                  <option value="Q">Quartile (25%) - Good for damaged codes</option>
                  <option value="H">High (30%) - Best error recovery</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher levels create denser QR codes but can recover from more damage
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}