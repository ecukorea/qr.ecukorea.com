import { Suspense } from 'react'
import SheetsDataProvider from './SheetsDataProvider'
import ClientHomePage from './ClientHomePage'

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Google Sheets 데이터를 불러오는 중...</p>
      </div>
    </div>}>
      <SheetsDataProvider>
        {(initialData) => <ClientHomePage initialSheetsData={initialData} />}
      </SheetsDataProvider>
    </Suspense>
  )
}