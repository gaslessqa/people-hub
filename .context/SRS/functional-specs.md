# Functional Specifications - People Hub

## Overview

Este documento mapea cada User Story del PRD a Functional Requirements (FR) con especificaciones tecnicas detalladas.

---

## EPIC-PH-001: User Authentication & Authorization

### FR-001: Registro de Usuario con Email

**Relacionado a:** EPIC-PH-001, US 1.1

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| email | string | Formato RFC 5321, max 254 chars, dominio valido |
| password | string | Min 8 chars, al menos 1 mayuscula, 1 minuscula, 1 numero |
| full_name | string | Min 2 chars, max 100 chars, solo letras y espacios |

**Processing:**
1. Validar formato de email (regex + verificacion de dominio)
2. Validar fortaleza de password segun policy
3. Verificar que email no existe en tabla `auth.users`
4. Crear usuario en Supabase Auth
5. Crear perfil en tabla `profiles` con rol por defecto: `recruiter`
6. Enviar email de verificacion via Supabase

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, userId: uuid, message: "Verification email sent" }` |
| Email exists | `400` - `{ success: false, error: { code: "EMAIL_EXISTS", message: "Email already registered" } }` |
| Validation error | `400` - `{ success: false, error: { code: "VALIDATION_ERROR", field: string, message: string } }` |

**Validations:**
- Email unico en sistema
- Password cumple policy de seguridad
- Nombre no vacio y sin caracteres especiales (excepto acentos)

---

### FR-002: Login con Credenciales

**Relacionado a:** EPIC-PH-001, US 1.2

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| email | string | Formato email valido |
| password | string | No vacio |

**Processing:**
1. Validar formato de email
2. Autenticar via Supabase Auth `signInWithPassword`
3. Verificar que usuario esta activo (no deshabilitado)
4. Obtener perfil con rol del usuario
5. Generar session tokens

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `200` - `{ success: true, user: { id, email, full_name, role }, session: { access_token, refresh_token } }` |
| Invalid credentials | `401` - `{ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } }` |
| User disabled | `403` - `{ success: false, error: { code: "USER_DISABLED", message: "Account is disabled" } }` |
| Email not verified | `403` - `{ success: false, error: { code: "EMAIL_NOT_VERIFIED", message: "Please verify your email" } }` |

**Validations:**
- Usuario existe y esta activo
- Password correcto
- Email verificado

---

### FR-003: Recuperacion de Contrasena

**Relacionado a:** EPIC-PH-001, US 1.3

**Input (Request Reset):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| email | string | Formato email valido |

**Processing (Request Reset):**
1. Validar formato de email
2. Verificar que email existe en sistema (sin revelar si existe o no)
3. Generar token de reset con expiracion (1 hora)
4. Enviar email con link de reset

**Input (Confirm Reset):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| token | string | Token valido de reset |
| new_password | string | Cumple policy de password |

**Processing (Confirm Reset):**
1. Validar token no expirado
2. Validar nuevo password cumple policy
3. Actualizar password en Supabase Auth
4. Invalidar token usado
5. Opcionalmente: invalidar todas las sesiones activas

**Output:**
| Escenario | Response |
|-----------|----------|
| Reset requested | `200` - `{ success: true, message: "If email exists, reset link was sent" }` |
| Reset confirmed | `200` - `{ success: true, message: "Password updated successfully" }` |
| Invalid token | `400` - `{ success: false, error: { code: "INVALID_TOKEN", message: "Reset link expired or invalid" } }` |

---

### FR-004: Gestion de Usuarios (CRUD)

**Relacionado a:** EPIC-PH-001, US 1.4

**Requiere rol:** `super_admin`

**Input (Create User):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| email | string | Formato email valido, unico |
| full_name | string | Min 2 chars |
| role | enum | `recruiter`, `manager`, `hr_admin`, `super_admin` |
| password | string | Opcional - si no se provee, se genera y envia por email |

**Processing (Create):**
1. Validar permisos del usuario que crea (super_admin)
2. Validar datos de entrada
3. Crear usuario en Supabase Auth
4. Crear perfil con rol especificado
5. Enviar email de bienvenida con credenciales temporales

**Input (Update User):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| user_id | uuid | Usuario existente |
| full_name | string | Opcional |
| role | enum | Opcional |
| is_active | boolean | Opcional |

**Input (Deactivate User):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| user_id | uuid | Usuario existente, no puede ser el mismo super_admin |

**Processing (Deactivate):**
1. Validar que no es auto-desactivacion
2. Marcar usuario como inactivo
3. Invalidar todas las sesiones del usuario
4. Mantener datos historicos (no eliminar)

**Output:**
| Escenario | Response |
|-----------|----------|
| User created | `201` - `{ success: true, user: { id, email, full_name, role } }` |
| User updated | `200` - `{ success: true, user: {...updated} }` |
| User deactivated | `200` - `{ success: true, message: "User deactivated" }` |
| Not authorized | `403` - `{ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }` |

---

### FR-005: Asignacion de Roles

**Relacionado a:** EPIC-PH-001, US 1.5

**Requiere rol:** `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| user_id | uuid | Usuario existente |
| role | enum | `recruiter`, `manager`, `hr_admin`, `super_admin` |

