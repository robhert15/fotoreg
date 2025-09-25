---
## Tarea 1: Lógica de BD Local para Pacientes

- **ID:** `PATIENTS-DB-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la capa de acceso a datos de los pacientes en la base de datos local SQLite.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (Plantilla 2).
  - Definición de tipos `Patient` y `NewPatient` en `src/types/index.ts`.
  - Funciones `initDB`, `addPatient`, `findPatients` en `src/db/patients.ts`.

---
## Tarea 2: Creación de Pantalla de Búsqueda de Pacientes

- **ID:** `PATIENTS-UI-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el componente de UI `PatientListScreen`, que servirá como la interfaz principal para buscar y listar pacientes.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (Plantilla 1).
  - Componente `PatientListScreen` en `src/screens/PatientListScreen.tsx` con UI estática y estado local.


---
## Tarea 3: Integración de BD en PatientListScreen

- **ID:** `PATIENTS-INT-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para conectar la UI de `PatientListScreen` con la base de datos, implementando la búsqueda de pacientes en tiempo real y eliminando los datos de ejemplo.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (Plantilla 1).
  - Lógica de carga inicial (`useEffect`) y búsqueda (`handleSearch`) en `PatientListScreen.tsx`.


---
## Tarea 4: Creación de Pantalla para Agregar Paciente

- **ID:** `PATIENTS-UI-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el componente de UI `AddPatientScreen`, que contiene el formulario para registrar nuevos pacientes.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (Plantilla 1).
  - Componente `AddPatientScreen` en `src/screens/AddPatientScreen.tsx` con UI y estado local para el formulario.


---
## Tarea 6: Integración de BD en AddPatientScreen

- **ID:** `PATIENTS-INT-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para conectar el formulario de `AddPatientScreen` a la base de datos. La lógica incluye el guardado real, feedback al usuario (éxito/error) y navegación de regreso a la lista.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (Plantilla 1).
  - Lógica de guardado `async` en `AddPatientScreen.tsx` con manejo de errores y navegación.


  ---
## Tarea 1 (V2): Modelo de Datos Completo

- **ID:** `DATA-MODEL-V2`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para definir el esquema completo y final de la base de datos, incluyendo las tablas `patients`, `consultations`, `consultation_drafts` y `photos`. Se actualizaron también todas las interfaces de TypeScript correspondientes.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Lógica de creación de 4 tablas en `src/db/database.ts`.
  - Interfaces `Patient`, `Consultation`, `Photo`, `ConsultationDraft` en `src/types/index.ts`.


  ---
## Tarea 2 (V2): Componente Reutilizable - CheckboxGroup

- **ID:** `COMP-FORM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el primer componente de formulario reutilizable, `CheckboxGroup`, que incluye un subcomponente `Checkbox` individual. Este componente permitirá la selección múltiple en nuestro formulario de consulta.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Componentes `Checkbox` y `CheckboxGroup` en `src/components/forms/Checkbox.tsx`.


  ---
## Tarea 2 (V2): Componente Reutilizable - RadioGroup

- **ID:** `COMP-FORM-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el segundo componente de formulario reutilizable, `RadioGroup`, destinado a manejar selecciones de opción única (ej. Sí/No).
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Componente `RadioGroup` en `src/components/forms/RadioGroup.tsx`.

  ---
## Tarea 2 (V2): Componente Reutilizable - DatePickerInput

- **ID:** `COMP-FORM-003`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el `DatePickerInput`, el último componente de formulario reutilizable, que encapsula el selector de fechas nativo para una experiencia de usuario óptima.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (incluye instalación de dependencia).
  - Componente `DatePickerInput` en `src/components/forms/DatePickerInput.tsx`.

  ---
## Tarea 1 (V2.1): Modelo de Datos Simplificado

- **ID:** `DATA-MODEL-V2.1`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para definir el esquema de base de datos simplificado, excluyendo el Podograma. Esto alinea la base de datos y los tipos con el nuevo alcance del MVP.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Lógica de creación de 4 tablas (con `consultations` simplificada) en `src/db/database.ts`.
  - Interfaces actualizadas y simplificadas en `src/types/index.ts`.

  ---
## Tarea 2 (V2): Componente Reutilizable - CheckboxGroup

- **ID:** `COMP-FORM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el primer componente de formulario reutilizable, `CheckboxGroup`, que incluye un subcomponente `Checkbox` individual. Este componente permitirá la selección múltiple en nuestro formulario de consulta.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Componentes `Checkbox` y `CheckboxGroup` en `src/components/forms/Checkbox.tsx`.

  ---
