# Análisis de Requerimientos — Portal ARVIC V1

**Fecha de análisis:** 27 de febrero de 2026
**Sistema:** Portal de Gestión de Consultores y Horas
**Versión analizada:** V1 (rama `Probando-Base-de-Datos-Nueva`)

---

## 1. Descripción General del Sistema

Portal ARVIC es una plataforma web de gestión interna para una empresa consultora (ARVIC). Su propósito central es administrar el trabajo de consultores asignados a empresas clientes, registrar y aprobar las horas trabajadas, y calcular automáticamente el valor económico de esas horas tanto a costo interno (consultor) como a precio de venta (cliente).

**Stack tecnológico:**
- Backend: Node.js + Express.js + MongoDB (Mongoose)
- Frontend: HTML5 + CSS3 + JavaScript Vanilla
- Autenticación: JWT (tokens de 24 h)
- Infraestructura: Vercel + MongoDB Atlas

---

## 2. Actores del Sistema

### 2.1 Administrador (`role: 'admin'`)

Usuario con control total del sistema. Existe un único usuario `admin` con `userId = 'admin'`. Se encarga de toda la configuración del catálogo y de la supervisión operativa.

**Responsabilidades:**
- Gestionar el catálogo de entidades base: empresas, proyectos, soportes, módulos
- Crear y gestionar cuentas de consultores
- Definir asignaciones (qué consultor trabaja qué cosa para qué cliente, a qué tarifa)
- Revisar, aprobar o rechazar los reportes de horas enviados por los consultores
- Consultar el tarifario (margen comercial por asignación)

### 2.2 Consultor (`role: 'consultor'`)

Empleado o colaborador externo de ARVIC que presta servicios a clientes. Cada consultor tiene un `userId` con formato `cons####` (ej. `cons1234`) y contraseña con formato `cons####.####`.

**Responsabilidades:**
- Ver sus propias asignaciones activas (soportes, proyectos, tareas)
- Registrar reportes de horas trabajadas vinculados a sus asignaciones
- Consultar el estado de sus reportes (Pendiente / Aprobado / Rechazado)
- Corregir y reenviar reportes rechazados junto con el feedback del administrador

---

## 3. Entidades de Negocio

### 3.1 Empresa (`Company`)

Representa a un cliente final al que ARVIC presta servicios. Es el eje central de las asignaciones.

| Campo | Descripción |
|---|---|
| `companyId` | Identificador único generado automáticamente |
| `name` | Nombre de la empresa cliente |
| `description` | Descripción o notas internas |
| `isActive` | Estado activo/inactivo |

### 3.2 Consultor / Usuario (`User`)

Persona que opera dentro del sistema. Puede ser administrador o consultor.

| Campo | Descripción |
|---|---|
| `userId` | Identificador único (`admin` o formato `cons####`) |
| `name` | Nombre completo |
| `email` | Correo electrónico (único en el sistema) |
| `password` | Contraseña en texto plano (pendiente de hashing) |
| `role` | `admin` o `consultor` |
| `isActive` | Habilita o deshabilita el acceso |

### 3.3 Soporte (`Support`)

Tipo de servicio de soporte técnico recurrente que se puede contratar. Representa una categoría de servicio que ARVIC ofrece a un cliente de forma continua.

| Campo | Descripción |
|---|---|
| `supportId` | Identificador único |
| `name` | Nombre del tipo de soporte (ej. "Soporte SAP FI") |
| `description` | Descripción del servicio |
| `isActive` | Estado activo/inactivo |

### 3.4 Proyecto (`Project`)

Trabajo acotado en el tiempo con un alcance definido, a diferencia del soporte que es recurrente.

| Campo | Descripción |
|---|---|
| `projectId` | Identificador único |
| `name` | Nombre del proyecto (ej. "Implementación SAP S/4HANA") |
| `description` | Descripción del alcance |
| `isActive` | Estado activo/inactivo |

### 3.5 Módulo (`Module`)

Área funcional o componente de trabajo dentro de un soporte o proyecto (ej. módulo FI, MM, SD en SAP). Permite clasificar las horas a un nivel de granularidad más fino que el soporte o proyecto.

| Campo | Descripción |
|---|---|
| `moduleId` | Identificador único |
| `name` | Nombre del módulo (ej. "Finanzas", "Logística", "ABAP") |
| `description` | Descripción del módulo |
| `isActive` | Estado activo/inactivo |

