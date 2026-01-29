# Notify Recruiter of New Feedback

**Jira Key:** PH-40
**Epic:** PH-27 (Notifications and Email)
**Priority:** High
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** receive an email notification when a Manager submits feedback for a candidate
**So that** I can promptly review the feedback and take appropriate next steps in the hiring process

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Email sent when feedback is submitted

```gherkin
Given I am a Recruiter assigned to a candidate
When a Manager submits interview feedback for that candidate
Then I should receive an email notification
And the email should contain the candidate's name
And the email should contain the manager's name
And the email should show the rating given (X/5 stars)
And the email should include a link to view the full feedback
```

### Scenario 2: Email includes feedback summary

```gherkin
Given I receive a feedback notification email
When I open the email
Then I should see:
  | Information        | Included |
  | Candidate Name     | Yes      |
  | Position/Vacancy   | Yes      |
  | Manager Name       | Yes      |
  | Rating (stars)     | Yes      |
  | Feedback Preview   | Yes      |
  | View Details CTA   | Yes      |
And the feedback preview should be truncated if too long
```

### Scenario 3: Multiple recruiters notified if shared

```gherkin
Given a candidate has multiple recruiters assigned
When a Manager submits feedback
Then all assigned recruiters should receive the notification
And each email should be personalized to the recipient
```

### Scenario 4: Respect notification preferences

```gherkin
Given I am a Recruiter who has disabled feedback notifications
When a Manager submits feedback for my candidate
Then I should NOT receive an email notification
And an in-app notification should still be created
```

---

## Technical Notes

- Email triggered by insert into `interview_feedback` table
- Consider batching multiple feedback submissions (15-minute window)
- Include visual star rating in email (using images or Unicode stars)
- Track which recruiter(s) are responsible for the candidate
- Log all notification attempts for debugging
- Implement retry logic for failed email deliveries
- Data-testid convention: (backend/email - no UI testids, but track via logs)

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-029)
