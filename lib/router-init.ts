/**
 * Router initialization script for client-side routing
 * This should be loaded on every page to handle URL redirection
 */

import { Router } from './router'

/**
 * Initializes the router and handles routing on page load
 * Should be called when the DOM is ready
 */
export function initializeRouter(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleRouting)
  } else {
    handleRouting()
  }
}

/**
 * Handles the routing logic
 */
async function handleRouting(): Promise<void> {
  const router = new Router()
  
  try {
    await router.handleRoute()
  } catch (error) {
    console.error('Router initialization error:', error)
    // If there's an error during routing, show a generic error
    router.showError('An unexpected error occurred. Please try again later.')
  }
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  initializeRouter()
}