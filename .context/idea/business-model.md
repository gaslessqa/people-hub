# Business Model Canvas

## Aplicación de Gestión de RRHH (ATS + HR Tracking + Freelance)

---

## Problem Statement

El proceso de reclutamiento y gestión de talento en pequeñas empresas y startups está fragmentado. Los equipos de RRHH utilizan múltiples herramientas desconectadas: hojas de cálculo para tracking de candidatos, emails dispersos para comunicación con managers, y sistemas separados para gestión de empleados. Esto genera:

**Problema crítico #1: Contactos duplicados e información perdida.** Un recruiter contacta a alguien que ya fue rechazado hace 6 meses, o peor, a un empleado actual de otra área. No existe una "fuente única de verdad" sobre el estado de cada persona en relación con la empresa.

**Problema crítico #2: Pérdida de contexto en transiciones.** Cuando un candidato se convierte en empleado, toda la información valiosa del proceso de selección (notas, feedback de entrevistas, expectativas salariales discutidas) se pierde. El onboarding arranca de cero sin el contexto que RRHH ya tenía.

**Problema crítico #3: Fricción en la comunicación recruiter-manager.** El feedback de entrevistas técnicas vive en emails, Slack, o la memoria del manager. No hay un lugar centralizado donde el recruiter pueda ver el estado real de cada candidato desde la perspectiva de quien decide.

---

## 1. Customer Segments

| Segmento | Descripción | Tamaño estimado |
|----------|-------------|-----------------|
| **RRHH de Startups** | Equipos de 1-3 personas gestionando 5-50 vacantes/año | ~50,000 startups en LATAM |
| **RRHH de PyMEs** | Departamentos pequeños (2-5 personas) con procesos informales | ~200,000 PyMEs con RRHH dedicado |
| **Freelancers de RRHH** | Consultores independientes gestionando múltiples clientes | ~10,000 freelancers activos en LATAM |

**Usuarios dentro de cada segmento:**
- Recruiters (uso diario, operativo)
- Managers técnicos (uso puntual, feedback)
- HR Managers (uso periódico, supervisión y KPIs)

---

## 2. Value Propositions

| Pain Point | Propuesta de Valor |
|------------|-------------------|
| Candidatos duplicados/contacto indebido | **Buscador global** antes de contactar cualquier persona |
| Historial fragmentado | **Modelo único de persona** con timeline completo |
| Pérdida de info candidato→empleado | **Transición limpia** conservando todo el historial |
| Comunicación recruiter-manager opaca | **Feedback visible** y estructurado en cada candidato |
| ATS comerciales complejos y costosos | **Herramienta ligera** sin features innecesarios |

**Diferenciador clave:** Una persona = un registro, independientemente de si es candidato, empleado, ex-empleado o combinaciones. Sin duplicados, con historial completo.

---

## 3. Channels

| Canal | Tipo | Frecuencia |
|-------|------|------------|
| Aplicación web | Directo | Diaria (recruiters), semanal (managers) |
| Login por roles | Acceso controlado | Continuo |
| Dashboard de KPIs | Supervisión | Mensual (HR Manager) |

**Nota:** No hay canales comerciales en MVP. Distribución interna únicamente.

---

## 4. Customer Relationships

| Tipo de Relación | Descripción |
|------------------|-------------|
| **Self-service** | Uso autónomo sin soporte comercial |
| **Operativo diario** | Herramienta de trabajo, no consulta ocasional |
| **Feedback interno** | Mejoras basadas en uso real del equipo |

---

## 5. Revenue Streams

### MVP (Fase actual)
- No aplica - uso interno/proyecto personal

### Evolución potencial
| Modelo | Descripción | Estimación |
|--------|-------------|------------|
| Licencia interna | Pago único por empresa | $500-2,000 USD/año |
| SaaS multi-tenant | Suscripción mensual | $29-99 USD/mes |
| Módulo freelance | Facturación + multi-cliente | $49-149 USD/mes |

---

## 6. Key Resources

| Recurso | Tipo | Criticidad |
|---------|------|------------|
| Aplicación web (Next.js/React) | Tecnológico | Alta |
| Base de datos centralizada (Supabase) | Tecnológico | Alta |
| Modelo único de personas | Diseño/Arquitectura | Alta |
| Sistema de roles y permisos | Funcional | Media |
| Conocimiento de procesos RRHH | Dominio | Alta |

---

## 7. Key Activities

| Actividad | Descripción |
|-----------|-------------|
| Desarrollo del MVP | Implementar funcionalidades core |
| Diseño del modelo de datos | Asegurar unicidad de personas |
| Testing con usuarios reales | Validar con recruiters/managers |
| Iteración basada en feedback | Mejora continua |

---

## 8. Key Partners

| Partner | Rol |
|---------|-----|
| Usuarios internos (recruiters/managers) | Validación y feedback |
| Freelancers RRHH (early adopters) | Testing en escenarios multi-cliente |
| Comunidades de RRHH | Difusión orgánica post-MVP |

---

## 9. Cost Structure

| Costo | Tipo | Estimación mensual |
|-------|------|-------------------|
| Hosting (Vercel/Supabase) | Variable | $0-50 USD (tier free inicial) |
| Dominio | Fijo | $1-2 USD |
| Tiempo de desarrollo | Inversión | N/A (proyecto personal) |

**Modelo de costos:** Lean. Prioridad en costos variables que escalen con uso.

---

## MVP Hypothesis

### Hipótesis 1: Búsqueda unificada reduce errores
> "Si los recruiters pueden buscar en una base única antes de contactar, reducirán los contactos duplicados/indebidos en un 80%."
>
> **Métrica:** % de contactos que resultan en "ya contactado" o "es empleado"

### Hipótesis 2: Historial compartido mejora decisiones
> "Si managers y recruiters ven el mismo historial de candidato, el tiempo de decisión se reduce en 40%."
>
> **Métrica:** Días promedio desde primera entrevista hasta decisión final

### Hipótesis 3: Transición candidato→empleado sin fricción
> "Si la información de candidato persiste al convertirse en empleado, el tiempo de onboarding administrativo se reduce en 50%."
>
> **Métrica:** Tiempo para completar datos de nuevo empleado en sistema
