# Notifications (Email)

**Jira Key:** PH-27
**Status:** TO DO
**Priority:** MEDIUM
**Phase:** Communication (Sprint 5-6)

---

## Epic Description

Notificaciones basicas por email para mantener al equipo informado de eventos importantes.

**Business Value:**
Managers y recruiters reciben alertas de acciones pendientes sin tener que revisar el sistema constantemente.

---

## User Stories

1. **PH-39** - As a Manager, I want to receive email when I have new candidate to review
2. **PH-40** - As a Recruiter, I want to receive email when Manager leaves feedback
3. **PH-41** - As a user, I want to configure which notifications I receive

**NOTA:** Verificar IDs exactos en Jira (https://gaslessqa.atlassian.net/browse/PH)

---

## Scope

### In Scope

- Email cuando candidato llega a interviewing
- Email cuando se agrega feedback
- Preferencias de notificacion por usuario

### Out of Scope

- Notificaciones in-app
- Push notifications
- Digest semanal
- Slack/Teams integration

---

## Related Functional Requirements

- **FR-028:** Notificar Nuevo Candidato a Manager
- **FR-029:** Notificar Feedback a Recruiter
- **FR-030:** Configurar Preferencias de Notificacion

See: `.context/SRS/functional-specs.md`

---

## Dependencies

- EPIC PH-18 (Positions) - trigger de nuevo candidato
- EPIC PH-24 (Feedback) - trigger de nuevo feedback

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC-PH-007)
- **SRS:** `.context/SRS/functional-specs.md` (FR-028 to FR-030)