### 3.6 Asignación de Soporte (`Assignment`)

Vínculo formal entre un consultor, una empresa, un tipo de soporte y un módulo, con tarifas pactadas. Define que "el consultor X trabaja soporte Y para empresa Z en módulo W, a un costo de $A/hora para la empresa y $B/hora para nosotros".

| Campo | Descripción |
|---|---|
| `assignmentId` | Identificador único |
| `userId` | Consultor asignado |
| `companyId` | Empresa cliente |
| `supportId` | Tipo de soporte |
| `moduleId` | Módulo de trabajo |
| `tarifaConsultor` | Costo interno por hora (lo que ARVIC paga al consultor) |
| `tarifaCliente` | Precio de venta por hora (lo que el cliente paga a ARVIC) |
| `isActive` | Estado activo/inactivo |

### 3.7 Asignación de Proyecto (`ProjectAssignment`)

Similar a la asignación de soporte, pero para proyectos. Vincula un consultor con un proyecto específico de una empresa.

| Campo | Descripción |
|---|---|
| `projectAssignmentId` | Identificador único |
| `consultorId` | Consultor asignado |
| `companyId` | Empresa cliente |
| `projectId` | Proyecto al que se asigna |
| `moduleId` | Módulo dentro del proyecto |
| `tarifaConsultor` | Costo interno por hora |
| `tarifaCliente` | Precio de venta por hora |
| `isActive` | Estado activo/inactivo |

### 3.8 Asignación de Tarea (`TaskAssignment`)

Asignación ad-hoc para trabajos puntuales o tareas específicas que no encajan en el modelo de soporte continuo ni de proyecto formal. Puede estar opcionalmente vinculada a un soporte existente.

| Campo | Descripción |
|---|---|
| `taskAssignmentId` | Identificador único |
| `consultorId` | Consultor asignado |
| `companyId` | Empresa cliente |
| `linkedSupportId` | Soporte vinculado (opcional, puede ser nulo) |
| `moduleId` | Módulo de trabajo |
| `descripcion` | Descripción de la tarea específica |
| `tarifaConsultor` | Costo interno por hora |
| `tarifaCliente` | Precio de venta por hora |
| `isActive` | Estado activo/inactivo |

### 3.9 Reporte de Horas (`Report`)

Registro que un consultor crea para declarar el tiempo trabajado en una asignación en un día específico. Es la unidad central del flujo operativo del sistema.

| Campo | Descripción |
|---|---|
| `reportId` | Identificador único |
| `userId` | Consultor que reporta |
| `assignmentId` | Asignación sobre la que se reporta |
| `assignmentType` | `support`, `project` o `task` |
| `companyId` | Empresa a la que corresponde |
| `supportId` / `projectId` | Referencia al soporte o proyecto (según tipo) |
| `moduleId` | Módulo trabajado |
| `title` | Título descriptivo del reporte |
| `description` | Descripción detallada del trabajo realizado |
| `hours` | Horas trabajadas (valor numérico) |
| `date` | Fecha del trabajo reportado |
| `status` | `Pendiente`, `Aprobado`, `Rechazado`, `Resubmitted` |
| `feedback` | Comentario del admin en caso de rechazo |
| `resubmittedAt` | Fecha de reenvío tras rechazo |

### 3.10 Tarifario (`Tarifario`)

Registro calculado automáticamente cada vez que se crea una asignación (de cualquier tipo). Centraliza la información comercial y el margen por asignación.

| Campo | Descripción |
|---|---|
| `tarifarioId` | Generado como `tarifa_{assignmentId}` |
| `assignmentId` | Asignación que lo origina |
| `costoConsultor` | Costo interno por hora |
| `costoCliente` | Precio de venta por hora |
| `margen` | `costoCliente - costoConsultor` |
| `margenPorcentaje` | `(margen / costoCliente) × 100` |
| `tipo` | `support`, `project` o `task` |
| Campos denormalizados | Nombres de consultor, empresa, soporte, módulo (para reporting sin JOINs) |

---

## 4. Requerimientos Funcionales

### RF-01: Autenticación y Control de Acceso