**Processing:**
1. Validar permisos (super_admin)
2. Validar que el usuario existe y esta activo
3. Actualizar rol en tabla `profiles`
4. Registrar cambio en audit log

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `200` - `{ success: true, user: { id, role } }` |
| User not found | `404` - `{ success: false, error: { code: "USER_NOT_FOUND" } }` |

**Permisos por rol:**
| Accion | recruiter | manager | hr_admin | super_admin |
|--------|-----------|---------|----------|-------------|
| Ver personas | Si | Solo sus vacantes | Si | Si |
| Crear personas | Si | No | Si | Si |
| Editar personas | Si | No | Si | Si |
| Ver feedback | Si | Si (propios) | Si | Si |
| Dar feedback | No | Si | Si | Si |
| Ver dashboard | Basico | No | Completo | Completo |
| Gestionar usuarios | No | No | No | Si |
| Configurar sistema | No | No | Si | Si |

---

## EPIC-PH-002: People Management (Core)

### FR-006: Crear Registro de Persona

**Relacionado a:** EPIC-PH-002, US 2.1

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion | Requerido |
|-------|------|------------|-----------|
| first_name | string | Min 1 char, max 50 | Si |
| last_name | string | Min 1 char, max 50 | Si |
| email | string | Formato email, max 254 | Si |
| phone | string | Formato E.164, max 20 | No |
| linkedin_url | string | URL valida de LinkedIn | No |
| current_company | string | Max 100 chars | No |
| current_position | string | Max 100 chars | No |
| location | string | Max 100 chars | No |
| notes | string | Max 5000 chars | No |
| source | enum | `linkedin`, `referral`, `job_board`, `direct`, `other` | No |
| initial_status | enum | Estado valido del sistema | No (default: `lead`) |

