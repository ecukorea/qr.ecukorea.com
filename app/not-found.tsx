'use client'

import Link from 'next/link'
import ECULogo from '../components/ECULogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* ECU Logo */}
        <div className="mb-8">
          <ECULogo size="xl" className="mx-auto" />
        </div>

        {/* Organization name */}
        <h1 className="text-3xl font-bold text-gray-700 mb-8">
          복음주의 학생연합 ECU
        </h1>
        
        {/* 404 Error */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-gray-300 mb-4">
            404
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            찾으시는 단축 URL이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            이전 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}