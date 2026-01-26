<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Product Requirements Document (PRD) - Manual

> **Fase:** 2 - Architecture
> **Tiempo estimado:** 2-4 horas
> **Herramientas:** Google Docs, Notion, o Markdown editor
> **Prerequisitos:** Fase 1 completa (business-model.md, market-context.md)

---

## 🎯 Objetivo

Crear el **PRD (Product Requirements Document)** completo que define QUÉ construiremos, PARA QUIÉN, y POR QUÉ.

Al finalizar tendrás 4 archivos en `.context/PRD/`:

- `executive-summary.md`
- `user-personas.md`
- `mvp-scope.md`
- `user-journeys.md`

---

## 🔑 Conceptos Clave

| Término                 | Significado                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| **PRD**                 | Product Requirements Document - Define qué construir y por qué       |
| **User Persona**        | Representación ficticia de un usuario típico basada en investigación |
| **User Story**          | Descripción de una funcionalidad desde perspectiva del usuario       |
| **Epic**                | Agrupación de user stories relacionadas                              |
| **User Journey**        | Camino que sigue el usuario para lograr un objetivo                  |
| **MVP**                 | Minimum Viable Product - Versión mínima funcional                    |
| **Acceptance Criteria** | Condiciones que deben cumplirse para considerar completa una feature |

---

## 📐 Estructura del PRD

```
┌─────────────────────────────────────────────────────────────────┐
│                           PRD                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. EXECUTIVE SUMMARY         2. USER PERSONAS                  │
│  ┌───────────────────┐        ┌───────────────────┐             │
│  │ • Problem         │        │ • Persona 1       │             │
│  │ • Solution        │        │ • Persona 2       │             │
│  │ • Success Metrics │        │ • Persona 3       │             │
│  │ • Target Users    │        │                   │             │
│  └───────────────────┘        └───────────────────┘             │
│          │                            │                         │
│          └────────────┬───────────────┘                         │
│                       ▼                                         │
│           3. MVP SCOPE                                          │
│           ┌───────────────────────────────┐                     │
│           │ • Epics                       │                     │
│           │ • User Stories                │                     │
│           │ • Acceptance Criteria         │                     │
│           │ • Out of Scope               │                     │
│           └───────────────────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│           4. USER JOURNEYS                                      │
│           ┌───────────────────────────────┐                     │
│           │ • Happy Paths                 │                     │
│           │ • Edge Cases                  │                     │
│           │ • Error Scenarios             │                     │
│           └───────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 PARTE 1: Executive Summary

### ¿Qué es?

Un resumen ejecutivo de 1-2 páginas que cualquiera puede leer para entender el producto.

### Paso 1.1: Refina el Problem Statement

**¿Qué hacer?**
Toma el Problem Statement de tu Business Model y refínalo.

**¿Por qué?**
El problema es la base de todo. Debe ser cristalino.

**¿Cómo?**

Usa esta estructura:

```markdown
## Problem Statement

### El Problema

[1 párrafo: ¿Qué problema existe?]

### Impacto Actual

[1 párrafo: ¿Cómo afecta a los usuarios HOY?]

### Por Qué Ahora

[1 párrafo: ¿Por qué es el momento correcto para resolverlo?]
```

**Ejemplo:**

```markdown
## Problem Statement

### El Problema

Los QA Engineers dedican el 60% de su tiempo a tareas repetitivas:
escribir test cases desde cero, documentar en formatos inconsistentes,
y mantener documentación desactualizada.

### Impacto Actual

Esto resulta en:

- 2-3 horas diarias perdidas en documentación manual
- Test coverage inconsistente entre proyectos
- Burnout del equipo de QA
- Bugs que llegan a producción por falta de tests

### Por Qué Ahora

La adopción de CI/CD ha acelerado los ciclos de release.
Los equipos de QA no pueden mantener el ritmo sin automatización.
La IA generativa ofrece por primera vez la posibilidad de
generar tests de calidad desde especificaciones.
```

---

### Paso 1.2: Define la Solución

**¿Qué hacer?**
Describe qué construirás en 3-5 bullets.

**¿Por qué?**
Define el alcance sin entrar en detalles técnicos.

**¿Cómo?**

```markdown
## Solution Overview