**Processing:**
1. Validar permisos del usuario
2. Validar datos de entrada
3. Verificar que email no existe (warning, no bloqueo)
4. Crear registro en tabla `people`
5. Crear entrada inicial en `activity_log`
6. Si se asigna vacante, crear relacion en `person_positions`

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, person: { id, full_name, email, status, created_at } }` |
| Email exists (warning) | `201` - `{ success: true, person: {...}, warning: { code: "EMAIL_EXISTS", existing_person_id: uuid } }` |
| Validation error | `400` - `{ success: false, error: { code: "VALIDATION_ERROR", details: [...] } }` |

---

### FR-007: Busqueda de Personas (Duplicate Check)

**Relacionado a:** EPIC-PH-002, US 2.2

**Requiere rol:** Cualquier usuario autenticado

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| query | string | Min 2 chars, max 100 |
| search_type | enum | `all`, `name`, `email`, `phone` (default: `all`) |
| limit | integer | 1-50 (default: 10) |

**Processing:**
1. Sanitizar query (prevenir injection)
2. Busqueda full-text en campos: first_name, last_name, email, phone
3. Aplicar fuzzy matching para nombres (tolerancia a typos)
4. Ordenar por relevancia
5. Aplicar permisos (manager solo ve personas de sus vacantes)

**Output:**
```typescript
{
  success: true,
  results: [
    {
      id: uuid,
      full_name: string,
      email: string, // parcialmente oculto: j***@email.com
      status: string,
      status_label: string,
      last_activity: datetime,
      match_score: number // 0-100
    }
  ],
  total_count: number
}
```

**Validations:**
- Query no vacio
- Resultados filtrados por permisos de usuario

---

### FR-008: Ver Perfil Completo de Persona

**Relacionado a:** EPIC-PH-002, US 2.3

**Requiere rol:** Segun permisos (ver FR-005)

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |

**Processing:**
1. Validar permisos del usuario para ver esta persona
2. Obtener datos basicos de `people`
3. Obtener estados actuales de `person_statuses`
4. Obtener vacantes asociadas de `person_positions`
5. Obtener timeline de `activity_log` (ultimas 50 entradas)
6. Obtener feedback de `feedback` (ordenado por fecha)

**Output:**
```typescript
{
  success: true,
  person: {
    id: uuid,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    linkedin_url: string,
    current_company: string,
    current_position: string,
    location: string,
    source: string,
    created_at: datetime,
    updated_at: datetime,
    created_by: { id, full_name },
    statuses: [
      { status_type: string, status_value: string, since: datetime }
    ],
    positions: [
      { position_id, title, status_in_position, assigned_at }
    ],
    timeline: [
      { type, content, created_at, created_by }
    ],
    feedback: [
      { id, type, rating, recommendation, content, created_at, created_by }
    ]
  }
}
```

---

### FR-009: Editar Datos de Persona

**Relacionado a:** EPIC-PH-002, US 2.4

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |
| first_name | string | Opcional, validaciones de FR-006 |
| last_name | string | Opcional |
| email | string | Opcional |
| phone | string | Opcional |
| ...otros campos | ... | Opcional |

**Processing:**
1. Validar permisos
2. Validar datos de entrada
3. Actualizar solo campos proporcionados
4. Registrar cambios en `activity_log` (que cambio, valor anterior, valor nuevo)
5. Actualizar `updated_at`

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `200` - `{ success: true, person: {...updated} }` |
| Person not found | `404` - `{ success: false, error: { code: "PERSON_NOT_FOUND" } }` |
| Validation error | `400` - `{ success: false, error: {...} }` |

---

### FR-010: Cambiar Estado de Persona

**Relacionado a:** EPIC-PH-002, US 2.5

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |
| status_type | enum | Tipo de estado (ver FR-011) |
| status_value | enum | Valor valido para el tipo |
| comment | string | Opcional, max 1000 chars |
| position_id | uuid | Opcional, si cambio aplica a vacante especifica |

**Processing:**
1. Validar permisos
2. Validar que la transicion de estado es valida (state machine)
3. Crear nuevo registro en `person_statuses`
4. Registrar en `activity_log`
5. Si es transicion especial (ej: `contratado`), disparar logica adicional
6. Enviar notificaciones si aplica

**Transiciones validas (candidato):**
```
lead -> aplicado -> en_proceso -> finalista -> contratado
                                            -> rechazado
         aplicado -> rechazado
                  -> retirado (por el candidato)