## Tarea 2 (V2): Componente Reutilizable - RadioGroup

- **ID:** `COMP-FORM-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el segundo componente de formulario reutilizable, `RadioGroup`, destinado a manejar selecciones de opción única.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Componente `RadioGroup` en `src/components/forms/RadioGroup.tsx`.

  ---
## Tarea 2 (V2): Componente Reutilizable - DatePickerInput

- **ID:** `COMP-FORM-003`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el `DatePickerInput`, el último componente de formulario reutilizable, que encapsula el selector de fechas nativo. Con esto, la Tarea 2 está completa.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (incluye instalación de dependencia).
  - Componente `DatePickerInput` en `src/components/forms/DatePickerInput.tsx`.


  ---
## Tarea 3 (V2): Componente de Cámara

- **ID:** `COMP-CAM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el componente `CameraScreen`, una pantalla completa que gestiona el flujo de captura de fotos, incluyendo permisos, vista previa y confirmación.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (incluye instalación de dependencia).
  - Componente `CameraScreen` en `src/screens/CameraScreen.tsx`.

  ---
## Tarea 4 (V2): Estructura del Formulario - Tab Navigator

- **ID:** `NAV-FORM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la estructura principal del formulario de consulta, implementando un `MaterialTopTabNavigator` con cuatro pestañas placeholder.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (incluye instalación de dependencias).
  - Componente `NewConsultationScreen` en `src/screens/NewConsultationScreen.tsx`.


  ---
## Tarea 5 (V2): Lógica de Autoguardado en Borrador

- **ID:** `LOGIC-DRAFT-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear las funciones de la API de datos (`findOrCreateDraft` y `updateDraft`) que manejarán la lógica de creación y actualización de borradores de consulta en la base de datos.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Nuevo archivo de API `src/db/api/consultations.ts` con la lógica de borradores.


  ---
## Tarea 6 (V2): Integración del Formulario (Parte 1)

- **ID:** `INT-FORM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para la primera fase de la integración final. Esto incluye conectar la lógica de borradores a la pantalla `NewConsultationScreen`, gestionar el estado del formulario y poblar la primera pestaña ("Consulta") con sus componentes reales.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Refactorización de `NewConsultationScreen.tsx` para manejar estado y autoguardado.
  - Actualización de tipos de navegación en `AppNavigator.tsx`.


  ---
## Tarea 6 (V2): Integración del Formulario (Parte 2 - Historial)

- **ID:** `INT-FORM-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para poblar la pestaña 'Historial' con sus componentes reales, conectándola al sistema de borradores e implementando la lógica para campos condicionales. Se identificó la necesidad de mejorar los componentes de formulario para aceptar valores iniciales.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Implementación del componente `HistoryTab` en `NewConsultationScreen.tsx`.

  ---
## Tarea 6 (V2): Integración del Formulario (Parte 3 - Hábitos)

- **ID:** `INT-FORM-003`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para poblar la pestaña 'Hábitos' con sus componentes reales, conectándola al sistema de borradores. Se identificó la necesidad de refactorizar `RadioGroup` para aceptar un valor inicial.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Implementación del componente `HabitsTab` en `NewConsultationScreen.tsx`.

  ---
## Tarea 6 (V2): Integración del Formulario (Parte 4 - Fotos)