[Nombre del Producto] es [categoría] que permite a [usuarios]
[acción principal] para [beneficio].

### Features Core del MVP:

1. **[Feature 1]:** [Descripción en 1 línea]
2. **[Feature 2]:** [Descripción en 1 línea]
3. **[Feature 3]:** [Descripción en 1 línea]
4. **[Feature 4]:** [Descripción en 1 línea]
5. **[Feature 5]:** [Descripción en 1 línea]
```

**Ejemplo:**

```markdown
## Solution Overview

TestGen AI es una plataforma de generación de tests que permite
a QA Engineers crear test cases automáticamente desde user stories
para reducir tiempo de documentación en 70%.

### Features Core del MVP:

1. **Import de User Stories:** Conectar con Jira/GitHub para importar stories
2. **Generación de Test Cases:** AI genera tests desde acceptance criteria
3. **Editor de Tests:** Modificar y refinar tests generados
4. **Export Multi-formato:** Exportar a Xray, Zephyr, o Markdown
5. **Colaboración:** Compartir y comentar tests con el equipo
```

---

### Paso 1.3: Define Success Metrics (KPIs)

**¿Qué hacer?**
Establece 3-5 métricas que indiquen si el producto es exitoso.

**¿Por qué?**
Sin métricas claras, no sabrás si estás ganando o perdiendo.

**¿Cómo?**

Usa el framework **AARRR (Pirate Metrics):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AARRR FRAMEWORK                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ACQUISITION ──→ ACTIVATION ──→ RETENTION ──→ REVENUE ──→ REFERRAL
│  ¿Cómo nos      ¿Primera       ¿Vuelven?     ¿Pagan?     ¿Refieren?
│  encuentran?    experiencia?                                    │
│                                                                 │
│  Métricas:      Métricas:      Métricas:     Métricas:   Métricas:
│  - Signups      - Setup done   - DAU/MAU     - MRR       - NPS
│  - Visits       - First test   - Retention   - ARPU      - Referrals
│  - Sources      - Time to      - Churn       - LTV       - Shares
│                   value                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ejemplo:**

```markdown
## Success Metrics

| Categoría   | Métrica                    | Target MVP (90 días) |
| ----------- | -------------------------- | -------------------- |
| Acquisition | Signups                    | 500 usuarios         |
| Activation  | % que genera primer test   | 60%                  |
| Retention   | MAU (Monthly Active Users) | 200                  |
| Revenue     | MRR                        | $2,000               |
| Referral    | NPS                        | > 40                 |
```

> 💡 **Tip:** Para MVP, enfócate en Activation (¿entienden el valor?) y Retention (¿vuelven?).

---

### Paso 1.4: Consolida el Executive Summary

**¿Qué hacer?**
Une todo en un solo documento.

**Archivo:** `.context/PRD/executive-summary.md`

```markdown
# Executive Summary - [Nombre del Producto]

**Versión:** 1.0
**Fecha:** [YYYY-MM-DD]
**Autor:** [Tu nombre]

---

## Problem Statement

[Del Paso 1.1]

---

## Solution Overview

[Del Paso 1.2]

---

## Success Metrics

[Del Paso 1.3]

---

## Target Users (Preview)

[Lista breve de 2-3 perfiles - se detallan en user-personas.md]

- **[Persona 1]:** [1 línea]
- **[Persona 2]:** [1 línea]
- **[Persona 3]:** [1 línea]

---

**Siguiente:** user-personas.md
```

---

## 📋 PARTE 2: User Personas

### ¿Qué es?

Representaciones detalladas de tus usuarios ideales basadas en investigación.

### Paso 2.1: Identifica tus perfiles de usuario

**¿Qué hacer?**
Lista 2-3 tipos de usuarios distintos.

**¿Por qué?**
Diferentes usuarios tienen diferentes necesidades. Diseñar para "todos" significa diseñar para nadie.

**¿Cómo?**

Responde:

- ¿Quiénes usarán el producto directamente?
- ¿Quiénes toman la decisión de compra?
- ¿Hay usuarios secundarios afectados?

---

### Paso 2.2: Crea cada persona

**¿Qué hacer?**
Desarrolla cada persona en detalle.

**Estructura por persona:**

```markdown
## Persona 1: [Nombre Ficticio]

