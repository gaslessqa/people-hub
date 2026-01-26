# Backend Setup - People Hub

Este documento describe la configuración del backend de People Hub, incluyendo la base de datos, autenticación y API layer.

## Resumen

| Aspecto        | Valor                          |
| -------------- | ------------------------------ |
| **Database**   | PostgreSQL 17.6 (Supabase)     |
| **Project ID** | `ylkwhejmcymlowcqgibn`         |
| **Region**     | eu-west-2                      |
| **Auth**       | Supabase Auth (Email/Password) |
| **Client**     | @supabase/ssr v0.8.0           |

---

## Database Schema

### Tablas (11 total)

| Tabla                | Propósito                                           | RLS |
| -------------------- | --------------------------------------------------- | --- |
| `profiles`           | Usuarios del sistema con roles RBAC                 | ✅  |
| `people`             | Registro central de personas (candidatos/empleados) | ✅  |
| `positions`          | Vacantes y posiciones abiertas                      | ✅  |
| `status_definitions` | Estados configurables por tipo                      | ✅  |
| `person_statuses`    | Historial de estados de personas                    | ✅  |
| `person_positions`   | Asignación de candidatos a vacantes (pipeline)      | ✅  |
| `feedback`           | Evaluaciones de entrevistas                         | ✅  |
| `notes`              | Notas y comentarios sobre personas                  | ✅  |
| `activity_log`       | Timeline de actividades                             | ✅  |
| `notification_log`   | Historial de notificaciones                         | ✅  |
| `user_preferences`   | Configuraciones de usuario                          | ✅  |

### ENUMs

| Enum              | Valores                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `user_role`       | recruiter, manager, hr_admin, super_admin                          |
| `status_type`     | candidate, employee, external                                      |
| `employment_type` | full_time, part_time, contract, internship                         |
| `position_status` | open, on_hold, closed                                              |
| `close_reason`    | filled, cancelled, on_hold                                         |
| `pipeline_stage`  | applied, screening, interviewing, finalist, offer, hired, rejected |
| `feedback_type`   | technical, cultural, final, other                                  |
| `recommendation`  | strong_yes, yes, maybe, no, strong_no                              |
| `person_source`   | linkedin, referral, job_board, direct, other                       |
| `priority`        | low, medium, high, urgent                                          |

---

## Roles y Permisos (RBAC)

### Matriz de Permisos

| Acción             | Recruiter | Manager              | HR Admin | Super Admin |
| ------------------ | --------- | -------------------- | -------- | ----------- |
| Ver personas       | ✅ Todas  | ⚠️ Solo sus vacantes | ✅ Todas | ✅ Todas    |
| Crear personas     | ✅        | ❌                   | ✅       | ✅          |
| Editar personas    | ✅        | ❌                   | ✅       | ✅          |
| Eliminar personas  | ❌        | ❌                   | ❌       | ✅          |
| Ver vacantes       | ✅        | ✅                   | ✅       | ✅          |
| Crear vacantes     | ✅        | ❌                   | ✅       | ✅          |
| Dar feedback       | ❌        | ✅                   | ✅       | ✅          |
| Ver dashboard      | ❌        | ❌                   | ✅       | ✅          |
| Gestionar usuarios | ❌        | ❌                   | ❌       | ✅          |

### Funciones Helper RLS

```sql
-- Obtener profile_id del usuario autenticado
get_current_user_profile_id() -> UUID

-- Obtener rol del usuario autenticado
get_current_user_role() -> user_role

-- Verificar si es admin (hr_admin o super_admin)
is_admin() -> BOOLEAN

-- Verificar si es super_admin
is_super_admin() -> BOOLEAN

-- Verificar si es manager de una vacante específica
is_manager_of_position(pos_id UUID) -> BOOLEAN
```

---

## Autenticación

### Configuración

- **Provider:** Email/Password
- **Session:** JWT con refresh automático
- **Middleware:** Protección de rutas en `src/middleware.ts`

### Usuarios de Prueba (Seed Data)