- **ID:** `INT-FORM-004`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para implementar la pestaña "Fotos". Esto incluyó crear funciones en la API de datos, refactorizar `CameraScreen` para que sea navegable y devuelva datos, y construir la UI de la pestaña para tomar y mostrar fotos.
- **Artefactos Generados:**
  - Nuevas funciones en `src/db/api/consultations.ts`.
  - Actualización de tipos en `src/navigation/AppNavigator.tsx`.
  - Refactorización completa de `src/screens/CameraScreen.tsx`.
  - Implementación del componente `PhotosTab` en `NewConsultationScreen.tsx`.


  ---
## Tarea 6 (V2): Integración del Formulario (Parte 4 - Fotos FINAL)

- **ID:** `INT-FORM-004-FINAL`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones finales para implementar la pestaña "Fotos", conectando la UI con la `CameraScreen` y la base de datos para tomar, guardar y mostrar las miniaturas de las fotos.
- **Artefactos Generados:**
  - Nuevas funciones en `src/db/api/consultations.ts`.
  - Implementación completa del componente `PhotosTab` en `NewConsultationScreen.tsx`.


  ---
## Tarea 6 (V2): Integración del Formulario (Parte 5 - Guardado Final)

- **ID:** `INT-FORM-005-SAVE`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para añadir el botón "Guardar Consulta" y la lógica final para mover un borrador a la tabla de consultas permanentes, completando así toda la funcionalidad de la consulta.
- **Artefactos Generados:**
  - Nueva función `finalizeConsultation` en la API de datos.
  - Adición del botón de guardado y su lógica `handleFinalSave` en `NewConsultationScreen.tsx`.


  ---
## Tarea (Diseño): Creación del Sistema de Colores

- **ID:** `DESIGN-SYS-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se estableció el color corporativo primario (`#00aecb`). Se generaron las instrucciones para crear un archivo de tema centralizado (`src/constants/theme.ts`) para gestionar la paleta de colores de la aplicación de forma mantenible.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Creación del archivo `src/constants/theme.ts` con el objeto `Colors`.

  ---
## Tarea (Historial): API para Obtener Consultas

- **ID:** `API-CONS-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la función `getConsultationsForPatient` en la capa de API. Esta función es el requisito previo para poder mostrar el historial de consultas en la pantalla de detalle del paciente.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Nueva función `getConsultationsForPatient` en `src/db/api/consultations.ts`.


  ---
## Tarea (Historial): UI para Lista de Consultas

- **ID:** `UI-CONS-LIST-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para refactorizar `PatientDetailScreen`. Ahora obtiene y muestra una lista del historial de consultas del paciente usando la nueva función de la API. Se aplicó el color corporativo al botón principal.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Refactorización completa de `src/screens/PatientDetailScreen.tsx`.


  ---
## Tarea (Detalle Consulta): API para Obtener Consulta por ID

- **ID:** `API-CONS-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la función `getConsultationById` en la capa de API. Esta función es el requisito previo para poder construir la pantalla de detalle de una consulta.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Nueva función `getConsultationById` en `src/db/api/consultations.ts`.


  ---
## Tarea (Detalle Consulta): UI para Ver Consulta

- **ID:** `UI-CONS-DETAIL-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la nueva pantalla `ConsultationDetailScreen`, diseñada para mostrar de forma detallada y de solo lectura los datos de una consulta pasada.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Creación del archivo `src/screens/ConsultationDetailScreen.tsx`.
  - Actualización de tipos en `src/navigation/AppNavigator.tsx`.


  ---
## Tarea (Detalle Consulta): Conexión de Navegación

