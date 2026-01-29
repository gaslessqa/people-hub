# Filter People by Assigned Vacancy

**Jira Key:** PH-34
**Epic:** PH-25 (Search and Filters)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** filter people by the vacancy they are assigned to
**So that** I can view all candidates for a specific position and manage the hiring pipeline for that role

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Filter by specific vacancy

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I open the vacancy filter dropdown
And I select a specific vacancy (e.g., "Senior Developer")
Then I should only see people assigned to that vacancy
And the selected vacancy should be displayed in the filter
```

### Scenario 2: View unassigned candidates

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I select "Unassigned" from the vacancy filter
Then I should only see people not assigned to any vacancy
And these candidates can be assigned to vacancies
```

### Scenario 3: Search within filtered vacancy

```gherkin
Given I am logged in as a Recruiter
And I have filtered by a specific vacancy
When I also use the search function
Then results should show only people matching both criteria
And the vacancy filter should remain active
```

### Scenario 4: Filter shows vacancy with candidate count

```gherkin
Given I am logged in as a Recruiter
And I open the vacancy filter dropdown
Then each vacancy option should show the number of assigned candidates
And vacancies should be sorted by name or candidate count
And I should be able to search within the vacancy dropdown
```

---

## Technical Notes

- Vacancy list should be fetched from `vacancies` table with active vacancies first
- Include candidate count per vacancy using aggregation query
- Support typeahead search within the vacancy dropdown for long lists
- Consider grouping vacancies by department or status (open/closed)
- Filter state should persist in URL for bookmarking/sharing
- Data-testid convention: `filter-vacancy-dropdown`, `filter-vacancy-option-{id}`, `filter-vacancy-search`, `filter-vacancy-clear`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-023)
