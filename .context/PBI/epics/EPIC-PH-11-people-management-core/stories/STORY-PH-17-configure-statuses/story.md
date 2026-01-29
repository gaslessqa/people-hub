# Configure System Statuses

**Jira Key:** PH-17
**Epic:** PH-11 (People Management Core)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As an** HR Admin
**I want to** configure the available system statuses
**So that** I can adapt it to our process

---

## Description

Implementar el modulo de configuracion de estados para HR Admin. Permite crear, editar y desactivar estados del sistema, personalizando el flujo de trabajo de la organizacion.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View all statuses

- **Given:** I am logged in as HR Admin
- **When:** I navigate to status configuration
- **Then:** I see all statuses grouped by type (candidate, employee, external)

### Scenario 2: Create new status

- **Given:** I am in status configuration
- **When:** I create a new status with name, label, color, and order
- **Then:** The status is available for use in the system

### Scenario 3: Edit existing status

- **Given:** I am in status configuration
- **When:** I change a status label or color
- **Then:** The changes apply to all people with that status

### Scenario 4: Cannot delete status in use

- **Given:** There are people with status "en_proceso"
- **When:** I try to delete that status
- **Then:** I see an error "Cannot delete status with X people assigned"

---

## Technical Notes

### Frontend

- Page: `/admin/statuses`
- Grouped by type (tabs or sections)
- Drag-drop for reordering
- Color picker for status color
- Badge preview

### Backend

- API: `GET/POST/PATCH/DELETE /api/admin/statuses`
- Validate uniqueness of status_value per type
- Check usage before delete
- RLS: hr_admin and super_admin only

### Database

- `status_definitions` table
- Fields: status_type, status_value, label, color, order, is_active

**Default Status Types:**

- Candidate: lead, aplicado, en_proceso, finalista, rechazado, contratado
- Employee: activo, en_prueba, baja_voluntaria, baja_involuntaria
- External: freelancer, contractor, ex_empleado

---

## Dependencies

### Blocked By

- PH-5 Epic (Authentication with roles)

### Blocks

- PH-16 (Change Status) - needs status definitions

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado
- [ ] Deployed to staging

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-11-people-management-core/epic.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-011)
