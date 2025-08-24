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
    const [showStyler, setShowStyler] = useState(false)

    // Initialize services
    const urlValidator = new URLValidator()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Clear previous messages
        setValidationMessage('')
        setCopySuccess('')

        // Validate URL using URLValidator
        const validation = urlValidator.validateAndNormalize(url)
        
        if (!validation.isValid) {
            setValidationMessage(validation.errorMessage || 'Please enter a valid URL')
            return
        }

        // Update URL and show styler
        setUrl(validation.normalizedUrl)
        setShowStyler(true)
    }

    const handleReset = () => {
        setUrl('https://example.com')
        setGeneratedQR('')
        setValidationMessage('')
        setCopySuccess('')
        setShowStyler(false)
    }

    const handleQRGenerated = (dataUrl: string) => {
        setGeneratedQR(dataUrl)
    }

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopySuccess('Copied to clipboard!')
            setTimeout(() => setCopySuccess(''), 3000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            setCopySuccess('Failed to copy')
            setTimeout(() => setCopySuccess(''), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-8">
                    <div className="mb-4">
                        <ECULogo size="md" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            복음주의 학생연합 ECU
                        </h2>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        QR Code Styler
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Create beautiful, customized QR codes with advanced styling options. 
                        Choose from multiple dot styles, colors, gradients, and add your logo.
                    </p>
                </header>

                {!showStyler ? (
                    <main className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter URL:
                                </label>
                                <input
                                    type="url"
                                    id="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    required
                                    className="form-input"
                                />
                                {validationMessage && (
                                    <p className="mt-1 text-sm text-red-600">{validationMessage}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary"
                            >
                                Create Styled QR Code
                            </button>
                        </form>

                        {/* Features Preview */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Advanced QR Code Features</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-1">⚫</div>
                                    <div className="text-xs text-gray-600">6 Dot Styles</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-1">🌈</div>
                                    <div className="text-xs text-gray-600">Gradients</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-1">🏢</div>
                                    <div className="text-xs text-gray-600">Logo Support</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-1">🎨</div>
                                    <div className="text-xs text-gray-600">8 Presets</div>
                                </div>
                            </div>
                        </div>
                    </main>
                ) : (
                    <div>
                        {/* Back Button */}
                        <div className="mb-6">
                            <button
                                onClick={handleReset}
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to URL Input
                            </button>
                        </div>

                        {/* URL Display */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700">Current URL:</p>
                                    <p className="text-blue-600 truncate">{url}</p>
                                </div>
                                <button
                                    onClick={() => handleCopyToClipboard(url)}
                                    className="ml-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            {copySuccess && (
                                <p className="text-sm text-green-600 font-medium mt-2">{copySuccess}</p>
                            )}
                        </div>

                        {/* QR Styler Component */}
                        <QRStyler 
                            data={url} 
                            onQRGenerated={handleQRGenerated}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}