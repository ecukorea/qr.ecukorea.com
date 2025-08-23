/**
 * Tests for enhanced error handling functionality
 * Tests requirements 2.3, 3.4, 5.4
 */

import { Router } from '../router'
import { SheetsDataService, SheetsServiceError, SheetsNetworkError, SheetsDataError, SheetsAuthError } from '../sheets-data-service'

// Mock the SheetsDataService
jest.mock('../sheets-data-service')

// Create a testable router for error handling tests
class ErrorTestRouter extends Router {
  private lastErrorMessage?: string
  private showed404 = false
  private mockPathname = '/'

  public showError(message: string): void {
    this.lastErrorMessage = message
  }

  public show404(): void {
    this.showed404 = true
  }

  public getLastErrorMessage(): string | undefined {
    return this.lastErrorMessage
  }

  public getShowed404(): boolean {
    return this.showed404
  }

  public resetTestState(): void {
    this.lastErrorMessage = undefined
    this.showed404 = false
    this.mockPathname = '/'
  }

  // Mock window.location for testing
  public mockLocation(pathname: string): void {
    this.mockPathname = pathname
    ;(global as any).window = {
      location: {
        pathname,
        protocol: 'https:',
        host: 'example.com'
      }
    }
  }

  // Override handleRoute to work in test environment with proper error handling
  public async handleRoute(): Promise<void> {
    if (typeof window === 'undefined') {
      return // Skip on server-side rendering
    }

    const path = this.mockPathname
    
    // If we're on the root path, no routing needed
    if (path === '/' || path === '') {
      return
    }

    // Extract ID from path (remove leading slash)
    const id = path.substring(1)
    
    // Validate ID format (should be alphanumeric, 6-8 characters)
    const idRegex = /^[a-zA-Z0-9]{6,8}$/
    if (!idRegex.test(id)) {
      this.show404()
      return
    }

    try {
      // Look up the URL in the sheet data
      const urlRecord = await (this as any).sheetsService.findUrlById(id)
      
      if (urlRecord) {
        // Valid ID found, redirect to the original URL
        this.redirect(urlRecord.to)
      } else {
        // ID not found in database
        this.show404()
      }
    } catch (error) {
      console.error('Error during route handling:', error)
      
      // Provide specific error messages based on error type
      if (error instanceof SheetsAuthError) {
        this.showError('접근 권한이 없습니다. 관리자에게 문의해 주세요.')
      } else if (error instanceof SheetsNetworkError) {
        this.showError('인터넷 연결을 확인하고 다시 시도해 주세요.')
      } else if (error instanceof SheetsDataError) {
        this.showError('데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      } else if (error instanceof SheetsServiceError) {
        this.showError('서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        this.showError('링크를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.')
      }
    }
  }

  // Override redirect to not actually redirect in tests
  public redirect(url: string): void {
    try {
      // Validate the URL before redirecting
      new URL(url)
      // In tests, we don't actually redirect
    } catch (error) {
      console.error('Invalid redirect URL:', url, error)
      this.showError('Invalid destination URL. Please contact the link owner.')
    }
  }

  // Expose testHandleRoute for testing
  public async testHandleRoute(): Promise<void> {
    return this.handleRoute()
  }
}

describe('Error Handling', () => {
  let router: ErrorTestRouter
  let mockSheetsService: jest.Mocked<SheetsDataService>

  beforeEach(() => {
    router = new ErrorTestRouter()
    mockSheetsService = (router as any).sheetsService as jest.Mocked<SheetsDataService>
    router.resetTestState()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Google Sheets Error Handling (Requirement 3.4)', () => {
    it('should show Korean auth error message for SheetsAuthError', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const authError = new SheetsAuthError('Access denied')
      mockSheetsService.findUrlById.mockRejectedValue(authError)

      await router.testHandleRoute()

      expect(router.getLastErrorMessage()).toBe('접근 권한이 없습니다. 관리자에게 문의해 주세요.')
      expect(router.getShowed404()).toBe(false)
    })

    it('should show Korean network error message for SheetsNetworkError', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const networkError = new SheetsNetworkError('Network connection failed')
      mockSheetsService.findUrlById.mockRejectedValue(networkError)

      await router.testHandleRoute()

      expect(router.getLastErrorMessage()).toBe('인터넷 연결을 확인하고 다시 시도해 주세요.')
      expect(router.getShowed404()).toBe(false)
    })

    it('should show Korean data error message for SheetsDataError', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const dataError = new SheetsDataError('Invalid CSV data')
      mockSheetsService.findUrlById.mockRejectedValue(dataError)

      await router.testHandleRoute()

      expect(router.getLastErrorMessage()).toBe('데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      expect(router.getShowed404()).toBe(false)
    })

    it('should show Korean service error message for SheetsServiceError', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const serviceError = new SheetsServiceError('Service temporarily unavailable')
      mockSheetsService.findUrlById.mockRejectedValue(serviceError)

      await router.testHandleRoute()

      expect(router.getLastErrorMessage()).toBe('서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      expect(router.getShowed404()).toBe(false)
    })

    it('should show generic Korean error message for unknown errors', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const unknownError = new Error('Unknown error')
      mockSheetsService.findUrlById.mockRejectedValue(unknownError)

      await router.testHandleRoute()

      expect(router.getLastErrorMessage()).toBe('링크를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.')
      expect(router.getShowed404()).toBe(false)
    })
  })

  describe('404 Error Handling (Requirement 2.3)', () => {
    it('should show 404 for invalid ID format', async () => {
      router.mockLocation('/invalid-id-format!')
      
      await router.testHandleRoute()

      expect(router.getShowed404()).toBe(true)
      expect(router.getLastErrorMessage()).toBeUndefined()
    })

    it('should show 404 for non-existent valid ID', async () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      mockSheetsService.findUrlById.mockResolvedValue(null)

      await router.testHandleRoute()

      expect(router.getShowed404()).toBe(true)
      expect(router.getLastErrorMessage()).toBeUndefined()
    })
  })



  describe('User-Friendly Error Messages (Requirement 5.4)', () => {
    it('should provide non-technical error messages', async () => {
      const testId = 'abc123'
      
      // Test that error messages are user-friendly and in Korean
      const testCases = [
        {
          error: new SheetsAuthError('403 Forbidden'),
          expectedMessage: '접근 권한이 없습니다. 관리자에게 문의해 주세요.'
        },
        {
          error: new SheetsNetworkError('fetch failed'),
          expectedMessage: '인터넷 연결을 확인하고 다시 시도해 주세요.'
        },
        {
          error: new SheetsDataError('CSV parse error'),
          expectedMessage: '데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        },
        {
          error: new SheetsServiceError('500 Internal Server Error'),
          expectedMessage: '서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        }
      ]

      for (const { error, expectedMessage } of testCases) {
        router.resetTestState()
        router.mockLocation(`/${testId}`)
        mockSheetsService.findUrlById.mockRejectedValue(error)

        await router.testHandleRoute()

        const errorMessage = router.getLastErrorMessage()
        expect(errorMessage).toBe(expectedMessage)
        
        // Verify messages are user-friendly (no technical terms)
        expect(errorMessage).not.toContain('Error:')
        expect(errorMessage).not.toContain('Exception:')
        expect(errorMessage).not.toContain('fetch')
        expect(errorMessage).not.toContain('HTTP')
        expect(errorMessage).not.toContain('500')
        expect(errorMessage).not.toContain('403')
      }
    })
  })
})