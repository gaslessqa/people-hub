# API Documentation - People Hub

Este documento describe los endpoints y operaciones de la API de People Hub usando Supabase.

## Introducción

People Hub usa Supabase como backend, lo que proporciona:

- **REST API** auto-generada para todas las tablas
- **Row Level Security (RLS)** para control de acceso
- **Realtime subscriptions** para actualizaciones en vivo
- **TypeScript types** auto-generados

---

## Autenticación

### Headers Requeridos

```http
Authorization: Bearer <access_token>
apikey: <anon_key>
```

### Obtener Token

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// data.session.access_token contiene el JWT
```

---

## Endpoints por Entidad

### People (Personas)

#### Listar Personas

```typescript
const { data, error } = await supabase
  .from('people')
  .select('*')
  .order('created_at', { ascending: false });
```

**Con relaciones:**

```typescript
const { data } = await supabase.from('people').select(`
    *,
    created_by:profiles!people_created_by_fkey(full_name, email),
    person_statuses(
      status_definition:status_definitions(label, color)
    ),
    person_positions(
      position:positions(title, status),
      stage
    )
  `);
```

#### Buscar Personas

```typescript
const { data } = await supabase
  .from('people')
  .select('*')
  .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
```

#### Crear Persona

```typescript
const { data, error } = await supabase
  .from('people')
  .insert({
    first_name: 'Juan',
    last_name: 'García',
    email: 'juan@example.com',
    phone: '+34 612 345 678',
    source: 'linkedin',
    created_by: currentUserProfileId,
  })
  .select()
  .single();
```

#### Actualizar Persona

```typescript
const { data, error } = await supabase
  .from('people')
  .update({
    current_company: 'Nueva Empresa',
    current_position: 'Senior Developer',
  })
  .eq('id', personId)
  .select()
  .single();
```

---

### Positions (Vacantes)

#### Listar Vacantes

```typescript
const { data } = await supabase
  .from('positions')
  .select(
    `
    *,
    hiring_manager:profiles!positions_hiring_manager_id_fkey(full_name),
    recruiter:profiles!positions_recruiter_id_fkey(full_name)
  `
  )
  .eq('status', 'open')
  .order('priority', { ascending: false });
```

#### Ver Pipeline de una Vacante

```typescript
const { data } = await supabase
  .from('person_positions')
  .select(
    `
    *,
    person:people(
      id, first_name, last_name, email, current_company
    )
  `
  )
  .eq('position_id', positionId)
  .order('stage');
```

#### Crear Vacante

```typescript
const { data, error } = await supabase
  .from('positions')
  .insert({
    title: 'Frontend Developer',
    department: 'Engineering',
    description: 'Descripción del puesto...',
    employment_type: 'full_time',
    salary_min: 40000,
    salary_max: 55000,
    salary_currency: 'EUR',
    hiring_manager_id: managerId,
    recruiter_id: recruiterId,
    priority: 'high',
  })
  .select()
  .single();
```

---

### Person Positions (Pipeline)

#### Asignar Candidato a Vacante

```typescript
const { data, error } = await supabase
  .from('person_positions')
  .insert({
    person_id: personId,
    position_id: positionId,
    stage: 'applied',
  })
  .select()
  .single();
```

#### Cambiar Etapa del Pipeline

```typescript
const { data, error } = await supabase
  .from('person_positions')
  .update({ stage: 'interviewing' })
  .eq('person_id', personId)
  .eq('position_id', positionId)
  .select()
  .single();
```

---

### Feedback (Evaluaciones)

#### Listar Feedback de una Persona

```typescript
const { data } = await supabase
  .from('feedback')
  .select(
    `
    *,
    given_by:profiles(full_name),
    position:positions(title)
  `
  )
  .eq('person_id', personId)
  .order('created_at', { ascending: false });
