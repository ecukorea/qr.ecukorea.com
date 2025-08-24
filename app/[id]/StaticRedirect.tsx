'use client'

import { useEffect } from 'react'
import { UrlMapping } from '../../lib/build-time-sheets'
import ECULogo from '../../components/ECULogo'

interface StaticRedirectProps {
  mapping: UrlMapping
}

export default function StaticRedirect({ mapping }: StaticRedirectProps) {
  useEffect(() => {
    // Redirect to the target URL after a short delay
    const timer = setTimeout(() => {
      window.location.href = mapping.to
    }, 700) // 0.7 second delay

    return () => clearTimeout(timer)
  }, [mapping.to])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* ECU Logo */}
        <div className="mb-8">
          <ECULogo size="xl" className="mx-auto" />
        </div>

        {/* Title or Organization name */}
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
          {mapping.title || '복음주의 학생연합 ECU'}
        </h1>

        {/* Loading spinner */}
        <div className="mb-6">
          <div className="w-8 h-8 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* Redirecting text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Redirecting...
        </h2>
        <p className="text-gray-500 mb-6">
          잠시만 기다려주세요.
        </p>

        {/* Destination info */}
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-400 mb-2">
            Taking you to:
          </p>
          <p className="text-sm text-blue-600 break-all">
            {mapping.to}
          </p>
        </div>

        {/* Progress bar animation */}
        <div className="w-64 mx-auto mt-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
              style={{ 
                animation: 'progress 0.7s ease-out forwards',
                width: '0%'
              }}
            ></div>
          </div>
        </div>

        {/* Meta information for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-xs text-gray-400">
            <p>QR ID: {mapping.id}</p>
            {mapping.title && <p>Title: {mapping.title}</p>}
            {mapping.description && <p>Description: {mapping.description}</p>}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}