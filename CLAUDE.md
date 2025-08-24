# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Production builds
npm run build          # Standard Next.js build
npm run build:ssg      # Static Site Generation build (creates out/ directory)

# Testing
npm run test           # Run Jest tests
npm run test:watch     # Watch mode for tests

# Linting and quality
npm run lint           # ESLint checking

# Static deployment
npm run serve          # Serve built static files locally
npm run deploy         # Build for GitHub Pages deployment
./deploy.sh            # AWS S3/CloudFront deployment (with environment variables)
```

## Architecture Overview

This is a Next.js 15 application configured for Static Site Generation (SSG) that creates styled QR codes and handles URL shortening through Google Sheets integration.

### Key Components

**Main Application Flow:**
- `/` - QR code styler interface with advanced customization options
- `/[id]/` - Dynamic route for URL shortening redirects (SSG with client-side routing)
- Client-side routing handles short URLs without server dependencies

**Core Libraries:**
- `lib/enhanced-qr-generator.ts` - Advanced QR styling using qr-code-styling library
- `lib/performance-monitor.ts` - Performance tracking and cache effectiveness monitoring
- `lib/sheets-data-service.ts` - Google Sheets integration and error handling types
- `lib/url-validator.ts` - URL validation and normalization

### Deployment Architecture

**SSG Configuration:**
- `next.config.js` configured with `output: 'export'`, `unoptimized: true` images, `trailingSlash: true`
- Dynamic routes use `generateStaticParams()` with sample param for export compatibility
- Static files deployed to hosting providers (Vercel, Netlify, GitHub Pages, AWS S3/CloudFront)
- GitHub Pages deployment ready with `npm run deploy` command
- AWS deployment with `./deploy.sh` script (requires AWS CLI and environment variables)

**Client-Side Routing:**
- Short URLs (`/abc123`) are handled entirely in the browser via `app/[id]/page.tsx`
- Google Sheets lookup performed client-side for URL resolution
- Loading states and error handling built into components

### Testing Strategy

- Jest configured with Next.js integration
- Test files located in `lib/__tests__/` (streamlined to essential tests only)
- Coverage collection from `lib/**/*.{ts,tsx}` files
- Module path mapping: `@/` for root, `lib/` for lib directory

### Essential Test Files Remaining
- `enhanced-qr-generator.test.ts` - QR generation functionality
- `performance-monitor.test.ts` - Performance tracking
- `sheets-data-service.test.ts` & `.integration.test.ts` - Google Sheets integration
- `url-validator.test.ts` - URL validation

### Data Flow

1. **QR Generation**: User input → URL validation → QR styling options → Enhanced QR generator → Download
2. **URL Shortening**: Client visits `/shortcode` → SSG serves static page → Client-side lookup in Google Sheets → Redirect or 404

### Key Technical Decisions

- **SSG over SSR**: Eliminates server requirements, enables CDN distribution
- **Client-side routing**: Handles dynamic routes without server-side logic
- **Google Sheets as database**: Simple, accessible data source for URL mappings
- **qr-code-styling**: Advanced QR customization with dots, gradients, logos, and multiple presets

### Performance Considerations

- Client-side caching implemented (10-minute QR code cache, 5-minute fresh + 10-minute stale for Sheets data)
- Performance monitoring built into QR generation pipeline
- Bundle optimization through Next.js tree shaking and code splitting
- Static asset caching with CDN distribution