- **ID:** `NAV-CONS-DETAIL-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para hacer que los elementos de la lista de historial en `PatientDetailScreen` sean presionables y naveguen a la pantalla `ConsultationDetailScreen`, completando el flujo de visualización de historial.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Refactorización de `renderConsultationItem` en `src/screens/PatientDetailScreen.tsx`.


  ---
## Tarea (Detalle Consulta): Renderizado de Datos Completos

- **ID:** `UI-CONS-DETAIL-002-RENDER`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para refactorizar `ConsultationDetailScreen` con la lógica completa para parsear y renderizar todos los datos de una consulta, incluyendo los campos JSON y las fotos asociadas.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Refactorización completa de `src/screens/ConsultationDetailScreen.tsx`.


  ---
## Tarea (Edición): Botón de Editar

- **ID:** `FEAT-EDIT-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para añadir el botón "Editar Consulta" en la pantalla de detalle y actualizar los tipos de navegación para iniciar el flujo de edición.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Modificaciones en `ConsultationDetailScreen.tsx` y `AppNavigator.tsx`.

  ---
## Tarea (Edición): Cargar Datos para Editar

- **ID:** `FEAT-EDIT-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para modificar `NewConsultationScreen` y la API de datos. Ahora el formulario puede iniciarse en "modo edición", cargando los datos de una consulta existente en un nuevo borrador editable.
- **Artefactos Generados:**
  - Nueva función `createDraftFromConsultation` en `src/db/api/consultations.ts`.
  - Lógica de carga condicional en el `useEffect` de `NewConsultationScreen.tsx`.

  ---
## Tarea (Edición): API para Actualizar Consulta

- **ID:** `FEAT-EDIT-003`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear la función `updateConsultation` en la capa de API. Esta función es responsable de ejecutar la sentencia `UPDATE` para guardar los cambios de una consulta editada.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Nueva función `updateConsultation` en `src/db/api/consultations.ts`.


  ---
## Tarea (Edición): Lógica de Guardado Inteligente

- **ID:** `FEAT-EDIT-004`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para refactorizar la función de guardado en `NewConsultationScreen`, permitiéndole manejar tanto la creación de nuevas consultas (`finalizeConsultation`) como la actualización de las existentes (`updateConsultation`).
- **Artefactos Generados:**
  - Nueva función `deleteDraft` en la API de datos.
  - Lógica de guardado condicional en `handleFinalSave` en `NewConsultationScreen.tsx`.


  ---
## Tarea (Edición In-Place): Extracción de ConsultationForm

- **ID:** `REFACTOR-FORM-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para la refactorización principal: extraer la UI y lógica del formulario de `NewConsultationScreen` a un nuevo componente reutilizable `ConsultationForm`.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Creación del esqueleto de `src/components/forms/ConsultationForm.tsx`.
  - Simplificación de `src/screens/NewConsultationScreen.tsx`.

  ---
## Tarea (Edición In-Place): Implementación en Detalle

