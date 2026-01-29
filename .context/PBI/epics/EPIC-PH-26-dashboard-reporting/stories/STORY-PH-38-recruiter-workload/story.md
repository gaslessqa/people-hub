# View Current Workload (Recruiter)

**Jira Key:** PH-38
**Epic:** PH-26 (Dashboard and Reporting)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do

---

## User Story

**As a** Recruiter
**I want to** view my current workload summary
**So that** I can prioritize my tasks and manage my pipeline of candidates effectively

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View personal workload dashboard

```gherkin
Given I am logged in as a Recruiter
When I navigate to my dashboard or workload section
Then I should see a summary of my current assignments:
  | Metric                    | Value |
  | Active Candidates         | X     |
  | Interviews to Schedule    | X     |
  | Pending Reviews           | X     |
  | Offers in Progress        | X     |
And each metric should link to the relevant candidate list
```

### Scenario 2: View candidates by stage

```gherkin
Given I am logged in as a Recruiter
And I am viewing my workload
Then I should see my candidates grouped by pipeline stage
And I should see the count in each stage
And I should be able to expand each group to see names
```

### Scenario 3: View upcoming tasks and deadlines

```gherkin
Given I am logged in as a Recruiter
And I am viewing my workload
Then I should see a list of upcoming tasks:
  | Task Type           | Count | Due |
  | Interviews Today    | X     | -   |
  | Follow-ups Due      | X     | X   |
  | Feedback Pending    | X     | X   |
And tasks should be sorted by urgency
And overdue items should be highlighted
```

### Scenario 4: Compare workload over time

```gherkin
Given I am logged in as a Recruiter
And I am viewing my workload
When I look at the trend section
Then I should see how my workload has changed this week/month
And I should see completion rate (candidates processed)
```

---

## Technical Notes

- Workload data is specific to the logged-in recruiter
- Query should filter by `recruiter_id` or `assigned_to` field
- Consider using widgets that can be rearranged (dashboard customization)
- Implement quick actions from the workload view (e.g., schedule interview)
- Show workload health indicator (green/yellow/red based on volume)
- Data-testid convention: `workload-summary`, `workload-metric-{name}`, `workload-tasks-list`, `workload-stage-{stage}`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-027)
