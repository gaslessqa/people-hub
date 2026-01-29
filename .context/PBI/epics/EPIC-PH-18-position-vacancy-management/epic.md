# Position/Vacancy Management

**Jira Key:** PH-18
**Status:** TO DO
**Priority:** HIGH
**Phase:** Core Features (Sprint 3-4)

---

## Epic Description

Gestion de vacantes y asignacion de candidatos al pipeline de reclutamiento. Permite crear posiciones abiertas, asignar candidatos, y visualizar el proceso en vista kanban.

**Business Value:**
Visibilidad completa del pipeline de reclutamiento. Los recruiters pueden trackear candidatos por vacante, y los managers pueden ver y dar seguimiento a los candidatos de sus posiciones.

---

## User Stories

1. **[PH-19](https://gaslessqa.atlassian.net/browse/PH-19)** - As a Recruiter, I want to create a vacancy with description and requirements
2. **[PH-20](https://gaslessqa.atlassian.net/browse/PH-20)** - As a Recruiter, I want to assign candidates to a vacancy so that I track the pipeline
3. **[PH-21](https://gaslessqa.atlassian.net/browse/PH-21)** - As a Recruiter, I want to view the candidate pipeline by vacancy in kanban view
4. **[PH-22](https://gaslessqa.atlassian.net/browse/PH-22)** - As a Manager, I want to view candidates assigned to my vacancies so that I follow up
5. **[PH-23](https://gaslessqa.atlassian.net/browse/PH-23)** - As a Recruiter, I want to close a vacancy (filled or cancelled) so that I update metrics

---

## Scope

### In Scope

- CRUD de vacantes
- Asignacion de candidatos a vacantes
- Vista kanban del pipeline
- Vista filtrada para managers
- Cierre de vacantes con razon
- Estadisticas basicas por vacante

### Out of Scope (Future)

- Publicacion automatica en job boards
- Templates de vacantes
- Workflow de aprobacion
- Scoring automatico de candidatos

---

## Acceptance Criteria (Epic Level)

1. Un Recruiter puede crear vacantes con toda la informacion necesaria
2. Un Recruiter puede asignar candidatos existentes a vacantes
3. La vista kanban muestra candidatos por etapa
4. Un Manager solo ve candidatos de sus vacantes asignadas
5. Las vacantes pueden cerrarse como filled o cancelled
6. Las metricas se actualizan al cerrar vacantes

---

## Related Functional Requirements

- **FR-012:** Crear Vacante
- **FR-013:** Asignar Candidato a Vacante
- **FR-014:** Ver Pipeline de Vacante (Kanban)
- **FR-015:** Ver Candidatos de Mis Vacantes (Manager)
- **FR-016:** Cerrar Vacante

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Data Model

**Main entity: `positions`**

- id, title, department, description, requirements
- location, employment_type, salary_min/max, salary_currency
- hiring_manager_id, recruiter_id
- status (open, closed, on_hold)
- close_reason, hired_person_id
- priority, created_at, closed_at

**Relation: `person_positions`**

- person_id, position_id, stage, assigned_at, updated_at

### Database Schema

**IMPORTANTE:** Usar Supabase MCP para schema real actualizado.

---

## Dependencies

### Internal Dependencies

- EPIC PH-11 (People Management) - requiere personas para asignar

### Blocks

- EPIC 4: Feedback System (feedback por vacante)
- EPIC 6: Dashboard (metricas de vacantes)

---

## Estimated Effort

- **Development:** 1 sprint
- **Testing:** 0.5 sprint
- **Total:** 1.5 sprints

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC-PH-003)
- **SRS:** `.context/SRS/functional-specs.md` (FR-012 to FR-016)
