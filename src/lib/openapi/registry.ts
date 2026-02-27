/**
 * OpenAPI Registry Configuration
 *
 * Central configuration for generating OpenAPI documentation
 * from Zod schemas. This is the source of truth for the API spec.
 */

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { APP_URLS } from '@/lib/urls';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

// Create the registry instance
export const registry = new OpenAPIRegistry();

// ============================================================================
// Security Schemes
// ============================================================================

// Cookie-based authentication (Supabase session)
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'sb-ylkwhejmcymlowcqgibn-auth-token',
  description: 'Supabase session cookie. Obtained automatically after login via the web app.',
});

// ============================================================================
// OpenAPI Document Generator
// ============================================================================

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'People Hub - API',
      version: '1.0.0',
      description: `
## Custom API Endpoints

This documentation covers the custom Next.js API endpoints for People Hub.

---

## Authentication

All endpoints (except \`/api/health\`) require a valid Supabase session.

### Cookie Auth (Browser)
Session cookies are sent automatically from the browser after login.

**Cookie name:** \`sb-ylkwhejmcymlowcqgibn-auth-token\`

### How to test
1. Login via the web app at [People Hub](${APP_URLS.production})
2. Open DevTools → Application → Cookies
3. Copy the \`sb-ylkwhejmcymlowcqgibn-auth-token\` value
4. Add it as a cookie header in your HTTP client

---

## Base URLs

| Environment | URL |
|------------|-----|
| Development | \`http://localhost:3000/api\` |
| Staging | \`${APP_URLS.staging}/api\` |
| Production | \`${APP_URLS.production}/api\` |

---

## Role-based Access

| Role | Access Level |
|------|-------------|
| \`recruiter\` | People, Positions, Notes, Feedback (view) |
| \`manager\` | + My Vacancies, Feedback (submit), Pipeline |
| \`hr_admin\` | + Status Definitions, User overview |
| \`super_admin\` | Full access including User Management |
      `.trim(),
      contact: {
        name: 'Development Team',
        url: 'https://github.com/gaslessqa/people-hub',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: `${APP_URLS.staging}/api`,
        description: 'Staging server',
      },
      {
        url: `${APP_URLS.production}/api`,
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'System', description: 'Health check and system endpoints' },
      { name: 'People', description: 'People/candidate management' },
      { name: 'Positions', description: 'Vacancy and position management' },
      { name: 'Admin - Users', description: 'User management (super_admin only)' },
      { name: 'Admin - Statuses', description: 'Status definitions (hr_admin+)' },
      { name: 'Profiles', description: 'Profile lookup' },
      { name: 'Settings', description: 'User notification preferences' },
    ],
  });
}

// Re-export z with OpenAPI extensions
export { z };
