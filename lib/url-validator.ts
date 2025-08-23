/**
 * URLValidator class for validating and normalizing URLs
 * Handles URL format validation and provides user-friendly error messages
 */
export class URLValidator {
  private static readonly VALID_PROTOCOLS = ['http:', 'https:'];
  private static readonly URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  /**
   * Validates if a URL is properly formatted
   * @param url - The URL string to validate
   * @returns boolean indicating if the URL is valid
   */
  public isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) {
      return false;
    }

    try {
      const urlObject = new URL(trimmedUrl);
      
      // Check if protocol is http or https
      if (!URLValidator.VALID_PROTOCOLS.includes(urlObject.protocol)) {
        return false;
      }

      // Additional regex validation for more comprehensive checking
      return URLValidator.URL_REGEX.test(trimmedUrl);
    } catch (error) {
      return false;
    }
  }

  /**
   * Normalizes a URL by ensuring it has a proper protocol
   * @param url - The URL string to normalize
   * @returns normalized URL string
   */
  public normalizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return url;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) {
      return trimmedUrl;
    }

    // If URL doesn't start with http:// or https://, add https://
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return `https://${trimmedUrl}`;
    }

    return trimmedUrl;
  }

  /**
   * Gets a user-friendly validation message for invalid URLs
   * @param url - The URL string that failed validation
   * @returns user-friendly error message
   */
  public getValidationMessage(url: string): string {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return 'Please enter a URL';
    }

    const trimmedUrl = url.trim();
    
    // Check if it's missing protocol
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return 'URL must start with http:// or https://';
    }

    try {
      const urlObject = new URL(trimmedUrl);
      
      // Check protocol first
      if (!URLValidator.VALID_PROTOCOLS.includes(urlObject.protocol)) {
        return 'URL must use http:// or https:// protocol';
      }

      // Check if hostname exists and is valid
      if (!urlObject.hostname || urlObject.hostname.length === 0) {
        return 'Please enter a valid domain name';
      }

      // If URL object creation succeeded but regex failed, it's likely a format issue
      if (!URLValidator.URL_REGEX.test(trimmedUrl)) {
        return 'Please enter a valid URL format';
      }

    } catch (error) {
      // For URLs that can't be parsed by URL constructor
      return 'Please enter a valid URL format';
    }

    // This should not be reached if validation is working correctly
    return 'Please enter a valid URL format';
  }

  /**
   * Validates and normalizes a URL in one step
   * @param url - The URL string to process
   * @returns object with validation result, normalized URL, and error message if invalid
   */
  public validateAndNormalize(url: string): {
    isValid: boolean;
    normalizedUrl: string;
    errorMessage?: string;
  } {
    const normalizedUrl = this.normalizeUrl(url);
    const isValid = this.isValidUrl(normalizedUrl);
    
    return {
      isValid,
      normalizedUrl,
      errorMessage: isValid ? undefined : this.getValidationMessage(url)
    };
  }
}