### Foto Description

[Descripción para generar imagen con IA - edad, apariencia, contexto]

### Demographics

| Atributo  | Valor             |
| --------- | ----------------- |
| Edad      | [X años]          |
| Ocupación | [Rol]             |
| Empresa   | [Tipo de empresa] |
| Ubicación | [Ciudad, País]    |
| Educación | [Nivel]           |

### Goals (¿Qué quiere lograr?)

1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

### Pain Points (Frustraciones actuales)

1. [Pain 1] - [Cómo le afecta]
2. [Pain 2] - [Cómo le afecta]
3. [Pain 3] - [Cómo le afecta]

### Tech Savviness

- **Nivel:** [Early Adopter / Mainstream / Late Adopter]
- **Dispositivos:** [Laptop, móvil, tablet...]
- **Apps favoritas:** [Herramientas que usa]

### Quote

> "[Frase que capture su frustración o necesidad]"

### Cómo usaría nuestro producto

[1-2 párrafos describiendo su uso típico]
```

**Ejemplo:**

```markdown
## Persona 1: María García

### Foto Description

Mujer profesional de 32 años, cabello oscuro, usando laptop en oficina
moderna tipo startup. Expresión concentrada pero amigable.

### Demographics

| Atributo  | Valor                              |
| --------- | ---------------------------------- |
| Edad      | 32 años                            |
| Ocupación | QA Lead                            |
| Empresa   | Startup fintech (50-200 empleados) |
| Ubicación | Ciudad de México                   |
| Educación | Ingeniería en Sistemas             |

### Goals

1. Mejorar la cobertura de tests sin aumentar el equipo
2. Estandarizar la documentación de QA
3. Reducir tiempo de regresión antes de cada release

### Pain Points

1. **Documentación inconsistente** - Cada tester tiene su propio estilo
2. **Tiempo limitado** - Los sprints son de 2 semanas y no alcanza
3. **Herramientas desconectadas** - Jira, Excel, Confluence no se hablan

### Tech Savviness

- **Nivel:** Early Adopter
- **Dispositivos:** MacBook Pro, iPhone
- **Apps favoritas:** Jira, Slack, Playwright, Postman

### Quote

> "Paso más tiempo documentando tests que ejecutándolos.
> Tiene que haber una mejor manera."

### Cómo usaría nuestro producto

María conectaría TestGen AI con Jira al inicio de cada sprint.
Por cada user story asignada a QA, generaría test cases en segundos,
los revisaría y ajustaría, y luego los exportaría a Xray.
Ahorraría 10+ horas por sprint en documentación.
```

---

### Paso 2.3: Valida tus personas

**¿Qué hacer?**
Revisa que las personas sean realistas y diversas.

**Checklist de validación:**

```
[ ] ¿Las personas son diferentes entre sí? (no clones)
[ ] ¿Están basadas en usuarios reales o investigación?
[ ] ¿Los pain points son específicos y verificables?
[ ] ¿Los goals están relacionados con tu problema?
[ ] ¿Puedes nombrar personas reales que encajen en cada perfil?
```

**Archivo:** `.context/PRD/user-personas.md`

---

## 📋 PARTE 3: MVP Scope

### ¿Qué es?

Definición detallada de qué incluye y qué NO incluye el MVP.

### Paso 3.1: Define los Epics

**¿Qué hacer?**
Agrupa funcionalidades relacionadas en 3-5 Epics.

**¿Por qué?**
Los Epics organizan el trabajo y facilitan priorización.

**¿Cómo?**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA DE EPICS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EPIC = Tema grande (ej: "Autenticación")                       │
│    │                                                            │
│    ├── User Story 1 (ej: "Registro con email")                  │
│    ├── User Story 2 (ej: "Login con email")                     │
│    ├── User Story 3 (ej: "Recuperar contraseña")                │
│    └── User Story 4 (ej: "Logout")                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ejemplo de Epics:**

```markdown
## Epics del MVP