| Email                   | Password      | Rol         |
| ----------------------- | ------------- | ----------- |
| admin@peoplehub.dev     | Admin123!     | super_admin |
| hr@peoplehub.dev        | HrAdmin123!   | hr_admin    |
| recruiter@peoplehub.dev | Recruiter123! | recruiter   |
| manager@peoplehub.dev   | Manager123!   | manager     |

### Rutas Protegidas

```typescript
const protectedRoutes = ['/dashboard', '/people', '/positions', '/settings'];
```

---

## API Layer

### Archivos de Configuración

```
src/
├── lib/
│   ├── config.ts              # Variables de entorno centralizadas
│   └── supabase/
│       ├── client.ts          # Cliente para componentes cliente
│       ├── server.ts          # Cliente para Server Components
│       └── admin.ts           # Cliente admin (bypass RLS)
├── types/
│   └── supabase.ts            # Tipos auto-generados
└── middleware.ts              # Protección de rutas
```

### Uso del Cliente

**En Client Components:**

```tsx
'use client';
import { createClient } from '@/lib/supabase/client';

export function MyComponent() {
  const supabase = createClient();

  // Queries
  const { data } = await supabase.from('people').select('*');
}
```

**En Server Components:**

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();

  const { data } = await supabase.from('people').select('*');

  return <div>{JSON.stringify(data)}</div>;
}
```

**Admin (bypass RLS):**

```tsx
// SOLO en servidor
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();
// Esto bypasses RLS - usar con cuidado
```

---

## Variables de Entorno

### Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://ylkwhejmcymlowcqgibn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # Solo servidor
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Obtener Credenciales

1. Ir a: https://supabase.com/dashboard/project/ylkwhejmcymlowcqgibn/settings/api
2. Copiar: Project URL, anon public key, service_role key
3. Pegar en `.env`

---

## Seed Data

### Datos Incluidos

| Entidad              | Cantidad |
| -------------------- | -------- |
| Profiles (usuarios)  | 4        |
| Status Definitions   | 15       |
| People (candidatos)  | 15       |
| Positions (vacantes) | 5        |
| Person Positions     | 13       |
| Person Statuses      | 15       |
| Feedback             | 8        |
| Notes                | 12       |
| Activity Log         | 18       |

### Vacantes de Ejemplo

1. **Senior Frontend Developer** (open, high) - 4 candidatos
2. **Product Manager** (open, urgent) - 3 candidatos
3. **UX Designer** (open, medium) - 3 candidatos
4. **Data Analyst** (on_hold) - 2 candidatos
5. **DevOps Engineer** (closed, filled) - 1 contratado

---

## Comandos Útiles

### Regenerar Tipos TypeScript

```bash
npx supabase gen types typescript --project-id ylkwhejmcymlowcqgibn > src/types/supabase.ts
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
bun run dev

# Type check
bun run typecheck

# Build
bun run build
```

### Supabase CLI

```bash
# Login
supabase login

# Ver estado del proyecto
supabase projects list

# Ver migraciones
supabase migration list --project-ref ylkwhejmcymlowcqgibn
```

---

## Troubleshooting

### Error: Missing environment variables

```
Error: NEXT_PUBLIC_SUPABASE_URL is required
```

**Solución:** Verificar que `.env` existe y tiene las credenciales correctas.

### Error: cookies() expects to be called within a request scope

```
Error: cookies() expects to be called within a request scope
```

**Solución:** En Next.js 15+, `cookies()` es async. Usar `await cookies()`.

### Error: RLS policy violation

```
Error: new row violates row-level security policy
```

**Solución:** Verificar que el usuario tiene los permisos necesarios según su rol.

---

## Próximos Pasos

1. **Implementar Frontend:**
   - Crear páginas de autenticación (login, register)
   - Crear dashboard principal
   - Crear vistas de personas y vacantes

2. **Conectar UI a DB:**
   - Reemplazar mock data con queries reales
   - Implementar formularios con React Hook Form + Zod

3. **Testing:**
   - Tests de integración para RLS policies
   - Tests E2E con Playwright

---

## Referencias

- [Supabase Dashboard](https://supabase.com/dashboard/project/ylkwhejmcymlowcqgibn)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [@supabase/ssr Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
