# View Average Time to Hire

**Jira Key:** PH-37
**Epic:** PH-26 (Dashboard and Reporting)
**Priority:** Medium
**Story Points:** 5
**Status:** To Do

---

## User Story

**As an** HR Admin
**I want to** view the average time to hire metrics
**So that** I can identify bottlenecks in the recruitment process and optimize hiring efficiency

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View overall time to hire

```gherkin
Given I am logged in as an HR Admin
And I am viewing the dashboard or reports section
When I look at the Time to Hire metric
Then I should see the average days from application to hire
And this should be calculated from all completed hires
And I should see the trend compared to the previous period
```

### Scenario 2: View time to hire by stage

```gherkin
Given I am logged in as an HR Admin
And I am viewing time to hire details
Then I should see average time spent in each stage:
  | Stage                    | Avg Days |
  | Application to Screening | X        |
  | Screening to Interview   | X        |
  | Interview to Offer       | X        |
  | Offer to Hire            | X        |
And I should identify which stage takes the longest
```

### Scenario 3: Filter time to hire by vacancy

```gherkin
Given I am logged in as an HR Admin
And I am viewing time to hire metrics
When I filter by a specific vacancy or department
Then the metrics should recalculate for that filter
And I should be able to compare different vacancies
```

### Scenario 4: Time to hire trend over time

```gherkin
Given I am logged in as an HR Admin
And I am viewing time to hire metrics
Then I should see a line chart showing time to hire trend
And the chart should cover the last 6-12 months
And I should be able to identify improvement or decline patterns
```

---

## Technical Notes

- Calculate time-to-hire from `status_history` table timestamps
- Define "hire date" as when status changes to "Hired"
- Define "application date" as person creation or first vacancy assignment
- Exclude withdrawn or rejected candidates from calculation
- Store calculated metrics in a reporting table for performance
- Allow drill-down from summary to individual candidates
- Data-testid convention: `metric-time-to-hire`, `metric-stage-breakdown`, `chart-time-trend`, `filter-metric-vacancy`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-026)
