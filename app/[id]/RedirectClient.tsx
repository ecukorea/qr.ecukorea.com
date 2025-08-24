'use client'

import { useEffect, useState } from 'react'
import ECULogo from '../../components/ECULogo'

interface URLRecord {
  id: string;
  to: string;
  description: string;
}

interface RedirectClientProps {
  id: string;
}

export default function RedirectClient({ id }: RedirectClientProps) {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'not-found'>('loading')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Google Sheets configuration
  const SHEET_ID = '1WPO2Hs53oFtPExN3kZLFfJtsRclE1ZA3uat59elqXwg'
  const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

  useEffect(() => {
    if (!id) return

    // Validate ID format (alphanumeric, 6-8 characters)
    if (!/^[a-zA-Z0-9]{6,8}$/.test(id)) {
      setStatus('not-found')
      return
    }

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / 7) // Complete in 0.7 seconds
      })
    }, 100)

    // Handle the redirect
    const handleRedirect = async () => {
      try {
        // Show loading for 0.7 seconds
        setTimeout(async () => {
          try {
            const urlRecord = await fetchUrlById(id)
            
            if (urlRecord) {
              setStatus('redirecting')
              // Redirect after a brief moment
              setTimeout(() => {
                window.location.href = urlRecord.to
              }, 500)
            } else {
              setStatus('not-found')
            }
          } catch (error) {
            console.error('Redirect error:', error)
            setStatus('error')
            
            if (error instanceof Error) {
              if (error.message.includes('fetch')) {
                setErrorMessage('인터넷 연결을 확인하고 다시 시도해 주세요.')
              } else if (error.message.includes('403')) {
                setErrorMessage('접근 권한이 없습니다. 관리자에게 문의해 주세요.')
              } else if (error.message.includes('404')) {
                setErrorMessage('데이터를 찾을 수 없습니다. URL을 확인해 주세요.')
              } else {
                setErrorMessage('링크를 불러오는 중 문제가 발생했습니다.')
              }
            } else {
              setErrorMessage('알 수 없는 오류가 발생했습니다.')
            }
          }
          clearInterval(progressInterval)
        }, 700)
      } catch (error) {
        console.error('Initial error:', error)
        setStatus('error')
        setErrorMessage('초기화 중 오류가 발생했습니다.')
        clearInterval(progressInterval)
      }
    }

    handleRedirect()

    return () => {
      clearInterval(progressInterval)
    }
  }, [id])

  // Fetch URL by ID from Google Sheets
  const fetchUrlById = async (id: string): Promise<URLRecord | null> => {
    const response = await fetch(CSV_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const csvText = await response.text()
    
    if (!csvText.trim()) {
      throw new Error('Empty response from Google Sheets')
    }

    const records = parseCSV(csvText)
    return records.find(record => record.id === id) || null
  }

  // Parse CSV data
  const parseCSV = (csvText: string): URLRecord[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format')
    }

    // Skip header row
    const dataLines = lines.slice(1)
    const records: URLRecord[] = []

    for (const line of dataLines) {
      const [id, to, description] = parseCSVLine(line)
      
      if (id && to && isValidUrl(to)) {
        records.push({
          id: id.trim(),
          to: to.trim(),
          description: (description || '').trim()
        })
      }
    }

    return records
  }

  // Parse a single CSV line handling quotes and commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <ECULogo size="xl" className="mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            복음주의 학생연합 ECU
          </h1>

          <div className="mb-6">
            <div className="w-8 h-8 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading...
          </h2>
          <p className="text-gray-500 mb-6">
            링크를 확인하고 있습니다.
          </p>

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

  // Redirecting state
  if (status === 'redirecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <ECULogo size="xl" className="mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            복음주의 학생연합 ECU
          </h1>

          <div className="mb-6">
            <div className="w-8 h-8 mx-auto border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-500">
            목적지로 이동 중입니다.
          </p>
        </div>
      </div>
    )
  }

  // Not found state
  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <ECULogo size="lg" className="mx-auto" />
          </div>

          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            복음주의 학생연합 ECU
          </h1>

          <h2 className="text-6xl font-bold text-gray-300 mb-4">404</h2>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">페이지를 찾을 수 없습니다</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            찾으시는 단축 URL이 존재하지 않거나 삭제되었을 수 있습니다.<br />
            URL을 다시 확인해 주세요.
          </p>
          
          <div className="space-y-3">
            <a
              href="/"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              메인으로 이동
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              이전 페이지로
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <ECULogo size="lg" className="mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
          복음주의 학생연합 ECU
        </h1>

        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">문제가 발생했습니다</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {errorMessage}
        </p>
        
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            메인으로 이동
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}