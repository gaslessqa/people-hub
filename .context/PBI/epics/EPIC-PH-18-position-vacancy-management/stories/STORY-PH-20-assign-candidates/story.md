# Assign Candidates to Vacancy

**Jira Key:** PH-20
**Epic:** PH-18 (Position/Vacancy Management)
**Priority:** High
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** assign candidates to a vacancy
**So that** I can track the pipeline

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Assign candidate to open vacancy

- **Given:** I have a person record and an open vacancy
- **When:** I assign the person to the vacancy
- **Then:** They appear in the vacancy pipeline at "applied" stage

### Scenario 2: Cannot assign to closed vacancy

- **Given:** The vacancy is closed
- **When:** I try to assign a candidate
- **Then:** I see an error "Cannot assign to closed vacancy"

### Scenario 3: Cannot assign same person twice

- **Given:** A person is already assigned to a vacancy
- **When:** I try to assign them again
- **Then:** I see an error "Already assigned to this vacancy"

---

## Technical Notes

- API: `POST /api/positions/:id/candidates`
- Table: `person_positions`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-013)
