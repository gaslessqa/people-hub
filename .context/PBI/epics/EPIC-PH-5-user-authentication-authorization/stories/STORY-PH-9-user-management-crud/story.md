# User Management (CRUD) by Super Admin

**Jira Key:** PH-9
**Epic:** PH-5 (User Authentication & Authorization)
**Priority:** High
**Story Points:** 8
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Super Admin
**I want to** manage users (create, edit, deactivate)
**So that** I can control access to the platform

---

## Description

Implementar el modulo de administracion de usuarios para el rol Super Admin. Debe permitir crear nuevos usuarios, editar informacion de usuarios existentes, y desactivar cuentas. Los usuarios desactivados no pueden hacer login.

Este modulo es exclusivo para usuarios con rol `super_admin`.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Create new user

- **Given:** I am logged in as Super Admin
- **When:** I create a new user with email, name, and role
- **Then:** The user is created and receives a welcome email with temporary credentials

### Scenario 2: Edit user information

- **Given:** I am logged in as Super Admin
- **When:** I edit a user's name or other profile data
- **Then:** The changes are saved and visible immediately

### Scenario 3: Deactivate user

- **Given:** I am logged in as Super Admin
- **When:** I deactivate a user account
- **Then:** The user can no longer login and all their sessions are invalidated

### Scenario 4: Cannot deactivate own account

- **Given:** I am logged in as Super Admin
- **When:** I try to deactivate my own account
- **Then:** I see an error "Cannot deactivate your own account"

### Scenario 5: List all users

- **Given:** I am logged in as Super Admin
- **When:** I navigate to user management
- **Then:** I see a list of all users with their status, role, and last activity

---

## Technical Notes

### Frontend

- Page: `/admin/users`
- Components:
  - User list table with sorting/filtering
  - Create user modal/drawer
  - Edit user modal/drawer
  - Deactivate confirmation dialog
- Use shadcn/ui data table, dialog, form components

### Backend

- API Routes:
  - `GET /api/admin/users` - List users
  - `POST /api/admin/users` - Create user
  - `PATCH /api/admin/users/:id` - Update user
  - `DELETE /api/admin/users/:id` - Deactivate user
- Supabase Admin API for user creation
- RLS policies to restrict to super_admin

### Database

- `auth.users` - User accounts
- `profiles` - Extended profile with `is_active`, `role`

### External Services

- Supabase Auth Admin API
- Supabase Email (welcome email)

---

## Dependencies

### Blocked By

- PH-6 (Registration)
- PH-7 (Login)

### Blocks

- PH-10 (Role Assignment) - shares admin UI

### Related Stories

- PH-10 (Role Assignment)

---

## UI/UX Considerations

- Data table with search, sort, filter capabilities
- Clear status indicators (active/inactive)
- Role badges with colors
- Confirmation dialogs for destructive actions
- Toast notifications for success/error

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado (2 reviewers)
- [ ] Documentacion actualizada
- [ ] Deployed to staging
- [ ] QA testing passed
- [ ] Acceptance criteria validated
- [ ] No critical/high bugs open

---

## Testing Strategy

See: `test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- List users
- Create user with valid data
- Create user with existing email
- Edit user
- Deactivate user
- Cannot deactivate self
- Permission checks (non-admin cannot access)
- Session invalidation on deactivate

---

## Implementation Plan

See: `implementation-plan.md` (se crea en Fase 6)

---

## Notes

- Only super_admin can access this module
- Implement pagination for large user lists
- Consider adding user search functionality
- Log all admin actions for audit trail

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md` (US 1.4)
- **SRS:** `.context/SRS/functional-specs.md` (FR-004)