### EPIC-001: User Authentication

Gestión de cuentas de usuario (registro, login, perfil).

### EPIC-002: Project Management

Crear y gestionar proyectos de testing.

### EPIC-003: Test Case Generation

Generación automática de test cases desde user stories.

### EPIC-004: Export & Integration

Exportar tests e integrarse con herramientas externas.

### EPIC-005: Collaboration

Compartir y colaborar en tests con el equipo.
```

---

### Paso 3.2: Escribe User Stories

**¿Qué hacer?**
Descompón cada Epic en User Stories específicas.

**¿Por qué?**
Las User Stories son la unidad de trabajo. Son lo que se implementa.

**Formato estándar:**

```
Como [tipo de usuario]
Quiero [acción/funcionalidad]
Para [beneficio/razón]
```

**Ejemplo:**

```markdown
### EPIC-001: User Authentication

#### US-1.1: Registro con email

**Como** nuevo usuario
**Quiero** registrarme con mi email y contraseña
**Para** acceder a la plataforma

**Acceptance Criteria:**

- [ ] Formulario pide email y contraseña
- [ ] Email debe ser válido (formato RFC)
- [ ] Contraseña mínimo 8 caracteres
- [ ] Muestra error si email ya existe
- [ ] Envía email de verificación
- [ ] Redirige a onboarding después de verificar

**Priority:** Must Have
**Estimate:** 3 story points

---

#### US-1.2: Login con email

**Como** usuario registrado
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder a mis proyectos

**Acceptance Criteria:**

- [ ] Formulario pide email y contraseña
- [ ] Muestra error si credenciales incorrectas
- [ ] Limita intentos fallidos (max 5)
- [ ] Opción "Recordarme" (30 días)
- [ ] Redirige a dashboard después de login

**Priority:** Must Have
**Estimate:** 2 story points
```

---

### Paso 3.3: Prioriza con MoSCoW

**¿Qué hacer?**
Clasifica cada User Story según prioridad.

**¿Por qué?**
El MVP debe tener lo mínimo necesario. Priorizar evita scope creep.

**Framework MoSCoW:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIORIZACIÓN MoSCoW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MUST HAVE (M)        SHOULD HAVE (S)       COULD HAVE (C)      │
│  ─────────────        ───────────────       ──────────────      │
│  Sin esto el MVP      Importante pero       Nice-to-have        │
│  NO funciona          no crítico            para MVP            │
│                                                                 │
│  Ejemplos:            Ejemplos:             Ejemplos:           │
│  • Login/Signup       • Forgot password     • OAuth login       │
│  • Core feature       • Notifications       • Dark mode         │
│  • Basic UI           • Settings            • Export PDF        │
│                                                                 │
│                                                                 │
│  WON'T HAVE (W)                                                 │
│  ─────────────                                                  │
│  Explícitamente fuera de scope del MVP                          │
│                                                                 │
│  Ejemplos:                                                      │
│  • Mobile app                                                   │
│  • Multi-idioma                                                 │
│  • Enterprise features                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Paso 3.4: Define Out of Scope

**¿Qué hacer?**
Lista explícitamente qué NO incluye el MVP.

**¿Por qué?**
Tan importante como definir qué incluyes es definir qué excluyes.

```markdown
## Out of Scope (MVP)

Estas funcionalidades están planeadas pero NO en el MVP:

