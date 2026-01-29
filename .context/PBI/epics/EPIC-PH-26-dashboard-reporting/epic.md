# Dashboard & Reporting

**Jira Key:** PH-26
**Status:** TO DO
**Priority:** MEDIUM
**Phase:** Visibility (Sprint 5-6)

---

## Epic Description

Dashboards y metricas para supervision. KPIs de reclutamiento para HR Admin y carga de trabajo para Recruiters.

**Business Value:**
Visibilidad del estado de reclutamiento sin pedir reportes manuales. Identificar cuellos de botella.

---

## User Stories

1. **PH-36** - As an HR Admin, I want to view dashboard with main KPIs so that I have visibility
2. **PH-37** - As an HR Admin, I want to view average time to hire by vacancy
3. **PH-38** - As a Recruiter, I want to view my current workload so that I can prioritize

**NOTA:** Verificar IDs exactos en Jira (https://gaslessqa.atlassian.net/browse/PH)

---

## Scope

### In Scope

- Dashboard con KPIs principales
- Tiempo promedio de contratacion
- Carga de trabajo por recruiter
- Funnel de conversion

### Out of Scope

- Reportes exportables (PDF/Excel)
- Dashboards personalizables
- Comparativas year-over-year

---

## Related Functional Requirements

- **FR-025:** Dashboard de KPIs
- **FR-026:** Tiempo Promedio de Contratacion
- **FR-027:** Carga de Trabajo (Recruiter)

See: `.context/SRS/functional-specs.md`

---

## Dependencies

- EPIC PH-11 (People) - datos de personas
- EPIC PH-18 (Positions) - datos de vacantes

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC-PH-006)
- **SRS:** `.context/SRS/functional-specs.md` (FR-025 to FR-027)
