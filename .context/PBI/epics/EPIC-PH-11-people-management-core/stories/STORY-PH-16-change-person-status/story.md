# Change Person Status

**Jira Key:** PH-16
**Epic:** PH-11 (People Management Core)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Recruiter
**I want to** change a person's status
**So that** I reflect their current situation

---

## Description

Implementar el cambio de estado de personas con validacion de transiciones. El sistema debe seguir una state machine que define que transiciones son validas (ej: lead -> aplicado -> en_proceso).

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Valid status transition

- **Given:** A person has status "lead"
- **When:** I change their status to "aplicado"
- **Then:** The status is updated and logged in timeline

### Scenario 2: Invalid status transition

- **Given:** A person has status "lead"
- **When:** I try to change directly to "contratado" (skipping stages)
- **Then:** I see an error showing valid transitions

### Scenario 3: Add comment with status change

- **Given:** I am changing a person's status
- **When:** I add a comment explaining the reason
- **Then:** Both status change and comment are logged

### Scenario 4: Status affects visibility for managers

- **Given:** A person is changed to "en_proceso"
- **When:** A Manager views their vacancies
- **Then:** They see this person in the appropriate stage

---

## Technical Notes

### Frontend

- Status change dropdown/modal
- Show only valid next statuses
- Optional comment field
- Confirmation for significant transitions

### Backend

- API: `POST /api/people/:id/status`
- State machine validation
- Create new record in `person_statuses`
- Log in `activity_log`
- Trigger notifications if configured

### Database

- `person_statuses` - new record (history preserved)
- `activity_log` - change logged

**Valid Transitions (Candidate):**

```
lead -> aplicado -> en_proceso -> finalista -> contratado
                                            -> rechazado
       aplicado -> rechazado
                -> retirado
```

---

## Dependencies

### Blocked By

- PH-14 (View Profile)
- PH-17 (Configure Statuses) - for custom statuses

### Blocks

- Pipeline views in EPIC 3

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
- **SRS:** `.context/SRS/functional-specs.md` (FR-010)
