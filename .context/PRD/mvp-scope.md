# MVP Scope - People Hub

## In Scope (Must Have)

### EPIC-PH-001: User Authentication & Authorization

Sistema de autenticacion y control de acceso basado en roles.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 1.1 | Como usuario, quiero registrarme con email corporativo para acceder a la plataforma | Must |
| US 1.2 | Como usuario, quiero hacer login con mis credenciales para acceder a mi cuenta | Must |
| US 1.3 | Como usuario, quiero recuperar mi contrasena si la olvido para no quedar bloqueado | Must |
| US 1.4 | Como Super Admin, quiero gestionar usuarios (crear, editar, desactivar) para controlar el acceso | Must |
| US 1.5 | Como Super Admin, quiero asignar roles a usuarios para definir sus permisos | Must |

**Roles del sistema:**
- `recruiter` - Gestion operativa de personas y vacantes
- `manager` - Feedback y visualizacion de candidatos de sus vacantes
- `hr_admin` - Supervision, reportes y configuracion de estados
- `super_admin` - Gestion tecnica, usuarios y permisos

---

### EPIC-PH-002: People Management (Core)

Gestion centralizada de personas con modelo unificado.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 2.1 | Como Recruiter, quiero crear un nuevo registro de persona para iniciar tracking | Must |
| US 2.2 | Como Recruiter, quiero buscar personas existentes antes de crear una nueva para evitar duplicados | Must |
| US 2.3 | Como Recruiter, quiero ver el perfil completo de una persona con todo su historial | Must |
| US 2.4 | Como Recruiter, quiero editar datos de una persona para mantener informacion actualizada | Must |
| US 2.5 | Como Recruiter, quiero cambiar el estado de una persona para reflejar su situacion actual | Must |
| US 2.6 | Como HR Admin, quiero configurar los estados disponibles del sistema para adaptarlo a nuestro proceso | Must |

**Estados base del sistema (configurables):**
- Candidato: `lead`, `aplicado`, `en_proceso`, `finalista`, `rechazado`, `contratado`
- Empleado: `activo`, `en_prueba`, `baja_voluntaria`, `baja_involuntaria`
- Externo: `freelancer`, `contractor`, `ex_empleado`

---

### EPIC-PH-003: Position/Vacancy Management

Gestion de vacantes y asignacion de candidatos.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 3.1 | Como Recruiter, quiero crear una vacante con descripcion y requisitos | Must |
| US 3.2 | Como Recruiter, quiero asignar candidatos a una vacante para trackear el pipeline | Must |
| US 3.3 | Como Recruiter, quiero ver el pipeline de candidatos por vacante en vista kanban | Must |
| US 3.4 | Como Manager, quiero ver los candidatos asignados a mis vacantes para dar seguimiento | Must |
| US 3.5 | Como Recruiter, quiero cerrar una vacante (cubierta o cancelada) para actualizar metricas | Must |

---

### EPIC-PH-004: Feedback & Notes System

Sistema de notas y feedback estructurado por persona.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 4.1 | Como Recruiter, quiero agregar notas a una persona para registrar interacciones | Must |
| US 4.2 | Como Manager, quiero registrar feedback de entrevista con rating para que Recruiter lo vea | Must |
| US 4.3 | Como Recruiter, quiero ver todo el feedback de managers en el perfil del candidato | Must |
| US 4.4 | Como cualquier usuario, quiero ver el timeline de actividad de una persona ordenado cronologicamente | Must |

**Tipos de feedback:**
- Nota general (solo texto)
- Feedback de entrevista (texto + rating 1-5 + recomendacion: si/no/tal vez)
- Cambio de estado (automatico, con comentario opcional)

---

### EPIC-PH-005: Search & Filters

Busqueda avanzada y filtros para encontrar personas rapidamente.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 5.1 | Como Recruiter, quiero buscar personas por nombre, email o telefono para encontrarlas rapido | Must |
| US 5.2 | Como Recruiter, quiero filtrar personas por estado actual para ver solo los relevantes | Must |
| US 5.3 | Como Recruiter, quiero filtrar personas por vacante asignada para ver pipeline especifico | Must |
| US 5.4 | Como Manager, quiero filtrar candidatos por mis vacantes asignadas para ver solo mi equipo | Must |

