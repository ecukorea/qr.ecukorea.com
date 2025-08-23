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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            position: relative;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            animation: float 3s ease-in-out infinite;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .org-name {
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 2rem;
          }
          .error-code {
            font-size: 6rem;
            font-weight: bold;
            background: linear-gradient(135deg, #ef4444, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
            line-height: 1;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .error-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
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
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          }
          .sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #fbbf24;
            border-radius: 50%;
            animation: sparkle 2s linear infinite;
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
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
          
          <!-- Sparkle effects -->
          <div class="sparkle" style="top: 20%; left: 15%; animation-delay: 0s;"></div>
          <div class="sparkle" style="top: 30%; right: 20%; animation-delay: 0.5s;"></div>
          <div class="sparkle" style="bottom: 25%; left: 25%; animation-delay: 1s;"></div>
          <div class="sparkle" style="bottom: 35%; right: 15%; animation-delay: 1.5s;"></div>
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            position: relative;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            animation: shake 0.5s ease-in-out infinite alternate;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            100% { transform: translateX(2px); }
          }
          .org-name {
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 2rem;
          }
          .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease-in-out infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .error-title {
            font-size: 1.8rem;
            font-weight: 600;
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 1rem 0;
          }
          .error-message {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.6;
            font-size: 1.1rem;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 0 0.5rem;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
          }
          .btn-secondary {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
          }
          .btn-secondary:hover {
            box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
          }
          .glitter {
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            border-radius: 50%;
            animation: glitter 3s linear infinite;
          }
          @keyframes glitter {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
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
          
          <!-- Glitter effects -->
          <div class="glitter" style="top: 15%; left: 10%; animation-delay: 0s;"></div>
          <div class="glitter" style="top: 25%; right: 15%; animation-delay: 1s;"></div>
          <div class="glitter" style="bottom: 20%; left: 20%; animation-delay: 2s;"></div>
          <div class="glitter" style="bottom: 30%; right: 10%; animation-delay: 0.5s;"></div>
          <div class="glitter" style="top: 50%; left: 5%; animation-delay: 1.5s;"></div>
          <div class="glitter" style="top: 60%; right: 5%; animation-delay: 2.5s;"></div>
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