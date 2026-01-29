# Notify Manager of New Candidate

**Jira Key:** PH-39
**Epic:** PH-27 (Notifications and Email)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Manager
**I want to** receive an email notification when a new candidate is assigned to my vacancy
**So that** I can promptly review the candidate and schedule interviews without constantly checking the system

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Email sent when candidate assigned to vacancy

```gherkin
Given I am a Manager with a vacancy assigned to me
When a Recruiter assigns a new candidate to my vacancy
Then I should receive an email notification
And the email should contain the candidate's name
And the email should contain the vacancy/position title
And the email should include a link to view the candidate's profile
```

### Scenario 2: Email contains relevant candidate summary

```gherkin
Given I receive a new candidate notification email
When I open the email
Then I should see:
  | Information      | Included |
  | Candidate Name   | Yes      |
  | Email            | Yes      |
  | Phone            | Yes      |
  | Position Applied | Yes      |
  | Recruiter Name   | Yes      |
  | View Profile CTA | Yes      |
```

### Scenario 3: Multiple assignments send individual emails

```gherkin
Given I am a Manager with multiple vacancies
When candidates are assigned to different vacancies
Then I should receive separate emails for each assignment
And each email should clearly identify the vacancy
```

### Scenario 4: Respect notification preferences

```gherkin
Given I am a Manager who has disabled candidate notifications
When a new candidate is assigned to my vacancy
Then I should NOT receive an email notification
And an in-app notification should still be created
```

---

## Technical Notes

- Use Supabase Edge Functions or external email service (SendGrid, Resend)
- Email template should be HTML with plain text fallback
- Trigger email via database trigger or application event
- Implement email queue for reliability and rate limiting
- Track email delivery status (sent, delivered, failed)
- Include unsubscribe link as per email regulations
- Data-testid convention: (backend/email - no UI testids, but track via logs)

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-028)
