/**
 * Example usage of the Router class
 * This demonstrates how the router handles different scenarios
 */

import { Router } from './router'

export async function demonstrateRouter() {
  const router = new Router()

  console.log('=== Router Example Usage ===')

  // Example 1: Check if current route is a redirect route
  console.log('1. Checking current route type:')
  console.log('   Is redirect route:', router.isRedirectRoute())
  console.log('   Current path ID:', router.getCurrentPathId())

  // Example 2: Simulate different path scenarios
  console.log('\n2. Path validation examples:')
  const testPaths = [
    '/',
    '/abc123',
    '/ABC123',
    '/a1b2c3',
    '/12345678',
    '/invalid-id',
    '/abc12',
    '/abc123456789'
  ]

  testPaths.forEach(path => {
    // Simulate the path
    if (typeof window !== 'undefined') {
      const originalPath = window.location.pathname
      ;(window.location as any).pathname = path
      
      const isRedirect = router.isRedirectRoute()
      const pathId = router.getCurrentPathId()
      
      console.log(`   Path: ${path} -> Redirect: ${isRedirect}, ID: ${pathId}`)
      
      // Restore original path
      ;(window.location as any).pathname = originalPath
    }
  })

  // Example 3: Handle a sample route (this would normally be called on page load)
  console.log('\n3. Route handling example:')
  console.log('   Note: In a real application, handleRoute() would be called automatically')
  console.log('   when the page loads with a /{id} path.')

  return router
}

// Example of how to initialize the router in a real application
export function initializeRouterExample() {
  console.log('=== Router Initialization Example ===')
  
  if (typeof window !== 'undefined') {
    const router = new Router()
    
    // This would typically be called on page load
    router.handleRoute().catch(error => {
      console.error('Router error:', error)
    })
    
    console.log('Router initialized and handling current route')
    return router
  } else {
    console.log('Router can only be initialized in browser environment')
    return null
  }
}