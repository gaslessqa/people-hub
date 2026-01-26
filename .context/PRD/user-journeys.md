# User Journeys - People Hub

## Journey 1: Registro de Nuevo Candidato (Happy Path)

### Metadata
- **Persona:** Ana (Recruiter Operativa)
- **Scenario:** Ana recibe un CV por email y necesita registrar al candidato en el sistema

### Steps

**Step 1: Busqueda de duplicados**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana accede a People Hub y usa la busqueda global con el nombre/email del candidato |
| **System Response** | Sistema muestra resultados de busqueda o "No se encontraron coincidencias" |
| **Pain Point** | Si la busqueda es lenta o no encuentra por variaciones del nombre (Juan vs. Juan Carlos) |

**Step 2: Crear nuevo registro**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana hace click en "Nueva Persona" y completa formulario basico (nombre, email, telefono) |
| **System Response** | Formulario con validacion en tiempo real. Campos obligatorios marcados |
| **Pain Point** | Formulario muy largo o campos confusos. Validacion de email que rechaza formatos validos |

**Step 3: Asignar a vacante**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana selecciona la vacante a la que aplica el candidato desde dropdown |
| **System Response** | Sistema muestra lista de vacantes abiertas filtradas. Auto-asigna estado "aplicado" |
| **Pain Point** | Lista de vacantes muy larga sin filtro. No poder crear vacante inline |

**Step 4: Agregar nota inicial**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana agrega nota con contexto inicial (fuente, expectativas, observaciones del CV) |
| **System Response** | Editor de texto simple. Nota guardada con timestamp y autor automatico |
| **Pain Point** | Perder el texto si hay error de conexion. No poder adjuntar archivos (v2) |

**Step 5: Confirmar creacion**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana hace click en "Guardar" |
| **System Response** | Persona creada. Redirige a perfil completo. Toast de confirmacion |
| **Pain Point** | Redireccion a listado en lugar de perfil creado |

### Expected Outcome
Candidato registrado en el sistema, asignado a vacante, con nota inicial. Visible en pipeline. Sin duplicados.

### Alternative Paths / Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Email ya existe en sistema | Sistema muestra warning y enlace al perfil existente antes de permitir crear |
| Vacante no existe aun | Permitir crear persona sin vacante asignada, o link rapido para crear vacante |
| Conexion perdida al guardar | Auto-save en draft. Mensaje de error claro con opcion de reintentar |
| Campos especiales (nombre compuesto) | Soportar caracteres especiales, tildes, n con tilde |

---

## Journey 2: Manager Deja Feedback de Entrevista

### Metadata
- **Persona:** Carlos (Engineering Manager)
- **Scenario:** Carlos acaba de entrevistar a un candidato y necesita dejar su feedback antes de olvidarlo

### Steps

**Step 1: Notificacion o acceso directo**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Carlos recibe email con link directo al candidato, o accede desde bookmark del sistema |
| **System Response** | Email con contexto (nombre candidato, vacante, recruiter). Link directo a perfil |
| **Pain Point** | Email que llega a spam. Link que pide login y no redirige correctamente |

**Step 2: Revisar contexto del candidato**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Carlos abre el perfil y revisa notas previas y feedback de otros entrevistadores |
| **System Response** | Timeline visible con historial completo. Feedback previo expandible |
| **Pain Point** | Demasiada informacion sin jerarquia. No poder ver solo feedback de entrevistas |

**Step 3: Agregar feedback estructurado**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Carlos hace click en "Agregar Feedback", selecciona tipo "Entrevista", completa rating y comentarios |
| **System Response** | Formulario con: rating 1-5, recomendacion (Si/No/Tal vez), campo de texto para comentarios |
| **Pain Point** | Rating obligatorio sin contexto de que significa cada numero. Texto sin guia de que incluir |

**Step 4: Confirmar y notificar**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Carlos hace click en "Enviar Feedback" |
| **System Response** | Feedback guardado. Notificacion automatica a Recruiter. Toast de confirmacion |
| **Pain Point** | No saber si el recruiter fue notificado. No poder editar si comete error |

### Expected Outcome
Feedback estructurado registrado en el perfil del candidato. Recruiter notificado. Visible para futuras referencias.

