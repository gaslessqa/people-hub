# Search People Before Creating (Duplicate Check)

**Jira Key:** PH-13
**Epic:** PH-11 (People Management Core)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Recruiter
**I want to** search existing people before creating a new one
**So that** I avoid duplicates

---

## Description

Implementar busqueda global de personas con soporte para nombre, email y telefono. La busqueda debe ser rapida (<500ms), soportar fuzzy matching para typos, y mostrar suficiente informacion para identificar a la persona.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Search by name finds matches

- **Given:** I am on the search page or create form
- **When:** I type a person's name
- **Then:** I see matching results with name, email (partial), status, and last activity

### Scenario 2: Search by email finds exact match

- **Given:** I am searching for a person
- **When:** I enter their email address
- **Then:** I see the exact match at the top of results

### Scenario 3: No results found

- **Given:** I am searching for a person
- **When:** I enter a name/email that doesn't exist
- **Then:** I see "No results found" with option to create new person

### Scenario 4: Fuzzy matching for typos

- **Given:** I am searching for "Maria Garcia"
- **When:** I type "Maria Garsia" (typo)
- **Then:** I still see "Maria Garcia" in results (fuzzy match)

---

## Technical Notes

### Frontend

- Global search bar (Cmd+K shortcut)
- Search results dropdown/modal
- Debounced input (300ms)
- Show: name, email (masked), status badge, last activity

### Backend

- API: `GET /api/people/search?q=...`
- Full-text search using pg_trgm
- Fuzzy matching with similarity threshold
- Results ordered by relevance

### Database

- Enable pg_trgm extension
- Create GIN indexes on name, email fields

---

## Dependencies

### Blocked By

- PH-12 (Create Person) - needs people to search

### Blocks

- All features that need to find people

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado
- [ ] Performance < 500ms
- [ ] Deployed to staging

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-PH-11-people-management-core/epic.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-007)
