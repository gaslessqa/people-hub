# Filter Candidates by My Vacancies (Manager)

**Jira Key:** PH-35
**Epic:** PH-25 (Search and Filters)
**Priority:** High
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Manager
**I want to** filter and view only candidates assigned to my vacancies
**So that** I can focus on the candidates I need to evaluate without seeing unrelated hiring pipelines

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Default view shows only my candidates

```gherkin
Given I am logged in as a Manager
When I navigate to the people/candidates page
Then I should only see candidates assigned to vacancies I manage
And I should not see candidates from other managers' vacancies
And a clear indicator should show I'm viewing "My Candidates"
```

### Scenario 2: Filter among my vacancies

```gherkin
Given I am logged in as a Manager
And I have multiple vacancies assigned to me
When I open the vacancy filter dropdown
Then I should only see my vacancies as options
And I can select one to filter candidates for that specific role
```

### Scenario 3: No candidates state

```gherkin
Given I am logged in as a Manager
And I have vacancies but no candidates assigned yet
When I view the candidates page
Then I should see an empty state message
And the message should explain that candidates will appear when assigned
```

### Scenario 4: Manager with no vacancies

```gherkin
Given I am logged in as a Manager
And I have no vacancies assigned to me
When I navigate to the candidates page
Then I should see an informative empty state
And the message should indicate I have no vacancies to review
And a contact option for HR/Admin should be suggested
```

---

## Technical Notes

- Apply RLS (Row Level Security) policy on backend to enforce manager-vacancy relationship
- Query should join `people` -> `vacancy_assignments` -> `vacancies` -> `vacancy_managers`
- Manager's vacancy list should be cached to avoid repeated queries
- Consider showing vacancy status (open/closed) in the filter
- This is a security requirement, not just UX - backend must enforce the restriction
- Data-testid convention: `filter-my-vacancies`, `my-candidates-indicator`, `vacancy-filter-manager`, `empty-state-no-candidates`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-024)
