import RedirectClient from './RedirectClient'

// Generate static params for SSG - provide a sample param to satisfy export requirements
export async function generateStaticParams() {
  // Return a sample param to satisfy Next.js export requirements
  // All other routes will be handled client-side
  return [{ id: 'example' }]
}

interface RedirectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const id = (await params).id
  return <RedirectClient id={id} />
}