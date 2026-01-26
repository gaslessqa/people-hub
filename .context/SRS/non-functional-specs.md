# Non-Functional Specifications - People Hub

## Overview

Este documento define los requerimientos no funcionales (NFRs) para el MVP de People Hub. Las metricas son cuantificables y realistas para un MVP.

---

## 1. Performance

### Page Load Performance

| Metrica | Target MVP | Medicion |
|---------|------------|----------|
| **LCP (Largest Contentful Paint)** | < 2.0s | Core Web Vitals |
| **FID (First Input Delay)** | < 100ms | Core Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Core Web Vitals |
| **TTI (Time to Interactive)** | < 3.0s | Lighthouse |
| **TTFB (Time to First Byte)** | < 500ms | Server response |

### API Response Time

| Endpoint Type | Target (p95) | Max Acceptable |
|---------------|--------------|----------------|
| **Read simple** (get person) | < 200ms | 500ms |
| **Read complex** (dashboard) | < 500ms | 1000ms |
| **Write simple** (create note) | < 300ms | 700ms |
| **Write complex** (create person) | < 500ms | 1000ms |
| **Search** (full-text) | < 500ms | 1000ms |

### Database Performance

| Operacion | Target | Condiciones |
|-----------|--------|-------------|
| **Query simple** (by ID) | < 50ms | Indice primario |
| **Query con joins** (perfil completo) | < 100ms | Hasta 5 tablas |
| **Query de busqueda** (full-text) | < 200ms | Hasta 10,000 registros |
| **Insert simple** | < 50ms | Una tabla |
| **Insert con relaciones** | < 150ms | Transaccion multi-tabla |

### Concurrent Users

| Escenario | Target MVP | Target v2 |
|-----------|------------|-----------|
| **Usuarios simultaneos** | 20 | 100 |
| **Requests por segundo** | 50 | 200 |
| **Conexiones DB simultaneas** | 10 | 50 |

---

## 2. Security

### Authentication

| Aspecto | Implementacion |
|---------|----------------|
| **Protocolo** | JWT via Supabase Auth |
| **Token expiration** | Access: 1 hora, Refresh: 7 dias |
| **Token storage** | HttpOnly cookies (refresh), Memory (access) |
| **Session management** | Server-side via Supabase |
| **MFA** | No en MVP (v2+) |

### Password Policy

| Requisito | Valor |
|-----------|-------|
| **Longitud minima** | 8 caracteres |
| **Complejidad** | 1 mayuscula + 1 minuscula + 1 numero |
| **Caracteres especiales** | Opcional (recomendado) |
| **Historial** | No en MVP (v2+) |
| **Expiracion** | No en MVP (v2+) |
| **Intentos fallidos** | Bloqueo temporal despues de 5 intentos (15 min) |

### Authorization (RBAC)

| Rol | Nivel de acceso |
|-----|-----------------|
| **recruiter** | CRUD personas, notas, vacantes propias |
| **manager** | Read candidatos de sus vacantes, Write feedback |
| **hr_admin** | Full read, configuracion de estados, reportes |
| **super_admin** | Full access, gestion de usuarios |

**Implementacion:**
- Row Level Security (RLS) en PostgreSQL via Supabase
- Middleware de validacion de permisos en API routes
- Claims de rol en JWT token

### Data Encryption

| Capa | Implementacion |
|------|----------------|
| **In transit** | HTTPS/TLS 1.3 (forzado via Vercel) |
| **At rest** | Encryption automatica de Supabase (AES-256) |
| **Sensitive fields** | No encryption adicional en MVP (datos no son PII critico) |
| **Backups** | Encrypted by Supabase |

### Input Validation

| Capa | Implementacion |
|------|----------------|
| **Client-side** | Zod schemas + React Hook Form |
| **Server-side** | Zod schemas (duplicados para seguridad) |
| **SQL Injection** | Prepared statements via Supabase client |
| **XSS** | React auto-escaping + CSP headers |

### OWASP Top 10 Mitigations

| Vulnerabilidad | Mitigacion |
|----------------|------------|
| **Injection** | Prepared statements, input validation |
| **Broken Auth** | Supabase Auth, token expiration, HTTPS |
| **Sensitive Data Exposure** | TLS, no datos sensibles en logs |
| **XXE** | N/A (no XML processing) |
| **Broken Access Control** | RLS, middleware auth, permisos por rol |
| **Security Misconfiguration** | Env variables, no secrets en codigo |
| **XSS** | React escaping, CSP headers |
| **Insecure Deserialization** | JSON only, schema validation |
| **Vulnerable Components** | Dependabot, npm audit |
| **Insufficient Logging** | Activity log, error tracking |

### Security Headers

```typescript
// next.config.js
headers: [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
]
```

---

## 3. Scalability

### Database Scalability

| Aspecto | Implementacion MVP | Escalabilidad futura |
|---------|-------------------|----------------------|
| **Connection pooling** | Supabase pooler (default) | PgBouncer dedicado |
| **Indexes** | Primarios + busqueda | Partial indexes, covering indexes |
| **Partitioning** | No requerido | Por fecha si >1M registros |
| **Read replicas** | No | Si para reportes |

