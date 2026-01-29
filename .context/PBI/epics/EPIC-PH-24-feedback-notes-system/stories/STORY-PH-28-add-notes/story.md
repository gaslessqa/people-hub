# Add Notes to Person

**Jira Key:** PH-28
**Epic:** PH-24 (Feedback and Notes System)
**Priority:** High
**Story Points:** 3
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** add notes to a person's profile
**So that** I can track important information, observations, and context about candidates throughout the recruitment process

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add a new note to a person's profile

```gherkin
Given I am logged in as a Recruiter
And I am viewing a person's profile page
When I click on the "Add Note" button
And I enter note content in the text area
And I click "Save"
Then the note should be saved with the current timestamp
And my user name should be recorded as the author
And the note should appear in the notes section
```

### Scenario 2: View existing notes on a person's profile

```gherkin
Given I am logged in as a Recruiter
And I am viewing a person's profile with existing notes
When I navigate to the notes section
Then I should see all notes in reverse chronological order
And each note should display the author name
And each note should display the creation date and time
```

### Scenario 3: Validation for empty notes

```gherkin
Given I am logged in as a Recruiter
And I am adding a new note to a person's profile
When I try to save without entering any content
Then I should see a validation error message
And the note should not be saved
```

### Scenario 4: Edit own note within time limit

```gherkin
Given I am logged in as a Recruiter
And I have created a note within the last 24 hours
When I click the edit button on my note
And I modify the content
And I click "Save"
Then the note should be updated with the new content
And an "edited" indicator should be displayed
```

---

## Technical Notes

- Notes should be stored in the `person_notes` table with `person_id`, `author_id`, `content`, and timestamps
- Implement rich text editor for note content (basic formatting: bold, italic, lists)
- Notes are visible to all users with access to the person's profile
- Consider implementing @mentions for notifying other team members
- Maximum note length: 5000 characters
- Data-testid convention: `note-add-button`, `note-content-input`, `note-save-button`, `note-item-{id}`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-017)
