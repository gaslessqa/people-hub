# Register Interview Feedback with Rating

**Jira Key:** PH-29
**Epic:** PH-24 (Feedback and Notes System)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Manager
**I want to** register interview feedback with a rating from 1 to 5
**So that** I can provide structured evaluation of candidates after interviews and help the recruitment team make informed decisions

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Submit interview feedback with rating

```gherkin
Given I am logged in as a Manager
And I am viewing a candidate's profile assigned to my vacancy
When I click on "Add Interview Feedback"
And I select a rating from 1 to 5 stars
And I enter feedback comments in the text area
And I click "Submit Feedback"
Then the feedback should be saved with my rating and comments
And the feedback should be linked to my user account
And a timestamp should be recorded
And a success message should be displayed
```

### Scenario 2: Rating is required for feedback submission

```gherkin
Given I am logged in as a Manager
And I am adding interview feedback
When I enter comments but do not select a rating
And I try to submit the feedback
Then I should see a validation error indicating rating is required
And the feedback should not be saved
```

### Scenario 3: View submitted feedback

```gherkin
Given I am logged in as a Manager
And I have previously submitted feedback for a candidate
When I view that candidate's profile
Then I should see my feedback in the feedback section
And it should display my rating as stars
And it should display my comments
And it should show the date I submitted it
```

### Scenario 4: Multiple feedback entries per candidate

```gherkin
Given I am logged in as a Manager
And a candidate has received feedback from multiple managers
When I view the candidate's profile
Then I should see all feedback entries
And each entry should show the manager's name
And each entry should show their individual rating
And entries should be sorted by date (newest first)
```

---

## Technical Notes

- Feedback stored in `interview_feedback` table with `person_id`, `manager_id`, `rating` (1-5), `comments`, and timestamps
- Rating component should use a 5-star visual selector
- Comments field should support up to 2000 characters
- Only managers assigned to vacancies can give feedback on candidates for those vacancies
- Feedback cannot be edited after submission (immutable for audit purposes)
- Trigger notification to recruiter when feedback is submitted (see PH-40)
- Data-testid convention: `feedback-add-button`, `feedback-rating-{n}`, `feedback-comments-input`, `feedback-submit-button`, `feedback-item-{id}`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-018)