### Application Scalability

| Aspecto | Implementacion MVP |
|---------|-------------------|
| **Stateless** | Si - no session state en servidor |
| **Horizontal scaling** | Vercel auto-scaling |
| **CDN** | Vercel Edge Network |
| **API routes** | Serverless functions |

### Caching Strategy

| Tipo | Implementacion | TTL |
|------|----------------|-----|
| **Static assets** | Vercel CDN | Immutable (hash) |
| **API responses** | `Cache-Control` headers | No cache para datos dinamicos |
| **ISR pages** | `revalidate` | 60s para dashboards |
| **Client-side** | React Query | staleTime: 30s |

### Limits & Quotas

| Recurso | Limite MVP | Razon |
|---------|------------|-------|
| **Personas en sistema** | 10,000 | Performance de busqueda |
| **Vacantes abiertas** | 100 | UI de seleccion |
| **Usuarios** | 50 | Single-tenant scope |
| **Feedback por persona** | 100 | Timeline performance |
| **Notas por persona** | 200 | Timeline performance |
| **File upload** | No en MVP | Complejidad |

---

## 4. Accessibility

### WCAG 2.1 Compliance

| Criterio | Target | Implementacion |
|----------|--------|----------------|
| **Level** | AA | Minimo requerido |
| **Keyboard navigation** | 100% funcionalidades | tabindex, focus management |
| **Screen reader** | Full support | ARIA labels, semantic HTML |
| **Color contrast** | >= 4.5:1 (text), >= 3:1 (large) | Palette validada |
| **Focus indicators** | Visibles en todos los elementos | Custom focus styles |
| **Text resize** | Hasta 200% sin perdida | Relative units (rem) |

### Keyboard Navigation

| Accion | Shortcut |
|--------|----------|
| **Busqueda global** | `Cmd/Ctrl + K` |
| **Navegacion principal** | `Tab` |
| **Cerrar modal** | `Escape` |
| **Confirmar accion** | `Enter` |
| **Menu desplegable** | `Arrow keys` |

### Screen Reader Support

| Elemento | Implementacion |
|----------|----------------|
| **Buttons** | `aria-label` si solo icono |
| **Forms** | `<label>` asociado, `aria-describedby` para errores |
| **Modals** | `role="dialog"`, `aria-modal="true"` |
| **Loading states** | `aria-live="polite"` |
| **Errors** | `role="alert"` |
| **Navigation** | `<nav>`, `aria-current="page"` |

### Color & Visual

| Aspecto | Especificacion |
|---------|----------------|
| **Paleta primaria** | No depende solo de color para informacion |
| **Status badges** | Color + icono + texto |
| **Error states** | Color rojo + icono + mensaje |
| **Focus ring** | 2px solid, contraste suficiente |
| **Reduced motion** | Respeta `prefers-reduced-motion` |

---

## 5. Browser Support

### Desktop Browsers

| Browser | Versiones | Soporte |
|---------|-----------|---------|
| **Chrome** | Ultimas 2 | Full |
| **Firefox** | Ultimas 2 | Full |
| **Safari** | Ultimas 2 | Full |
| **Edge** | Ultimas 2 | Full |

### Mobile Browsers

| Browser | Versiones | Soporte |
|---------|-----------|---------|
| **iOS Safari** | Ultimas 2 (iOS 15+) | Full |
| **Android Chrome** | Ultimas 2 | Full |
| **Samsung Internet** | Ultimas 2 | Basic |

### Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| **sm** | 640px | Mobile landscape |
| **md** | 768px | Tablet |
| **lg** | 1024px | Desktop |
| **xl** | 1280px | Wide desktop |

### Progressive Enhancement

| Feature | Fallback |
|---------|----------|
| **JavaScript disabled** | Mensaje de requerimiento |
| **CSS Grid** | Flexbox fallback |
| **Modern APIs** | Polyfills via Next.js |

---

## 6. Reliability

### Availability Target

| Metrica | Target MVP | Medicion |
|---------|------------|----------|
| **Uptime** | 99.5% | ~3.65 horas downtime/mes |
| **Planned maintenance** | < 1 hora/mes | Con aviso previo |
| **Unplanned downtime** | < 2 horas/mes | Incident response |

### Error Handling

| Tipo de Error | Handling |
|---------------|----------|
| **Validation errors** | Mensaje claro al usuario, no logging |
| **Auth errors** | Redirect a login, clear session |
| **API errors** | Toast con mensaje, retry option |
| **Network errors** | Offline indicator, auto-retry |
| **Server errors (500)** | Error page, log to monitoring |

### Error Rate Targets

| Metrica | Target |
|---------|--------|
| **Client-side errors** | < 1% de sesiones |
| **API error rate** | < 0.5% de requests |
| **Failed transactions** | < 0.1% |

### Disaster Recovery