| ID | Requerimiento |
|---|---|
| RF-01.1 | El sistema debe permitir login con `userId` y `password` |
| RF-01.2 | El sistema debe emitir un token JWT válido por 24 horas tras autenticación exitosa |
| RF-01.3 | El sistema debe redirigir al dashboard correspondiente según el rol del usuario |
| RF-01.4 | El sistema debe cerrar sesión automáticamente tras 30 minutos de inactividad (con aviso a los 25 min) |
| RF-01.5 | El sistema debe cerrar sesión automáticamente cuando el token JWT expire (24 h) |
| RF-01.6 | Solo usuarios con `isActive: true` deben poder autenticarse |
| RF-01.7 | El sistema debe proteger todas las rutas verificando el token en el header `Authorization: Bearer {token}` |
| RF-01.8 | Solo el administrador debe poder acceder al endpoint `/api/users/passwords` |

### RF-02: Gestión de Catálogos (Admin)

| ID | Requerimiento |
|---|---|
| RF-02.1 | El admin debe poder crear, leer, actualizar y desactivar **empresas** |
| RF-02.2 | El admin debe poder crear, leer, actualizar y desactivar **proyectos** |
| RF-02.3 | El admin debe poder crear, leer, actualizar y desactivar **tipos de soporte** |
| RF-02.4 | El admin debe poder crear, leer, actualizar y desactivar **módulos** |
| RF-02.5 | Los IDs de catálogos deben generarse automáticamente si no se proveen |
| RF-02.6 | Cada catálogo debe tener un campo `isActive` para soft-delete (no eliminación física) |

### RF-03: Gestión de Usuarios (Admin)

| ID | Requerimiento |
|---|---|
| RF-03.1 | El admin debe poder crear consultores con `userId`, `name`, `email`, `password` y `role` |
| RF-03.2 | El sistema no debe devolver el campo `password` en las respuestas GET de usuarios |
| RF-03.3 | El admin debe poder activar/desactivar consultores (`isActive`) |
| RF-03.4 | El sistema debe rechazar la creación de usuarios con `userId` o `email` duplicado |
| RF-03.5 | El admin debe poder actualizar nombre, email, contraseña, rol y estado de cualquier usuario |

### RF-04: Gestión de Asignaciones (Admin)

| ID | Requerimiento |
|---|---|
| RF-04.1 | El admin debe poder crear **asignaciones de soporte** (consultor + empresa + soporte + módulo + tarifas) |
| RF-04.2 | El admin debe poder crear **asignaciones de proyecto** (consultor + empresa + proyecto + módulo + tarifas) |
| RF-04.3 | El admin debe poder crear **asignaciones de tarea** (consultor + empresa + módulo + descripción + tarifas, con soporte opcional) |
| RF-04.4 | Al crear cualquier tipo de asignación, el sistema debe crear **automáticamente** una entrada en el Tarifario |
| RF-04.5 | Al eliminar una asignación, el sistema debe eliminar también la entrada del Tarifario asociada |
| RF-04.6 | El admin debe poder desactivar asignaciones sin eliminarlas |

### RF-05: Tarifario (Admin)

| ID | Requerimiento |
|---|---|
| RF-05.1 | El tarifario debe calcularse automáticamente: `margen = costoCliente - costoConsultor` |
| RF-05.2 | El tarifario debe calcularse automáticamente: `margenPorcentaje = (margen / costoCliente) × 100` |
| RF-05.3 | Si el admin actualiza los costos de una asignación, el sistema debe recalcular el margen automáticamente |
| RF-05.4 | El tarifario debe almacenar nombres denormalizados (consultor, empresa, soporte/proyecto, módulo) para facilitar reportes sin consultas adicionales |
| RF-05.5 | El admin debe poder consultar el tarifario filtrando por tipo (`support`, `project`, `task`) |

### RF-06: Gestión de Reportes — Consultor

| ID | Requerimiento |
|---|---|
| RF-06.1 | El consultor debe poder ver únicamente sus asignaciones activas |
| RF-06.2 | El consultor debe poder crear un reporte de horas seleccionando una de sus asignaciones activas |
| RF-06.3 | El reporte debe incluir: título, descripción, horas trabajadas y fecha |
| RF-06.4 | El estado inicial de todo reporte debe ser `Pendiente` |
| RF-06.5 | El consultor debe poder ver el estado de todos sus reportes |
| RF-06.6 | El consultor debe poder ver el `feedback` del administrador cuando un reporte es rechazado |
| RF-06.7 | El consultor debe poder **reenviar** un reporte rechazado (estado pasa a `Resubmitted`) |
| RF-06.8 | Al reenviar un reporte, el sistema debe registrar la fecha de reenvío (`resubmittedAt`) |

### RF-07: Revisión de Reportes — Admin

