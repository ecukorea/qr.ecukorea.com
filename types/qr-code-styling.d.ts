declare module 'qr-code-styling' {
  interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    data?: string;
    image?: string;
    margin?: number;
    qrOptions?: {
      typeNumber?: number;
      mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    };
    imageOptions?: {
      hideBackgroundDots?: boolean;
      imageSize?: number;
      crossOrigin?: string;
      margin?: number;
    };
    dotsOptions?: {
      color?: string;
      gradient?: {
        type?: 'linear' | 'radial';
        rotation?: number;
        colorStops?: Array<{
          offset: number;
          color: string;
        }>;
      };
      type?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
    };
    cornersSquareOptions?: {
      color?: string;
      gradient?: {
        type?: 'linear' | 'radial';
        rotation?: number;
        colorStops?: Array<{
          offset: number;
          color: string;
        }>;
      };
      type?: 'square' | 'dot' | 'extra-rounded';
    };
    cornersDotOptions?: {
      color?: string;
      gradient?: {
        type?: 'linear' | 'radial';
        rotation?: number;
        colorStops?: Array<{
          offset: number;
          color: string;
        }>;
      };
      type?: 'square' | 'dot';
    };
    backgroundOptions?: {
      color?: string;
      gradient?: {
        type?: 'linear' | 'radial';
        rotation?: number;
        colorStops?: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
  }

  class QRCodeStyling {
    constructor(options?: QRCodeStylingOptions);
    getRawData(format?: 'png' | 'jpg' | 'jpeg' | 'svg' | 'webp'): Promise<ArrayBuffer>;
    update(options: Partial<QRCodeStylingOptions>): void;
    append(container: HTMLElement): void;
    download(downloadOptions?: { name?: string; extension?: string }): void;
  }

  export = QRCodeStyling;
}