```

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `200` - `{ success: true, new_status: { type, value, since } }` |
| Invalid transition | `400` - `{ success: false, error: { code: "INVALID_TRANSITION", allowed: [...] } }` |

---

### FR-011: Configurar Estados del Sistema

**Relacionado a:** EPIC-PH-002, US 2.6

**Requiere rol:** `hr_admin`, `super_admin`

**Input (List States):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| status_type | enum | Opcional, filtrar por tipo |

**Input (Create State):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| status_type | enum | `candidate`, `employee`, `external` |
| status_value | string | Identificador unico, snake_case, max 50 |
| label | string | Display name, max 50 |
| color | string | Hex color (#RRGGBB) |
| order | integer | Orden de visualizacion |
| is_active | boolean | Default: true |

**Processing:**
1. Validar permisos
2. Validar unicidad de status_value dentro del tipo
3. Crear/actualizar registro en `status_definitions`
4. Si se desactiva un estado, validar que no hay personas en ese estado

**Output:**
```typescript
{
  success: true,
  statuses: [
    {
      id: uuid,
      status_type: string,
      status_value: string,
      label: string,
      color: string,
      order: number,
      is_active: boolean,
      person_count: number // cuantas personas tienen este estado
    }
  ]
}
```

---

## EPIC-PH-003: Position/Vacancy Management

### FR-012: Crear Vacante

**Relacionado a:** EPIC-PH-003, US 3.1

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion | Requerido |
|-------|------|------------|-----------|
| title | string | Min 3, max 100 | Si |
| department | string | Max 50 | No |
| description | string | Max 5000 | No |
| requirements | string | Max 5000 | No |
| location | string | Max 100 | No |
| employment_type | enum | `full_time`, `part_time`, `contract`, `internship` | No |
| salary_min | integer | >= 0 | No |
| salary_max | integer | >= salary_min | No |
| salary_currency | string | ISO 4217 (USD, MXN, etc) | No |
| hiring_manager_id | uuid | Usuario con rol manager | No |
| recruiter_id | uuid | Usuario con rol recruiter | No (default: usuario actual) |
| priority | enum | `low`, `medium`, `high`, `urgent` | No (default: `medium`) |

**Processing:**
1. Validar permisos
2. Validar datos de entrada
3. Crear registro en `positions`
4. Si se asigna hiring_manager, notificarlo
5. Registrar en `activity_log`

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, position: { id, title, status: "open", created_at } }` |

---

### FR-013: Asignar Candidato a Vacante

**Relacionado a:** EPIC-PH-003, US 3.2

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| position_id | uuid | Vacante existente y abierta |
| person_id | uuid | Persona existente |
| initial_stage | enum | Etapa del pipeline (default: `applied`) |
| comment | string | Opcional, max 500 |

**Processing:**
1. Validar permisos
2. Validar que vacante esta abierta
3. Validar que persona no esta ya asignada a esta vacante
4. Crear relacion en `person_positions`
5. Actualizar estado de persona si es necesario
6. Notificar a hiring_manager si esta definido
7. Registrar en `activity_log`

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, assignment: { person_id, position_id, stage, assigned_at } }` |
| Already assigned | `400` - `{ success: false, error: { code: "ALREADY_ASSIGNED" } }` |
| Position closed | `400` - `{ success: false, error: { code: "POSITION_CLOSED" } }` |

---

### FR-014: Ver Pipeline de Vacante (Kanban)

**Relacionado a:** EPIC-PH-003, US 3.3

**Requiere rol:** `recruiter`, `manager` (solo sus vacantes), `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| position_id | uuid | Vacante existente |

**Processing:**
1. Validar permisos (manager solo puede ver si es hiring_manager)
2. Obtener vacante con detalles
3. Obtener candidatos agrupados por etapa
4. Para cada candidato: ultimo feedback, dias en etapa actual

**Output:**
```typescript
{
  success: true,
  position: {
    id: uuid,
    title: string,
    status: string,
    hiring_manager: { id, full_name },
    recruiter: { id, full_name }
  },
  pipeline: {
    applied: [
      { person_id, full_name, days_in_stage, last_feedback_date }
    ],
    screening: [...],
    interviewing: [...],
    finalist: [...],
    offer: [...],
    hired: [...],
    rejected: [...]
  },
  stats: {
    total_candidates: number,
    avg_days_to_hire: number,
    conversion_rates: { applied_to_screening: percent, ... }
  }
}
```

---

### FR-015: Ver Candidatos de Mis Vacantes (Manager)

**Relacionado a:** EPIC-PH-003, US 3.4

**Requiere rol:** `manager`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| stage_filter | enum | Opcional, filtrar por etapa |

**Processing:**
1. Obtener vacantes donde usuario es `hiring_manager`
2. Obtener candidatos de esas vacantes
3. Agrupar por vacante o por etapa segun preferencia
4. Incluir acciones pendientes (feedback por dar)

**Output:**
```typescript
{
  success: true,
  positions: [
    {
      id: uuid,
      title: string,
      candidates: [
        {
          person_id: uuid,
          full_name: string,
          stage: string,
          needs_feedback: boolean,
          last_feedback: datetime
        }
      ]
    }
  ],
  pending_feedback_count: number
}
```

---