| ID | Requerimiento |
|---|---|
| RF-07.1 | El admin debe poder ver todos los reportes de todos los consultores |
| RF-07.2 | El admin debe poder filtrar reportes por estado, empresa, consultor o fecha |
| RF-07.3 | El admin debe poder **aprobar** un reporte (estado pasa a `Aprobado`) |
| RF-07.4 | El admin debe poder **rechazar** un reporte con un mensaje de feedback obligatorio (estado pasa a `Rechazado`) |
| RF-07.5 | Un reporte en estado `Resubmitted` debe volver a ser revisable por el admin |

### RF-08: Exportación de Datos

| ID | Requerimiento |
|---|---|
| RF-08.1 | El sistema debe permitir exportar reportes en formato **PDF** |
| RF-08.2 | El sistema debe permitir exportar reportes en formato **Excel** |

---

## 5. Flujos de Trabajo

### FW-01: Flujo de Autenticación

```
Usuario accede a index.html
         │
         ▼
    Ingresa userId + password
         │
         ▼
POST /api/auth/login
    ├── userId no existe → Error "Credenciales inválidas"
    ├── isActive = false  → Error "Usuario inactivo"
    ├── password incorrecta → Error "Credenciales inválidas"
    └── OK
         │
         ▼
    Genera JWT (24 h) → Guarda en localStorage
         │
         ▼
    role = 'admin'     → Redirige a /admin/dashboard.html
    role = 'consultor' → Redirige a /consultor/dashboard.html
```

### FW-02: Flujo de Creación de Asignación y Tarifario

```
Admin abre panel de asignaciones
         │
         ▼
    Selecciona tipo: Soporte / Proyecto / Tarea
         │
         ▼
    Completa formulario:
    - Consultor, Empresa, [Soporte|Proyecto], Módulo
    - Tarifa Consultor ($/hora), Tarifa Cliente ($/hora)
         │
         ▼
POST /api/[assignments|projectAssignments|taskAssignments]
         │
         ├── Crea documento Assignment
         │
         └── Automáticamente crea documento Tarifario:
               assignmentId  = ID generado
               tarifarioId   = "tarifa_" + assignmentId
               margen        = costoCliente - costoConsultor
               margenPorcentaje = (margen / costoCliente) × 100
               tipo          = 'support' | 'project' | 'task'
               [campos denormalizados: nombres de consultor, empresa, etc.]
```

### FW-03: Flujo de Reporte de Horas

```
Consultor accede a su dashboard
         │
         ▼
    Ve sus asignaciones activas (filtradas por userId)
         │
         ▼
    Crea nuevo reporte:
    - Selecciona asignación
    - Ingresa título, descripción, horas, fecha
         │
         ▼
POST /api/reports
    └── status = 'Pendiente'
         │
         ▼
    Admin ve reporte en su bandeja de pendientes
         │
         ├── APROBAR ──────────────────────────────┐
         │   PUT /api/reports/:id                   │
         │   status = 'Aprobado'                    │
         │                                          ▼
         └── RECHAZAR                        Flujo terminado
             PUT /api/reports/:id
             status = 'Rechazado'
             feedback = "Motivo del rechazo"
                  │
                  ▼
             Consultor ve estado 'Rechazado' + feedback
                  │
                  ▼
             REENVIAR (corrige y reenvía)
             PUT /api/reports/:id
             status = 'Resubmitted'
             resubmittedAt = new Date()
                  │
                  ▼
             Vuelve a bandeja del Admin → ciclo de revisión
```

### FW-04: Ciclo de Vida de un Reporte

```
Pendiente ──(aprobar)──▶ Aprobado
    │
    └──(rechazar)──▶ Rechazado ──(reenviar)──▶ Resubmitted
                                                     │
                                                 (aprobar)──▶ Aprobado
                                                     │
                                                 (rechazar)──▶ Rechazado
                                                     (ciclo puede repetirse)
```

### FW-05: Gestión de Catálogos

```
Admin abre sección de catálogo (Empresas / Proyectos / Soportes / Módulos)
         │
         ▼
    CREAR:
    POST /api/{entidad}
    - Si no se provee ID, el sistema genera uno automáticamente
    - isActive = true por defecto
         │
    EDITAR:
    PUT /api/{entidad}/:id
    - Actualiza campos modificados
    - isActive puede cambiarse para desactivar/reactivar
         │
    ELIMINAR:
    DELETE /api/{entidad}/:id
    - Eliminación física del registro
    - Considerar: si hay asignaciones activas referenciando este catálogo,
      la eliminación puede generar inconsistencia referencial (ver RF-GAPS)
```

