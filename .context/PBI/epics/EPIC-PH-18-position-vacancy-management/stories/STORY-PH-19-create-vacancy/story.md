# Create Vacancy with Description and Requirements

**Jira Key:** PH-19
**Epic:** PH-18 (Position/Vacancy Management)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** create a vacancy with description and requirements
**So that** I can publish the position

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Create vacancy with required fields

- **Given:** I am logged in as Recruiter
- **When:** I create a vacancy with title and department
- **Then:** The vacancy is created with status "open"

### Scenario 2: Create vacancy with all fields

- **Given:** I am logged in as Recruiter
- **When:** I fill all fields (title, department, description, requirements, location, type, salary, manager)
- **Then:** The vacancy is created with all data saved

### Scenario 3: Assign hiring manager

- **Given:** I am creating a vacancy
- **When:** I select a hiring manager from the list
- **Then:** That manager can see candidates for this vacancy

### Scenario 4: Set priority

- **Given:** I am creating a vacancy
- **When:** I set priority to "urgent"
- **Then:** The vacancy appears highlighted in the list

---

## Technical Notes

- Page: `/positions/new`
- API: `POST /api/positions`
- Table: `positions`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-012)
