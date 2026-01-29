# Search & Filters

**Jira Key:** PH-25
**Status:** TO DO
**Priority:** HIGH
**Phase:** Core Features (Sprint 3-4)

---

## Epic Description

Busqueda avanzada y filtros para encontrar personas rapidamente. Clave para evitar duplicados y encontrar candidatos.

**Business Value:**
Tiempo para encontrar persona < 10 segundos. Previene contactar duplicados o personas incorrectas.

---

## User Stories

1. **PH-32** - As a Recruiter, I want to search people by name, email or phone so that I find them quickly
2. **PH-33** - As a Recruiter, I want to filter people by current status so that I see only relevant ones
3. **PH-34** - As a Recruiter, I want to filter people by assigned vacancy so that I see specific pipeline
4. **PH-35** - As a Manager, I want to filter candidates by my assigned vacancies so that I see only my team

**NOTA:** Verificar IDs exactos en Jira (https://gaslessqa.atlassian.net/browse/PH)

---

## Scope

### In Scope

- Busqueda global con Cmd+K
- Filtros por estado, vacante
- Fuzzy matching para typos
- Resultados paginados

### Out of Scope

- Busqueda por skills/tags
- Saved searches
- Export de resultados

---

## Related Functional Requirements

- **FR-021:** Busqueda Global
- **FR-022:** Filtrar por Estado
- **FR-023:** Filtrar por Vacante
- **FR-024:** Filtrar Mis Vacantes (Manager)

See: `.context/SRS/functional-specs.md`

---

## Dependencies

- EPIC PH-11 (People Management)
- EPIC PH-18 (Positions) - para filtro por vacante

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC-PH-005)
- **SRS:** `.context/SRS/functional-specs.md` (FR-021 to FR-024)
