# Close Vacancy (Filled or Cancelled)

**Jira Key:** PH-23
**Epic:** PH-18 (Position/Vacancy Management)
**Priority:** High
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** close a vacancy (filled or cancelled)
**So that** I update metrics

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Close as filled

- **Given:** I have a vacancy with a hired candidate
- **When:** I close the vacancy as "filled" and select the hired person
- **Then:** The vacancy is closed and the person is marked as hired

### Scenario 2: Close as cancelled

- **Given:** I have an open vacancy
- **When:** I close the vacancy as "cancelled" with a reason
- **Then:** The vacancy is closed

### Scenario 3: Put on hold

- **Given:** I have an open vacancy
- **When:** I change status to "on hold"
- **Then:** The vacancy is paused but not closed

---

## Technical Notes

- API: `PATCH /api/positions/:id/close`
- Close reasons: filled, cancelled, on_hold
- Update metrics on close

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-016)