### FR-016: Cerrar Vacante

**Relacionado a:** EPIC-PH-003, US 3.5

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| position_id | uuid | Vacante existente y abierta |
| close_reason | enum | `filled`, `cancelled`, `on_hold` |
| hired_person_id | uuid | Requerido si reason es `filled` |
| comment | string | Opcional, max 500 |

**Processing:**
1. Validar permisos
2. Validar que vacante esta abierta
3. Si es `filled`, validar que hired_person_id es candidato de esta vacante
4. Actualizar estado de vacante
5. Si es `filled`, transicionar persona a estado `contratado`
6. Actualizar etapa de otros candidatos (opcional: marcar como `position_filled`)
7. Registrar en `activity_log`
8. Actualizar metricas

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `200` - `{ success: true, position: { id, status: "closed", close_reason } }` |
| Already closed | `400` - `{ success: false, error: { code: "ALREADY_CLOSED" } }` |

---

## EPIC-PH-004: Feedback & Notes System

### FR-017: Agregar Nota a Persona

**Relacionado a:** EPIC-PH-004, US 4.1

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |
| content | string | Min 1 char, max 5000 |
| is_private | boolean | Default: false |

**Processing:**
1. Validar permisos
2. Validar contenido no vacio
3. Crear registro en `notes`
4. Registrar en `activity_log`

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, note: { id, content, is_private, created_at, created_by } }` |

---

### FR-018: Registrar Feedback de Entrevista

**Relacionado a:** EPIC-PH-004, US 4.2

**Requiere rol:** `manager`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion | Requerido |
|-------|------|------------|-----------|
| person_id | uuid | Persona existente | Si |
| position_id | uuid | Vacante a la que aplica | Si |
| feedback_type | enum | `technical`, `cultural`, `final`, `other` | Si |
| rating | integer | 1-5 | Si |
| recommendation | enum | `strong_yes`, `yes`, `maybe`, `no`, `strong_no` | Si |
| strengths | string | Max 2000 | No |
| concerns | string | Max 2000 | No |
| comments | string | Max 5000 | Si |
| is_confidential | boolean | Solo visible para HR | No (default: false) |

**Processing:**
1. Validar permisos (manager solo puede dar feedback en sus vacantes)
2. Validar que persona esta asignada a la vacante
3. Crear registro en `feedback`
4. Registrar en `activity_log`
5. Notificar a recruiter asignado

**Output:**
| Escenario | Response |
|-----------|----------|
| Success | `201` - `{ success: true, feedback: { id, rating, recommendation, created_at } }` |
| Not assigned to position | `400` - `{ success: false, error: { code: "PERSON_NOT_IN_POSITION" } }` |

---

### FR-019: Ver Feedback de Candidato

**Relacionado a:** EPIC-PH-004, US 4.3

**Requiere rol:** `recruiter`, `manager` (solo sus vacantes), `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |
| position_id | uuid | Opcional, filtrar por vacante |

**Processing:**
1. Validar permisos
2. Obtener feedback ordenado por fecha desc
3. Filtrar confidenciales segun permisos
4. Incluir autor de cada feedback

**Output:**
```typescript
{
  success: true,
  feedback: [
    {
      id: uuid,
      position: { id, title },
      feedback_type: string,
      rating: number,
      recommendation: string,
      strengths: string,
      concerns: string,
      comments: string,
      is_confidential: boolean,
      created_at: datetime,
      created_by: { id, full_name, role }
    }
  ],
  summary: {
    avg_rating: number,
    recommendation_breakdown: { strong_yes: n, yes: n, ... },
    total_feedback: number
  }
}
```

---

### FR-020: Ver Timeline de Actividad

**Relacionado a:** EPIC-PH-004, US 4.4

**Requiere rol:** Cualquier usuario autenticado (filtrado por permisos)

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| person_id | uuid | Persona existente |
| limit | integer | 1-100 (default: 50) |
| offset | integer | >= 0 (default: 0) |
| type_filter | enum[] | Opcional: `note`, `feedback`, `status_change`, `assignment` |

**Processing:**
1. Validar permisos para ver persona
2. Obtener actividades de `activity_log` + `notes` + `feedback`
3. Ordenar cronologicamente (mas reciente primero)
4. Filtrar por tipo si se especifica
5. Paginar

