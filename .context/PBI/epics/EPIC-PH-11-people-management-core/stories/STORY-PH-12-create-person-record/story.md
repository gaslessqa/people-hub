# Create New Person Record

**Jira Key:** PH-12
**Epic:** PH-11 (People Management Core)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Recruiter
**I want to** create a new person record
**So that** I can start tracking them

---

## Description

Implementar el formulario y flujo para crear nuevos registros de personas en People Hub. El formulario debe capturar datos basicos (nombre, email) y opcionales (telefono, linkedin, empresa actual, etc).

El sistema debe verificar si el email ya existe y mostrar warning antes de crear duplicados.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Create person with required fields

- **Given:** I am logged in as Recruiter
- **When:** I fill the form with first name, last name, and email
- **Then:** A new person record is created with status "lead"

### Scenario 2: Create person with all fields

- **Given:** I am logged in as Recruiter
- **When:** I fill all fields (name, email, phone, linkedin, company, position, location, source, notes)
- **Then:** The person is created with all data saved

### Scenario 3: Email already exists (warning)

- **Given:** I am creating a new person
- **When:** I enter an email that already exists in the system
- **Then:** I see a warning with link to existing profile, but can still create if I choose

### Scenario 4: Invalid email format

- **Given:** I am creating a new person
- **When:** I enter an invalid email format
- **Then:** I see validation error and cannot submit

---

## Technical Notes

### Frontend

- Page: `/people/new`
- Components: Multi-step or single form
- Fields: first_name, last_name, email (required), phone, linkedin_url, current_company, current_position, location, source, notes
- Real-time email duplicate check (debounced)

### Backend

- API: `POST /api/people`
- Validate required fields
- Check for existing email (return warning, not error)
- Create record in `people` table
- Create initial status in `person_statuses`
- Log creation in `activity_log`

### Database

- `people` table
- `person_statuses` table
- `activity_log` table

---

## Dependencies

### Blocked By

- PH-5 Epic (Authentication)

### Blocks

- PH-13 (Search) - needs people to search
- PH-14 (View Profile) - needs people to view

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-11-people-management-core/epic.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-006)
