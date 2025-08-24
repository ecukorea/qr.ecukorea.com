import { fetchSheetsData, findMappingById } from '../../lib/build-time-sheets'
import StaticRedirect from './StaticRedirect'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// Generate static params for all QR codes from Google Sheets
export async function generateStaticParams() {
  try {
    const mappings = await fetchSheetsData()
    console.log(`🔧 Generating static params for ${mappings.length} QR codes`)
    
    return mappings.map((mapping) => ({
      id: mapping.id
    }))
  } catch (error) {
    console.error('❌ Error generating static params:', error)
    // Return empty array to prevent build failure
    return []
  }
}

interface RedirectPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for each QR code page
export async function generateMetadata({ params }: RedirectPageProps): Promise<Metadata> {
  const id = (await params).id
  const mappings = await fetchSheetsData()
  const mapping = findMappingById(mappings, id)
  
  if (!mapping) {
    return {
      title: '복음주의 학생연합 ECU'
    }
  }
  
  const title = mapping.title || '복음주의 학생연합 ECU'
  
  // Build metadata object with optional description
  const metadata: Metadata = {
    title: title,
    openGraph: {
      title: title,
      siteName: '복음주의 학생연합 ECU',
      locale: 'ko_KR',
      type: 'website',
      url: mapping.to,
      images: [
        {
          url: 'https://ecukorea.com/og-logo.png',
          width: 1200,
          height: 630,
          alt: 'ECU Logo'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      images: ['https://ecukorea.com/og-logo.png']
    }
  }
  
  // Add description only if it exists
  if (mapping.description) {
    metadata.description = mapping.description
    if (metadata.openGraph) metadata.openGraph.description = mapping.description
    if (metadata.twitter) metadata.twitter.description = mapping.description
  }
  
  return metadata
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const id = (await params).id
  
  // Fetch the URL mapping at build time
  const mappings = await fetchSheetsData()
  const mapping = findMappingById(mappings, id)
  
  if (!mapping) {
    notFound()
  }
  
  return <StaticRedirect mapping={mapping} />
}