import { fetchSheetsData } from '../lib/sheets-service'

interface SheetsData {
  id: string
  to: string
  description: string
  title?: string
}

interface SheetsDataProviderProps {
  children: (data: SheetsData[]) => React.ReactNode
}

export default async function SheetsDataProvider({ children }: SheetsDataProviderProps) {
  let sheetsData: SheetsData[] = []
  
  try {
    sheetsData = await fetchSheetsData()
  } catch (error) {
    console.error('Failed to fetch sheets data:', error)
    // Return empty array on error
  }
  
  return <>{children(sheetsData)}</>
}