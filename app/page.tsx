'use client'

import { useState } from 'react'
import { QRCodeGenerator, QRCodeGenerationError } from '../lib/qr-code-generator'
import { URLValidator } from '../lib/url-validator'
import { SheetsServiceError, SheetsNetworkError, SheetsDataError, SheetsAuthError } from '../lib/sheets-data-service'
import ECULogo from '../components/ECULogo'

export default function Home() {
    const [url, setUrl] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{
        qrCode: string
        originalUrl: string
    } | null>(null)
    const [error, setError] = useState('')
    const [validationMessage, setValidationMessage] = useState('')
    const [copySuccess, setCopySuccess] = useState('')

    // Initialize services
    const qrGenerator = new QRCodeGenerator()
    const urlValidator = new URLValidator()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Clear previous messages
        setValidationMessage('')
        setError('')
        setCopySuccess('')

        // Validate URL using URLValidator
        const validation = urlValidator.validateAndNormalize(url)
        
        if (!validation.isValid) {
            setValidationMessage(validation.errorMessage || 'Please enter a valid URL')
            return
        }

        setIsLoading(true)

        try {
            // Generate QR code directly from the user's URL
            // Note: We're not creating shortened URLs yet since Google Sheets storage isn't implemented
            const qrCodeDataUrl = await qrGenerator.generateQR(validation.normalizedUrl, {
                width: 256,
                margin: 2,
                errorCorrectionLevel: 'M'
            })

            // Set the result
            setResult({
                qrCode: `<img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />`,
                originalUrl: validation.normalizedUrl
            })

        } catch (error) {
            console.error('QR generation error:', error)
            
            // Provide user-friendly error messages based on error type
            if (error instanceof QRCodeGenerationError) {
                setError('QR 코드 생성에 실패했습니다. 다시 시도해 주세요.')
            } else if (error instanceof SheetsAuthError) {
                setError('서비스 접근 권한 문제가 발생했습니다. 관리자에게 문의해 주세요.')
            } else if (error instanceof SheetsNetworkError) {
                setError('인터넷 연결을 확인하고 다시 시도해 주세요.')
            } else if (error instanceof SheetsDataError) {
                setError('데이터 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
            } else if (error instanceof SheetsServiceError) {
                setError('서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
            } else if (error instanceof Error && error.message.includes('network')) {
                setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.')
            } else {
                setError('QR 코드 생성 중 문제가 발생했습니다. 다시 시도해 주세요.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setUrl('')
        setDescription('')
        setResult(null)
        setError('')
        setValidationMessage('')
        setCopySuccess('')
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
            <div className="max-w-2xl mx-auto px-4">
                <header className="text-center mb-8">
                    <div className="mb-4">
                        <ECULogo size="md" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            복음주의 학생연합 ECU
                        </h2>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        QR Code Generator
                    </h1>
                    <p className="text-gray-600">
                        Generate QR codes for your URLs instantly
                    </p>
                </header>

                <main className="bg-white rounded-lg shadow-md p-6">
                    {!result && !error && (
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

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (optional):
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description for your link"
                                    className="form-input"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Generating QR Code...' : 'Generate QR Code'}
                            </button>
                        </form>
                    )}

                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-gray-600">Generating QR code...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                        </div>
                    )}

                    {result && (
                        <div className="text-center space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Your QR Code</h2>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <div dangerouslySetInnerHTML={{ __html: result.qrCode }} />
                            </div>
                            <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                                <p><strong>URL:</strong> <a href={result.originalUrl} className="text-primary-600 hover:text-primary-700 underline break-all">{result.originalUrl}</a></p>
                                {description && <p><strong>Description:</strong> <span className="text-gray-700">{description}</span></p>}
                                <p className="text-sm text-gray-500 italic">Note: URL shortening will be available once Google Sheets integration is complete.</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => handleCopyToClipboard(result.originalUrl)}
                                    className="btn-primary"
                                >
                                    Copy URL
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="btn-secondary"
                                >
                                    Generate Another
                                </button>
                            </div>
                            {copySuccess && (
                                <p className="text-sm text-green-600 font-medium">{copySuccess}</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-red-600">Error</h2>
                            <p className="text-gray-700">{error}</p>
                            <button
                                onClick={handleReset}
                                className="btn-secondary"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}