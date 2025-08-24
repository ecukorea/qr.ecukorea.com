/**
 * Runtime Google Sheets data fetcher with caching
 * Fetches QR URL mappings with server-side caching
 */
import { unstable_cache } from 'next/cache'

export interface UrlMapping {
  id: string
  to: string
  description: string
  title?: string
}

/**
 * Fetches all URL mappings from Google Sheets (uncached)
 */
async function fetchSheetsDataUncached(): Promise<UrlMapping[]> {
  const SHEET_ID = '1WPO2Hs53oFtPExN3kZLFfJtsRclE1ZA3uat59elqXwg'
  const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
  
  try {
    console.log('📊 Fetching URL mappings from Google Sheets...')
    
    const response = await fetch(SHEETS_URL, {
      headers: {
        'User-Agent': 'ECU-QR-Generator/1.0'
      },
      // Add cache control for fetch
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    const mappings = parseCSV(csvText)
    
    console.log(`✅ Successfully fetched ${mappings.length} URL mappings`)
    return mappings
    
  } catch (error) {
    console.error('❌ Failed to fetch sheets data:', error)
    
    // Return empty array for build to continue
    console.log('⚠️  Continuing build with empty URL mappings')
    return []
  }
}

/**
 * Parse CSV data into URL mappings
 */
function parseCSV(csvText: string): UrlMapping[] {
  const lines = csvText.trim().split('\n')
  
  if (lines.length <= 1) {
    console.log('⚠️  No data rows found in CSV')
    return []
  }
  
  // Skip header row and process data rows
  const dataRows = lines.slice(1)
  const mappings: UrlMapping[] = []
  
  for (let i = 0; i < dataRows.length; i++) {
    try {
      const row = parseCSVLine(dataRows[i])
      
      // Expect at least 3 columns: id, to, description, and optional title
      if (row.length >= 3) {
        const [id, to, description, title] = row
        
        // Validate required fields
        if (id && to && isValidQRId(id) && isValidURL(to)) {
          mappings.push({
            id: id.trim(),
            to: to.trim(),
            description: description ? description.trim() : '',
            title: title ? title.trim() : undefined
          })
        } else {
          console.log(`⚠️  Skipping invalid row ${i + 2}: missing or invalid data`)
        }
      }
    } catch (error) {
      console.log(`⚠️  Skipping malformed row ${i + 2}:`, error)
    }
  }
  
  return mappings
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
      i++
    } else {
      // Regular character
      current += char
      i++
    }
  }
  
  // Add the last field
  result.push(current)
  
  return result
}

/**
 * Validate QR ID format (6-8 alphanumeric characters)
 */
function isValidQRId(id: string): boolean {
  return /^[a-zA-Z0-9]{6,8}$/.test(id)
}

/**
 * Basic URL validation
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Cached version of fetchSheetsData with 5-minute cache
 */
export const fetchSheetsData = unstable_cache(
  fetchSheetsDataUncached,
  ['sheets-data'], // cache key
  { revalidate: 300 } // 5 minutes cache
)

/**
 * Get URL mapping by ID
 */
export function findMappingById(mappings: UrlMapping[], id: string): UrlMapping | null {
  return mappings.find(mapping => mapping.id === id) || null
}