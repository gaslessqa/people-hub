# Architecture Specifications - People Hub

## 1. System Architecture

### C4 Level 1: System Context

```mermaid
C4Context
    title System Context Diagram - People Hub

    Person(recruiter, "Recruiter", "Gestiona candidatos y vacantes")
    Person(manager, "Manager", "Da feedback sobre candidatos")
    Person(hr_admin, "HR Admin", "Supervisa y configura")
    Person(super_admin, "Super Admin", "Administra sistema")

    System(people_hub, "People Hub", "Sistema de gestion de RRHH")

    System_Ext(supabase_auth, "Supabase Auth", "Autenticacion y usuarios")
    System_Ext(supabase_db, "Supabase DB", "PostgreSQL database")
    System_Ext(email_service, "Email Service", "Notificaciones via Supabase")

    Rel(recruiter, people_hub, "Usa", "HTTPS")
    Rel(manager, people_hub, "Usa", "HTTPS")
    Rel(hr_admin, people_hub, "Usa", "HTTPS")
    Rel(super_admin, people_hub, "Usa", "HTTPS")

    Rel(people_hub, supabase_auth, "Autentica via", "API")
    Rel(people_hub, supabase_db, "Lee/Escribe", "API")
    Rel(people_hub, email_service, "Envia emails", "API")
```

### C4 Level 2: Container Diagram

```mermaid
C4Container
    title Container Diagram - People Hub

    Person(user, "Usuario", "Recruiter/Manager/Admin")

    Container_Boundary(c1, "People Hub Application") {
        Container(spa, "Web Application", "Next.js 15", "App Router, React Server Components")
        Container(api, "API Routes", "Next.js API", "Serverless functions")
        Container(middleware, "Auth Middleware", "Next.js Middleware", "Validacion de sesion y permisos")
    }

    Container_Boundary(c2, "Supabase Platform") {
        ContainerDb(db, "PostgreSQL", "Supabase DB", "Datos de personas, vacantes, feedback")
        Container(auth, "Auth Service", "Supabase Auth", "JWT, sesiones")
        Container(storage, "Storage", "Supabase Storage", "Archivos futuros")
        Container(realtime, "Realtime", "Supabase Realtime", "Subscripciones futuras")
    }

    Container_Ext(vercel, "Vercel", "Edge Network", "Hosting, CDN, Serverless")
    Container_Ext(github, "GitHub Actions", "CI/CD", "Build, test, deploy")

    Rel(user, spa, "Accede via", "HTTPS")
    Rel(spa, api, "Llama", "HTTP/JSON")
    Rel(api, middleware, "Pasa por")
    Rel(middleware, auth, "Valida token")
    Rel(api, db, "Queries", "Supabase Client")
    Rel(spa, vercel, "Hosted en")
    Rel(github, vercel, "Deploys to")
```

### Component Diagram (Simplified)

```mermaid
flowchart TB
    subgraph Client["Browser"]
        UI[React Components]
        Hooks[Custom Hooks]
        State[React Query / Zustand]
    end

    subgraph Server["Next.js Server"]
        Pages[App Router Pages]
        ServerComp[Server Components]
        APIRoutes[API Routes]
        Middleware[Auth Middleware]
    end

    subgraph Supabase["Supabase Backend"]
        Auth[Auth Service]
        DB[(PostgreSQL)]
        RLS[Row Level Security]
        Edge[Edge Functions]
    end

    UI --> Hooks
    Hooks --> State
    State --> APIRoutes

    Pages --> ServerComp
    ServerComp --> DB

    APIRoutes --> Middleware
    Middleware --> Auth
    APIRoutes --> DB

    DB --> RLS
```

---

## 2. Database Design