### Alternative Paths / Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Carlos quiere feedback privado (solo HR) | Opcion de marcar feedback como "confidencial" (solo HR Admin puede ver) |
| Entrevista fue cancelada | Permitir registrar "Entrevista no realizada" con motivo |
| Carlos olvida dar feedback (3 dias despues) | Reminder automatico por email a los 2 dias sin feedback |
| Candidato tiene multiples entrevistas programadas | Diferenciar feedback por tipo de entrevista (tecnica, cultural, final) |

---

## Journey 3: Buscar Persona Antes de Contactar

### Metadata
- **Persona:** Ana (Recruiter Operativa)
- **Scenario:** Ana va a hacer cold outreach a alguien de LinkedIn y quiere verificar si ya esta en el sistema

### Steps

**Step 1: Acceso a busqueda**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana usa el atajo de teclado (Cmd+K) o hace click en barra de busqueda global |
| **System Response** | Modal de busqueda aparece con cursor listo. Placeholder: "Buscar por nombre, email o telefono" |
| **Pain Point** | Busqueda no accesible rapidamente. Tener que navegar a seccion especifica |

**Step 2: Ingresar termino de busqueda**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana escribe el nombre de la persona (ej: "Maria Garcia") |
| **System Response** | Resultados aparecen mientras escribe (debounce 300ms). Muestra nombre, estado actual, ultima interaccion |
| **Pain Point** | Busqueda solo por nombre exacto. No encontrar "Maria Garcia Lopez" buscando "Maria Garcia" |

**Step 3: Revisar resultados**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana revisa los resultados mostrados |
| **System Response** | Cada resultado muestra: foto placeholder, nombre, estado (badge de color), email parcial, ultima actividad |
| **Pain Point** | Demasiados resultados sin forma de refinar. Informacion insuficiente para distinguir homonimos |

**Step 4a: Persona encontrada**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana hace click en el resultado correcto |
| **System Response** | Navega a perfil completo. Muestra todo el historial |
| **Pain Point** | N/A - Happy path |

**Step 4b: Persona no encontrada**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana verifica que no hay coincidencias y procede a crear nuevo registro |
| **System Response** | Mensaje "No se encontraron resultados" con boton "Crear nueva persona" que pre-llena el nombre buscado |
| **Pain Point** | Tener que escribir el nombre de nuevo al crear |

### Expected Outcome
Verificacion rapida (<10 segundos) de si la persona ya existe. Decision informada de contactar o no.

### Alternative Paths / Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Persona existe pero con email diferente | Busqueda por nombre parcial. Mostrar suficiente info para identificar |
| Homonimos (Maria Garcia x 3) | Mostrar diferenciadores: ultimo empleador, fecha de ultimo contacto, estado actual |
| Persona es empleado actual | Warning prominente: "Esta persona es empleado activo" antes de permitir accion |
| Persona fue rechazada recientemente | Mostrar badge "Rechazado hace 2 meses" con enlace a ver motivo |

---

## Journey 4: HR Admin Revisa Dashboard Semanal

### Metadata
- **Persona:** Laura (HR Admin)
- **Scenario:** Lunes por la manana, Laura quiere ver el estado general del reclutamiento para la reunion de equipo

### Steps

**Step 1: Acceso a dashboard**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Laura hace login y el sistema la lleva directamente al dashboard (landing para su rol) |
| **System Response** | Dashboard carga con KPIs principales visibles sin scroll |
| **Pain Point** | Dashboard que tarda en cargar. Tener que navegar desde otro lugar |

**Step 2: Revisar metricas principales**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Laura revisa: vacantes abiertas, candidatos por etapa, tiempo promedio de contratacion |
| **System Response** | Cards con numeros grandes, indicadores de tendencia (vs semana/mes anterior), colores para alertas |
| **Pain Point** | Numeros sin contexto. No saber si 15 vacantes abiertas es bueno o malo |

**Step 3: Drill-down en metrica especifica**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Laura hace click en "Vacantes abiertas" para ver detalle |
| **System Response** | Lista de vacantes con: nombre, recruiter asignado, dias abierta, candidatos en pipeline |
| **Pain Point** | Vista de detalle que pierde contexto del dashboard |