---

## 6. Reglas de Negocio

### RN-01: Estructura de IDs de Usuario
- El usuario administrador tiene `userId = 'admin'` (único)
- Los consultores tienen `userId` con formato `cons####` (4 dígitos)
- La contraseña de consultores sigue el patrón `cons####.####` (validada en frontend)

### RN-02: Tarifario Automático
- Toda asignación (soporte, proyecto o tarea) genera automáticamente una entrada en el Tarifario al momento de su creación
- El `tarifarioId` se construye como la concatenación `"tarifa_" + assignmentId`
- Si se elimina la asignación, la entrada del Tarifario asociada se elimina en cascada
- El margen se recalcula automáticamente si se actualizan los costos

### RN-03: Estados de Reportes
- Un reporte solo puede ser creado por el consultor propietario de la asignación
- El estado inicial siempre es `Pendiente`
- La transición `Rechazado → Resubmitted` requiere acción del consultor
- La transición `Pendiente/Resubmitted → Aprobado/Rechazado` requiere acción del admin
- El rechazo debe incluir feedback (motivo) para orientar al consultor

### RN-04: Visibilidad de Datos por Rol
- Un consultor solo puede ver sus propias asignaciones y reportes
- Un admin puede ver todas las asignaciones y reportes de todos los consultores
- Las contraseñas nunca se devuelven en endpoints GET estándar de usuarios
- Solo el admin puede acceder al endpoint especial `/api/users/passwords`

### RN-05: Sesión y Seguridad
- El token JWT tiene vigencia de 24 horas desde el login
- La sesión se invalida por inactividad tras 30 minutos
- El aviso de inactividad aparece 5 minutos antes del cierre automático (a los 25 min)

### RN-06: Tipos de Asignación
- El sistema reconoce tres tipos de asignación: `support`, `project`, `task`
- Los reportes deben referenciar el tipo correcto mediante `assignmentType`
- Una asignación de tarea puede existir de forma independiente o vinculada a un soporte (campo `linkedSupportId` opcional)

---

## 7. Requerimientos No Funcionales

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Disponibilidad | El sistema se despliega en Vercel + MongoDB Atlas con disponibilidad gestionada por dichos servicios |
| RNF-02 | Rendimiento | Las operaciones CRUD deben responder en menos de 2 segundos en condiciones normales |
| RNF-03 | Seguridad | Todos los endpoints de la API deben requerir token JWT válido (excepto `/api/auth/login` y `/api/health`) |
| RNF-04 | Seguridad | Las contraseñas deben almacenarse con hashing bcrypt (actualmente deshabilitado — ver Gaps) |
| RNF-05 | Usabilidad | El sistema debe funcionar en navegadores modernos (Chrome, Firefox, Edge) sin necesidad de instalación adicional |
| RNF-06 | Mantenibilidad | Los datos de catálogos deben usar soft-delete (`isActive`) para preservar integridad referencial histórica |
| RNF-07 | Escalabilidad | La estructura de datos en MongoDB soporta múltiples empresas, consultores y asignaciones concurrentes |
| RNF-08 | Trazabilidad | Todo reporte debe registrar `createdAt`, `updatedAt` y `resubmittedAt` (cuando aplique) |

---

## 8. Gaps y Áreas de Mejora Identificadas

### GAP-01: Seguridad — Contraseñas en Texto Plano (CRÍTICO)
**Estado actual:** El módulo `bcryptjs` está instalado pero deshabilitado. Las contraseñas se comparan y almacenan en texto plano.
**Impacto:** Cualquier persona con acceso a la base de datos puede ver todas las contraseñas.
**Acción sugerida:** Rehabilitar bcrypt tanto en la creación de usuarios como en la validación del login.

### GAP-02: Seguridad — Sin Rate Limiting en Login
**Estado actual:** El endpoint `/api/auth/login` no tiene protección contra ataques de fuerza bruta.
**Impacto:** Un atacante puede probar contraseñas indefinidamente.
**Acción sugerida:** Implementar rate limiting (ej. máximo 5 intentos por minuto por IP) con la librería `express-rate-limit`.