**Output:**
```typescript
{
  success: true,
  timeline: [
    {
      id: uuid,
      type: "note" | "feedback" | "status_change" | "assignment" | "edit",
      content: string | object,
      created_at: datetime,
      created_by: { id, full_name }
    }
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    has_more: boolean
  }
}
```

---

## EPIC-PH-005: Search & Filters

### FR-021: Busqueda Global

**Relacionado a:** EPIC-PH-005, US 5.1

(Especificado en FR-007)

---

### FR-022: Filtrar por Estado

**Relacionado a:** EPIC-PH-005, US 5.2

**Requiere rol:** Cualquier usuario autenticado

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| status_type | enum | `candidate`, `employee`, `external` |
| status_values | string[] | Array de estados validos |
| page | integer | >= 1 |
| page_size | integer | 1-100 (default: 20) |

**Processing:**
1. Validar permisos
2. Filtrar personas por estado actual
3. Aplicar permisos adicionales (manager solo ve sus vacantes)
4. Ordenar por ultima actividad
5. Paginar

**Output:**
```typescript
{
  success: true,
  people: [
    {
      id: uuid,
      full_name: string,
      email: string,
      status: { type, value, label, color },
      last_activity: datetime,
      current_positions: [{ id, title }]
    }
  ],
  pagination: { total, page, page_size, total_pages }
}
```

---

### FR-023: Filtrar por Vacante

**Relacionado a:** EPIC-PH-005, US 5.3

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| position_id | uuid | Vacante existente |
| stage | enum | Opcional, etapa especifica |
| include_rejected | boolean | Default: false |

**Processing:**
1. Validar permisos
2. Obtener personas asignadas a la vacante
3. Filtrar por etapa si se especifica
4. Incluir/excluir rechazados segun parametro

**Output:** Similar a FR-022

---

### FR-024: Filtrar Mis Vacantes (Manager)

**Relacionado a:** EPIC-PH-005, US 5.4

(Especificado en FR-015)

---

## EPIC-PH-006: Dashboard & Reporting

### FR-025: Dashboard de KPIs (HR Admin)

**Relacionado a:** EPIC-PH-006, US 6.1

**Requiere rol:** `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| period | enum | `week`, `month`, `quarter`, `year` |
| compare_previous | boolean | Default: true |

**Processing:**
1. Validar permisos
2. Calcular metricas para periodo seleccionado
3. Si compare_previous, calcular delta vs periodo anterior
4. Agregar datos de funnel

**Output:**
```typescript
{
  success: true,
  period: { start: date, end: date },
  kpis: {
    open_positions: { value: number, delta: number, trend: "up" | "down" | "flat" },
    total_candidates: { value, delta, trend },
    hires_this_period: { value, delta, trend },
    avg_time_to_hire_days: { value, delta, trend },
    offer_acceptance_rate: { value, delta, trend }
  },
  funnel: {
    applied: number,
    screening: number,
    interviewing: number,
    finalist: number,
    offer: number,
    hired: number,
    conversion_rates: {
      applied_to_hired: percent
    }
  },
  recent_activity: [
    { type, description, timestamp }
  ]
}
```

---

### FR-026: Tiempo Promedio de Contratacion

**Relacionado a:** EPIC-PH-006, US 6.2

**Requiere rol:** `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| position_id | uuid | Opcional, filtrar por vacante |
| date_from | date | Opcional |
| date_to | date | Opcional |

**Processing:**
1. Obtener vacantes cerradas con razon `filled`
2. Calcular tiempo desde apertura hasta cierre
3. Agrupar por departamento si aplica
4. Calcular promedio, mediana, min, max

**Output:**
```typescript
{
  success: true,
  time_to_hire: {
    avg_days: number,
    median_days: number,
    min_days: number,
    max_days: number,
    total_hires: number
  },
  by_department: [
    { department: string, avg_days: number, hires: number }
  ],
  trend: [
    { period: string, avg_days: number }
  ]
}
```

---

### FR-027: Carga de Trabajo (Recruiter)

**Relacionado a:** EPIC-PH-006, US 6.3