### Entity-Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ PEOPLE : creates
    PROFILES ||--o{ POSITIONS : manages
    PROFILES ||--o{ FEEDBACK : gives
    PROFILES ||--o{ NOTES : writes

    PEOPLE ||--o{ PERSON_STATUSES : has
    PEOPLE ||--o{ PERSON_POSITIONS : assigned_to
    PEOPLE ||--o{ FEEDBACK : receives
    PEOPLE ||--o{ NOTES : has
    PEOPLE ||--o{ ACTIVITY_LOG : generates

    POSITIONS ||--o{ PERSON_POSITIONS : contains
    POSITIONS ||--o{ FEEDBACK : relates_to
    POSITIONS }o--|| PROFILES : hiring_manager
    POSITIONS }o--|| PROFILES : recruiter

    STATUS_DEFINITIONS ||--o{ PERSON_STATUSES : defines

    PROFILES {
        uuid id PK
        uuid auth_user_id FK
        string full_name
        string email
        enum role
        boolean is_active
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }

    PEOPLE {
        uuid id PK
        string first_name
        string last_name
        string email
        string phone
        string linkedin_url
        string current_company
        string current_position
        string location
        enum source
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    PERSON_STATUSES {
        uuid id PK
        uuid person_id FK
        uuid status_definition_id FK
        string comment
        uuid changed_by FK
        timestamp created_at
    }

    STATUS_DEFINITIONS {
        uuid id PK
        enum status_type
        string status_value
        string label
        string color
        integer order_index
        boolean is_active
        timestamp created_at
    }

    POSITIONS {
        uuid id PK
        string title
        string department
        text description
        text requirements
        string location
        enum employment_type
        integer salary_min
        integer salary_max
        string salary_currency
        uuid hiring_manager_id FK
        uuid recruiter_id FK
        enum priority
        enum status
        enum close_reason
        uuid hired_person_id FK
        timestamp created_at
        timestamp updated_at
        timestamp closed_at
    }

    PERSON_POSITIONS {
        uuid id PK
        uuid person_id FK
        uuid position_id FK
        enum stage
        timestamp assigned_at
        timestamp updated_at
    }

    FEEDBACK {
        uuid id PK
        uuid person_id FK
        uuid position_id FK
        uuid given_by FK
        enum feedback_type
        integer rating
        enum recommendation
        text strengths
        text concerns
        text comments
        boolean is_confidential
        timestamp created_at
    }

    NOTES {
        uuid id PK
        uuid person_id FK
        uuid created_by FK
        text content
        boolean is_private
        timestamp created_at
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid person_id FK
        uuid performed_by FK
        enum action_type
        jsonb old_value
        jsonb new_value
        text description
        timestamp created_at
    }

    NOTIFICATION_LOG {
        uuid id PK
        uuid user_id FK
        enum notification_type
        jsonb payload
        boolean is_sent
        timestamp sent_at
        timestamp created_at
    }

    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        jsonb notification_settings
        jsonb ui_settings
        timestamp updated_at
    }
```

### Schema Notes

**IMPORTANTE:** Este ERD es una guia conceptual. El schema real debe obtenerse via Supabase MCP para asegurar sincronizacion con la base de datos en vivo.

**Indices recomendados:**
- `people(email)` - Busqueda de duplicados
- `people(first_name, last_name)` - Busqueda por nombre
- `person_statuses(person_id, created_at)` - Estado actual
- `person_positions(position_id, stage)` - Pipeline
- `activity_log(person_id, created_at)` - Timeline
- `feedback(person_id, created_at)` - Feedback reciente

**Enums:**
```sql
CREATE TYPE user_role AS ENUM ('recruiter', 'manager', 'hr_admin', 'super_admin');
CREATE TYPE status_type AS ENUM ('candidate', 'employee', 'external');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE position_status AS ENUM ('open', 'on_hold', 'closed');
CREATE TYPE close_reason AS ENUM ('filled', 'cancelled', 'on_hold');
CREATE TYPE pipeline_stage AS ENUM ('applied', 'screening', 'interviewing', 'finalist', 'offer', 'hired', 'rejected');
CREATE TYPE feedback_type AS ENUM ('technical', 'cultural', 'final', 'other');
CREATE TYPE recommendation AS ENUM ('strong_yes', 'yes', 'maybe', 'no', 'strong_no');
CREATE TYPE person_source AS ENUM ('linkedin', 'referral', 'job_board', 'direct', 'other');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

---

## 3. Tech Stack Justification

### Frontend: Next.js 15 (App Router)

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + React Server Components | Mejor performance, menos JS en cliente |
| + File-based routing | DX mejorada, estructura clara |
| + Full-stack framework | API routes integrados, sin backend separado |
| + Vercel optimizado | Deploy zero-config, edge functions |
| + Comunidad activa | Documentacion extensa, soporte |
| **Trade-offs** | |
| - Curva App Router | Diferente a Pages Router, learning curve |
| - Server Components limitations | No hooks, no browser APIs directamente |
| - Frequent updates | Breaking changes entre versiones |

### UI Library: shadcn/ui + Tailwind CSS

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + Componentes accesibles | Radix UI primitives, ARIA built-in |
| + Customizable | Copy-paste, no lock-in |
| + Tailwind integration | Consistencia, design tokens |
| + No bundle size | Solo lo que usas |
| **Trade-offs** | |
| - Mas setup inicial | Configurar cada componente |
| - Consistencia manual | No theme global automatico |

### Backend: Supabase

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + PostgreSQL | Base de datos relacional robusta |
| + Auth integrado | JWT, OAuth, MFA ready |
| + Row Level Security | Permisos a nivel de DB |
| + Real-time ready | Subscripciones para v2 |
| + Free tier generoso | Suficiente para MVP |
| + API auto-generada | PostgREST, menos codigo backend |
| **Trade-offs** | |
| - Vendor lock-in | Migracion costosa a otro provider |
| - RLS complexity | Curva de aprendizaje |
| - Rate limits | Limites en free tier |

### State Management: React Query + Zustand

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + React Query | Server state, caching, refetch automatico |
| + Zustand | Client state simple, no boilerplate |
| + Separation of concerns | Server vs client state claros |
| **Trade-offs** | |
| - Dos librerias | Overhead de aprender ambas |
| - Overkill para MVP simple | Podria ser solo useState/useContext |

### Form Handling: React Hook Form + Zod

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + React Hook Form | Performance, uncontrolled inputs |
| + Zod | Type-safe validation, inference |
| + Integration | RHF resolver para Zod |
| **Trade-offs** | |
| - Zod bundle size | ~12kb minified |
| - Learning curve | Schemas pueden ser complejos |

### Hosting: Vercel

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + Next.js creators | Optimizaciones de primera clase |
| + Edge network | CDN global, bajo latency |
| + Serverless functions | Auto-scaling |
| + Preview deployments | PR previews automaticos |
| + Analytics built-in | Core Web Vitals |
| **Trade-offs** | |
| - Pricing at scale | Puede ser costoso con alto trafico |
| - Cold starts | Serverless latency inicial |
| - Vendor lock-in | Algunas features Vercel-only |

### CI/CD: GitHub Actions

| Aspecto | Detalle |
|---------|---------|
| **Por que elegido** | |
| + Integracion GitHub | Mismo lugar que codigo |
| + Free tier | 2000 min/mes gratis |
| + Marketplace | Actions pre-hechos |
| **Trade-offs** | |
| - YAML verbose | Configuracion puede ser larga |
| - Debugging dificil | Logs no tan claros |

---

## 4. Data Flow

### User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Next as Next.js
    participant API as API Route
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    User->>Browser: Fill registration form
    Browser->>Browser: Client-side validation (Zod)
    Browser->>API: POST /api/auth/register
    API->>API: Server-side validation (Zod)
    API->>Auth: signUp(email, password)
    Auth->>Auth: Create auth.users record
    Auth->>Auth: Generate verification token
    Auth-->>API: User created + token
    API->>DB: INSERT INTO profiles
    DB-->>API: Profile created
    API->>Auth: Send verification email
    API-->>Browser: 201 Created
    Browser-->>User: "Check your email"
```

### Create Person Flow

```mermaid
sequenceDiagram
    actor Recruiter
    participant Browser
    participant API as API Route
    participant MW as Auth Middleware
    participant DB as PostgreSQL

    Recruiter->>Browser: Fill person form
    Browser->>Browser: Validate (Zod)
    Browser->>API: POST /api/people
    API->>MW: Validate JWT
    MW->>MW: Check role permissions
    MW-->>API: Authorized
    API->>DB: Check duplicate (email)
    DB-->>API: No duplicate / Warning
    API->>DB: INSERT INTO people
    DB-->>API: Person created
    API->>DB: INSERT INTO activity_log
    API-->>Browser: 201 Created + person
    Browser-->>Recruiter: Show success
```

### Give Feedback Flow

```mermaid
sequenceDiagram
    actor Manager
    participant Browser
    participant API as API Route
    participant DB as PostgreSQL
    participant Email as Email Service

    Manager->>Browser: Fill feedback form
    Browser->>API: POST /api/feedback
    API->>API: Validate permissions
    API->>DB: Check person in position
    DB-->>API: Valid assignment
    API->>DB: INSERT INTO feedback
    API->>DB: INSERT INTO activity_log
    DB-->>API: Feedback saved
    API->>DB: Get recruiter of position
    DB-->>API: Recruiter details
    API->>Email: Send notification
    API-->>Browser: 201 Created
    Browser-->>Manager: "Feedback enviado"
```

### Search Persons Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as API Route
    participant DB as PostgreSQL

    User->>Browser: Type search query
    Browser->>Browser: Debounce 300ms
    Browser->>API: GET /api/people/search?q=...
    API->>API: Sanitize query
    API->>DB: Full-text search + RLS
    Note over DB: Applies user permissions via RLS
    DB-->>API: Matching results
    API->>API: Format response
    API-->>Browser: Results + metadata
    Browser-->>User: Show results
```

---

## 5. Security Architecture

### Authentication Flow

```mermaid
flowchart TB
    subgraph Client
        Login[Login Form]
        Token[Access Token<br/>Memory only]
        Refresh[Refresh Token<br/>HttpOnly Cookie]
    end

    subgraph Server
        Middleware[Auth Middleware]
        API[API Routes]
    end

    subgraph Supabase
        Auth[Supabase Auth]
        DB[(Database)]
    end

    Login -->|credentials| Auth
    Auth -->|tokens| Login
    Login -->|store| Token
    Login -->|set cookie| Refresh

    Token -->|header| Middleware
    Middleware -->|verify| Auth
    Auth -->|valid| Middleware
    Middleware -->|proceed| API

    Refresh -->|auto-refresh| Auth
    Auth -->|new tokens| Client
```

### RBAC Implementation

```mermaid
flowchart LR
    subgraph Roles
        R[Recruiter]
        M[Manager]
        H[HR Admin]
        S[Super Admin]
    end

    subgraph Permissions
        P1[Create Person]
        P2[Edit Person]
        P3[Give Feedback]
        P4[View Dashboard]
        P5[Manage Users]
        P6[Configure System]
    end

    R --> P1
    R --> P2
    M --> P3
    H --> P1
    H --> P2
    H --> P4
    H --> P6
    S --> P1
    S --> P2
    S --> P3
    S --> P4
    S --> P5
    S --> P6
```

### Row Level Security (RLS)

```sql
-- Example RLS policies (conceptual)

-- Recruiters can see all people
CREATE POLICY "Recruiters can view all people"
ON people FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('recruiter', 'hr_admin', 'super_admin')
  )
);

-- Managers can only see people in their positions
CREATE POLICY "Managers can view assigned candidates"
ON people FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid()
    AND p.role = 'manager'
    AND EXISTS (
      SELECT 1 FROM person_positions pp
      JOIN positions pos ON pp.position_id = pos.id
      WHERE pp.person_id = people.id
      AND pos.hiring_manager_id = p.id
    )
  )
);

-- Only recruiters/admins can insert people
CREATE POLICY "Recruiters can create people"
ON people FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('recruiter', 'hr_admin', 'super_admin')
  )
);
```

### Data Protection

| Layer | Protection |
|-------|------------|
| **Transport** | TLS 1.3 (Vercel enforced) |
| **Storage** | AES-256 at rest (Supabase) |
| **Tokens** | JWT signed with RS256 |
| **Passwords** | bcrypt hashing (Supabase Auth) |
| **Queries** | Prepared statements (SQL injection prevention) |
| **Output** | React auto-escaping (XSS prevention) |

---

## 6. Folder Structure

```
people-hub/
├── .context/                    # Context Engineering docs
│   ├── PRD/                     # Product Requirements
│   ├── SRS/                     # Software Requirements
│   └── guidelines/              # Development guidelines
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/         # Protected routes group
│   │   │   ├── people/
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── positions/
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   │
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/
│   │   │   ├── people/
│   │   │   ├── positions/
│   │   │   ├── feedback/
│   │   │   └── health/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   └── features/            # Feature-specific components
│   │       ├── people/
│   │       ├── positions/
│   │       └── feedback/
│   │
│   ├── lib/
│   │   ├── supabase/            # Supabase client & utils
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Auth middleware
│   │   ├── validations/         # Zod schemas
│   │   ├── utils/               # Helper functions
│   │   └── constants.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-people.ts
│   │   ├── use-positions.ts
│   │   └── use-auth.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── database.ts          # Generated from Supabase
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
├── supabase/
│   ├── migrations/              # SQL migrations
│   └── seed.sql                 # Test data
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 7. Deployment Architecture

```mermaid
flowchart TB
    subgraph GitHub
        Code[Source Code]
        Actions[GitHub Actions]
    end

    subgraph Vercel["Vercel Platform"]
        Preview[Preview Deploy<br/>PR branches]
        Staging[Staging<br/>develop branch]
        Production[Production<br/>main branch]
    end

    subgraph Supabase["Supabase"]
        DBStaging[(Staging DB)]
        DBProd[(Production DB)]
    end

    Code -->|push| Actions
    Actions -->|lint + test| Actions
    Actions -->|deploy| Preview
    Actions -->|deploy| Staging
    Actions -->|deploy| Production

    Preview -->|connect| DBStaging
    Staging -->|connect| DBStaging
    Production -->|connect| DBProd
```

### Environment Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | localhost | staging.supabase.co | prod.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev-key | staging-key | prod-key |
| `SUPABASE_SERVICE_ROLE_KEY` | dev-key | staging-key | prod-key |
| `NEXT_PUBLIC_APP_URL` | localhost:3000 | staging.app.com | app.com |

---

## Appendix: Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Database | PostgreSQL, MySQL, MongoDB | PostgreSQL via Supabase | Relational model fits RRHH domain, RLS for security |
| Auth | Custom, Auth0, Supabase Auth | Supabase Auth | Integrated with DB, free tier, JWT built-in |
| Hosting | AWS, GCP, Vercel | Vercel | Best Next.js integration, preview deploys |
| State | Redux, Zustand, Context | React Query + Zustand | Server/client state separation |
| Styling | CSS Modules, Styled, Tailwind | Tailwind + shadcn | Performance, consistency, accessibility |
| Testing | Jest, Vitest, Playwright | Vitest + Playwright | Speed, ESM support, E2E coverage |

---

*Documento generado para: People Hub MVP*
*Version: 1.0*
*Ultima actualizacion: Fase 2 - Architecture*
