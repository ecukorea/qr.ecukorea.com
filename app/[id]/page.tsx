'use client'

import { useEffect, useState } from 'react'
import { Router } from '../../lib/router'
import ECULogo from '../../components/ECULogo'

interface RedirectPageProps {
  params: {
    id: string
  }
}

export default function RedirectPage({ params }: RedirectPageProps) {
  const [isRedirecting, setIsRedirecting] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const router = new Router()
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / 15) // Update every 100ms for 1.5 seconds
      })
    }, 100)
    
    // Handle the redirect with 1.5 second delay
    const handleRedirect = async () => {
      try {
        // Show loading screen for 1.5 seconds
        setTimeout(async () => {
          try {
            // The router will handle the current route automatically
            await router.handleRoute()
          } catch (error) {
            console.error('Redirect error:', error)
            setIsRedirecting(false)
            clearInterval(progressInterval)
            
            // Provide specific error handling based on error type
            if (error instanceof Error) {
              if (error.message.includes('Google Sheets fetch failed')) {
                router.showError('서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
              } else if (error.message.includes('network') || error.message.includes('fetch')) {
                router.showError('인터넷 연결을 확인하고 다시 시도해 주세요.')
              } else {
                router.showError('링크를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.')
              }
            } else {
              router.showError('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.')
            }
          }
        }, 1500) // 1.5 seconds delay
      } catch (error) {
        console.error('Initial redirect error:', error)
        setIsRedirecting(false)
        clearInterval(progressInterval)
      }
    }

    handleRedirect()

    // Cleanup interval on unmount
    return () => {
      clearInterval(progressInterval)
    }
  }, [params.id])

  // Show simple loading state for 1.5 seconds while redirect is being processed
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* ECU Logo */}
          <div className="mb-8">
            <ECULogo size="xl" className="mx-auto" />
          </div>

          {/* Organization name */}
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            복음주의 학생연합 ECU
          </h1>

          {/* Simple loading spinner */}
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

          {/* Progress bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // This will only show if there's an error and isRedirecting is set to false
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <ECULogo size="lg" className="mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Loading...
        </h2>
        <p className="text-gray-500">
          Please wait while we process your request.
        </p>
      </div>
    </div>
  )
}