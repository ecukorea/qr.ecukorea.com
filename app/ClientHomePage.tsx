'use client'

import { useState } from 'react'
import { URLValidator } from '../lib/url-validator'
import ECULogo from '../components/ECULogo'
import QRStyler from '../components/QRStyler'

interface SheetsData {
  id: string
  to: string
  description: string
  title?: string
}

interface ClientHomePageProps {
  initialSheetsData: SheetsData[]
}

export default function ClientHomePage({ initialSheetsData }: ClientHomePageProps) {
    const [url, setUrl] = useState('https://example.com')
    const [validationMessage, setValidationMessage] = useState('')
    const [copySuccess, setCopySuccess] = useState('')
    const [generatedQR, setGeneratedQR] = useState<string>('')
    const [validUrl, setValidUrl] = useState('https://example.com')
    const [sheetUrls, setSheetUrls] = useState<{id: string, to: string}[]>(
        initialSheetsData.map(m => ({ id: m.id, to: m.to }))
    )
    const [isLoadingUrls, setIsLoadingUrls] = useState(false)
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false)

    // Initialize services
    const urlValidator = new URLValidator()

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value
        setUrl(newUrl)
        
        // Clear previous messages
        setValidationMessage('')
        
        // Validate URL in real-time
        const validation = urlValidator.validateAndNormalize(newUrl)
        
        if (validation.isValid) {
            setValidUrl(validation.normalizedUrl)
            setValidationMessage('')
        } else if (newUrl.trim()) {
            setValidationMessage(validation.errorMessage || '올바른 URL을 입력해주세요')
        }
    }

    const handleQRGenerated = (dataUrl: string) => {
        setGeneratedQR(dataUrl)
    }

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopySuccess('클립보드에 복사되었습니다!')
            setTimeout(() => setCopySuccess(''), 3000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            setCopySuccess('복사에 실패했습니다')
            setTimeout(() => setCopySuccess(''), 3000)
        }
    }

    const handleLoadUrlsFromSheets = async () => {
        setIsLoadingUrls(true)
        try {
            // Fetch directly from Google Sheets with cache-busting for client-side refresh
            const SHEET_ID = '1WPO2Hs53oFtPExN3kZLFfJtsRclE1ZA3uat59elqXwg'
            const cacheBuster = `&t=${Date.now()}`
            const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv${cacheBuster}`
            
            const response = await fetch(SHEETS_URL, {
                headers: {
                    'User-Agent': 'ECU-QR-Generator/1.0'
                },
                cache: 'no-cache' // Force fresh fetch
            })
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const csvText = await response.text()
            const mappings = parseClientCSV(csvText)
            setSheetUrls(mappings.map(m => ({ id: m.id, to: m.to })))
        } catch (error) {
            console.error('Failed to load URLs from sheets:', error)
        } finally {
            setIsLoadingUrls(false)
        }
    }

    // Client-side CSV parser (simplified version)
    const parseClientCSV = (csvText: string) => {
        const lines = csvText.trim().split('\n')
        if (lines.length <= 1) return []
        
        const dataRows = lines.slice(1) // Skip header
        const mappings: {id: string, to: string, description: string, title?: string}[] = []
        
        for (let i = 0; i < dataRows.length; i++) {
            try {
                const row = dataRows[i].split(',').map(field => field.replace(/^"|"$/g, '').trim())
                if (row.length >= 3) {
                    const [id, to, description, title] = row
                    if (id && to && /^[a-zA-Z0-9]{6,8}$/.test(id)) {
                        try {
                            new URL(to) // Validate URL
                            mappings.push({
                                id: id.trim(),
                                to: to.trim(),
                                description: description ? description.trim() : '',
                                title: title ? title.trim() : undefined
                            })
                        } catch {
                            // Skip invalid URLs
                        }
                    }
                }
            } catch (error) {
                // Skip malformed rows
            }
        }
        
        return mappings
    }

    const handleSelectUrl = (selectedUrl: string) => {
        setUrl(selectedUrl)
        const validation = urlValidator.validateAndNormalize(selectedUrl)
        if (validation.isValid) {
            setValidUrl(validation.normalizedUrl)
            setValidationMessage('')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="text-center mb-8">
                    <div className="mb-4">
                        <ECULogo size="md" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            복음주의 학생연합 ECU
                        </h2>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        QR 코드 스타일러
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        다양한 도트 스타일, 색상, 그라데이션 중에서 선택하고 로고를 추가하세요.
                    </p>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: URL Input Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">URL 입력</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                        QR 코드로 만들 URL:
                                    </label>
                                    <input
                                        type="url"
                                        id="url"
                                        value={url}
                                        onChange={handleUrlChange}
                                        placeholder="https://example.com"
                                        className="form-input"
                                    />
                                    {validationMessage && (
                                        <p className="mt-1 text-sm text-red-600">{validationMessage}</p>
                                    )}
                                </div>

                                {/* Advanced: Google Sheets Integration */}
                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <h4 className="text-sm font-semibold text-gray-900">🔧 구글 시트에 저장된 정보 사용하기</h4>
                                        <svg 
                                            className={`w-4 h-4 transition-transform ${isAdvancedExpanded ? 'transform rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isAdvancedExpanded && (
                                        <div className="mt-3 space-y-3">
                                            <p className="text-xs text-gray-600">
                                                Google Sheets에 저장된 URL 목록을 불러와서 선택할 수 있습니다.
                                            </p>
                                            
                                            {/* Buttons Row */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={handleLoadUrlsFromSheets}
                                                    disabled={isLoadingUrls}
                                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoadingUrls ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            로딩중...
                                                        </>
                                                    ) : (
                                                        '새로고침'
                                                    )}
                                                </button>
                                                
                                                <a
                                                    href="https://docs.google.com/spreadsheets/d/1WPO2Hs53oFtPExN3kZLFfJtsRclE1ZA3uat59elqXwg/edit"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Google Sheets로 이동하기
                                                </a>
                                            </div>

                                            {/* URLs List */}
                                            {sheetUrls.length > 0 && (
                                                <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                                                    <div className="p-2 bg-gray-50 border-b">
                                                        <p className="text-xs font-medium text-gray-700">클릭하여 선택하세요:</p>
                                                    </div>
                                                    <div className="divide-y divide-gray-100">
                                                        {sheetUrls.map((item, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSelectUrl(item.to)}
                                                                className="w-full p-2 text-left hover:bg-blue-50 transition-colors"
                                                            >
                                                                <div className="text-xs">
                                                                    <span className="font-mono text-gray-600">id={item.id}</span>
                                                                    <br />
                                                                    <span className="text-blue-600 break-all">to={item.to}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: QR Styler Section */}
                    <div className="lg:col-span-2">
                        <QRStyler 
                            data={validUrl} 
                            onQRGenerated={handleQRGenerated}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}