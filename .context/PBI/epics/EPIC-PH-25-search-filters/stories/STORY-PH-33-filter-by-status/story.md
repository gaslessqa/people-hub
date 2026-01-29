# Filter People by Current Status

**Jira Key:** PH-33
**Epic:** PH-25 (Search and Filters)
**Priority:** High
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** filter people by their current status
**So that** I can focus on candidates at specific stages of the recruitment pipeline and manage my workload efficiently

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Filter by single status

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I open the status filter dropdown
And I select "Interview Scheduled"
Then I should only see people with "Interview Scheduled" status
And the filter selection should be clearly visible
And the results count should update
```

### Scenario 2: Filter by multiple statuses

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I select multiple statuses from the filter
Then I should see people matching any of the selected statuses
And the filter should show the number of selected statuses
And I should be able to remove individual status selections
```

### Scenario 3: Clear status filter

```gherkin
Given I am logged in as a Recruiter
And I have an active status filter applied
When I click the "Clear" button on the filter
Then all people should be displayed regardless of status
And the filter dropdown should show no selections
```

### Scenario 4: Combine status filter with search

```gherkin
Given I am logged in as a Recruiter
And I have a status filter applied
When I also enter a search term
Then results should match both the status filter AND the search term
And clearing one should not affect the other
```

---

## Technical Notes

- Status options should be dynamically loaded from the `status_types` table
- Filter state should be preserved in URL query parameters for shareable links
- Implement multi-select dropdown component with checkboxes
- Show count of people per status in the dropdown when possible
- Filter should work client-side for small datasets, server-side for large
- Data-testid convention: `filter-status-dropdown`, `filter-status-option-{status}`, `filter-status-clear`, `filter-status-count`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-022)