| Feature      | Razón de exclusión     | Fase planeada |
| ------------ | ---------------------- | ------------- |
| Mobile app   | Focus en web first     | v2.0          |
| SSO/SAML     | Solo para enterprise   | v1.5          |
| API pública  | Requiere más seguridad | v1.3          |
| Multi-idioma | Castellano primero     | v2.0          |
| AI training  | Dataset insuficiente   | v1.5          |
```

**Archivo:** `.context/PRD/mvp-scope.md`

---

## 📋 PARTE 4: User Journeys

### ¿Qué es?

Descripción paso a paso de cómo los usuarios interactúan con el producto.

### Paso 4.1: Identifica los journeys principales

**¿Qué hacer?**
Lista los flujos más importantes que un usuario realiza.

**¿Cómo?**

Para cada persona, pregunta: ¿Cuáles son las 2-3 tareas principales que haría?

```markdown
## User Journeys

### Journeys Principales:

1. **Onboarding Journey:** Nuevo usuario se registra y crea primer proyecto
2. **Core Journey:** Usuario genera test cases desde user story
3. **Collaboration Journey:** Usuario comparte tests con su equipo
```

---

### Paso 4.2: Mapea cada journey

**¿Qué hacer?**
Describe paso a paso el flujo completo.

**Formato:**

```markdown
### Journey: [Nombre del Journey]

**Persona:** [Nombre de la persona]
**Goal:** [Qué quiere lograr]
**Trigger:** [Qué inicia el journey]

#### Flujo Principal (Happy Path)
```

PASO 1 ──→ PASO 2 ──→ PASO 3 ──→ PASO 4 ──→ GOAL
│ │ │ │
▼ ▼ ▼ ▼
[Acción] [Acción] [Acción] [Acción] [Resultado]

```

| Paso | Acción del Usuario | Respuesta del Sistema | Pantalla   |
| ---- | ------------------ | --------------------- | ---------- |
| 1    | [Acción]           | [Respuesta]           | [Pantalla] |
| 2    | [Acción]           | [Respuesta]           | [Pantalla] |
| 3    | [Acción]           | [Respuesta]           | [Pantalla] |

#### Edge Cases

| Caso          | Qué pasa      | Cómo se maneja |
| ------------- | ------------- | -------------- |
| [Edge case 1] | [Descripción] | [Solución]     |
| [Edge case 2] | [Descripción] | [Solución]     |

#### Error Scenarios

| Error     | Causa   | Mensaje al usuario | Recovery          |
| --------- | ------- | ------------------ | ----------------- |
| [Error 1] | [Causa] | "[Mensaje]"        | [Qué puede hacer] |
| [Error 2] | [Causa] | "[Mensaje]"        | [Qué puede hacer] |
```

**Ejemplo:**

```markdown
### Journey: Generar Test Cases desde User Story

**Persona:** María García (QA Lead)
**Goal:** Generar test cases para una user story de Jira
**Trigger:** Nueva story asignada a QA en el sprint

#### Flujo Principal (Happy Path)
```

JIRA ──→ IMPORT ──→ GENERATE ──→ REVIEW ──→ EXPORT
│ │ │ │ │
▼ ▼ ▼ ▼ ▼
Story Selecciona AI genera Edita y Envía a
existe story tests aprueba Xray

```

| Paso | Acción del Usuario               | Respuesta del Sistema           | Pantalla     |
| ---- | -------------------------------- | ------------------------------- | ------------ |
| 1    | Click en "Import from Jira"      | Muestra lista de proyectos Jira | Dashboard    |
| 2    | Selecciona proyecto y story      | Carga story con AC              | Import modal |
| 3    | Click en "Generate Tests"        | Muestra loading, luego tests    | Generator    |
| 4    | Revisa tests, edita si necesario | Guarda cambios                  | Editor       |
| 5    | Click en "Export to Xray"        | Confirma export exitoso         | Export modal |

#### Edge Cases

| Caso              | Qué pasa                | Cómo se maneja                          |
| ----------------- | ----------------------- | --------------------------------------- |
| Story sin AC      | No hay de dónde generar | Mensaje: "Agrega AC a la story primero" |
| Jira desconectado | No puede importar       | Botón reconectar + instrucciones        |
| Tests ya existen  | Posible duplicación     | Pregunta: "¿Reemplazar o agregar?"      |

#### Error Scenarios

