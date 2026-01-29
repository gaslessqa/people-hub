# Search People by Name Email Phone

**Jira Key:** PH-32
**Epic:** PH-25 (Search and Filters)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** search for people by name, email, or phone number
**So that** I can quickly find specific candidates or contacts in the system without manually browsing through lists

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Search by full name

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I enter a person's full name in the search box
And I press Enter or click the search button
Then I should see results matching that name
And the search should match first name, last name, or both
And results should be displayed in relevance order
```

### Scenario 2: Search by email address

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I enter an email address in the search box
And I execute the search
Then I should see the person with that email address
And partial email matches should also be included
```

### Scenario 3: Search by phone number

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I enter a phone number in the search box
And I execute the search
Then I should see people with matching phone numbers
And the search should ignore formatting differences (spaces, dashes, parentheses)
```

### Scenario 4: No results found

```gherkin
Given I am logged in as a Recruiter
And I am on the people list page
When I search for a term that doesn't match any person
Then I should see an empty state message
And the message should suggest checking the spelling
And an option to clear search should be visible
```

---

## Technical Notes

- Implement full-text search using PostgreSQL `tsvector` or Supabase search functionality
- Search should be case-insensitive
- Debounce search input (300ms) to avoid excessive API calls
- Phone number search should normalize input (remove non-digit characters) before matching
- Consider implementing search highlighting in results
- Minimum 2 characters required to trigger search
- Data-testid convention: `search-input`, `search-button`, `search-clear-button`, `search-results-count`, `search-no-results`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-021)
