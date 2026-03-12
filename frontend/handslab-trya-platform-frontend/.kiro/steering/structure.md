# Project Structure

## Directory Organization

```
src/
├── app/                          # Next.js App Router (routes & pages)
│   ├── (authenticated)/          # Protected routes (require login)
│   │   ├── layout.tsx            # Authenticated layout with navbar
│   │   ├── page.tsx              # Root redirect by role
│   │   ├── paciente/             # Patient dashboard & features
│   │   ├── admin-rh/             # HR admin dashboard & features
│   │   ├── medico/               # Doctor dashboard & features
│   │   └── admin/                # System admin dashboard
│   ├── (unauthenticated)/        # Public routes (no auth required)
│   │   ├── login/                # Login page
│   │   ├── first-access/         # First-time password setup
│   │   └── password-reset/       # Password recovery flow
│   ├── api/                      # API routes (Next.js backend)
│   │   ├── auth/login/           # Authentication endpoint
│   │   └── health/               # Health check endpoint
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Global providers wrapper
│   └── globals.css               # Global styles
├── shared/                       # Shared code across all features
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API services & business logic
│   ├── context/                  # React Context providers
│   ├── types/                    # TypeScript type definitions
│   ├── theme/                    # Theme system & utilities
│   ├── utils/                    # Helper functions
│   └── config/                   # Configuration files
├── layout/                       # Layout components
└── middleware.ts                 # Route protection & tenant detection

public/                           # Static assets
├── logo.png                      # Default logo
├── logo_trigo.png                # Tenant-specific logos
└── [tenant]/                     # Tenant-specific assets

infra/terraform/                  # Infrastructure as Code
├── modules/                      # Terraform modules
│   ├── alb/                      # Application Load Balancer
│   ├── cloudfront/               # CDN configuration
│   ├── ecr/                      # Container registry
│   └── ecs/                      # Container orchestration
└── environments/                 # Environment configs (dev/staging/prod)
```

## Routing Conventions

### File-based Routing (Next.js App Router)
- `page.tsx` - Route component (required for each route)
- `layout.tsx` - Shared layout wrapper
- `[id]/` - Dynamic route segment
- `(group)/` - Route group (doesn't affect URL)

### Route Protection
- Routes in `(authenticated)/` require valid JWT token
- Routes in `(unauthenticated)/` are publicly accessible
- Middleware (`middleware.ts`) enforces authentication

## Code Organization Patterns

### Feature-based Structure
Each major feature (e.g., `paciente/triagem`, `admin-rh/beneficiarios`) contains:
```
feature/
├── page.tsx              # Main page component
├── components/           # Feature-specific components
├── services/             # API calls for this feature
├── types/                # TypeScript types
├── utils/                # Helper functions
└── README.md             # Feature documentation
```

### Shared vs Feature-specific
- **Use `shared/`** when code is used across multiple features/roles
- **Use feature folder** when code is specific to one page/module

## Component Patterns

### Client vs Server Components
- Add `'use client'` directive for interactive components
- Server components by default (no directive needed)
- Most components in this project are client components due to interactivity

### Component Structure
```typescript
'use client';

import { Box } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface ComponentProps {
  // Props definition
}

export function ComponentName({ props }: ComponentProps) {
  const theme = useThemeColors();
  
  return (
    <Box sx={{ bgcolor: theme.cardBackground }}>
      {/* Component JSX */}
    </Box>
  );
}
```

## Naming Conventions

- **Components**: PascalCase (`PatientCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase with `Service` suffix (`authService.ts`)
- **Types**: PascalCase for interfaces/types (`PatientData`)
- **Files**: Match component name or use kebab-case for utilities
- **Folders**: kebab-case for routes, camelCase for feature folders

## Import Aliases

- `@/` - Maps to `src/` directory
- Example: `import { api } from '@/shared/services/api'`

## Key Files

- `middleware.ts` - Route protection, tenant detection, token validation
- `src/app/providers.tsx` - Global context providers (Theme, Auth)
- `src/shared/services/api.ts` - Axios HTTP client with interceptors
- `src/shared/services/themeService.ts` - Multi-tenant theme configurations
- `src/shared/hooks/useThemeColors.ts` - Dynamic theme colors hook