| Error            | Causa              | Mensaje al usuario                                       | Recovery        |
| ---------------- | ------------------ | -------------------------------------------------------- | --------------- |
| Jira auth expiró | Token venció       | "Reconecta tu cuenta Jira"                               | Link a settings |
| AI timeout       | Story muy larga    | "La generación tardó mucho. Intenta con story más corta" | Retry button    |
| Export failed    | Xray no disponible | "No se pudo exportar. Guardado localmente."              | Download JSON   |
```

---

### Paso 4.3: Crea diagramas visuales

**¿Qué hacer?**
Crea diagramas de flujo para los journeys principales.

**Ejemplo en ASCII:**

```
┌─────────────────────────────────────────────────────────────────┐
│              ONBOARDING JOURNEY - María García                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│   │ SIGNUP  │───→│ VERIFY  │───→│ CONNECT │───→│ FIRST   │     │
│   │         │    │ EMAIL   │    │ JIRA    │    │ PROJECT │     │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│        │              │              │              │          │
│        ▼              ▼              ▼              ▼          │
│   [Form con      [Click en      [OAuth con     [Crear         │
│    email +        email de       Atlassian]     proyecto       │
│    password]      confirm]                      de test]       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    SUCCESS STATE                        │  │
│   │  ┌─────────┐                                            │  │
│   │  │ DASHBOARD│  Usuario ve su primer proyecto creado     │  │
│   │  │  READY  │  y está listo para importar stories.       │  │
│   │  └─────────┘                                            │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Tiempo estimado: 5-10 minutos                                │
│   Drop-off points: Verify email (30%), Connect Jira (20%)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Archivo:** `.context/PRD/user-journeys.md`

---

## 📋 Checklist Final del PRD

Antes de proceder al SRS, verifica:

### Executive Summary

- [ ] Problem Statement claro y específico
- [ ] Solution con 3-5 features core
- [ ] 3-5 KPIs medibles con targets
- [ ] Target users identificados

### User Personas

- [ ] 2-3 personas detalladas
- [ ] Cada persona tiene goals y pain points
- [ ] Personas son diversas (no clones)
- [ ] Incluyen quote representativa

### MVP Scope

- [ ] 3-5 Epics definidos
- [ ] User Stories con formato correcto
- [ ] Acceptance Criteria específicos
- [ ] Priorización MoSCoW aplicada
- [ ] Out of Scope documentado

### User Journeys

- [ ] 2-3 journeys principales mapeados
- [ ] Happy path detallado paso a paso
- [ ] Edge cases identificados
- [ ] Error scenarios con recovery

---

## 📚 Estructura de Archivos Final

```
.context/PRD/
├── executive-summary.md    # Problema, solución, KPIs
├── user-personas.md        # 2-3 personas detalladas
├── mvp-scope.md           # Epics, stories, priorización
└── user-journeys.md       # Flujos de usuario
```

---

## 🎓 Recursos Adicionales

- [Writing Great User Stories](https://www.mountaingoatsoftware.com/agile/user-stories) - Mike Cohn
- [User Persona Template](https://xtensio.com/user-persona/) - Xtensio
- [Customer Journey Mapping](https://www.nngroup.com/articles/customer-journey-mapping/) - Nielsen Norman Group
- [MoSCoW Prioritization](https://www.productplan.com/glossary/moscow-prioritization/) - ProductPlan

---

## ❓ Preguntas Frecuentes

**P: ¿Cuántas User Stories debería tener el MVP?**
R: Depende, pero típicamente 15-30. Si tienes más de 50, probablemente estás incluyendo demasiado.

**P: ¿Qué tan detallados deben ser los Acceptance Criteria?**
R: Lo suficiente para que un developer pueda implementar sin preguntas y un QA pueda testear sin ambigüedad.

**P: ¿Puedo cambiar el PRD después?**
R: Sí, es un documento vivo. Pero cambios significativos deben documentarse con versión y fecha.

**P: ¿Necesito validar las personas con usuarios reales?**
R: Idealmente sí. Como mínimo, basa las personas en conversaciones/observaciones reales.

---

**Siguiente manual:** `srs.MANUAL.md` - Software Requirements Specification
