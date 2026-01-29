# View My Vacancy Candidates (Manager)

**Jira Key:** PH-22
**Epic:** PH-18 (Position/Vacancy Management)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Manager
**I want to** view candidates assigned to my vacancies
**So that** I can follow up

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View my vacancies

- **Given:** I am logged in as Manager
- **When:** I navigate to my vacancies
- **Then:** I see only vacancies where I am the hiring manager

### Scenario 2: View candidates per vacancy

- **Given:** I have vacancies with candidates
- **When:** I select a vacancy
- **Then:** I see all candidates in that vacancy with their stage

### Scenario 3: See pending feedback

- **Given:** There are candidates needing feedback
- **When:** I view my vacancies
- **Then:** I see a badge indicating candidates awaiting my feedback

---

## Technical Notes

- Page: `/my-vacancies` (manager dashboard)
- RLS: filter by hiring_manager_id = current_user

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-015)
