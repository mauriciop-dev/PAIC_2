# 👥 GUÍA DE USUARIO - PAIC

**Plataforma de Administración Inteligente de Conjuntos**

Versión: 1.0.0  
Fecha: 10 de junio de 2026  
Audiencia: Administradores de conjuntos residenciales

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Navegación Básica](#navegación-básica)
4. [Centro de Control (Dashboard)](#centro-de-control-dashboard)
5. [Gestión de Residentes](#gestión-de-residentes)
6. [Gestión Financiera](#gestión-financiera)
7. [Seguridad y Control de Acceso](#seguridad-y-control-de-acceso)
8. [Comunicaciones Masivas](#comunicaciones-masivas)
9. [Gestión de Archivos](#gestión-de-archivos)
10. [Áreas Comunes](#áreas-comunes)
11. [Chatbot IA](#chatbot-ia)
12. [Configuración](#configuración)
13. [Preguntas Frecuentes](#preguntas-frecuentes)
14. [Solución de Problemas](#solución-de-problemas)

---

## 📖 Introducción

PAIC es tu asistente digital para administrar tu conjunto residencial de forma eficiente. Esta guía te ayudará a aprovechar todas las características de la plataforma.

### ¿Qué puedo hacer con PAIC?

✅ Gestionar residentes y apartamentos  
✅ Controlar finanzas (ingresos y gastos)  
✅ Registrar visitantes y paquetes  
✅ Enviar comunicaciones a residentes  
✅ Gestionar áreas comunes y reservas  
✅ Usar un asistente IA para automatizar tareas  
✅ Generar reportes y análisis  

---

## 🚀 Primeros Pasos

### Paso 1: Acceder a PAIC

1. Abre tu navegador
2. Ve a: `http://localhost:3000` (local) o tu URL de producción
3. Verás la pantalla de login

### Paso 2: Crear tu Cuenta

**Opción A: Usar Google (Recomendado)**
1. Haz clic en "Acceso para Administradores"
2. Haz clic en "Continuar con Google"
3. Autentica con tu cuenta Google
4. PAIC creará tu perfil automáticamente

**Opción B: Login Manual** (para personal interno)
1. Haz clic en "Soy Personal Interno"
2. Ingresa email y contraseña
3. Haz clic en "Ingresar"

### Paso 3: Configuración Inicial

Primera vez que ingresas como administrador:

1. Se abre el modal "Configuración Inicial"
2. Completa los datos:
   - **Nombre del Conjunto**: Ej: "Conjunto Residencial Los Andes"
   - **NIT**: Número de identificación tributaria
   - **Dirección**: Ubicación completa
   - **Nombre Administrador**: Tu nombre
   - **Email**: Tu correo (se autocompleta)
   - **Teléfono**: Contacto de emergencia

3. Haz clic "Guardar"
4. ¡Listo! Acceso a plataforma completa

### Paso 4: Tutorial Interactivo (Opcional)

Primera vez, PAIC ofrece un tour guiado:
- Haz clic en "Mostrar Tour" o "Omitir"
- El tour te muestra cada sección principal

---

## 🧭 Navegación Básica

### Estructura de Pantalla

```
┌─────────────────────────────────────────────┐
│           HEADER (Logo + Usuario)            │
├─────────────────────────────────────────────┤
│  NavBar (Pestañas principales)              │
├─────────┬───────────────────────────────────┤
│ Lateral │         CONTENIDO PRINCIPAL       │
│ (si AP) │                                   │
├─────────┴───────────────────────────────────┤
│            CHATBOT (esquina abajo)          │
└─────────────────────────────────────────────┘
```

### Header (Arriba)

**Lado izquierdo:**
- Logo PAIC
- Estado: "Trial" o "Pro"
- Si Trial: días restantes (Ej: "13 días restantes")

**Lado derecho:**
- Ícono de perfil
- Nombre de usuario
- Menú desplegable (⋮)

### NavBar (Pestañas)

Las pestañas disponibles dependen de tu rol:

**Para Administradores:**
- 🏠 Centro de Control
- 📊 Base de Datos
- 🏢 Áreas Comunes
- 💬 Comunicaciones
- 📁 Archivos
- 💰 Finanzas
- 🔒 Seguridad
- 📅 Vencimientos
- ✅ Tareas Pendientes
- ⚙️ Configuración (ícono engranaje)

**Para Guardias:**
- 🔒 Seguridad (solo)

**Para Contadores:**
- 💰 Finanzas (solo)

### Menú de Usuario (arriba derecha)

Haz clic en tu nombre o foto:

```
┌─────────────────────┐
│ Mi Perfil           │
│ Configuración       │
│ Ayuda               │
│ Cerrar Sesión       │
└─────────────────────┘
```

---

## 📊 Centro de Control (Dashboard)

Página inicial con resumen ejecutivo.

### Acceder
Haz clic en "Centro de Control" en NavBar

### Secciones

#### 1. **Estadísticas Clave** (arriba)

Cuatro tarjetas mostrando:
- 📊 **Residentes en Deuda**: Número y balance total
- 📋 **Tareas Pendientes**: Cantidad de tareas
- 📅 **Pagos Vencidos**: Obligaciones vencidas
- 📦 **Paquetes por Entregar**: Pendientes de entregar

Interacción: Haz clic en una tarjeta para ir al módulo correspondiente

#### 2. **Centro de Notificaciones**

Muestra hasta 5 alertas prioritarias:
- 🔴 Urgentes (rojo)
- 🟡 Media (amarillo)
- 🟢 Baja (verde)

**Ejemplo de notificación:**
```
⚠️ Apto 402: Pago vencido hace 15 días ($150.000)
→ [Ir a Finanzas]
```

Haz clic en cualquier notificación para ir al módulo relevante.

#### 3. **Gráficos de Análisis** (abajo)

Dos gráficos principales:

**A) Ingresos vs Gastos (Gráfico de Barras)**
- Eje X: Meses (últimos 12)
- Eje Y: Valores en pesos
- Barras verdes: Ingresos
- Barras rojas: Gastos
- Útil para ver tendencias financieras

**B) Distribución de Gastos (Gráfico Circular)**
- Categorías: Servicios, Mantenimiento, Nómina, etc.
- Colores diferentes para cada categoría
- Porcentaje de cada área

**Otros gráficos:**
- Volumen de paquetes por periodo
- Tráfico de visitantes por punto de acceso

---

## 👥 Gestión de Residentes

### Acceder
Haz clic en "Base de Datos" en NavBar

### Funciones Principales

#### 1. Ver Lista de Residentes

**Pantalla inicial:**
- Tabla con todos los residentes
- Columnas: Apartamento, Nombre, Email, Teléfono, Acciones

**Búsqueda y Filtros:**
```
┌──────────────────────────────────────┐
│ Buscar por apartamento o nombre: [__] │
└──────────────────────────────────────┘
Filtros: [Nombre ▼] [A-Z ▼] [Apto: ▼]
```

#### 2. Agregar Residente

**Método 1: Manual**
1. Haz clic en botón "+ Agregar Residente"
2. Se abre modal
3. Completa:
   - Apartamento: "401" (número o código)
   - Nombre: Nombre completo
   - Email: correo@ejemplo.com
   - Teléfono: +57 3001234567
4. Haz clic "Guardar"
5. Confirmación: "Residente agregado exitosamente"

**Método 2: Importar Excel**
1. Haz clic en "Importar desde Excel"
2. Descarga plantilla (opcionalmente)
3. Completa Excel con datos:
   ```
   | Apartamento | Nombre | Email | Teléfono |
   |-------------|--------|-------|----------|
   | 401 | Juan Pérez | juan@... | 3001234567 |
   | 402 | María García | maria@... | 3001234568 |
   ```
4. Sube archivo
5. Revisa preview
6. Haz clic "Importar"
7. Confirmación: "15 residentes importados exitosamente"

#### 3. Editar Residente

1. En tabla, haz clic en ícono "✏️ Editar"
2. Se abre modal con datos
3. Modifica los campos necesarios
4. Haz clic "Guardar Cambios"

#### 4. Eliminar Residente

1. En tabla, haz clic en ícono "🗑️ Eliminar"
2. Confirmación: "¿Seguro que deseas eliminar a Juan Pérez?"
3. Haz clic "Confirmar"
4. Confirmación: "Residente eliminado"

#### 5. Ver Estado de Cuenta

1. Haz clic en apartamento (ej: "401")
2. Se abre panel lateral
3. Muestra:
   - Datos personales
   - Estado financiero
   - Historial de pagos
   - Deuda actual (si aplica)

---

## 💰 Gestión Financiera

### Acceder
Haz clic en "Finanzas" en NavBar

### Estructura

La sección tiene 3 pestañas:

```
[📊 Resumen] [📥 Ingresos] [📤 Gastos]
```

---

### A. RESUMEN FINANCIERO

**Muestra:**

1. **Tarjetas de Totales:**
   - Total Ingresos (este mes/año)
   - Total Gastos (este mes/año)
   - Balance (Ingresos - Gastos)

2. **Gráfico de Barras:**
   - Mes a mes (últimos 12 meses)
   - Comparación Ingresos vs Gastos

3. **Gráfico Circular:**
   - Distribución de gastos por categoría

---

### B. SECCIÓN INGRESOS

#### Ver Ingresos

Tabla con columnas:
- Descripción
- Categoría (Cuota Admin, Multas, Alquiler, Otros)
- Fecha
- Monto
- Acciones

#### Agregar Ingreso Manual

1. Haz clic "+ Nuevo Ingreso"
2. Modal se abre
3. Completa:
   - Descripción: "Cuota de administración - Junio"
   - Categoría: [Cuota de Administración ▼]
   - Monto: 450000
   - Fecha: [Selector calendario]
4. Haz clic "Guardar"

#### Importar Ingresos (Excel)

1. Haz clic "📥 Importar Excel"
2. Opcionalmente descarga plantilla
3. Completa Excel:
   ```
   | Descripción | Monto | Categoría | Fecha |
   |-------------|-------|-----------|-------|
   | Cuota Admin | 450000 | Cuota de Administración | 2026-06-01 |
   | Multa Apto 401 | 50000 | Multas | 2026-06-05 |
   ```
4. Sube archivo
5. Sistema valida formato
6. Preview de datos
7. Haz clic "Importar"
8. Confirmación: "23 ingresos importados"

#### Editar Ingreso

1. Haz clic "✏️" en tabla
2. Modal se abre con datos
3. Modifica
4. Haz clic "Guardar Cambios"

#### Eliminar Ingreso

1. Haz clic "🗑️" en tabla
2. Confirmación
3. Haz clic "Confirmar eliminar"

#### Descargar Plantilla

1. Haz clic "📥 Descargar Plantilla"
2. Se descarga archivo Excel vacío
3. Llena con tus datos
4. Sube mediante "Importar Excel"

---

### C. SECCIÓN GASTOS

Funciona igual que ingresos, pero con:

**Categorías de Gastos:**
- Servicios (agua, luz, internet)
- Mantenimiento
- Nómina
- Administrativos
- Otros

**Campo adicional:**
- Proveedor: [Selector de proveedores]

#### Flujo Típico de Gasto

1. Haz clic "+ Nuevo Gasto"
2. Completa:
   - Descripción: "Reparación de escaleras"
   - Categoría: Mantenimiento
   - Monto: 1500000
   - Proveedor: [Construcciones XYZ ▼]
   - Fecha: 2026-06-10
3. Haz clic "Guardar"
4. Confirmación

---

## 🔒 Seguridad y Control de Acceso

### Acceder
Haz clic en "Seguridad" en NavBar

### Estructura

Dos pestañas:
```
[👥 Visitantes] [📦 Paquetes]
```

---

### A. REGISTRAR VISITANTE

**¿Quién usa esto?**
Personal de seguridad (guardias) principalmente.

**Proceso:**

1. Visitante llega a portería
2. Guardia abre pestaña "Visitantes"
3. Haz clic "+ Nuevo Visitante"
4. Modal se abre
5. Completa:
   - **Nombre Visitante**: "Juan Gómez"
   - **Apartamento**: "405" (destino)
   - **Fecha**: [Hoy automático]
   - **Hora Entrada**: [14:30]
   - **Punto de Acceso**: [Portería Principal ▼]

6. Haz clic "Registrar"
7. Sistema notifica al residente del apto 405
8. Confirmación: "Visitante registrado"

**¿Qué pasa después?**
- Residente del apto 405 recibe notificación
- Residente autoriza o rechaza visitante
- Si autoriza: Guardia puede dejar entrar
- Si rechaza: Guardia debe negar acceso

#### Marcar Salida de Visitante

1. En tabla de visitantes, busca el registro
2. Haz clic "Registrar Salida"
3. Sistema captura hora actual
4. Confirmación: "Salida registrada - Duración: 1h 30m"

#### Ver Historial

1. En tabla, ves todos los visitantes del día
2. Puedes filtrar por:
   - Fecha (rango)
   - Apartamento
   - Estado (Autorizado, Pendiente, Rechazado)
3. Ícono "👁️ Ver" para detalles

---

### B. REGISTRAR PAQUETE

**Proceso:**

1. Guardia recibe paquete
2. Abre pestaña "Paquetes"
3. Haz clic "+ Nuevo Paquete"
4. Completa:
   - **Apartamento**: "302"
   - **Courier**: [DHL ▼] o escribe "DHL"
   - **Número de Seguimiento**: "123456789"
   - **Punto de Acceso**: [Portería Principal ▼]
   - **Fecha Recepción**: [Hoy automático]

5. Haz clic "Registrar"
6. Sistema notifica residente
7. Confirmación: "Paquete registrado"

#### Marcar Paquete como Entregado

1. En tabla, cuando residente lo retira
2. Haz clic "Marcar Entregado"
3. Captura fecha/hora de entrega
4. Haz clic "Confirmar"
5. Sistema actualiza estado

#### Ver Pendientes

1. Sistema muestra solo paquetes no entregados
2. Filtra por:
   - Apartamento
   - Courier
   - Antigüedad

---

## 💬 Comunicaciones Masivas

### Acceder
Haz clic en "Comunicaciones" en NavBar

### ¿Para qué sirve?

Enviar emails a múltiples residentes/grupos sobre:
- Avisos importantes
- Recordatorios de pago
- Información de mantenimiento
- Avisos de servicios
- etc.

### Proceso Paso a Paso

#### Paso 1: Redactar Mensaje

**Opción A: Escribir Manual**

1. En campo "Asunto", ingresa tema:
   - Ej: "Recordatorio: Pago de Cuota - Junio 2026"

2. En campo "Cuerpo", escribe el mensaje:
   ```
   Estimados Residentes,

   Les recordamos que la cuota de administración 
   vence el 15 de junio. El valor es de $450.000.

   Pueden pagar en:
   - Banco XYZ, Cuenta: 12345678
   - Transferencia Nequi

   Gracias,
   Administración
   ```

**Opción B: Generar con IA**

1. Haz clic "✨ Generar con IA"
2. Ingresa instrucción:
   - "Recordar a residentes sobre pago de cuota vencida"
3. Gemini genera 3 opciones
4. Selecciona la mejor
5. Se completa el campo automáticamente
6. Puedes editar si necesario

#### Paso 2: Seleccionar Destinatarios

En sección "Destinatarios", elige grupo:

- **👥 Todos**: Todos los residentes
- **💳 Deudores**: Solo los que tienen deuda
- **🏢 Proveedores**: Personal de servicios
- **👔 Personal Interno**: Guardias, contadores, etc.

O específico:
- **🎯 Personalizado**: Ingresa emails individuales

#### Paso 3: Adjuntar Documentos (Opcional)

1. Haz clic "📎 Adjuntar Archivo"
2. Se abre modal "Seleccionar Archivos"
3. Muestra archivos en nube (PDFs)
4. Selecciona los que necesitas
5. Haz clic "Confirmar"
6. Se muestran en campo "Adjuntos"

#### Paso 4: Enviar

1. Revisa todo esté correcto
2. Haz clic "📧 Enviar a 47 destinatarios"
3. Confirmación: "Email enviado exitosamente"
4. Puedes ver en historial

#### Ver Historial de Comunicaciones

1. Pestaña "Historial" en Comunicaciones
2. Tabla muestra:
   - Fecha de envío
   - Asunto
   - Destinatarios (cantidad)
   - Estado (Enviado, Fallo)
   - Acciones (Ver detalles, Reenviar)

---

## 📁 Gestión de Archivos

### Acceder
Haz clic en "Archivos" en NavBar

### ¿Para qué sirve?

Almacenar documentos importantes del conjunto:
- Reglamentos
- Políticas
- Recibos
- Contratos
- Formatos

### Subir Archivo

1. Haz clic "📤 Subir Archivo"
2. Selector de archivo se abre
3. Selecciona PDF (máximo 5MB)
4. Haz clic "Abrir"
5. Sistema valida
6. Confirmación: "Archivo subido exitosamente"
7. Aparece en tabla

### Ver Archivos

Tabla muestra:
- Nombre del archivo
- Tamaño (Ej: 2.5 MB)
- Fecha de carga
- Acciones: Descargar, Compartir, Eliminar

### Descargar Archivo

1. En tabla, haz clic "📥 Descargar"
2. Archivo se descarga a tu PC
3. Puedes abrirlo con tu lector PDF

### Compartir en Comunicaciones

1. En tabla, haz clic "📧 Compartir"
2. Te redirige a Comunicaciones
3. Se pre-selecciona el archivo
4. Completa asunto, cuerpo y destinatarios
5. Haz clic "Enviar"

### Eliminar Archivo

1. En tabla, haz clic "🗑️ Eliminar"
2. Confirmación: "¿Seguro que deseas eliminar?"
3. Haz clic "Confirmar"
4. Confirmación: "Archivo eliminado"

---

## 🏢 Áreas Comunes

### Acceder
Haz clic en "Áreas Comunes" en NavBar

### ¿Para qué sirve?

Gestionar espacios compartidos y reservas:
- Salón comunal
- Cancha de tenis
- Piscina
- Gimnasio
- etc.

### Ver Áreas

1. Tabla con todas las áreas comunes
2. Columnas: Nombre, Capacidad, Color, Acciones

### Crear Área Nueva

1. Haz clic "+ Crear Área"
2. Modal se abre
3. Completa:
   - **Nombre**: "Salón Comunal"
   - **Capacidad**: "50" personas
   - **Color**: [Selector color] (para identificarla)
   - **Descripción**: "Espacio para eventos y reuniones"

4. Haz clic "Guardar"
5. Confirmación

### Ver Reservas de un Área

1. En tabla, haz clic en nombre del área
2. Se abre calendario
3. Muestra:
   - Fechas con reservas (ocupadas en color)
   - Fechas disponibles (vacías)
   - Detalles: Quién reservó, horario

### Crear Reserva Manual

1. En calendario, haz clic en fecha/hora disponible
2. Modal se abre
3. Pre-rellena:
   - Área (ya seleccionada)
   - Fecha
4. Completa:
   - **Apartamento**: "305"
   - **Hora Inicio**: 14:00
   - **Hora Fin**: 17:00
   - **Propósito**: "Cumpleaños"

5. Haz clic "Reservar"
6. Confirmación: "Reserva creada exitosamente"

### Cancelar Reserva

1. En calendario, haz clic en reserva
2. Detalles aparecen
3. Haz clic "Cancelar Reserva"
4. Confirmación
5. Haz clic "Confirmar"

---

## 🤖 Chatbot IA

### ¿Dónde está?

Botón flotante en esquina inferior derecha:
```
    ┌────────┐
    │  💬    │
    │ Chat   │
    └────────┘
```

### ¿Para qué sirve?

Asistente IA que puede:
- Responder preguntas
- Ejecutar acciones (registrar, editar, etc.)
- Generar reportes
- Automatizar tareas

### Cómo Usar

#### Abrir Chatbot

1. Haz clic en botón flotante "💬"
2. Ventana se abre (derecha de pantalla)
3. Ves historial de conversación

#### Hacer Pregunta Simple

```
Tú: "¿Cuántos residentes tengo?"
IA: "Tienes 47 residentes registrados en el conjunto."
```

#### Pedir Acción

```
Tú: "Agrega a María López en apartamento 302, 
     email: maria@gmail.com, teléfono: 3001234567"
IA: [Ejecuta] "He agregado a María López. ¿Algo más?"
```

#### Generar Contenido

```
Tú: "Genera un recordatorio amable sobre pago de cuota"
IA: [Propone 3 versiones]
    - Opción 1: [Formal]
    - Opción 2: [Amigable]
    - Opción 3: [Breve]
Tú: [Selecciona Opción 2]
IA: "Perfecto, copiado al portapapeles"
```

### Ejemplos de Comandos

| Comando | Resultado |
|---------|-----------|
| "Cuántas personas están en deuda?" | Retorna número y monto total |
| "Muéstrame los paquetes de hoy" | Lista paquetes registrados |
| "Registra un visitante para el apto 401" | Guía el proceso |
| "Genera email de recordatorio" | Propone opciones |
| "Cuál es el balance financiero?" | Muestra ingresos, gastos, balance |

### Casos de Uso Comunes

**1. Por la mañana:**
```
"Buenos días, dame un resumen de ayer"
→ Deudas nuevas, paquetes, visitantes
```

**2. Agregar residente rápido:**
```
"Agrega a la familia González en apto 501, 
 email: gonzalez@email.com, teléfono: 3009876543"
```

**3. Consulta rápida:**
```
"¿Hay visitas pendientes de autorizar?"
```

**4. Reporte:**
```
"Dame gastos del último mes por categoría"
```

---

## ⚙️ Configuración

### Acceder
Haz clic en ícono engranaje "⚙️" en NavBar

### Estructura

Varias pestañas en lateral izquierdo:

```
[Perfil]
[Conjunto]
[Puntos de Acceso]
[Gestionar Áreas]
[Suscripción]
[Usuarios]
[Permisos de Usuario]
```

---

### A. PERFIL

**Tus datos personales:**

1. Foto de perfil (avatar)
2. Nombre completo
3. Email
4. Teléfono
5. Rol actual

**Acciones:**
- Editar nombre/teléfono
- Cambiar foto
- Cambiar contraseña
- Activar 2FA (recomendado)

---

### B. CONJUNTO

**Información del conjunto:**

1. Nombre
2. NIT
3. Dirección
4. Nombre del administrador
5. Email de contacto
6. Teléfono

**Acciones:**
- Editar información
- Ver historial de cambios
- Descargar certificado
- Solicitar auditoría

---

### C. PUNTOS DE ACCESO

**Porterías/entradas del conjunto:**

**Ver puntos:**
Tabla con:
- Nombre
- Descripción
- Ubicación

**Agregar punto:**
1. Haz clic "+ Nuevo Punto"
2. Completa:
   - Nombre: "Portería Principal"
   - Descripción: "Entrada por calle 5"
   - Ubicación: Croquis o descripción

3. Haz clic "Guardar"

**Eliminar punto:**
1. En tabla, haz clic "🗑️"
2. Confirmación
3. Haz clic "Confirmar"

---

### D. GESTIONAR ÁREAS COMUNES

Similar a Áreas Comunes, pero desde configuración:
- Ver todas las áreas
- Crear nuevas
- Editar existentes
- Eliminar

---

### E. SUSCRIPCIÓN

**Tu plan actual:**

```
┌─────────────────────────────┐
│ Plan: TRIAL (14 días)       │
│ Días restantes: 13          │
│                             │
│ [Actualizar a Plan Pro]     │
└─────────────────────────────┘
```

**Plan Pro incluye:**
✅ Sin límite de residentes
✅ Sin límite de comunicaciones
✅ Soporte prioritario
✅ Backups automáticos
✅ Integraciones avanzadas

**Cómo actualizar:**
1. Haz clic "Actualizar a Plan Pro"
2. Se abre Mercado Pago
3. Completa pago
4. Plan actualiza automáticamente

---

### F. USUARIOS

**Gestionar personal interno:**

Tabla con:
- Email
- Nombre
- Rol (Guard, Contador, Admin)
- Estado (Activo, Inactivo)
- Acciones (Editar, Eliminar)

**Agregar usuario:**
1. Haz clic "+ Agregar Usuario"
2. Completa:
   - Email: usuario@ejemplo.com
   - Nombre: Nombre Completo
   - Rol: [Guardián ▼]
   - Contraseña: [Auto-generada o ingresa]

3. Haz clic "Crear"
4. Usuario recibe email con credenciales

**Editar usuario:**
1. En tabla, haz clic "✏️"
2. Modifica campos
3. Haz clic "Guardar"

**Eliminar usuario:**
1. En tabla, haz clic "🗑️"
2. Confirmación
3. Haz clic "Confirmar"

---

### G. PERMISOS DE USUARIO

**Personalizar roles:**

1. Tabla con roles predefinidos:
   - Guard (Seguridad)
   - Contador (Finanzas)
   - Admin Completo

2. Haz clic en rol para ver permisos:
   ```
   ☑️ Centro de Control
   ☑️ Base de Datos
   ☐ Áreas Comunes
   ☑️ Comunicaciones
   ☐ Archivos
   ☑️ Finanzas
   ☑️ Seguridad
   ☐ Vencimientos
   ☐ Tareas Pendientes
   ```

3. Marca/desmarca permisos
4. Haz clic "Guardar"

**Crear rol personalizado:**
1. Haz clic "+ Crear Rol"
2. Nombre: "Encargado Finanzas"
3. Selecciona permisos:
   - ☑️ Finanzas
   - ☑️ Base de Datos
4. Haz clic "Crear"

---

## ❓ Preguntas Frecuentes

### 1. ¿Cómo reinicio mi contraseña?
En login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones.

### 2. ¿Puedo cambiar a otro conjunto?
No directamente. Crea un nuevo usuario/cuenta para otro conjunto.

### 3. ¿Cada cuánto se respaldan los datos?
Supabase hace backups automáticos diarios. También puedes exportar manualmente.

### 4. ¿Qué pasa cuando vence el período de prueba?
Te enviamos email. Sin pago, la plataforma se desactiva (datos se conservan 90 días).

### 5. ¿Puedo tener múltiples administradores?
Sí, agrega usuarios con rol "Admin Completo" en Configuración → Usuarios.

### 6. ¿Los residentes ven su estado de cuenta?
No, actualmente solo los administradores. Próximamente habrá portal de residentes.

### 7. ¿Límite de residentes?
Teóricamente ilimitado, pero recomendamos máximo 1000 por rendimiento.

### 8. ¿Puedo integrar con otros sistemas?
Próximamente habrá API pública. Actualmente no.

### 9. ¿Existe app móvil?
Por ahora web responsive. App nativa está en roadmap.

### 10. ¿Cuál es el costo del plan Pro?
Varía por región. Verifica en tu moneda cuando intentas actualizar.

---

## 🐛 Solución de Problemas

### Problema: "No puedo iniciar sesión"

**Solución:**
1. Verifica que escribes bien tu email
2. Asegúrate que tu contraseña es correcta
3. Haz clic "¿Olvidaste tu contraseña?" para reiniciar
4. Si usas Google, verifica tener cuenta Google activa
5. Borra cache del navegador (Ctrl+Shift+Del)

### Problema: "No veo mis datos"

**Solución:**
1. Verifica que estés en el conjunto correcto
2. Cierra y abre sesión nuevamente
3. Actualiza página (F5)
4. Si problema persiste, contacta soporte

### Problema: "No puedo subir archivos"

**Solución:**
1. Verifica que archivo sea PDF
2. Verifica tamaño < 5MB
3. Intenta con otro navegador
4. Borra cache

### Problema: "El email no se envía"

**Solución:**
1. Verifica que destinatarios sean válidos
2. Revisa conexión a internet
3. Espera 2-3 minutos (proceso asincrónico)
4. Revisa sección "Historial" para confirmar envío

### Problema: "Chatbot no responde"

**Solución:**
1. Verifica conexión a internet
2. Intenta pregunta más simple
3. Recarga página
4. Si problema persiste, hay issue con Gemini

### Problema: "Cambios no se guardan"

**Solución:**
1. Verifica conexión a internet
2. Asegúrate de hacer clic botón "Guardar"
3. Busca mensajes de error en página
4. Intenta en otro navegador

### Problema: "La plataforma está lenta"

**Solución:**
1. Verifica conexión a internet
2. Cierra otras pestañas/aplicaciones
3. Borra cache del navegador
4. Intenta en navegador diferente
5. Si es recurrente, contacta soporte

---

## 📞 Contacto y Soporte

**¿Necesitas ayuda?**

- **Email**: soporte@paic.com
- **Chat**: Abre chat en la plataforma
- **Teléfono**: +57 (1) XXXX-XXXX
- **Documentación**: https://docs.paic.com

---

**Versión**: 1.0.0  
**Última actualización**: 10 de junio de 2026  
**Próximas actualizaciones**: Agosto 2026