```

#### Crear Feedback

```typescript
const { data, error } = await supabase
  .from('feedback')
  .insert({
    person_id: personId,
    position_id: positionId,
    given_by: currentUserProfileId,
    feedback_type: 'technical',
    rating: 4,
    recommendation: 'yes',
    strengths: 'Excelente conocimiento técnico...',
    concerns: 'Poca experiencia en testing...',
    comments: 'Recomiendo avanzar a siguiente ronda.',
    is_confidential: false,
  })
  .select()
  .single();
```

---

### Notes (Notas)

#### Listar Notas de una Persona

```typescript
const { data } = await supabase
  .from('notes')
  .select(
    `
    *,
    created_by:profiles(full_name)
  `
  )
  .eq('person_id', personId)
  .order('created_at', { ascending: false });
```

#### Crear Nota

```typescript
const { data, error } = await supabase
  .from('notes')
  .insert({
    person_id: personId,
    created_by: currentUserProfileId,
    content: 'Primera llamada telefónica muy positiva.',
    is_private: false,
  })
  .select()
  .single();
```

---

### Activity Log (Timeline)

#### Ver Timeline de una Persona

```typescript
const { data } = await supabase
  .from('activity_log')
  .select(
    `
    *,
    performed_by:profiles(full_name)
  `
  )
  .eq('person_id', personId)
  .order('created_at', { ascending: false })
  .limit(50);
```

#### Registrar Actividad

```typescript
const { error } = await supabase.from('activity_log').insert({
  person_id: personId,
  performed_by: currentUserProfileId,
  action_type: 'stage_changed',
  old_value: { stage: 'screening' },
  new_value: { stage: 'interviewing' },
  description: 'Candidato avanza a entrevistas',
});
```

---

### Status Definitions (Estados)

#### Listar Estados por Tipo

```typescript
const { data } = await supabase
  .from('status_definitions')
  .select('*')
  .eq('status_type', 'candidate')
  .eq('is_active', true)
  .order('order_index');
```

---

### Profiles (Usuarios)

#### Obtener Perfil Actual

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('auth_user_id', user.id)
  .single();
```

#### Listar Usuarios (Solo Admin)

```typescript
const { data } = await supabase.from('profiles').select('*').order('full_name');
```

---

## Realtime Subscriptions

### Escuchar Cambios en Personas

```typescript
const channel = supabase
  .channel('people-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, payload => {
    console.log('Change received:', payload);
  })
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Escuchar Nuevo Feedback

```typescript
const channel = supabase
  .channel('new-feedback')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, payload => {
    // Notificar al usuario
  })
  .subscribe();
```

---

## Errores Comunes

### RLS Policy Violation

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```

**Causa:** El usuario no tiene permisos para la operación.
**Solución:** Verificar el rol del usuario y las políticas RLS.

### Foreign Key Violation

```json
{
  "code": "23503",
  "message": "insert or update on table \"x\" violates foreign key constraint"
}
```

**Causa:** El ID referenciado no existe.
**Solución:** Verificar que el registro relacionado existe.

### Unique Violation

```json
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint"
}
```

**Causa:** Ya existe un registro con ese valor único.
**Solución:** Usar `upsert` o verificar duplicados antes.

---

## Buenas Prácticas

1. **Usar el cliente TypeScript:** Proporciona autocompletado y validación de tipos.

2. **Siempre manejar errores:**

   ```typescript
   const { data, error } = await supabase.from('people').select('*');
   if (error) {
     console.error('Error:', error.message);
     return;
   }
   ```

3. **Usar `.single()` para un solo registro:**

   ```typescript
   const { data } = await supabase.from('people').select('*').eq('id', id).single(); // Retorna objeto en lugar de array
   ```

4. **Limitar resultados:**

   ```typescript
   const { data } = await supabase.from('activity_log').select('*').limit(100);
   ```

5. **Usar transacciones con RPC:**
   ```typescript
   const { data, error } = await supabase.rpc('my_transaction_function', {
     param1: value1,
   });
   ```

---

## Referencias

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgREST Query Syntax](https://postgrest.org/en/stable/api.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