### GAP-03: Integridad Referencial — Eliminación de Catálogos
**Estado actual:** Los endpoints `DELETE` de entidades base (empresas, módulos, soportes, proyectos) eliminan físicamente el registro aunque existan asignaciones o reportes que lo referencien.
**Impacto:** Reportes y asignaciones que ya no pueden resolver sus referencias (IDs huérfanos).
**Acción sugerida:** Validar antes de eliminar si existen registros dependientes, o reemplazar eliminación física por desactivación (`isActive = false`).

### GAP-04: Validación de Unicidad de Reporte
**Estado actual:** No existe validación que impida que un consultor envíe múltiples reportes para la misma asignación y fecha.
**Impacto:** Duplicación accidental de horas reportadas.
**Acción sugerida:** Agregar una restricción de unicidad en el modelo `Report` para la combinación `userId + assignmentId + date`.

### GAP-05: Ausencia de Paginación en Listados
**Estado actual:** Los endpoints `GET` devuelven todos los registros sin paginación.
**Impacto:** Con volumen de datos elevado, las respuestas pueden volverse lentas y consumir excesiva memoria.
**Acción sugerida:** Implementar paginación con parámetros `page` y `limit` en todos los endpoints de listado.

### GAP-06: Ausencia de Filtros en la API de Reportes
**Estado actual:** El filtrado de reportes por empresa, consultor, estado o fecha se realiza en el frontend.
**Impacto:** Se descarga toda la colección de reportes y se filtra en el cliente, lo que es ineficiente.
**Acción sugerida:** Implementar filtros query en el backend: `?status=Pendiente&userId=cons1234&from=2026-01-01`.

### GAP-07: Inconsistencia en el Nombre del Campo de Consultor
**Estado actual:** En `Assignment` se usa `userId` para referenciar al consultor, mientras que en `ProjectAssignment` y `TaskAssignment` se usa `consultorId`.
**Impacto:** Inconsistencia que complica el mantenimiento y las queries cruzadas.
**Acción sugerida:** Unificar a un solo campo (`consultorId`) en todos los modelos de asignación.

### GAP-08: Sin Notificaciones
**Estado actual:** No existe ningún mecanismo de notificación (email, push, badge en UI) cuando un reporte cambia de estado.
**Impacto:** El consultor no se entera de que su reporte fue aprobado/rechazado sin entrar al portal a revisar manualmente.
**Acción sugerida:** Implementar al menos un indicador visual de conteo de reportes con cambios pendientes de revisar en el dashboard.

### GAP-09: Sin Resumen Financiero / Dashboard de KPIs
**Estado actual:** El sistema registra todos los datos necesarios para calcular ingresos (horas × tarifa cliente) y costos (horas × tarifa consultor), pero no existe una vista consolidada.
**Impacto:** El administrador no tiene una vista rápida del desempeño financiero.
**Acción sugerida:** Agregar un panel con métricas: horas aprobadas por empresa, ingresos estimados por mes, margen por consultor.

### GAP-10: Reporte Solo Ligado a Una Asignación
**Estado actual:** Cada reporte referencia exactamente una asignación y un módulo.
**Consideración:** Si un consultor trabaja en múltiples módulos de un mismo soporte en el mismo día, debe crear múltiples reportes.
**Acción sugerida:** Evaluar si esto es intencional (trazabilidad por módulo) o si sería útil permitir reportes multi-módulo.

---

## 9. Mapa de Dependencias entre Entidades

```
Module ◄──────────────────────────────────────────────────────┐
                                                               │
Company ◄──────────────────────────────────────────────────┐  │
                                                            │  │
Support ◄─────────────────────────────────────────┐        │  │
                                                   │        │  │
Project ◄─────────────────────────────────┐        │        │  │
                                           │        │        │  │
User (consultor) ◄──────────────┐          │        │        │  │
                                 │          │        │        │  │
                          Assignment ───────┼────────┼────────┼──┘
                          (type=support)    │        └────────┘
                                 │          │
                          ProjectAssignment ┘
                          (type=project)
                                 │
                          TaskAssignment
                          (type=task)
                                 │
                                 │ (crea automáticamente)
                                 ▼
                            Tarifario ◄─── calcula margen
                                 │
                         (consultas financieras)

                          Assignment
                               │
                               │ (consultor reporta horas)
                               ▼
                            Report
                            (Pendiente → Aprobado/Rechazado → Resubmitted)
```

---

*Documento generado mediante análisis estático del código fuente del proyecto. Versión inicial — sujeto a revisión y actualización.*
