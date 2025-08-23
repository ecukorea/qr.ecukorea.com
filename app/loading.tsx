import ECULogo from '../components/ECULogo'

export default function Loading() {
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

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          로딩 중...
        </h2>
        <p className="text-gray-500">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  )
}