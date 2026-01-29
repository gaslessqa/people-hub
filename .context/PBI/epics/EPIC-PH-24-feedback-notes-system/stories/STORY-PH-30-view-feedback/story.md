# View All Manager Feedback in Profile

**Jira Key:** PH-30
**Epic:** PH-24 (Feedback and Notes System)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** view all manager feedback in a person's profile
**So that** I can see consolidated interview evaluations and make informed decisions about candidate progression

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View all feedback on candidate profile

```gherkin
Given I am logged in as a Recruiter
And I am viewing a candidate's profile
And the candidate has received interview feedback from managers
When I navigate to the feedback section
Then I should see all feedback entries listed
And each entry should display the manager's name
And each entry should display the star rating (1-5)
And each entry should display the feedback comments
And each entry should display the submission date
```

### Scenario 2: View average rating calculation

```gherkin
Given I am logged in as a Recruiter
And I am viewing a candidate with multiple feedback entries
When I look at the feedback summary
Then I should see the average rating calculated from all feedback
And the average should be displayed as a decimal (e.g., 4.2)
And the total number of feedback entries should be shown
```

### Scenario 3: Empty feedback state

```gherkin
Given I am logged in as a Recruiter
And I am viewing a candidate with no interview feedback
When I navigate to the feedback section
Then I should see an empty state message
And the message should indicate no feedback has been received yet
```

### Scenario 4: Filter feedback by vacancy

```gherkin
Given I am logged in as a Recruiter
And I am viewing a candidate who applied to multiple vacancies
And the candidate has feedback for different vacancies
When I filter feedback by a specific vacancy
Then I should only see feedback related to that vacancy
And the average rating should recalculate for the filtered results
```

---

## Technical Notes

- Feedback section should be a dedicated tab or accordion in the person profile
- Calculate average rating on the frontend from all feedback entries
- Display ratings visually with filled/empty stars
- Include vacancy name/position in each feedback entry for context
- Implement pagination if candidate has more than 10 feedback entries
- Data-testid convention: `feedback-section`, `feedback-average-rating`, `feedback-count`, `feedback-filter-vacancy`, `feedback-list`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-019)