**Step 4: Identificar cuellos de botella**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Laura revisa funnel de conversion para identificar donde se pierden candidatos |
| **System Response** | Funnel visual: Aplicados > En proceso > Finalistas > Contratados. % de conversion por etapa |
| **Pain Point** | Funnel sin segmentacion (no poder ver por vacante o por recruiter) |

**Step 5: Exportar/compartir datos**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Laura quiere compartir el dashboard en la reunion |
| **System Response** | Opcion de screenshot/export (v2) o simplemente proyectar pantalla |
| **Pain Point** | No poder exportar a PDF. Datos sensibles visibles si proyecta |

### Expected Outcome
Vision clara del estado de reclutamiento en <5 minutos. Lista para presentar en reunion de equipo.

### Alternative Paths / Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| No hay datos suficientes (inicio de uso) | Mostrar mensaje amigable, no graficos vacios. Sugerir acciones |
| Metrica con alerta (tiempo >30 dias) | Highlight visual prominente. Quick action para investigar |
| Laura necesita dato historico | Selector de periodo (semana, mes, trimestre). Comparativa con periodo anterior |
| Datos inconsistentes (vacante sin candidatos) | No romper visualizacion. Manejar edge cases gracefully |

---

## Journey 5: Transicion Candidato a Empleado (Edge Case Critico)

### Metadata
- **Persona:** Ana (Recruiter Operativa)
- **Scenario:** Un candidato acepto la oferta y Ana necesita marcarlo como contratado sin perder historial

### Steps

**Step 1: Actualizar estado a "Contratado"**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana va al perfil del candidato y cambia estado de "Finalista" a "Contratado" |
| **System Response** | Modal de confirmacion: "Marcar como contratado iniciara transicion a empleado. El historial se conservara." |
| **Pain Point** | No entender las implicaciones del cambio. Miedo a perder datos |

**Step 2: Completar datos de contratacion**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana completa: fecha de inicio, posicion final, salario acordado, manager asignado |
| **System Response** | Formulario con campos de empleado. Pre-llenado con datos del candidato que ya existian |
| **Pain Point** | Tener que re-ingresar informacion. Campos confusos de que es obligatorio |

**Step 3: Confirmar transicion**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana confirma la transicion |
| **System Response** | Persona cambia a estado "Empleado - Activo". Timeline muestra: "Transicion: Candidato > Empleado" con fecha. Todo el historial de candidato permanece visible |
| **Pain Point** | Historial de candidato "desaparece" o queda oculto |

**Step 4: Verificar historial preservado**
| Aspecto | Detalle |
|---------|---------|
| **User Action** | Ana (o HR Admin) verifica que el historial de entrevistas y feedback sigue accesible |
| **System Response** | Timeline unificado muestra todo: aplicacion original, entrevistas, feedback, oferta, contratacion |
| **Pain Point** | No poder distinguir que fue "fase candidato" vs "fase empleado" |

### Expected Outcome
Candidato transicionado a empleado con 100% del historial preservado. Una sola fuente de verdad.

### Alternative Paths / Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Candidato rechaza oferta despues de aceptar | Permitir revertir a estado anterior. Registrar motivo |
| Candidato ya era ex-empleado | Mostrar historial completo: empleado > ex-empleado > candidato > empleado de nuevo |
| Error en datos de contratacion | Permitir editar datos post-transicion sin perder historial |
| Contratacion para otra posicion (diferente a la vacante original) | Soportar cambio de vacante/posicion en transicion |

---

## Matriz de Journeys vs User Stories

| Journey | User Stories Relacionadas |
|---------|---------------------------|
| J1: Registro nuevo candidato | US 2.1, US 2.2, US 3.2, US 4.1 |
| J2: Manager feedback | US 4.2, US 4.3, US 7.2 |
| J3: Busqueda antes de contactar | US 2.2, US 5.1, US 5.2 |
| J4: Dashboard semanal | US 6.1, US 6.2, US 6.3 |
| J5: Transicion candidato > empleado | US 2.5, US 2.3, US 4.4 |

---

*Documento generado para: People Hub MVP*
*Basado en: User Personas + MVP Scope*
