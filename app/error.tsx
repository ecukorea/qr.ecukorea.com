'use client'

import { useEffect } from 'react'
import ECULogo from '../components/ECULogo'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* ECU Logo and Branding */}
        <div className="mb-8">
          <ECULogo size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            복음주의 학생연합 ECU
          </h2>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-700 mb-4">
            문제가 발생했습니다
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={reset}
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            다시 시도
          </button>
          <div>
            <a
              href="/"
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              홈으로 가기
            </a>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="text-sm text-gray-400">
          <p>문제가 계속되면 페이지를 새로고침하거나 관리자에게 문의해 주세요.</p>
        </div>
        
        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-semibold text-gray-700 mb-2">개발자 정보:</h4>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}