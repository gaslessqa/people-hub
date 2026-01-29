# Dashboard with Main KPIs

**Jira Key:** PH-36
**Epic:** PH-26 (Dashboard and Reporting)
**Priority:** High
**Story Points:** 8
**Status:** To Do

---

## User Story

**As an** HR Admin
**I want to** view a dashboard with main recruitment KPIs
**So that** I can monitor the overall health of the hiring process and make data-driven decisions

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View main KPI cards on dashboard

```gherkin
Given I am logged in as an HR Admin
When I navigate to the dashboard page
Then I should see KPI cards displaying:
  | KPI                        | Description                    |
  | Open Vacancies             | Number of active vacancies     |
  | Active Candidates          | People in hiring pipeline      |
  | Interviews This Week       | Scheduled interviews           |
  | Offers Pending             | Offers awaiting response       |
  | Hires This Month           | Successful hires               |
And each KPI should show the current value
And each KPI should show trend compared to previous period
```

### Scenario 2: Filter dashboard by date range

```gherkin
Given I am logged in as an HR Admin
And I am viewing the dashboard
When I select a custom date range
Then all KPIs should recalculate for that period
And charts should update to reflect the selected dates
And the selected range should be clearly displayed
```

### Scenario 3: View pipeline funnel chart

```gherkin
Given I am logged in as an HR Admin
And I am viewing the dashboard
Then I should see a funnel chart showing:
  | Stage              | Count |
  | New Candidates     | X     |
  | Screening          | X     |
  | Interview          | X     |
  | Offer              | X     |
  | Hired              | X     |
And the funnel should be visually proportional
And I should be able to click a stage to see details
```

### Scenario 4: Dashboard auto-refresh

```gherkin
Given I am logged in as an HR Admin
And I am viewing the dashboard
When the page has been open for 5 minutes
Then the dashboard should auto-refresh with latest data
And a last updated timestamp should be visible
And I should be able to manually refresh at any time
```

---

## Technical Notes

- Use chart library (e.g., Recharts, Chart.js) for visualizations
- KPIs should be calculated via optimized SQL queries or materialized views
- Implement caching for dashboard data (TTL: 5 minutes)
- Consider using Supabase real-time for live updates
- Mobile-responsive layout with cards stacking vertically
- Export to PDF/CSV functionality for reports
- Data-testid convention: `dashboard-kpi-{name}`, `dashboard-funnel`, `dashboard-date-picker`, `dashboard-refresh-button`

---

## Related Documentation

- **SRS:** `.context/SRS/functional-specs.md` (FR-025)
