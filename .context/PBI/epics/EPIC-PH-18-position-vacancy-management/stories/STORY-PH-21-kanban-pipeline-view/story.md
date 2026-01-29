# View Candidate Pipeline in Kanban View

**Jira Key:** PH-21
**Epic:** PH-18 (Position/Vacancy Management)
**Priority:** High
**Story Points:** 8
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** view the candidate pipeline by vacancy in kanban view
**So that** I have visibility of the process

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View kanban board

- **Given:** I navigate to a vacancy
- **When:** I open the pipeline view
- **Then:** I see candidates organized by stage (columns)

### Scenario 2: Drag and drop to change stage

- **Given:** I am viewing the kanban board
- **When:** I drag a candidate card to another column
- **Then:** Their stage is updated

### Scenario 3: View candidate details

- **Given:** I am viewing the kanban board
- **When:** I click on a candidate card
- **Then:** I see a quick preview with key info and link to full profile

---

## Technical Notes

- Page: `/positions/:id/pipeline`
- Use dnd-kit or similar for drag-drop
- Pipeline Stages: applied, screening, interviewing, finalist, offer, hired, rejected

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-014)
