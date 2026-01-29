# People Management (Core)

**Jira Key:** PH-11
**Status:** TO DO
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

---

## Epic Description

Gestion centralizada de personas con modelo unificado. Este es el core del producto People Hub - una persona = un registro.

El sistema permite crear, buscar, ver, editar y gestionar el estado de personas. Soporta el ciclo de vida completo: candidato -> empleado -> ex-empleado, manteniendo todo el historial en un solo registro.

**Business Value:**
Elimina el problema de contactos duplicados, perdida de contexto en transiciones, y datos dispersos en multiples herramientas. Fuente unica de verdad sobre cada persona.

---

## User Stories

1. **[PH-12](https://gaslessqa.atlassian.net/browse/PH-12)** - As a Recruiter, I want to create a new person record so that I can start tracking
2. **[PH-13](https://gaslessqa.atlassian.net/browse/PH-13)** - As a Recruiter, I want to search existing people before creating a new one so that I avoid duplicates
3. **[PH-14](https://gaslessqa.atlassian.net/browse/PH-14)** - As a Recruiter, I want to view the complete profile of a person with all their history
4. **[PH-15](https://gaslessqa.atlassian.net/browse/PH-15)** - As a Recruiter, I want to edit a person's data so that I keep information updated
5. **[PH-16](https://gaslessqa.atlassian.net/browse/PH-16)** - As a Recruiter, I want to change a person's status so that I reflect their current situation
6. **[PH-17](https://gaslessqa.atlassian.net/browse/PH-17)** - As an HR Admin, I want to configure available system statuses so that I adapt it to our process

---

## Scope

### In Scope

- Crear registros de personas con datos basicos
- Busqueda global por nombre, email, telefono
- Deteccion de duplicados antes de crear
- Vista de perfil completo con historial
- Edicion de datos de persona
- Cambio de estados con validacion de transiciones
- Configuracion de estados por HR Admin
- Timeline de actividad

### Out of Scope (Future)

- Import masivo de personas (CSV)
- Merge de registros duplicados
- Tags/etiquetas personalizadas
- Campos custom definidos por usuario
- API publica para integraciones

---

## Acceptance Criteria (Epic Level)

1. Un Recruiter puede crear una persona con datos basicos
2. El sistema advierte si el email ya existe antes de crear
3. Un Recruiter puede ver el perfil completo con todo el historial
4. Un Recruiter puede editar cualquier dato de una persona
5. Un Recruiter puede cambiar el estado siguiendo las transiciones validas
6. Un HR Admin puede configurar los estados disponibles
7. Todo cambio queda registrado en el timeline

---

## Related Functional Requirements

- **FR-006:** Crear Registro de Persona
- **FR-007:** Busqueda de Personas (Duplicate Check)
- **FR-008:** Ver Perfil Completo de Persona
- **FR-009:** Editar Datos de Persona
- **FR-010:** Cambiar Estado de Persona
- **FR-011:** Configurar Estados del Sistema

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Data Model

**Main entity: `people`**

- id (uuid)
- first_name, last_name
- email, phone
- linkedin_url
- current_company, current_position
- location, source
- created_by, created_at, updated_at

**Estados: `person_statuses`**

- person_id, status_type, status_value, since

**Configuracion: `status_definitions`**

- status_type, status_value, label, color, order, is_active

### Database Schema

**IMPORTANTE:** Usar Supabase MCP para schema real actualizado.

### Security Requirements

- RLS policies por rol
- Recruiter: full access
- Manager: solo personas de sus vacantes
- HR Admin: full access + config
- Super Admin: full access

---

## Dependencies

### External Dependencies

- Supabase Database
- Full-text search (pg_trgm extension)

### Internal Dependencies

- EPIC PH-5 (Authentication) - requiere usuarios autenticados

### Blocks

- EPIC 3: Position Management (asignar personas a vacantes)
- EPIC 4: Feedback System (agregar feedback a personas)
- EPIC 5: Search & Filters (busqueda avanzada)

---

## Success Metrics

### Functional Metrics

- Busqueda retorna resultados en < 500ms
- 0 duplicados creados cuando email ya existe
- 100% de cambios registrados en timeline

### Business Metrics

- Reduccion de duplicados: -80% vs proceso anterior
- Tiempo para encontrar persona: < 10 segundos

---

## Risks & Mitigations

| Risk                        | Impact | Probability | Mitigation                          |
| --------------------------- | ------ | ----------- | ----------------------------------- |
| Datos duplicados importados | High   | Medium      | Busqueda obligatoria antes de crear |
| Performance en busqueda     | Medium | Low         | Indices, pg_trgm, paginacion        |
| Transiciones invalidas      | Medium | Low         | State machine validada en backend   |

---

## Testing Strategy

See: `feature-test-plan.md` (se crea en Fase 5)

### Test Coverage Requirements

- **Unit Tests:** Validaciones, state machine
- **Integration Tests:** CRUD operations, RLS
- **E2E Tests:** Flujos completos de creacion/edicion

---

## Implementation Plan

See: `feature-implementation-plan.md` (se crea en Fase 6)

### Recommended Story Order

1. PH-TBD - Create person (foundation)
2. PH-TBD - Search people (duplicate prevention)
3. PH-TBD - View profile (read)
4. PH-TBD - Edit person (update)
5. PH-TBD - Change status (state machine)
6. PH-TBD - Configure statuses (admin)

### Estimated Effort

- **Development:** 1.5 sprints
- **Testing:** 0.5 sprint
- **Total:** 2 sprints

---

## Notes

- Estados son configurables pero con transiciones predefinidas
- Considerar soft-delete para personas (nunca borrar fisicamente)
- Email es el identificador principal para deteccion de duplicados

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-006 to FR-011)
- **Architecture:** `.context/SRS/architecture-specs.md`