- **ID:** `REFACTOR-EDIT-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para refactorizar por completo `ConsultationDetailScreen`. Ahora utiliza el componente `ConsultationForm` y contiene toda la lógica de estado para alternar entre los modos de solo lectura y edición, así como los botones y funciones para guardar o cancelar los cambios.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Implementación completa de la lógica de edición "in-place" en `src/screens/ConsultationDetailScreen.tsx`.

  ---
## Tarea (Edición In-Place): Limpieza Arquitectónica

- **ID:** `REFACTOR-CLEANUP-003`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para simplificar `NewConsultationScreen`, eliminando la lógica de edición redundante. El componente ahora se adhiere al Principio de Responsabilidad Única, dedicándose exclusivamente a la creación de nuevas consultas.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Refactorización y simplificación de `src/screens/NewConsultationScreen.tsx`.

  ---
## Tarea (Rediseño): Implementación de Navegación por Pestañas

- **ID:** `NAV-REDESIGN-001`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para la refactorización completa del sistema de navegación, implementando un Bottom Tab Navigator como base de la aplicación y anidando los flujos de Stack existentes.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora (incluye instalación de dependencias).
  - Creación de 3 pantallas placeholder.
  - Refactorización completa de `src/navigation/AppNavigator.tsx`.

  ---
# FASE II: BACKEND API

## Tarea 1 (API V2): Setup del Proyecto y Migraciones

- **ID:** `API-SETUP-002-MIGRATIONS`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para la configuración inicial del proyecto de backend, incluyendo la instalación y configuración de la herramienta de migraciones de base de datos `node-pg-migrate`.
- **Artefactos Generados:**
  - Comandos de instalación de dependencias, incluyendo `node-pg-migrate`.
  - Configuración de scripts de migración en `package.json`.
  - Creación del archivo `.env` con la `DATABASE_URL`.
  - Comando para generar el primer archivo de migración.

  ---
## Tarea (API): Creación del Esquema de Base de Datos

- **ID:** `API-MIGRATE-001-SCHEMA`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para llenar el primer archivo de migración con el código SQL para crear el esquema multi-empresa completo (`companies`, `locations`, `users`, `patients`, `consultations`) en PostgreSQL.
- **Artefactos Generados:**
  - Código completo para el archivo de migración.
  - Comando `npm run migrate up` para ejecutar la migración.

  ---
## Tarea (API): Conexión a la Base de Datos Dedicada

- **ID:** `API-DB-CONNECT-002`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para configurar la conexión entre la API local y la base de datos `fotoreg-db` en el VPS, usando un archivo .env y un módulo de configuración con prueba de conexión.
- **Artefactos Generados:**
  - Creación de `.env` y `src/config/db.ts`.
  - Modificación de `src/index.ts` para verificar la conexión.

  ---
## Tarea (API): Creación del Primer Endpoint (Companies)

- **ID:** `API-ENDPOINT-001-COMPANY`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el primer endpoint de la API (`POST /api/companies`) para registrar nuevas empresas, siguiendo el patrón arquitectónico Ruta-Controlador-Servicio.
- **Artefactos Generados:**
  - Archivos `companyService.ts`, `companyController.ts`, y `companyRoutes.ts`.
  - Modificación de `index.ts` para registrar la nueva ruta.


  ---
## Tarea (API): Endpoints para Locations (Sedes)

- **ID:** `API-ENDPOINT-002-LOCATIONS`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear los endpoints de `locations` (`POST` y `GET`). Se implementó la arquitectura de rutas anidadas para que las sedes dependan de las compañías (`/companies/:companyId/locations`).
- **Artefactos Generados:**
  - Archivos `locationService.ts`, `locationController.ts`, y `locationRoutes.ts`.
  - Modificación de `companyRoutes.ts` para anidar las nuevas rutas.

  ---
### Artefacto 2: Bloque de Registro
*Copia y pega este bloque de código al final de tu archivo `src/.ai_context/INSTRUCTION_LEDGER.md`.*
```markdown
---
## Tarea (API): Autenticación de Admin con Google

- **ID:** `API-AUTH-001-GOOGLE`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para crear el endpoint de autenticación con Google. La lógica incluye la verificación de tokens de Google, el proceso de "encontrar o crear" (upsert) para usuarios y compañías, y la generación de un token de sesión JWT propio.
- **Artefactos Generados:**
  - Nuevos archivos `authService.ts`, `authController.ts`, y `authRoutes.ts`.
  - Actualización de `index.ts` para registrar las rutas de autenticación.


  ---
### Artefacto 2: Bloque de Registro
*Copia y pega este bloque de código al final de tu archivo `src/.ai_context/INSTRUCTION_LEDGER.md`.*
```markdown
---
## Tarea (Master Refactor): Implementación del Modelo de Datos V3

- **ID:** `DATA-MODEL-V3-FINAL`
- **Estado:** `COMPLETADO`
- **Descripción:** Se generaron las instrucciones para la refactorización completa de la capa de datos. Esto aborda las observaciones de Codex y añade la nueva funcionalidad de "Acompañante/Responsable". Incluye la actualización del esquema de la base de datos, los tipos de TypeScript y la encapsulación de la lógica JSON en la capa de API de datos.
- **Artefactos Generados:**
  - Instrucción para IA Desarrolladora.
  - Nuevo esquema V3 en `src/db/database.ts`.
  - Nuevos tipos V3 en `src/types/index.ts`.
  - Patrón de refactorización para la API de datos en `src/db/api/consultations.ts`.