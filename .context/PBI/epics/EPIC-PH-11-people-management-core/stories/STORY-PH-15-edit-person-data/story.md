# Edit Person Data

**Jira Key:** PH-15
**Epic:** PH-11 (People Management Core)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Recruiter
**I want to** edit a person's data
**So that** I keep information updated

---

## Description

Implementar la funcionalidad de edicion de datos de una persona. Los cambios deben ser validados, guardados, y registrados en el timeline para mantener trazabilidad.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Edit basic fields

- **Given:** I am on a person's profile
- **When:** I click edit and change their phone number
- **Then:** The change is saved and visible immediately

### Scenario 2: Edit with validation

- **Given:** I am editing a person
- **When:** I enter an invalid email format
- **Then:** I see validation error and cannot save

### Scenario 3: Changes are logged

- **Given:** I edit a person's data
- **When:** I save the changes
- **Then:** An entry is added to the timeline showing what changed

### Scenario 4: Concurrent edit protection

- **Given:** Another user is editing the same person
- **When:** I try to save my changes
- **Then:** I see a warning about conflicting changes

---

## Technical Notes

### Frontend

- Edit mode on profile page or modal
- Same form as create, pre-filled
- Show changed fields highlighted
- Optimistic updates with rollback on error

### Backend

- API: `PATCH /api/people/:id`
- Validate changed fields only
- Track changes for audit log
- Use updated_at for optimistic locking

### Database

- Update `people` table
- Insert into `activity_log` with diff

---

## Dependencies

### Blocked By

- PH-14 (View Profile)

### Blocks

- None directly

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
- **SRS:** `.context/SRS/functional-specs.md` (FR-009)
