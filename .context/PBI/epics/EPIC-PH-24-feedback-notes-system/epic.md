# Feedback & Notes System

**Jira Key:** PH-24
**Status:** TO DO
**Priority:** HIGH
**Phase:** Core Features (Sprint 3-4)

---

## Epic Description

Sistema de notas y feedback estructurado por persona. Permite a recruiters agregar notas y a managers registrar feedback de entrevistas con ratings.

**Business Value:**
Centraliza toda la comunicacion sobre candidatos. El feedback de managers queda visible para recruiters, eliminando emails dispersos.

---

## User Stories

1. **PH-28** - As a Recruiter, I want to add notes to a person so that I record interactions
2. **PH-29** - As a Manager, I want to register interview feedback with rating so that Recruiter can see it
3. **PH-30** - As a Recruiter, I want to view all manager feedback in the candidate profile
4. **PH-31** - As any user, I want to view the activity timeline of a person ordered chronologically

**NOTA:** Verificar IDs exactos en Jira (https://gaslessqa.atlassian.net/browse/PH)

---

## Scope

### In Scope

- Agregar notas de texto a personas
- Feedback estructurado (tipo, rating, recomendacion, comentarios)
- Timeline de actividad unificado
- Notas privadas (solo creador)

### Out of Scope

- Adjuntar archivos a notas
- Templates de feedback
- @ mentions en notas

---

## Related Functional Requirements

- **FR-017:** Agregar Nota a Persona
- **FR-018:** Registrar Feedback de Entrevista
- **FR-019:** Ver Feedback de Candidato
- **FR-020:** Ver Timeline de Actividad

See: `.context/SRS/functional-specs.md`

---

## Dependencies

- EPIC PH-11 (People Management) - requiere personas
- EPIC PH-18 (Positions) - feedback vinculado a vacantes

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC-PH-004)
- **SRS:** `.context/SRS/functional-specs.md` (FR-017 to FR-020)
