/**
 * Client-side router for handling URL redirection
 * Implements requirements 2.1, 2.2, 2.4
 */

import { SheetsDataService, URLRecord, SheetsServiceError, SheetsNetworkError, SheetsDataError, SheetsAuthError } from './sheets-data-service'

export class Router {
  private sheetsService: SheetsDataService
  private readonly BASE_URL: string

  constructor() {
    this.sheetsService = new SheetsDataService()
    // Get the base URL from the current location
    this.BASE_URL = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : ''
  }

  /**
   * Handles the current route and performs appropriate action
   * Called on page load to check if we need to redirect
   */
  async handleRoute(): Promise<void> {
    if (typeof window === 'undefined') {
      return // Skip on server-side rendering
    }

    const path = window.location.pathname

    // If we're on the root path, no routing needed
    if (path === '/' || path === '') {
      return
    }

    // Extract ID from path (remove leading slash)
    const id = path.substring(1)

    // Validate ID format (should be alphanumeric, 6-8 characters)
    if (!this.isValidIdFormat(id)) {
      this.show404()
      return
    }

    try {
      // Look up the URL in the sheet data
      const urlRecord = await this.sheetsService.findUrlById(id)

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

  /**
   * Redirects the user to the specified URL
   * Uses HTTP 302 redirect (temporary redirect)
   * @param url The URL to redirect to
   */
  redirect(url: string): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Validate the URL before redirecting
      new URL(url)

      // Perform the redirect
      window.location.href = url
    } catch (error) {
      console.error('Invalid redirect URL:', url, error)
      this.showError('Invalid destination URL. Please contact the link owner.')
    }
  }

  /**
   * Shows a 404 error page for invalid or non-existent IDs
   */
  show404(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Replace the current page content with 404 message
    document.body.innerHTML = this.get404HTML()

    // Update the page title
    document.title = '404 - Page Not Found | QR URL Shortener'
  }

  /**
   * Shows a generic error page
   * @param message The error message to display
   */
  showError(message: string): void {
    if (typeof window === 'undefined') {
      return
    }

    // Replace the current page content with error message
    document.body.innerHTML = this.getErrorHTML(message)

    // Update the page title
    document.title = 'Error | QR URL Shortener'
  }

  /**
   * Validates if an ID has the correct format
   * @param id The ID to validate
   * @returns boolean True if the ID format is valid
   */
  private isValidIdFormat(id: string): boolean {
    // ID should be alphanumeric, 6-8 characters
    const idRegex = /^[a-zA-Z0-9]{6,8}$/
    return idRegex.test(id)
  }

  /**
   * Generates HTML for the 404 error page
   * @returns string HTML content for 404 page
   */
  private get404HTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - 페이지를 찾을 수 없습니다 | 복음주의 학생연합 ECU</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 3rem;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .org-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2rem;
          }
          .error-code {
            font-size: 4rem;
            font-weight: bold;
            color: #d1d5db;
            margin: 0;
            line-height: 1;
          }
          .error-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin: 1rem 0;
          }
          .error-message {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: background-color 0.2s ease;
          }
          .btn:hover {
            background: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${this.BASE_URL}/ecu-logo.png" alt="ECU Logo" />
          </div>
          <div class="org-name">복음주의 학생연합 ECU</div>
          <h1 class="error-code">404</h1>
          <h2 class="error-title">페이지를 찾을 수 없습니다</h2>
          <p class="error-message">
            찾으시는 단축 URL이 존재하지 않거나 삭제되었을 수 있습니다.<br>
            URL을 다시 확인해 주세요.
          </p>
          <a href="${this.BASE_URL}" class="btn">메인으로 이동</a>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generates HTML for a generic error page
   * @param message The error message to display
   * @returns string HTML content for error page
   */
  private getErrorHTML(message: string): string {
    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>오류 발생 | 복음주의 학생연합 ECU</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 3rem;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .org-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2rem;
          }
          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .error-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin: 1rem 0;
          }
          .error-message {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: background-color 0.2s ease;
            margin: 0 0.5rem;
          }
          .btn:hover {
            background: #2563eb;
          }
          .btn-secondary {
            background: #6b7280;
          }
          .btn-secondary:hover {
            background: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${this.BASE_URL}/ecu-logo.png" alt="ECU Logo" />
          </div>
          <div class="org-name">복음주의 학생연합 ECU</div>
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">문제가 발생했습니다</h2>
          <p class="error-message">${message}</p>
          <a href="${this.BASE_URL}" class="btn">홈으로 가기</a>
          <a href="javascript:location.reload()" class="btn btn-secondary">다시 시도</a>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Gets the current path ID if we're on a redirect route
   * @returns string | null The ID from the path, or null if on root
   */
  getCurrentPathId(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    const path = window.location.pathname

    if (path === '/' || path === '') {
      return null
    }

    const id = path.substring(1)
    return this.isValidIdFormat(id) ? id : null
  }

  /**
   * Checks if the current route is a redirect route (/{id})
   * @returns boolean True if current route is a redirect route
   */
  isRedirectRoute(): boolean {
    return this.getCurrentPathId() !== null
  }
}