**Requiere rol:** `recruiter`, `hr_admin`, `super_admin`

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| recruiter_id | uuid | Opcional (default: usuario actual) |

**Processing:**
1. Validar permisos (solo puede ver su propia carga, excepto admins)
2. Obtener vacantes asignadas al recruiter
3. Contar candidatos por etapa
4. Identificar candidatos con feedback pendiente (>3 dias sin actividad)

**Output:**
```typescript
{
  success: true,
  workload: {
    open_positions: number,
    total_active_candidates: number,
    by_stage: {
      applied: number,
      screening: number,
      interviewing: number,
      finalist: number,
      offer: number
    },
    pending_actions: [
      { type: "follow_up", person_id, person_name, days_stale: number }
    ]
  }
}
```

---

## EPIC-PH-007: Notifications (Email)

### FR-028: Notificar Nuevo Candidato a Manager

**Relacionado a:** EPIC-PH-007, US 7.1

**Trigger:** Cuando candidato avanza a etapa `interviewing` en vacante con hiring_manager asignado

**Processing:**
1. Verificar que hiring_manager tiene notificaciones habilitadas
2. Obtener datos del candidato y vacante
3. Enviar email via Supabase con template
4. Registrar envio en `notification_log`

**Email Template:**
```
Subject: Nuevo candidato para revisar: {candidate_name} - {position_title}

Hola {manager_name},

{recruiter_name} ha movido a {candidate_name} a la etapa de entrevistas
para la posicion {position_title}.

Ver candidato: {link_to_profile}

---
People Hub
```

---

### FR-029: Notificar Feedback a Recruiter

**Relacionado a:** EPIC-PH-007, US 7.2

**Trigger:** Cuando se crea nuevo feedback (FR-018)

**Processing:**
1. Verificar que recruiter tiene notificaciones habilitadas
2. Obtener datos del feedback, candidato y manager
3. Enviar email via Supabase
4. Registrar en `notification_log`

**Email Template:**
```
Subject: {manager_name} dejo feedback sobre {candidate_name}

Hola {recruiter_name},

{manager_name} ha dejado feedback sobre {candidate_name} para {position_title}.

Recomendacion: {recommendation}
Rating: {rating}/5

Ver feedback completo: {link_to_profile}

---
People Hub
```

---

### FR-030: Configurar Preferencias de Notificacion

**Relacionado a:** EPIC-PH-007, US 7.3

**Requiere rol:** Cualquier usuario autenticado

**Input:**
| Campo | Tipo | Validacion |
|-------|------|------------|
| notification_type | enum | Tipo de notificacion |
| enabled | boolean | Activar/desactivar |

**Tipos de notificacion:**
- `new_candidate` - Nuevo candidato para revisar (manager)
- `new_feedback` - Feedback recibido (recruiter)
- `status_change` - Cambio de estado de candidato
- `position_closed` - Vacante cerrada
- `weekly_digest` - Resumen semanal

**Processing:**
1. Obtener preferencias actuales del usuario
2. Actualizar preferencia especificada
3. Guardar en tabla `user_preferences`

**Output:**
```typescript
{
  success: true,
  preferences: {
    new_candidate: boolean,
    new_feedback: boolean,
    status_change: boolean,
    position_closed: boolean,
    weekly_digest: boolean
  }
}
```

---

## Apendice: Codigos de Error Estandar

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada invalidos |
| `EMAIL_EXISTS` | 400 | Email ya registrado |
| `INVALID_CREDENTIALS` | 401 | Credenciales incorrectas |
| `TOKEN_EXPIRED` | 401 | Token expirado |
| `USER_DISABLED` | 403 | Usuario deshabilitado |
| `FORBIDDEN` | 403 | Sin permisos suficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `PERSON_NOT_FOUND` | 404 | Persona no encontrada |
| `POSITION_NOT_FOUND` | 404 | Vacante no encontrada |
| `ALREADY_ASSIGNED` | 400 | Ya asignado |
| `INVALID_TRANSITION` | 400 | Transicion de estado invalida |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

*Documento generado para: People Hub MVP*
*Basado en: MVP Scope (30 User Stories -> 30 Functional Requirements)*
