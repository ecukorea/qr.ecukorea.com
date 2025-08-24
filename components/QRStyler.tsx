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
          <h2 className="text-2xl font-bold mb-4">QR 코드 미리보기</h2>
          
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
QR 코드가 여기에 표시됩니다
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
QR 코드 다운로드
            </a>
          )}
        </div>

        {/* Styling Controls */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">QR 코드 사용자 정의</h2>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'style', label: '스타일' },
              { id: 'colors', label: '색상' },
              { id: 'logo', label: '로고' },
              { id: 'advanced', label: '고급' }
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
              <h3 className="text-lg font-semibold">빠른 프리셋</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'classic', label: '클래식', color: '#000000' },
                  { name: 'modern', label: '모던', color: '#2c3e50' },
                  { name: 'vibrant', label: '생동감', color: '#ff6b6b' },
                  { name: 'neon', label: '네온', color: '#00ff88' },
                  { name: 'business', label: '비즈니스', color: '#1a365d' },
                  { name: 'ocean', label: '오션', color: '#667eea' },
                  { name: 'dots', label: '도트', color: '#7b68ee' },
                  { name: 'classy', label: '클래시', color: '#8b5cf6' }
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
도트 스타일
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
                    <option value="square">사각형</option>
                    <option value="dots">원형</option>
                    <option value="rounded">둥근 모서리</option>
                    <option value="extra-rounded">매우 둥근 모서리</option>
                    <option value="classy">클래시</option>
                    <option value="classy-rounded">클래시 둥근 모서리</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
모서리 사각형 스타일
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
                    <option value="square">사각형</option>
                    <option value="dot">도트</option>
                    <option value="extra-rounded">매우 둥근 모서리</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
모서리 도트 스타일
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
              <h3 className="text-lg font-semibold">색상 사용자 정의</h3>
              
              {/* Visual Guide */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">QR 코드 구성 요소 안내</h4>
                <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                    <span>도트 (메인 패턴)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 border-2 border-blue-600 rounded-sm"></span>
                    <span>모서리 사각형</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>모서리 도트</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
도트 색상
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
모서리 사각형 색상
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
모서리 도트 색상
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.cornersDotOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        cornersDotOptions: { 
                          ...options.cornersDotOptions, 
                          color: e.target.value,
                          gradient: undefined
                        } 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.cornersDotOptions?.color || '#000000'}
                      onChange={(e) => updateOptions({ 
                        cornersDotOptions: { 
                          ...options.cornersDotOptions, 
                          color: e.target.value,
                          gradient: undefined
                        } 
                      })}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
모서리 사각형 안의 작은 도트 색상
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span>●</span>
                      <span>in</span>
                      <span>⬜</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
배경 색상
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
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800 border-t pt-4">그라데이션 옵션</h4>
                
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
                  <span className="text-sm font-medium text-gray-700">도트에 그라데이션 사용</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!options.cornersSquareOptions?.gradient}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateOptions({
                          cornersSquareOptions: {
                            ...options.cornersSquareOptions,
                            color: undefined,
                            gradient: {
                              type: 'linear',
                              rotation: 45,
                              colorStops: [
                                { offset: 0, color: '#667eea' },
                                { offset: 1, color: '#764ba2' }
                              ]
                            }
                          }
                        });
                      } else {
                        updateOptions({ 
                          cornersSquareOptions: {
                            ...options.cornersSquareOptions,
                            gradient: undefined,
                            color: '#000000'
                          }
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">모서리 사각형에 그라데이션 사용</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!options.cornersDotOptions?.gradient}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateOptions({
                          cornersDotOptions: {
                            ...options.cornersDotOptions,
                            color: undefined,
                            gradient: {
                              type: 'radial',
                              colorStops: [
                                { offset: 0, color: '#ffeaa7' },
                                { offset: 1, color: '#fab1a0' }
                              ]
                            }
                          }
                        });
                      } else {
                        updateOptions({ 
                          cornersDotOptions: {
                            ...options.cornersDotOptions,
                            gradient: undefined,
                            color: '#000000'
                          }
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">모서리 도트에 그라데이션 사용</span>
                </label>

                {options.dotsOptions?.gradient && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
그라데이션 유형
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
                        <option value="linear">선형</option>
                        <option value="radial">원형</option>
                      </select>
                    </div>

                    {options.dotsOptions.gradient.type === 'linear' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
회전 (도)
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
시작 색상
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
끝 색상
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
              <h3 className="text-lg font-semibold">로고 및 이미지</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
프리셋 로고
                  </label>
                  <button
                    onClick={() => {
                      updateOptions({
                        image: '/ecu-logo.png',
                        imageOptions: {
                          hideBackgroundDots: true,
                          imageSize: 0.4,
                          margin: 20
                        }
                      });
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    <img src="/ecu-logo.png" alt="ECU 로고" className="w-6 h-6 mr-2" />
                    ECU 로고 사용하기
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
로고 업로드
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
권장사항: 정사각형 이미지, 투명 배경의 PNG
                  </p>
                </div>
              </div>

              {options.image && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
로고 크기
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
QR 크기의 {Math.round((options.imageOptions?.imageSize || 0.4) * 100)}%
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
로고 여백
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
                      <span className="text-sm font-medium text-gray-700">로고 뒤 도트 숨기기</span>
                    </label>
                  </div>

                  <button
                    onClick={() => updateOptions({ 
                      image: undefined,
                      imageOptions: undefined 
                    })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
로고 제거
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">고급 설정</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
크기
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
여백
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
오류 정정 수준
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
                  <option value="L">낮음 (7%)</option>
                  <option value="M">보통 (15%)</option>
                  <option value="Q">분위수 (25%)</option>
                  <option value="H">높음 (30%)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
높은 수준은 더 많은 손상을 허용하지만 더 조밀한 QR 코드를 생성합니다
                </p>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
출력 형식
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