---

### EPIC-PH-006: Dashboard & Reporting

Dashboards y metricas para supervision.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 6.1 | Como HR Admin, quiero ver dashboard con KPIs principales (vacantes abiertas, candidatos por etapa, etc.) | Must |
| US 6.2 | Como HR Admin, quiero ver tiempo promedio de contratacion por vacante | Must |
| US 6.3 | Como Recruiter, quiero ver mi carga de trabajo actual (vacantes asignadas, candidatos pendientes) | Must |

**KPIs del dashboard:**
- Vacantes abiertas / cerradas (mes)
- Candidatos por etapa (funnel)
- Tiempo promedio de contratacion
- Tasa de conversion por etapa
- Actividad reciente del equipo

---

### EPIC-PH-007: Notifications (Email)

Notificaciones basicas por email.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 7.1 | Como Manager, quiero recibir email cuando tengo nuevo candidato para revisar | Must |
| US 7.2 | Como Recruiter, quiero recibir email cuando un Manager deja feedback para actuar rapido | Must |
| US 7.3 | Como usuario, quiero poder configurar que notificaciones recibir para no saturarme | Should |

---

## Out of Scope (Nice to Have) - v2+

### Integraciones Avanzadas
- Integracion con LinkedIn (import de perfiles)
- Integracion con calendarios (Google Calendar, Outlook)
- Integracion con sistemas de nomina
- Webhooks para sistemas externos

### Features Avanzados
- AI para matching candidato-vacante
- Parsing automatico de CVs
- Scheduling automatico de entrevistas
- Evaluaciones tecnicas integradas (coding tests)
- Multi-idioma (internacionalizacion)

### Escalabilidad
- Multi-tenancy (SaaS para multiples empresas)
- White-labeling
- API publica para terceros
- Mobile app nativa

### Reporting Avanzado
- Reportes personalizados con query builder
- Export a Excel/PDF
- Integracion con BI tools (Metabase, Looker)
- Comparativas historicas year-over-year

---

## Success Criteria

### Criterios de Aceptacion del MVP Completo

| Criterio | Condicion |
|----------|-----------|
| **Funcionalidad core** | Todas las User Stories "Must" implementadas y testeadas |
| **Performance** | Tiempo de carga < 2s, busqueda < 500ms |
| **Estabilidad** | Sin errores criticos en 2 semanas de uso |
| **Adopcion inicial** | Al menos 3 usuarios activos (1 recruiter, 1 manager, 1 admin) |
| **Data quality** | Cero duplicados en registros de personas |

### Metricas Minimas a Alcanzar (3 meses post-launch)

| Metrica | Target MVP |
|---------|------------|
| Usuarios activos semanales | >= 5 |
| Personas registradas | >= 50 |
| Vacantes gestionadas | >= 10 |
| Feedback registrado | >= 80% de candidatos en etapa final |
| Reduccion de duplicados | -80% vs proceso anterior |

### Condiciones para Lanzamiento

1. **Todas las epicas Must completadas** con tests pasando
2. **Ambiente de produccion estable** en Vercel + Supabase
3. **Documentacion basica** para usuarios (onboarding guide)
4. **Backup y recovery** configurados
5. **Monitoring basico** (errores, uptime)

---

## Resumen de Epicas y User Stories

| Epic ID | Epic Title | # Stories | Prioridad |
|---------|------------|-----------|-----------|
| EPIC-PH-001 | User Authentication & Authorization | 5 | Must |
| EPIC-PH-002 | People Management (Core) | 6 | Must |
| EPIC-PH-003 | Position/Vacancy Management | 5 | Must |
| EPIC-PH-004 | Feedback & Notes System | 4 | Must |
| EPIC-PH-005 | Search & Filters | 4 | Must |
| EPIC-PH-006 | Dashboard & Reporting | 3 | Must |
| EPIC-PH-007 | Notifications (Email) | 3 | Must/Should |

**Total User Stories MVP:** 30

---

*Documento generado para: People Hub MVP*
*Basado en: Executive Summary + User Personas + Business Model*
