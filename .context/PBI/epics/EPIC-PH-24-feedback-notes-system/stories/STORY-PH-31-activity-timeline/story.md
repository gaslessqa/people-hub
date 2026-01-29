# View Activity Timeline Chronologically

**Jira Key:** PH-31
**Epic:** PH-24 (Feedback and Notes System)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Recruiter or Manager
**I want to** view a chronological timeline of all activities for a person
**So that** I can understand the complete history of interactions, status changes, and events in one unified view

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View complete activity timeline

```gherkin
Given I am logged in as a Recruiter or Manager
And I am viewing a person's profile
When I navigate to the activity timeline section
Then I should see all activities in chronological order (newest first)
And activities should include status changes
And activities should include notes added
And activities should include feedback submitted
And activities should include vacancy assignments
And each activity should show date, time, and actor
```

### Scenario 2: Filter timeline by activity type

```gherkin
Given I am logged in as a Recruiter
And I am viewing a person's activity timeline
When I select a filter for "Status Changes" only
Then I should only see status change activities
And other activity types should be hidden
And I should be able to clear the filter to see all activities
```

### Scenario 3: Timeline with no activities

```gherkin
Given I am logged in as a Recruiter
And I am viewing a newly created person profile
When I navigate to the activity timeline
Then I should see the profile creation as the first activity
And a message indicating the timeline will populate as actions occur
```

### Scenario 4: Expand activity details

```gherkin
Given I am logged in as a Recruiter
And I am viewing a person's activity timeline
When I click on an activity item
Then I should see expanded details of that activity
And for notes: I should see the full note content
And for feedback: I should see rating and comments
And for status changes: I should see previous and new status
```

---

## Technical Notes

- Create a unified `activity_log` view that aggregates from multiple tables (notes, feedback, status_history, vacancy_assignments)
- Each activity type should have a distinct icon and color coding
- Implement virtual scrolling for performance with large activity histories
- Activities should be immutable (audit trail requirement)
- Consider adding relative timestamps ("2 hours ago") with full date on hover
- Data-testid convention: `activity-timeline`, `activity-item-{id}`, `activity-filter-{type}`, `activity-expand-button`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-020)
