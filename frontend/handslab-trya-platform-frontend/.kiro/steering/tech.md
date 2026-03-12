# Tech Stack

## Core Framework
- **Next.js 16** with App Router (file-based routing)
- **React 19** with Server/Client Components
- **TypeScript 5** (strict mode enabled)
- **Node.js 23** (Alpine Linux in Docker)

## UI & Styling
- **Material-UI (MUI) 7** - Primary component library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Emotion** - CSS-in-JS styling (MUI dependency)

## State & Data
- **React Hooks** - Local state management (useState, useEffect, useContext)
- **Context API** - Global theme and auth state
- **Custom Hooks** - `useAuth`, `useTheme`, `useThemeColors`, `useChat`, `useTenant`

## API & Communication
- **Axios** - HTTP client (wrapped in `api.ts` service)
- **Socket.io Client** - Real-time chat communication
- **JWT** - Authentication tokens stored in HTTP-only cookies

## Development Tools
- **ESLint 9** - Code linting with Next.js config
- **TypeScript Compiler** - Type checking (build errors ignored in production)

## Deployment
- **Docker** - Multi-stage builds (deps → builder → runner)
- **AWS ECS** - Container orchestration
- **AWS ECR** - Docker image registry
- **AWS CloudFront** - CDN and caching
- **Bitbucket Pipelines** - CI/CD automation

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker
docker-compose up        # Run containerized app locally
docker build -t trya .   # Build Docker image

# Environment
cp .env.example .env.local  # Setup environment variables
```

## Build Configuration

- **Output**: Standalone (optimized for Docker)
- **Memory**: 4GB allocated for builds (`--max-old-space-size=4096`)
- **Cache**: No-store headers on authenticated routes
- **Port**: 3000 (default)
- **Path Aliases**: `@/*` maps to `src/*`

## Key Dependencies

```json
{
  "@mui/material": "^7.3.4",
  "@mui/icons-material": "^7.3.4",
  "next": "16.0.7",
  "react": "19.1.0",
  "socket.io-client": "^4.8.1",
  "react-joyride-react-19": "^2.9.2",
  "react-qr-code": "^2.0.18"
}
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint (required)
- `NODE_ENV` - Environment mode (development/production)
