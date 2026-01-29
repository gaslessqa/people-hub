# Configure Notification Preferences

**Jira Key:** PH-41
**Epic:** PH-27 (Notifications and Email)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** User (Recruiter, Manager, or HR Admin)
**I want to** configure my notification preferences
**So that** I can control which notifications I receive and through which channels, avoiding information overload

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Access notification settings

```gherkin
Given I am logged in as any user role
When I navigate to my profile or settings page
Then I should see a "Notification Preferences" section
And I should be able to expand it to see all options
```

### Scenario 2: Configure email notification types

```gherkin
Given I am in the notification preferences section
Then I should see toggles for each notification type:
  | Notification Type              | Default |
  | New Candidate Assigned         | On      |
  | Interview Feedback Received    | On      |
  | Status Change Updates          | On      |
  | Weekly Summary Report          | On      |
  | System Announcements           | On      |
And I should be able to toggle each on or off
```

### Scenario 3: Configure notification channels

```gherkin
Given I am in the notification preferences section
When I view channel options
Then I should see options for:
  | Channel        | Available |
  | Email          | Yes       |
  | In-App         | Yes       |
And I should be able to set preferences per notification type
```

### Scenario 4: Save preferences successfully

```gherkin
Given I have modified my notification preferences
When I click "Save Preferences"
Then my preferences should be saved
And I should see a confirmation message
And subsequent notifications should respect my preferences
```

---

## Technical Notes

- Store preferences in `user_preferences` or `notification_settings` table
- Default all notifications to ON for new users
- In-app notifications cannot be fully disabled (only email opt-out)
- Consider adding "Quiet Hours" feature for email timing
- Provide "Reset to Defaults" option
- Sync preferences across devices (stored in database, not local)
- Data-testid convention: `notification-settings`, `notification-toggle-{type}`, `notification-channel-{channel}`, `notification-save-button`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-030)
