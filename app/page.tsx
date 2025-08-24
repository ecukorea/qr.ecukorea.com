'use client'

import { useState } from 'react'
import { URLValidator } from '../lib/url-validator'
import { SheetsServiceError, SheetsNetworkError, SheetsDataError, SheetsAuthError } from '../lib/sheets-data-service'
import ECULogo from '../components/ECULogo'
import QRStyler from '../components/QRStyler'

export default function Home() {
    const [url, setUrl] = useState('https://example.com')
    const [validationMessage, setValidationMessage] = useState('')
    const [copySuccess, setCopySuccess] = useState('')
    const [generatedQR, setGeneratedQR] = useState<string>('')
    const [validUrl, setValidUrl] = useState('https://example.com')

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
                        고급 스타일링 옵션으로 아름답고 맞춤형 QR 코드를 만드세요.
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