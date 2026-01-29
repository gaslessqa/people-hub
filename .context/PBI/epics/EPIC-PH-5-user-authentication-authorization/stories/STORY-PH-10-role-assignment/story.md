# Role Assignment by Super Admin

**Jira Key:** PH-10
**Epic:** PH-5 (User Authentication & Authorization)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Super Admin
**I want to** assign roles to users
**So that** I can define their permissions in the system

---

## Description

Implementar la funcionalidad de asignacion y cambio de roles para usuarios. El Super Admin debe poder cambiar el rol de cualquier usuario entre los roles disponibles: recruiter, manager, hr_admin, super_admin.

Los cambios de rol deben aplicarse inmediatamente y quedar registrados en un log de auditoria.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Assign role to user

- **Given:** I am logged in as Super Admin
- **When:** I change a user's role from "recruiter" to "hr_admin"
- **Then:** The user's permissions are updated immediately

### Scenario 2: Role change is logged

- **Given:** I am logged in as Super Admin
- **When:** I change a user's role
- **Then:** The change is recorded in the audit log with timestamp and who made the change

### Scenario 3: View role permissions

- **Given:** I am logged in as Super Admin
- **When:** I view the roles configuration
- **Then:** I see a matrix of what each role can do

### Scenario 4: Cannot remove last Super Admin

- **Given:** There is only one Super Admin in the system
- **When:** I try to change their role to something else
- **Then:** I see an error "Cannot remove the last Super Admin"

---

## Technical Notes

### Frontend

- Integrated in User Management page (`/admin/users`)
- Role selector dropdown in user edit
- Role permissions matrix view
- Confirmation dialog for role changes

### Backend

- API Route: `PATCH /api/admin/users/:id/role`
- Validation: cannot remove last super_admin
- Update `profiles.role`
- Create audit log entry

### Database

- `profiles.role` - User role (enum)
- `audit_log` - Track role changes (optional table)

**Roles enum:**

- `recruiter`
- `manager`
- `hr_admin`
- `super_admin`

### External Services

- None

---

## Dependencies

### Blocked By

- PH-9 (User Management) - shares admin UI

### Blocks

- None directly (but roles affect all features)

### Related Stories

- PH-9 (User Management)

---

## UI/UX Considerations

- Clear role labels with descriptions
- Visual feedback when role is changed
- Warning when changing to/from super_admin
- Permissions matrix for reference

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

**Test Cases Expected:** 6+ detailed test cases covering:

- Change role successfully
- Audit log created
- Cannot remove last super_admin
- Permissions applied immediately
- Permission checks (non-admin cannot change roles)
- Role change affects user access

---

## Implementation Plan

See: `implementation-plan.md` (se crea en Fase 6)

---

## Notes

**Role Permissions Matrix:**

| Action             | recruiter | manager           | hr_admin | super_admin |
| ------------------ | --------- | ----------------- | -------- | ----------- |
| Ver personas       | Si        | Solo sus vacantes | Si       | Si          |
| Crear personas     | Si        | No                | Si       | Si          |
| Editar personas    | Si        | No                | Si       | Si          |
| Ver feedback       | Si        | Si (propios)      | Si       | Si          |
| Dar feedback       | No        | Si                | Si       | Si          |
| Ver dashboard      | Basico    | No                | Completo | Completo    |
| Gestionar usuarios | No        | No                | No       | Si          |
| Configurar sistema | No        | No                | Si       | Si          |

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-5-user-authentication-authorization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md` (US 1.5)
- **SRS:** `.context/SRS/functional-specs.md` (FR-005)
