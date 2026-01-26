# Executive Summary - People Hub

## Problem Statement

### Pain Point Critico

Los equipos de RRHH en startups y PyMEs operan con herramientas fragmentadas: spreadsheets para tracking de candidatos, emails dispersos para comunicacion con managers, y sistemas separados para gestion de empleados. **No existe una "fuente unica de verdad"** sobre cada persona y su relacion con la empresa.

### Impacto en el Usuario Actual

- **Contactos duplicados:** Recruiters contactan personas ya rechazadas o empleados actuales de otras areas
- **Perdida de contexto:** Cuando un candidato se convierte en empleado, las notas de entrevistas, feedback y expectativas salariales se pierden
- **Comunicacion opaca:** El feedback de managers vive en emails/Slack, no hay visibilidad centralizada del estado real de candidatos
- **Friccion operativa:** Tiempo perdido buscando informacion en multiples lugares

---

## Solution Overview

### Que Construiremos en el MVP

People Hub es una aplicacion web que unifica la gestion de personas en RRHH bajo un modelo simple: **una persona = un registro**.

**Features Core:**

1. **Registro unico de personas** - Candidatos, empleados y ex-empleados en un solo modelo con estados flexibles
2. **Busqueda global** - Verificar si alguien ya existe antes de contactar (evita duplicados)
3. **Timeline de historial** - Todas las interacciones, estados y transiciones visibles en un solo lugar
4. **Feedback estructurado** - Managers pueden dejar feedback visible para recruiters en cada candidato
5. **Dashboard de KPIs** - Metricas clave para HR Admins (vacantes abiertas, tiempo promedio de contratacion, etc.)

### Como Resuelve el Problema

| Problema | Solucion People Hub |
|----------|---------------------|
| Contactos duplicados | Busqueda obligatoria antes de crear nuevo registro |
| Perdida de contexto | Historial persiste en transiciones de estado |
| Feedback disperso | Panel de feedback por persona, visible para todos los roles |
| Multiples herramientas | Una sola aplicacion para todo el ciclo de vida |

---

## Success Metrics

### KPIs del MVP (3-6 meses post-lanzamiento)

| Categoria | Metrica | Target |
|-----------|---------|--------|
| **Adopcion** | % de vacantes gestionadas en People Hub vs spreadsheets | > 80% |
| **Adopcion** | Usuarios activos semanales (recruiters + managers) | > 5 usuarios |
| **Engagement** | Feedback registrado por candidato en etapa final | > 90% |
| **Engagement** | Busquedas realizadas antes de crear nuevo contacto | > 95% |
| **Negocio** | Reduccion de contactos duplicados/indebidos | -80% vs baseline |

### Metricas de Calidad

| Metrica | Target |
|---------|--------|
| Tiempo para encontrar historial de una persona | < 10 segundos |
| Tiempo de onboarding de nuevo usuario | < 15 minutos |
| Errores reportados por usuario/semana | < 1 |

---

## Target Users

### Persona 1: Recruiter Operativo

**Perfil:** Profesional de RRHH que gestiona el pipeline de candidatos diariamente

**Pain point principal:** "Paso mas tiempo buscando informacion en emails y spreadsheets que haciendo recruiting"

**Uso esperado:** Diario, 2-4 horas en la plataforma

---

### Persona 2: Manager Tecnico

**Perfil:** Lider de equipo que participa en entrevistas y da feedback sobre candidatos

**Pain point principal:** "El recruiter me pregunta cosas que ya respondi por email hace 2 semanas"

**Uso esperado:** Puntual, 15-30 min cuando hay candidatos en su pipeline

---

### Persona 3: HR Admin

**Perfil:** Responsable del area de RRHH, supervisa procesos y define politicas

**Pain point principal:** "No tengo visibilidad real del estado de las busquedas sin pedir reportes manuales"

**Uso esperado:** Semanal, revision de dashboards y KPIs

---

### Persona 4: Super Admin (Tecnico)

**Perfil:** Responsable de configuracion del sistema, gestion de usuarios y permisos

**Pain point principal:** "Necesito control sobre quien accede a que informacion sensible"

**Uso esperado:** Mensual o ante nuevos usuarios/cambios de configuracion

---

## Technical Context

| Componente | Tecnologia |
|------------|------------|
| Frontend | Next.js 15 (App Router) |
| Backend | Next.js API Routes + Supabase |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Email | Supabase (notificaciones) |

**Arquitectura:** Single-tenant para MVP. Modelo de datos flexible con estados configurables.

---

*Documento generado para: People Hub MVP*
*Ultima actualizacion: Fase 2 - Architecture*
