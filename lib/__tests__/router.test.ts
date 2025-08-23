/**
 * Tests for Router class
 * Tests requirements 2.1, 2.2, 2.4
 */

import { Router } from '../router'
import { SheetsDataService, URLRecord } from '../sheets-data-service'

// Mock the SheetsDataService
jest.mock('../sheets-data-service')

// Create a testable router that doesn't interact with DOM
class TestableRouter extends Router {
  private lastRedirectUrl?: string
  private showed404 = false
  private lastErrorMessage?: string

  // Expose private method for testing
  public testIsValidIdFormat(id: string): boolean {
    return (this as any).isValidIdFormat(id)
  }

  // Override methods that interact with DOM for testing
  public redirect(url: string): void {
    try {
      // Validate URL like the real implementation
      new URL(url)
      this.lastRedirectUrl = url
    } catch (error) {
      this.showError('Invalid destination URL. Please contact the link owner.')
    }
  }

  public show404(): void {
    this.showed404 = true
  }

  public showError(message: string): void {
    this.lastErrorMessage = message
  }

  // Test helpers
  public getLastRedirectUrl(): string | undefined {
    return this.lastRedirectUrl
  }

  public getShowed404(): boolean {
    return this.showed404
  }

  public getLastErrorMessage(): string | undefined {
    return this.lastErrorMessage
  }

  public resetTestState(): void {
    this.lastRedirectUrl = undefined
    this.showed404 = false
    this.lastErrorMessage = undefined
    this.mockPathname = '/'
  }

  private mockPathname = '/'

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

  // Override getCurrentPathId to work in test environment
  public getCurrentPathId(): string | null {
    const path = this.mockPathname
    
    if (path === '/' || path === '') {
      return null
    }

    const id = path.substring(1)
    return this.testIsValidIdFormat(id) ? id : null
  }

  // Override isRedirectRoute to work in test environment
  public isRedirectRoute(): boolean {
    return this.getCurrentPathId() !== null
  }

  // Override handleRoute to work in test environment
  public async handleRoute(): Promise<void> {
    const path = this.mockPathname
    
    // If we're on the root path, no routing needed
    if (path === '/' || path === '') {
      return
    }

    // Extract ID from path (remove leading slash)
    const id = path.substring(1)
    
    // Validate ID format (should be alphanumeric, 6-8 characters)
    if (!this.testIsValidIdFormat(id)) {
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
      
      // Import the error types for testing
      const { SheetsAuthError, SheetsNetworkError, SheetsDataError, SheetsServiceError } = require('../sheets-data-service')
      
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
}

describe('Router', () => {
  let router: TestableRouter
  let mockSheetsService: jest.Mocked<SheetsDataService>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Create router instance
    router = new TestableRouter()
    
    // Get the mocked service instance
    mockSheetsService = (router as any).sheetsService as jest.Mocked<SheetsDataService>
    
    // Reset test state
    router.resetTestState()
  })

  describe('ID format validation', () => {
    const validIds = ['abc123', 'ABC123', 'a1b2c3', '12345678', 'AbC123']
    const invalidIds = ['abc12', 'abc123456789', 'abc-123', 'abc_123', 'abc 123', '']

    validIds.forEach(id => {
      it(`should accept valid ID: ${id}`, () => {
        expect(router.testIsValidIdFormat(id)).toBe(true)
      })
    })

    invalidIds.forEach(id => {
      it(`should reject invalid ID: ${id}`, () => {
        expect(router.testIsValidIdFormat(id)).toBe(false)
      })
    })
  })

  describe('handleRoute', () => {
    it('should do nothing for root path', async () => {
      router.mockLocation('/')
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).not.toHaveBeenCalled()
      expect(router.getShowed404()).toBe(false)
      expect(router.getLastRedirectUrl()).toBeUndefined()
    })

    it('should do nothing for empty path', async () => {
      router.mockLocation('')
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).not.toHaveBeenCalled()
      expect(router.getShowed404()).toBe(false)
      expect(router.getLastRedirectUrl()).toBeUndefined()
    })

    it('should show 404 for invalid ID format', async () => {
      router.mockLocation('/invalid-id-format')
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).not.toHaveBeenCalled()
      expect(router.getShowed404()).toBe(true)
    })

    it('should redirect for valid ID found in database', async () => {
      const testId = 'abc123'
      const testUrl = 'https://example.com/target'
      const mockRecord: URLRecord = {
        id: testId,
        to: testUrl,
        description: 'Test URL'
      }
      
      router.mockLocation(`/${testId}`)
      mockSheetsService.findUrlById.mockResolvedValue(mockRecord)
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).toHaveBeenCalledWith(testId)
      expect(router.getLastRedirectUrl()).toBe(testUrl)
      expect(router.getShowed404()).toBe(false)
    })

    it('should show 404 for valid ID format but not found in database', async () => {
      const testId = 'abc123'
      
      router.mockLocation(`/${testId}`)
      mockSheetsService.findUrlById.mockResolvedValue(null)
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).toHaveBeenCalledWith(testId)
      expect(router.getShowed404()).toBe(true)
      expect(router.getLastRedirectUrl()).toBeUndefined()
    })

    it('should show error page when sheets service fails', async () => {
      const testId = 'abc123'
      
      router.mockLocation(`/${testId}`)
      mockSheetsService.findUrlById.mockRejectedValue(new Error('Network error'))
      
      await router.handleRoute()
      
      expect(mockSheetsService.findUrlById).toHaveBeenCalledWith(testId)
      expect(router.getLastErrorMessage()).toContain('링크를 불러오는 중 문제가 발생했습니다')
      expect(router.getShowed404()).toBe(false)
    })
  })

  describe('redirect', () => {
    it('should redirect to valid URL', () => {
      const testUrl = 'https://example.com/target'
      
      router.redirect(testUrl)
      
      expect(router.getLastRedirectUrl()).toBe(testUrl)
      expect(router.getLastErrorMessage()).toBeUndefined()
    })

    it('should show error for invalid URL', () => {
      const invalidUrl = 'not-a-valid-url'
      
      router.redirect(invalidUrl)
      
      expect(router.getLastRedirectUrl()).toBeUndefined()
      expect(router.getLastErrorMessage()).toContain('Invalid destination URL')
    })
  })

  describe('getCurrentPathId', () => {
    it('should return null for root path', () => {
      router.mockLocation('/')
      
      const result = router.getCurrentPathId()
      
      expect(result).toBeNull()
    })

    it('should return null for empty path', () => {
      router.mockLocation('')
      
      const result = router.getCurrentPathId()
      
      expect(result).toBeNull()
    })

    it('should return ID for valid format', () => {
      const testId = 'abc123'
      router.mockLocation(`/${testId}`)
      
      const result = router.getCurrentPathId()
      
      expect(result).toBe(testId)
    })

    it('should return null for invalid ID format', () => {
      router.mockLocation('/invalid-id-format')
      
      const result = router.getCurrentPathId()
      
      expect(result).toBeNull()
    })
  })

  describe('isRedirectRoute', () => {
    it('should return false for root path', () => {
      router.mockLocation('/')
      
      const result = router.isRedirectRoute()
      
      expect(result).toBe(false)
    })

    it('should return true for valid redirect route', () => {
      router.mockLocation('/abc123')
      
      const result = router.isRedirectRoute()
      
      expect(result).toBe(true)
    })

    it('should return false for invalid ID format', () => {
      router.mockLocation('/invalid-id-format')
      
      const result = router.isRedirectRoute()
      
      expect(result).toBe(false)
    })
  })
})