| Aspecto | Implementacion MVP |
|---------|-------------------|
| **Database backups** | Diarios (Supabase automatic) |
| **Point-in-time recovery** | Ultimos 7 dias (Supabase) |
| **RTO (Recovery Time Objective)** | < 4 horas |
| **RPO (Recovery Point Objective)** | < 24 horas |

### Health Checks

| Check | Endpoint | Frecuencia |
|-------|----------|------------|
| **API health** | `/api/health` | 1 min |
| **Database connectivity** | Internal | 1 min |
| **Auth service** | Internal | 5 min |

---

## 7. Maintainability

### Code Quality

| Metrica | Target | Tool |
|---------|--------|------|
| **Test coverage** | > 80% | Jest/Vitest |
| **Linting errors** | 0 | ESLint |
| **Type errors** | 0 | TypeScript strict |
| **Code duplication** | < 5% | SonarQube (futuro) |

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Linting Rules

| Rule | Value |
|------|-------|
| **ESLint** | `next/core-web-vitals` + custom rules |
| **Prettier** | Configured, format on save |
| **Import order** | Enforced |
| **No console.log** | Error (except debug) |

### Documentation Requirements

| Documento | Ubicacion | Responsable |
|-----------|-----------|-------------|
| **README** | `/README.md` | Dev team |
| **API docs** | OpenAPI spec | Auto-generated |
| **Architecture** | `.context/SRS/` | Architect |
| **Deployment** | `/docs/deployment.md` | DevOps |
| **Onboarding** | `/docs/onboarding.md` | PM |

### Git Workflow

| Aspecto | Convencion |
|---------|------------|
| **Branch naming** | `feature/`, `fix/`, `docs/` |
| **Commit messages** | Conventional Commits |
| **PR template** | Checklist requerido |
| **Code review** | 1 approval minimo |
| **Main branch** | Protected, no direct push |

### Dependency Management

| Practica | Implementacion |
|----------|----------------|
| **Audit** | `npm audit` en CI |
| **Updates** | Dependabot weekly |
| **Lock file** | `package-lock.json` committed |
| **Peer deps** | Resueltas |

---

## 8. Observability

### Logging

| Tipo | Implementacion | Retencion |
|------|----------------|-----------|
| **Application logs** | Vercel Logs | 1 dia (free tier) |
| **API request logs** | Supabase logs | 7 dias |
| **Database logs** | Supabase logs | 7 dias |
| **Error logs** | (Sentry en v2) | 30 dias |

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info|warn|error",
  "message": "Description",
  "context": {
    "user_id": "uuid",
    "request_id": "uuid",
    "action": "string"
  }
}
```

### Metrics (MVP basico)

| Metrica | Fuente |
|---------|--------|
| **Page views** | Vercel Analytics |
| **API latency** | Vercel Function logs |
| **Error rate** | Vercel logs |
| **Database usage** | Supabase dashboard |

### Alerting (v2)

| Condicion | Accion |
|-----------|--------|
| **Error rate > 5%** | Notify team |
| **Latency p95 > 2s** | Notify team |
| **Database > 80%** | Notify team |
| **Auth failures > 10/min** | Investigate |

---

## 9. Internationalization (i18n)

### MVP Scope

| Aspecto | Implementacion |
|---------|----------------|
| **Idioma** | Espanol unico |
| **Fechas** | Formato ISO + locale display |
| **Moneda** | Configurable por vacante |
| **Timezone** | UTC storage, local display |

### Preparacion para i18n (v2)

| Practica | Implementacion |
|----------|----------------|
| **Strings externalizadas** | No hardcoded en componentes |
| **Estructura preparada** | `/locales/es.json` |
| **Date formatting** | `date-fns` con locale |
| **Number formatting** | `Intl.NumberFormat` |

---

## 10. Testing Strategy

### Test Types & Coverage

| Tipo | Coverage Target | Herramienta |
|------|-----------------|-------------|
| **Unit tests** | > 80% | Vitest |
| **Integration tests** | Flows criticos | Vitest + MSW |
| **E2E tests** | Happy paths | Playwright |
| **Visual regression** | No en MVP | (Chromatic v2) |

### Test Distribution

| Layer | Tests |
|-------|-------|
| **Components** | Unit + snapshot |
| **Hooks** | Unit |
| **Utils** | Unit |
| **API routes** | Integration |
| **User flows** | E2E |

### CI Pipeline Tests

```yaml
# Orden de ejecucion
1. Lint (ESLint + TypeScript)
2. Unit tests (paralelo)
3. Integration tests
4. Build
5. E2E tests (staging deploy)
```

---

## Resumen de Targets MVP

| Categoria | Metrica Clave | Target |
|-----------|---------------|--------|
| **Performance** | LCP | < 2s |
| **Performance** | API p95 | < 500ms |
| **Security** | OWASP compliance | Top 10 mitigated |
| **Availability** | Uptime | 99.5% |
| **Accessibility** | WCAG | Level AA |
| **Quality** | Test coverage | > 80% |
| **Errors** | API error rate | < 0.5% |

---

*Documento generado para: People Hub MVP*
*Tech Stack: Next.js 15, Supabase, Vercel*
