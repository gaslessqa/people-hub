# User Authentication & Authorization

**Jira Key:** PH-5
**Status:** TO DO
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

---

## Epic Description

Sistema de autenticacion y control de acceso basado en roles para People Hub. Este es el fundamento de seguridad para toda la aplicacion.

El sistema implementara autenticacion via Supabase Auth con soporte para registro de usuarios, login/logout, recuperacion de contrasena y gestion completa de usuarios por parte del Super Admin.

**Business Value:**
Sin autenticacion no hay control de acceso ni proteccion de datos sensibles de RRHH. Este epic es bloqueante para todas las demas funcionalidades del sistema.

---

## User Stories

1. **[PH-6](https://gaslessqa.atlassian.net/browse/PH-6)** - As a user, I want to register with corporate email so that I can access the platform
2. **[PH-7](https://gaslessqa.atlassian.net/browse/PH-7)** - As a user, I want to login with my credentials so that I can access my account
3. **[PH-8](https://gaslessqa.atlassian.net/browse/PH-8)** - As a user, I want to recover my password if I forget it so that I don't get locked out
4. **[PH-9](https://gaslessqa.atlassian.net/browse/PH-9)** - As a Super Admin, I want to manage users (create, edit, deactivate) so that I can control access
5. **[PH-10](https://gaslessqa.atlassian.net/browse/PH-10)** - As a Super Admin, I want to assign roles to users so that I can define their permissions

---

## Scope

### In Scope

- Registro de usuarios con email (Supabase Auth)
- Login/logout con session management
- Recuperacion de contrasena via email
- CRUD de usuarios por Super Admin
- Sistema de roles: recruiter, manager, hr_admin, super_admin
- Permisos basados en roles (RLS en Supabase)
- Verificacion de email

### Out of Scope (Future)

- SSO con Google/Microsoft
- 2FA / MFA
- Audit log de acciones de seguridad
- Session timeout configurable
- IP whitelisting

---

## Acceptance Criteria (Epic Level)

1. Un usuario puede registrarse con email valido y recibir email de verificacion
2. Un usuario puede hacer login y obtener session valida
3. Un usuario puede recuperar su contrasena via email
4. Un Super Admin puede crear, editar y desactivar usuarios
5. Un Super Admin puede asignar/cambiar roles a usuarios
6. Los permisos se aplican correctamente segun el rol del usuario
7. Las sesiones expiran correctamente y se pueden invalidar

---

## Related Functional Requirements

- **FR-001:** Registro de Usuario con Email
- **FR-002:** Login con Credenciales
- **FR-003:** Recuperacion de Contrasena
- **FR-004:** Gestion de Usuarios (CRUD)
- **FR-005:** Asignacion de Roles

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Authentication

- Supabase Auth para gestion de usuarios y sesiones
- JWT tokens para autenticacion
- Refresh token rotation habilitado
- Email verification obligatorio

### Database Schema

**Tables:**

- `auth.users` (Supabase managed) - Usuarios del sistema
- `public.profiles` - Perfil extendido con rol y metadata
- `public.user_preferences` - Preferencias de notificaciones

**IMPORTANTE:** Usar Supabase MCP para schema real actualizado.

### Security Requirements

- Password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Rate limiting en endpoints de auth
- Tokens con expiracion corta (1h access, 7d refresh)
- RLS policies para proteger datos por rol

---

## Dependencies

### External Dependencies

- Supabase Auth service
- Supabase email service (para verificacion y reset)

### Internal Dependencies

- None (esta es la primera epica)

### Blocks

- EPIC 2: People Management (requiere usuarios autenticados)
- Todos los demas epics dependen de autenticacion

---

## Success Metrics

### Functional Metrics

- 100% de endpoints protegidos con autenticacion
- 0 vulnerabilidades de seguridad criticas
- < 500ms tiempo de respuesta en login

### Business Metrics

- Onboarding de nuevo usuario < 5 minutos
- Tasa de verificacion de email > 95%

---

## Risks & Mitigations

| Risk                   | Impact | Probability | Mitigation                                   |
| ---------------------- | ------ | ----------- | -------------------------------------------- |
| Supabase Auth downtime | High   | Low         | Implementar retry logic, comunicar status    |
| Emails en spam         | Medium | Medium      | Configurar SPF/DKIM, usar dominio verificado |
| Tokens robados         | High   | Low         | Refresh token rotation, session invalidation |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/feature-test-plan.md` (se crea en Fase 5)

### Test Coverage Requirements

- **Unit Tests:** Validaciones de input, logica de permisos
- **Integration Tests:** Supabase Auth flows, RLS policies
- **E2E Tests:** Registro, login, logout, password reset flows

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/feature-implementation-plan.md` (se crea en Fase 6)

### Recommended Story Order

1. PH-TBD - User registration (foundation)
2. PH-TBD - User login/logout (enables access)
3. PH-TBD - Password recovery (self-service)
4. PH-TBD - User management (admin control)
5. PH-TBD - Role assignment (permissions)

### Estimated Effort

- **Development:** 1 sprint (2 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 1.5 sprints

---

## Notes

- Supabase Auth ya esta configurado en el proyecto
- Usar componentes de shadcn/ui para formularios de auth
- Considerar dark mode desde el inicio en UI de login

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001 to FR-005)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
