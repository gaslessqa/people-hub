# View Complete Person Profile with History

**Jira Key:** PH-14
**Epic:** PH-11 (People Management Core)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Recruiter
**I want to** view the complete profile of a person with all their history
**So that** I have full context

---

## Description

Implementar la pagina de perfil de persona que muestra toda la informacion: datos basicos, estado actual, vacantes asignadas, timeline de actividad (notas, feedback, cambios de estado).

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View basic profile information

- **Given:** I navigate to a person's profile
- **When:** The page loads
- **Then:** I see all their basic info (name, email, phone, company, position, etc.)

### Scenario 2: View current status

- **Given:** I am on a person's profile
- **When:** I look at the status section
- **Then:** I see their current status with badge/color and since date

### Scenario 3: View activity timeline

- **Given:** I am on a person's profile
- **When:** I scroll to the timeline section
- **Then:** I see all activities (notes, feedback, status changes) ordered by date

### Scenario 4: View assigned vacancies

- **Given:** The person is assigned to vacancies
- **When:** I look at the vacancies section
- **Then:** I see all vacancies they're assigned to with their stage in each

---

## Technical Notes

### Frontend

- Page: `/people/[id]`
- Sections: Header (name, status), Details, Vacancies, Timeline
- Tabs or accordion for organization
- Infinite scroll for timeline

### Backend

- API: `GET /api/people/:id`
- Include: statuses, positions, timeline (paginated)
- RLS: filter based on user role

### Database

- Join: people, person_statuses, person_positions, activity_log, feedback

---

## Dependencies

### Blocked By

- PH-12 (Create Person)

### Blocks

- PH-15 (Edit) - needs profile page
- PH-16 (Change Status) - needs profile page

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
- **SRS:** `.context/SRS/functional-specs.md` (FR-008)
