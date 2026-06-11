# 🧪 MANUAL DE TESTING - PAIC

**Plataforma de Administración Inteligente de Conjuntos**

Versión: 1.0.0  
Fecha: 10 de junio de 2026  
Audiencia: QA Engineers, Testers

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Entorno de Testing](#entorno-de-testing)
3. [Casos de Prueba - Autenticación](#casos-de-prueba---autenticación)
4. [Casos de Prueba - Dashboard](#casos-de-prueba---dashboard)
5. [Casos de Prueba - Residentes](#casos-de-prueba---residentes)
6. [Casos de Prueba - Finanzas](#casos-de-prueba---finanzas)
7. [Casos de Prueba - Seguridad](#casos-de-prueba---seguridad)
8. [Casos de Prueba - Comunicaciones](#casos-de-prueba---comunicaciones)
9. [Casos de Prueba - Archivos](#casos-de-prueba---archivos)
10. [Casos de Prueba - Chatbot IA](#casos-de-prueba---chatbot-ia)
11. [Casos de Prueba - Configuración](#casos-de-prueba---configuración)
12. [Testing de Seguridad](#testing-de-seguridad)
13. [Testing de Performance](#testing-de-performance)
14. [Testing de Compatibilidad](#testing-de-compatibilidad)
15. [Reporte de Bugs](#reporte-de-bugs)

---

## 📖 Introducción

Este manual proporciona un conjunto exhaustivo de casos de prueba para validar la funcionalidad de PAIC. Cada caso incluye:

- **ID**: Identificador único
- **Descripción**: Qué se prueba
- **Pre-requisitos**: Condiciones iniciales
- **Pasos**: Instrucciones detalladas
- **Resultado Esperado**: Qué debería pasar
- **Criterio de Aceptación**: Validación de éxito

---

## 🔧 Entorno de Testing

### Configuración Recomendada

```
Navegadores:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

Sistema Operativo:
- Windows 10/11
- macOS 13+
- Ubuntu 22.04+

Dispositivos Móviles:
- iPhone 12+ (iOS 15+)
- Samsung S21+ (Android 12+)

Conexión:
- Internet: Mínimo 5 Mbps
- Ambiente: Testing, Staging, Local

Credenciales de Prueba:
- Admin: admin@test.com / password123
- Guard: guard@test.com / password123
- Contador: counter@test.com / password123
```

### Datos de Prueba Iniciales

```sql
-- Conjunto de prueba
INSERT INTO conjuntos VALUES (
  'test-conjunto-001',
  'Conjunto Test',
  '123456789',
  'Calle Test 123',
  'Admin Test',
  'admin@test.com',
  '3001234567',
  'Free',
  NULL,
  NOW()
);

-- Residentes de prueba (5 residentes)
INSERT INTO residents (conjunto_id, apartment, name, email, phone) VALUES
  ('test-conjunto-001', '101', 'Juan Pérez', 'juan@test.com', '3001111111'),
  ('test-conjunto-001', '102', 'María García', 'maria@test.com', '3002222222'),
  ('test-conjunto-001', '201', 'Carlos López', 'carlos@test.com', '3003333333'),
  ('test-conjunto-001', '202', 'Ana Martínez', 'ana@test.com', '3004444444'),
  ('test-conjunto-001', '301', 'Luis Rodríguez', 'luis@test.com', '3005555555');
```

### Reset de Ambiente

```bash
# Limpiar datos de prueba
npm run test:reset

# Recargar datos iniciales
npm run test:seed
```

---

## 🔐 CASOS DE PRUEBA - AUTENTICACIÓN

### Caso 1: Login con Google OAuth

**ID**: AUTH-001  
**Descripción**: Validar autenticación mediante Google OAuth

**Pre-requisitos:**
- Navegador con sesión Google disponible
- Conexión a internet
- Acceso a app en URL correcta

**Pasos:**
1. Abrir app en navegador
2. Ver pantalla de login
3. Hacer clic "Continuar con Google"
4. En popup de Google, ingresar email de prueba
5. Ingresar contraseña Google
6. Hacer clic "Continuar"
7. En pantalla de consentimiento, hacer clic "Permitir"

**Resultado Esperado:**
- ✅ Popup se cierra
- ✅ Redirecciona a URL principal
- ✅ Si es primera vez, muestra modal "Configuración Inicial"
- ✅ Si ya existe perfil, va directamente a Dashboard
- ✅ Header muestra nombre del usuario

**Criterio de Aceptación:**
```
☑ Usuario logueado correctamente
☑ Datos de Google se sincronizaron
☑ Perfil se creó o actualizó
☑ Email coincide con Google
☑ Avatar se descargó (si aplica)
```

---

### Caso 2: Login con Email/Contraseña (Personal Interno)

**ID**: AUTH-002  
**Descripción**: Autenticación de personal interno

**Pre-requisitos:**
- Usuario existe en tabla "users"
- Contraseña está en hash en BD

**Pasos:**
1. En login, seleccionar "Soy Personal Interno"
2. Ingresar email: "guard@test.com"
3. Ingresar contraseña: "password123"
4. Hacer clic "Ingresar"

**Resultado Esperado:**
- ✅ Valida credenciales
- ✅ Redirecciona a módulo permitido
- ✅ Muestra rol en header
- ✅ NavBar muestra solo módulos permitidos

**Criterio de Aceptación:**
```
☑ Login exitoso
☑ Sesión iniciada
☑ Permisos cargados correctamente
☑ No acceso a módulos no permitidos
```

---

### Caso 3: Email/Contraseña Incorrectos

**ID**: AUTH-003  
**Descripción**: Manejo de credenciales inválidas

**Pre-requisitos:**
- Email válido pero contraseña incorrecta

**Pasos:**
1. Seleccionar "Soy Personal Interno"
2. Email: "guard@test.com"
3. Contraseña: "passwordincorrecto"
4. Hacer clic "Ingresar"

**Resultado Esperado:**
- ✅ Mensaje de error: "Credenciales inválidas"
- ✅ Campo se marca en rojo
- ✅ Usuario NO es logueado
- ✅ Permanece en login

**Criterio de Aceptación:**
```
☑ Error capturado
☑ Mensaje amigable mostrado
☑ Sesión no se abre
☑ Log de intento fallido registrado
```

---

### Caso 4: Registro de Nuevo Administrador

**ID**: AUTH-004  
**Descripción**: Crear cuenta administrador mediante Google

**Pre-requisitos:**
- Email Google que no existe aún en PAIC
- Primera vez ingresando a la plataforma

**Pasos:**
1. Hacer clic "Continuar con Google"
2. Autenticar con Google (email nuevo)
3. Ver modal "Configuración Inicial"
4. Completar:
   - Nombre Conjunto: "Conjunto Test 2"
   - NIT: "987654321"
   - Dirección: "Carrera 10 # 45-50"
   - Admin Name: "Admin Test"
5. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Perfil se crea en "user_profiles"
- ✅ Entrada se crea en tabla "conjuntos"
- ✅ UserProfile tiene rol "Trial"
- ✅ trialExpiresAt es 14 días en el futuro
- ✅ Redirecciona a Dashboard
- ✅ Muestra "Periodo de prueba: 14 días"

**Criterio de Aceptación:**
```
☑ Usuario creado
☑ Conjunto creado
☑ Trial inicializado
☑ Datos guardados correctamente
☑ Email de bienvenida enviado
```

---

### Caso 5: Cerrar Sesión

**ID**: AUTH-005  
**Descripción**: Logout correctamente

**Pre-requisitos:**
- Usuario logueado

**Pasos:**
1. Hacer clic en nombre de usuario (arriba derecha)
2. Hacer clic "Cerrar Sesión"
3. Confirmar si aparece diálogo

**Resultado Esperado:**
- ✅ Sesión se cierra
- ✅ Redirecciona a login
- ✅ Token se elimina
- ✅ Canales Supabase se cierran
- ✅ No puede acceder sin reloguear

**Criterio de Aceptación:**
```
☑ Logout ejecutado
☑ Sesión limpiada
☑ Redirección correcta
☑ No acceso sin reloguear
```

---

## 📊 CASOS DE PRUEBA - DASHBOARD

### Caso 6: Cargar Dashboard Inicial

**ID**: DASH-001  
**Descripción**: Dashboard carga con datos correctos

**Pre-requisitos:**
- Usuario logueado
- Conjunto con 5+ residentes

**Pasos:**
1. Hacer login
2. Ver página principal (Dashboard)
3. Esperar a que datos carguen

**Resultado Esperado:**
- ✅ Dashboard carga en < 2 segundos
- ✅ Muestra 4 tarjetas de estadísticas
- ✅ Números coinciden con BD
- ✅ Gráficos se renderizan

**Criterio de Aceptación:**
```
☑ Carga < 2 segundos
☑ Datos correctos
☑ UI responsive
☑ Gráficos visibles
```

---

### Caso 7: Actualizar Estadísticas

**ID**: DASH-002  
**Descripción**: Datos se actualizan al agregar residente

**Pre-requisitos:**
- Dashboard abierto
- Residente nuevo no existe

**Pasos:**
1. Abrir Base de Datos
2. Agregar nuevo residente
3. Volver a Dashboard
4. Refrescar página

**Resultado Esperado:**
- ✅ Contador de residentes aumentó
- ✅ Número refleja nuevo total

**Criterio de Aceptación:**
```
☑ Dato actualizado
☑ Refresh no necesario (idealmente)
☑ Número correcto
```

---

### Caso 8: Interacción con Notificaciones

**ID**: DASH-003  
**Descripción**: Clic en notificación lleva al módulo

**Pre-requisitos:**
- Dashboard con notificaciones visibles
- Residente en deuda

**Pasos:**
1. En Centro de Notificaciones, hacer clic en notificación de deuda
2. Ej: "Apto 402: Pago vencido"

**Resultado Esperado:**
- ✅ Redirecciona a módulo correspondiente
- ✅ Si es finanzas, muestra residente deudor
- ✅ Presiona atrás y vuelve a Dashboard

**Criterio de Aceptación:**
```
☑ Navegación correcta
☑ Módulo abre en contexto
☑ Atrás funciona
```

---

## 👥 CASOS DE PRUEBA - RESIDENTES

### Caso 9: Agregar Residente Manual

**ID**: RES-001  
**Descripción**: Crear residente individual

**Pre-requisitos:**
- Usuario logueado
- Base de Datos accesible

**Pasos:**
1. Ir a "Base de Datos"
2. Hacer clic "+ Agregar Residente"
3. Modal se abre
4. Ingresar:
   - Apartamento: "405"
   - Nombre: "Test Resident"
   - Email: "test@resident.com"
   - Teléfono: "3009999999"
5. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Confirmación: "Residente agregado"
- ✅ Nuevo residente aparece en tabla
- ✅ Datos coinciden con ingresado

**Criterio de Aceptación:**
```
☑ Residente creado en BD
☑ Apartado es único
☑ Validaciones pasaron
☑ Confirmación mostrada
```

---

### Caso 10: Validar Apartamento Duplicado

**ID**: RES-002  
**Descripción**: No permitir mismo apartamento dos veces

**Pre-requisitos:**
- Residente en apto 101 ya existe

**Pasos:**
1. Intentar agregar otro en apto 101
2. Ingresar datos
3. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Sistema rechaza
- ✅ Error: "Apartamento ya existe"
- ✅ Modal no se cierra
- ✅ Campo se marca en rojo

**Criterio de Aceptación:**
```
☑ Validación funciona
☑ Duplicados no permitidos
☑ Error claro
☑ No se guarda
```

---

### Caso 11: Importar Residentes (Excel)

**ID**: RES-003  
**Descripción**: Cargar múltiples residentes desde archivo

**Pre-requisitos:**
- Archivo Excel preparado
- Formato correcto

**Pasos:**
1. Ir a Base de Datos
2. Hacer clic "Importar desde Excel"
3. Descargar plantilla (opcional)
4. Llenar Excel:
   ```
   | Apartamento | Nombre | Email | Teléfono |
   |-------------|--------|-------|----------|
   | 501 | Rosa | rosa@... | 3001111111 |
   | 502 | Pedro | pedro@... | 3001111112 |
   | 503 | Pablo | pablo@... | 3001111113 |
   ```
5. Sube archivo
6. Ver preview
7. Hacer clic "Importar"

**Resultado Esperado:**
- ✅ Archivo validado
- ✅ Preview muestra 3 residentes
- ✅ Confirmación: "3 residentes importados"
- ✅ Todos aparecen en tabla

**Criterio de Aceptación:**
```
☑ Importación exitosa
☑ Validación de formato
☑ Todos los datos en BD
☑ Confirmación clara
```

---

### Caso 12: Editar Residente

**ID**: RES-004  
**Descripción**: Modificar datos de residente

**Pre-requisitos:**
- Residente existe (Juan Pérez, apto 101)

**Pasos:**
1. En tabla Base de Datos, encontrar apto 101
2. Hacer clic "✏️ Editar"
3. Modal abre con datos actuales
4. Cambiar email: "juan.nuevo@email.com"
5. Cambiar teléfono: "3009876543"
6. Hacer clic "Guardar Cambios"

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Confirmación: "Residente actualizado"
- ✅ Email nuevo aparece en tabla
- ✅ Teléfono se actualizó

**Criterio de Aceptación:**
```
☑ Edición guardada
☑ Datos coinciden
☑ BD actualizada
☑ Confirmación mostrada
```

---

### Caso 13: Eliminar Residente

**ID**: RES-005  
**Descripción**: Remover residente del sistema

**Pre-requisitos:**
- Residente existe

**Pasos:**
1. En tabla, hacer clic "🗑️ Eliminar"
2. Diálogo pide confirmación
3. Hacer clic "Confirmar"

**Resultado Esperado:**
- ✅ Residente desaparece de tabla
- ✅ Confirmación: "Residente eliminado"
- ✅ No puede encontrarse en BD
- ✅ Historial se preserva (si aplica)

**Criterio de Aceptación:**
```
☑ Eliminación ejecutada
☑ Confirmación requerida
☑ No aparece en tabla
☑ Soft delete o hard (según política)
```

---

## 💰 CASOS DE PRUEBA - FINANZAS

### Caso 14: Agregar Ingreso

**ID**: FIN-001  
**Descripción**: Registrar nuevo ingreso

**Pre-requisitos:**
- Módulo Finanzas accesible

**Pasos:**
1. Ir a "Finanzas"
2. Seleccionar pestaña "Ingresos"
3. Hacer clic "+ Nuevo Ingreso"
4. Completar:
   - Descripción: "Cuota administración junio"
   - Categoría: "Cuota de Administración"
   - Monto: "450000"
   - Fecha: "2026-06-10"
5. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Ingreso aparece en tabla
- ✅ Confirmación: "Ingreso guardado"
- ✅ Total de ingresos aumentó
- ✅ Gráficos se actualizan

**Criterio de Aceptación:**
```
☑ Ingreso en BD
☑ Validaciones pasaron
☑ Totales correctos
☑ Gráficos actualizados
```

---

### Caso 15: Importar Ingresos (Excel)

**ID**: FIN-002  
**Descripción**: Carga masiva de ingresos

**Pre-requisitos:**
- Archivo Excel preparado

**Pasos:**
1. Ir a Finanzas → Ingresos
2. Hacer clic "Importar Excel"
3. Excel con datos:
   ```
   | Descripción | Monto | Categoría | Fecha |
   |-------------|-------|-----------|-------|
   | Cuota Adm | 450000 | Cuota Admin | 2026-06-01 |
   | Multa 301 | 50000 | Multas | 2026-06-02 |
   ```
4. Sube archivo
5. Preview: 2 registros
6. Hacer clic "Importar"

**Resultado Esperado:**
- ✅ 2 ingresos importados
- ✅ Total refleja suma
- ✅ Confirmación: "2 ingresos importados"

**Criterio de Aceptación:**
```
☑ Importación completa
☑ Validación pasó
☑ Datos correctos
```

---

### Caso 16: Generar Reporte Financiero

**ID**: FIN-003  
**Descripción**: Ver análisis mensuales

**Pre-requisitos:**
- Hay datos de ingresos y gastos

**Pasos:**
1. Ir a Finanzas → Resumen
2. Observar gráficos

**Resultado Esperado:**
- ✅ Gráfico de barras (ingresos vs gastos)
- ✅ Gráfico circular (distribución gastos)
- ✅ Totales correctos
- ✅ Datos por categoría

**Criterio de Aceptación:**
```
☑ Gráficos renderizados
☑ Datos correctos
☑ Leyendas visibles
☑ Colores diferenciados
```

---

### Caso 17: Eliminar Gasto

**ID**: FIN-004  
**Descripción**: Remover registro de gasto

**Pre-requisitos:**
- Gasto existe en tabla

**Pasos:**
1. Ir a Finanzas → Gastos
2. Encontrar gasto
3. Hacer clic "🗑️ Eliminar"
4. Confirmación
5. Hacer clic "Confirmar"

**Resultado Esperado:**
- ✅ Gasto desaparece
- ✅ Total se actualiza
- ✅ Gráficos recalculan

**Criterio de Aceptación:**
```
☑ Eliminación exitosa
☑ Totales correctos
☑ Gráficos actualizados
```

---

## 🔒 CASOS DE PRUEBA - SEGURIDAD

### Caso 18: Registrar Visitante

**ID**: SEC-001  
**Descripción**: Registrar entrada de visitante

**Pre-requisitos:**
- Guardián logueado
- Residente existe en apto 302

**Pasos:**
1. Ir a "Seguridad"
2. Pestaña "Visitantes"
3. Hacer clic "+ Nuevo Visitante"
4. Completar:
   - Nombre: "Juan Gómez"
   - Apartamento: "302"
   - Fecha: Hoy
   - Hora: "14:30"
   - Punto: "Portería Principal"
5. Hacer clic "Registrar"

**Resultado Esperado:**
- ✅ Visitante registrado en tabla
- ✅ Residente del 302 recibe notificación
- ✅ Confirmación: "Visitante registrado"
- ✅ Hora de entrada capturada

**Criterio de Aceptación:**
```
☑ Registro en BD
☑ Timestamp correcto
☑ Notificación enviada
☑ En tabla visible
```

---

### Caso 19: Marcar Salida de Visitante

**ID**: SEC-002  
**Descripción**: Registrar hora de salida

**Pre-requisitos:**
- Visitante registrado (Juan Gómez)
- No marcado como salida aún

**Pasos:**
1. En tabla Visitantes, encontrar a Juan
2. Hacer clic "Registrar Salida"
3. Sistema captura hora actual

**Resultado Esperado:**
- ✅ Hora salida se registra
- ✅ Duración se calcula
- ✅ Estado cambia a "Completado"
- ✅ Confirmación: "Salida registrada"

**Criterio de Aceptación:**
```
☑ Hora salida registrada
☑ Duración correcta
☑ Estado actualizado
```

---

### Caso 20: Registrar Paquete

**ID**: SEC-003  
**Descripción**: Registrar recepción de paquete

**Pre-requisitos:**
- Guardián logueado

**Pasos:**
1. Ir a Seguridad → Paquetes
2. Hacer clic "+ Nuevo Paquete"
3. Completar:
   - Apartamento: "205"
   - Courier: "DHL"
   - Tracking: "1234567890"
   - Punto: "Portería Principal"
4. Hacer clic "Registrar"

**Resultado Esperado:**
- ✅ Paquete aparece en tabla
- ✅ Residente del 205 recibe notificación
- ✅ Confirmación: "Paquete registrado"
- ✅ Estado: "Por entregar"

**Criterio de Aceptación:**
```
☑ Registro en BD
☑ Notificación enviada
☑ En tabla visible
☑ Estado correcto
```

---

### Caso 21: Marcar Paquete Entregado

**ID**: SEC-004  
**Descripción**: Registrar entrega de paquete

**Pre-requisitos:**
- Paquete registrado (apto 205)

**Pasos:**
1. En tabla Paquetes, encontrar paquete
2. Hacer clic "Marcar Entregado"
3. Confirmar

**Resultado Esperado:**
- ✅ Estado cambia a "Entregado"
- ✅ Fecha/hora se registra
- ✅ Ya no aparece en "Pendientes"

**Criterio de Aceptación:**
```
☑ Estado actualizado
☑ Fecha/hora registrada
☑ Ya no en pendientes
```

---

## 💬 CASOS DE PRUEBA - COMUNICACIONES

### Caso 22: Enviar Email a Todos

**ID**: COM-001  
**Descripción**: Comunicación masiva a todos residentes

**Pre-requisitos:**
- 5+ residentes en el sistema

**Pasos:**
1. Ir a "Comunicaciones"
2. Completar:
   - Asunto: "Aviso importante"
   - Cuerpo: "Se informa que..."
3. Destinatarios: Seleccionar "👥 Todos"
4. Hacer clic "📧 Enviar a X destinatarios"

**Resultado Esperado:**
- ✅ Confirmación: "Email enviado a 5 residentes"
- ✅ En historial aparece el envío
- ✅ Todos residentes reciben email
- ✅ Email llega en < 1 minuto

**Criterio de Aceptación:**
```
☑ Email enviado
☑ Todos recibieron
☑ En historial
☑ Confirmación clara
```

---

### Caso 23: Enviar a Grupo Específico (Deudores)

**ID**: COM-002  
**Descripción**: Email solo a residentes en deuda

**Pre-requisitos:**
- 2+ residentes en deuda
- Grupo "Deudores" disponible

**Pasos:**
1. Ir a Comunicaciones
2. Asunto: "Recordatorio de pago"
3. Cuerpo: "Su deuda es..."
4. Destinatarios: "💳 Deudores"
5. Enviar

**Resultado Esperado:**
- ✅ Solo deudores reciben email
- ✅ Count correcto en confirmación
- ✅ Email contiene monto de deuda

**Criterio de Aceptación:**
```
☑ Solo deudores reciben
☑ Count correcto
☑ Email personalizado
```

---

### Caso 24: Generar Contenido con IA

**ID**: COM-003  
**Descripción**: IA genera propuesta de email

**Pre-requisitos:**
- Gemini API configurada
- Conexión a internet

**Pasos:**
1. En Comunicaciones, hacer clic "✨ Generar con IA"
2. Prompt: "Recordar sobre pago de cuota"
3. Esperar respuesta

**Resultado Esperado:**
- ✅ 3 opciones generadas
- ✅ Contenido relevante
- ✅ Tonos diferentes
- ✅ Usuario puede seleccionar

**Criterio de Aceptación:**
```
☑ IA responde
☑ 3 opciones mostradas
☑ Contenido coherente
☑ Selectable
```

---

### Caso 25: Adjuntar Archivo a Email

**ID**: COM-004  
**Descripción**: Incluir PDF en comunicación

**Pre-requisitos:**
- Archivo PDF existe en nube
- Comunicación está siendo redactada

**Pasos:**
1. En Comunicaciones, hacer clic "📎 Adjuntar"
2. Modal se abre con archivos
3. Seleccionar "Reglamento.pdf"
4. Hacer clic "Confirmar"
5. Enviar email

**Resultado Esperado:**
- ✅ Archivo se adjunta
- ✅ Visible en campo "Adjuntos"
- ✅ Email incluye el archivo
- ✅ Residentes pueden descargar

**Criterio de Aceptación:**
```
☑ Archivo adjuntado
☑ En email recibido
☑ Descargable
☑ Sin corrupción
```

---

## 📁 CASOS DE PRUEBA - ARCHIVOS

### Caso 26: Subir Archivo PDF

**ID**: ARC-001  
**Descripción**: Cargar documento a almacenamiento

**Pre-requisitos:**
- Archivo PDF (< 5MB)

**Pasos:**
1. Ir a "Archivos"
2. Hacer clic "📤 Subir Archivo"
3. Selector se abre
4. Seleccionar "Reglamento.pdf" (1.5MB)
5. Hacer clic "Abrir"
6. Esperar confirmación

**Resultado Esperado:**
- ✅ Archivo aparece en tabla
- ✅ Confirmación: "Archivo subido"
- ✅ Tamaño correcto (1.5MB)
- ✅ Fecha de carga registrada

**Criterio de Aceptación:**
```
☑ Archivo en nube
☑ Tamaño correcto
☑ Metadata guardada
☑ En tabla visible
```

---

### Caso 27: Rechazar Archivo Muy Grande

**ID**: ARC-002  
**Descripción**: No permitir archivos > 5MB

**Pre-requisitos:**
- Archivo PDF de 10MB

**Pasos:**
1. En Archivos, hacer clic "Subir"
2. Seleccionar archivo 10MB
3. Intentar abrir

**Resultado Esperado:**
- ✅ Error: "Archivo muy grande (máx 5MB)"
- ✅ Archivo no se sube
- ✅ Selector se mantiene abierto

**Criterio de Aceptación:**
```
☑ Validación ejecutada
☑ Error claro
☑ No se carga
☑ UX amigable
```

---

### Caso 28: Descargar Archivo

**ID**: ARC-003  
**Descripción**: Obtener archivo del almacenamiento

**Pre-requisitos:**
- Archivo existe en tabla

**Pasos:**
1. En Archivos, encontrar archivo
2. Hacer clic "📥 Descargar"
3. Esperar descarga

**Resultado Esperado:**
- ✅ Descarga se inicia
- ✅ Archivo llega íntegro
- ✅ Nombre correcto
- ✅ Sin corrupción

**Criterio de Aceptación:**
```
☑ Descarga completa
☑ Hash válido
☑ Abre correctamente
☑ Contenido íntegro
```

---

### Caso 29: Eliminar Archivo

**ID**: ARC-004  
**Descripción**: Remover documento del almacenamiento

**Pre-requisitos:**
- Archivo existe

**Pasos:**
1. En tabla, hacer clic "🗑️"
2. Confirmación
3. Hacer clic "Confirmar"

**Resultado Esperado:**
- ✅ Archivo desaparece de tabla
- ✅ Confirmación: "Archivo eliminado"
- ✅ No accesible en nube

**Criterio de Aceptación:**
```
☑ Eliminación ejecutada
☑ Confirmación requerida
☑ No recuperable
```

---

## 🤖 CASOS DE PRUEBA - CHATBOT IA

### Caso 30: Consulta Simple

**ID**: CHAT-001  
**Descripción**: Chatbot responde pregunta básica

**Pre-requisitos:**
- Chatbot abierto
- Conexión a internet

**Pasos:**
1. Hacer clic botón "💬" (esquina abajo)
2. Escribir: "¿Cuántos residentes tengo?"
3. Presionar Enter

**Resultado Esperado:**
- ✅ Chatbot procesa pregunta
- ✅ Retorna número correcto
- ✅ Respuesta en < 3 segundos
- ✅ Mensaje aparece en historial

**Criterio de Aceptación:**
```
☑ Respuesta correcta
☑ Tiempo aceptable
☑ En historial
☑ Formato legible
```

---

### Caso 31: Ejecutar Acción (Registrar Residente)

**ID**: CHAT-002  
**Descripción**: IA ejecuta comando

**Pre-requisitos:**
- Chatbot abierto

**Pasos:**
1. Escribir: "Agrega a Rosa López en apto 501, email rosa@test.com, teléfono 3001111111"
2. Presionar Enter
3. Esperar

**Resultado Esperado:**
- ✅ Chatbot procesa comando
- ✅ Residente se crea en BD
- ✅ Confirmación: "He agregado a Rosa"
- ✅ Aparece en Base de Datos

**Criterio de Aceptación:**
```
☑ Comando ejecutado
☑ Residente creado
☑ Validaciones pasaron
☑ Confirmación clara
```

---

### Caso 32: Generar Propuesta de Contenido

**ID**: CHAT-003  
**Descripción**: IA propone versiones

**Pre-requisitos:**
- Chatbot abierto

**Pasos:**
1. Escribir: "Genera 3 versiones de email recordando sobre pago"
2. Presionar Enter
3. Esperar respuesta

**Resultado Esperado:**
- ✅ IA propone 3 versiones
- ✅ Tonos diferentes (formal, amigable, breve)
- ✅ Contenido coherente
- ✅ Usuario puede copiar

**Criterio de Aceptación:**
```
☑ 3 versiones generadas
☑ Contenido de calidad
☑ Diferenciadas
☑ Copiables/seleccionables
```

---

### Caso 33: Error en Chatbot

**ID**: CHAT-004  
**Descripción**: Manejo de errores

**Pre-requisitos:**
- Conexión a internet cortada O API no disponible

**Pasos:**
1. Abrir Chatbot
2. Escribir pregunta
3. Presionar Enter

**Resultado Esperado:**
- ✅ Mensaje de error amigable
- ✅ No impacta la app
- ✅ Sugiere reintentar

**Criterio de Aceptación:**
```
☑ Error capturado
☑ Mensaje legible
☑ No crash app
☑ Retry posible
```

---

## ⚙️ CASOS DE PRUEBA - CONFIGURACIÓN

### Caso 34: Editar Perfil de Usuario

**ID**: CONF-001  
**Descripción**: Modificar datos personales

**Pre-requisitos:**
- Usuario logueado
- En sección Configuración

**Pasos:**
1. Ir a Configuración → Perfil
2. Hacer clic "Editar"
3. Cambiar:
   - Nombre: "Admin Nuevo"
   - Teléfono: "3009876543"
4. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Datos actualizados en BD
- ✅ Header muestra nuevo nombre
- ✅ Confirmación: "Perfil actualizado"

**Criterio de Aceptación:**
```
☑ Datos guardados
☑ UI actualizada
☑ BD consistente
```

---

### Caso 35: Agregar Usuario Interno

**ID**: CONF-002  
**Descripción**: Crear guardia/contador

**Pre-requisitos:**
- En Configuración → Usuarios

**Pasos:**
1. Hacer clic "+ Agregar Usuario"
2. Completar:
   - Email: "nuevaguardia@test.com"
   - Nombre: "Nueva Guardia"
   - Rol: "Guard"
   - Contraseña: Auto-generada
3. Hacer clic "Crear"

**Resultado Esperado:**
- ✅ Usuario creado en tabla "users"
- ✅ Email de credenciales enviado
- ✅ En tabla aparece nuevo usuario
- ✅ Can login con credenciales

**Criterio de Aceptación:**
```
☑ Usuario en BD
☑ Email enviado
☑ Puede loguear
☑ Permisos correctos
```

---

### Caso 36: Configurar Permisos Rol

**ID**: CONF-003  
**Descripción**: Personalizar acceso por rol

**Pre-requisitos:**
- En Configuración → Permisos

**Pasos:**
1. Crear rol "Encargado de Finanzas"
2. Seleccionar permisos:
   - ☑️ Finanzas
   - ☑️ Base de Datos
   - ☐ Otros
3. Hacer clic "Crear"

**Resultado Esperado:**
- ✅ Rol creado
- ✅ Usuarios con este rol solo ven módulos permitidos
- ✅ Intento de acceso no permitido: Acceso denegado

**Criterio de Aceptación:**
```
☑ Rol guardado
☑ Permisos aplicados
☑ Usuarios afectados
```

---

## 🔐 TESTING DE SEGURIDAD

### Caso 37: SQL Injection - Campo Email

**ID**: SEC-INJ-001  
**Descripción**: Intentar inyección SQL

**Pre-requisitos:**
- Formulario de residente abierto

**Pasos:**
1. En campo Email, ingresar:
   `' OR '1'='1`
2. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Input validado
- ✅ Rechazo o escape de caracteres
- ✅ No afecta BD

**Criterio de Aceptación:**
```
☑ No SQL Injection posible
☑ Validación en frontend
☑ BD protegida
```

---

### Caso 38: XSS - Campo Descripción

**ID**: SEC-XSS-001  
**Descripción**: Intentar cross-site scripting

**Pre-requisitos:**
- Formulario de ingreso abierto

**Pasos:**
1. En Descripción, ingresar:
   `<img src=x onerror="alert('XSS')">`
2. Hacer clic "Guardar"

**Resultado Esperado:**
- ✅ Script no ejecuta
- ✅ HTML escapado
- ✅ Se guarda como texto

**Criterio de Aceptación:**
```
☑ XSS prevenido
☑ Encoding aplicado
☑ Seguro en BD
```

---

### Caso 39: Acceso No Autorizado

**ID**: SEC-AUTH-001  
**Descripción**: Guardia intenta acceder a Finanzas

**Pre-requisitos:**
- Guardia logueado (Guard role)

**Pasos:**
1. Intentar modificar URL a /finanzas
2. O hacer fuerza bruta en NavBar

**Resultado Esperado:**
- ✅ Acceso denegado
- ✅ Redirecciona a módulo permitido
- ✅ Mensaje: "No tienes permisos"

**Criterio de Aceptación:**
```
☑ RLS en BD
☑ Frontend valida
☑ Backend rechaza
```

---

### Caso 40: CSRF - Cambio No Autorizado

**ID**: SEC-CSRF-001  
**Descripción**: Prevención de solicitudes falsificadas

**Pre-requisitos:**
- Usuario logueado

**Pasos:**
1. Intenta modificar datos via formulario en otra pestaña
2. Sin CSRF token

**Resultado Esperado:**
- ✅ Solicitud rechazada
- ✅ Token validado
- ✅ Log de intento

**Criterio de Aceptación:**
```
☑ CSRF token implementado
☑ Validación en backend
☑ No cambios no autorizados
```

---

## ⚡ TESTING DE PERFORMANCE

### Caso 41: Carga de Dashboard

**ID**: PERF-001  
**Descripción**: Tiempo de carga inicial

**Pre-requisitos:**
- App virgen
- Cache limpio

**Pasos:**
1. Abrir app
2. Loguear
3. Medir tiempo hasta que Dashboard esté interactive

**Resultado Esperado:**
- ✅ Carga: < 2 segundos
- ✅ First Contentful Paint: < 1s
- ✅ Largest Contentful Paint: < 2.5s

**Criterio de Aceptación:**
```
☑ < 2s carga completa
☑ UI responsive rápido
☑ Gráficos no bloquean
```

---

### Caso 42: Tabla Grande (1000 residentes)

**ID**: PERF-002  
**Descripción**: Performance con muchos datos

**Pre-requisitos:**
- 1000 residentes en BD

**Pasos:**
1. Ir a Base de Datos
2. Ver tabla
3. Buscar residente
4. Filtrar

**Resultado Esperado:**
- ✅ Tabla carga en < 3s
- ✅ Scroll suave
- ✅ Búsqueda en < 500ms
- ✅ Filtros responsivos

**Criterio de Aceptación:**
```
☑ Virtualización o paginación
☑ Sin freezes
☑ Búsqueda rápida
```

---

### Caso 43: Gráficos en Dashboard

**ID**: PERF-003  
**Descripción**: Render de múltiples gráficos

**Pre-requisitos:**
- 12 meses de datos

**Pasos:**
1. Abrir Dashboard
2. Medir tiempo de render de gráficos

**Resultado Esperado:**
- ✅ Gráficos en < 1.5s
- ✅ Animaciones suaves
- ✅ 60fps

**Criterio de Aceptación:**
```
☑ Render rápido
☑ Animaciones smooth
☑ Sin lag
```

---

## 🌐 TESTING DE COMPATIBILIDAD

### Caso 44: Chrome en Windows 10

**ID**: COMPAT-001  
**Descripción**: Funcionalidad completa en Chrome

**Pre-requisitos:**
- Chrome 120+
- Windows 10

**Pasos:**
1. Abrir app en Chrome
2. Completar flujo completo (login, crear residente, etc.)

**Resultado Esperado:**
- ✅ Todas las funciones OK
- ✅ Estilos correctos
- ✅ Gráficos renderizados
- ✅ Responsive correcto

**Criterio de Aceptación:**
```
☑ 100% funcional
☑ UI correcta
☑ Rendimiento OK
```

---

### Caso 45: Safari en macOS

**ID**: COMPAT-002  
**Descripción**: Compatibilidad Safari

**Pre-requisitos:**
- Safari 17+
- macOS

**Pasos:**
1. Abrir app en Safari
2. Test completo

**Resultado Esperado:**
- ✅ Todas funciones OK
- ✅ Estilos correctos
- ✅ (Nota: algunas APIs pueden no estar disponibles)

**Criterio de Aceptación:**
```
☑ Funcional
☑ UI correcta
☑ Sin errores console
```

---

### Caso 46: iPhone (Responsive)

**ID**: COMPAT-003  
**Descripción**: Mobile en iPhone

**Pre-requisitos:**
- iPhone 12+ iOS 15+
- O DevTools modo móvil

**Pasos:**
1. Abrir en móvil o DevTools (375px)
2. Navegar por módulos

**Resultado Esperado:**
- ✅ Layout responsive
- ✅ Botones accesibles
- ✅ Tablas scrolleables
- ✅ Modal legible

**Criterio de Aceptación:**
```
☑ Responsive correcto
☑ Touch friendly
☑ Legible
☑ Funcional
```

---

### Caso 47: Android (Samsung)

**ID**: COMPAT-004  
**Descripción**: Compatibilidad Android

**Pre-requisitos:**
- Samsung S21+ Android 12+

**Pasos:**
1. Abrir app
2. Test completo

**Resultado Esperado:**
- ✅ Funcional
- ✅ Responsive OK
- ✅ Touch OK

**Criterio de Aceptación:**
```
☑ Funcional
☑ Responsive
☑ Rendimiento OK
```

---

## 📋 REPORTE DE BUGS

### Formato de Reporte

```markdown
## BUG: [Título descriptivo]

**ID**: BUG-XXX
**Severidad**: 🔴 Crítica / 🟠 Alta / 🟡 Media / 🟢 Baja

**Descripción:**
Descripción clara del bug

**Pasos para Reproducir:**
1. Paso 1
2. Paso 2
3. Paso 3

**Resultado Esperado:**
Lo que debería haber sucedido

**Resultado Actual:**
Lo que sucedió realmente

**Evidencia:**
- Screenshot/Video
- Logs
- Timestamp

**Entorno:**
- Navegador: Chrome 120
- SO: Windows 10
- URL: http://localhost:3000
- Usuario: admin@test.com

**Notas Adicionales:**
Contexto importante
```

### Ejemplo de Reporte

```markdown
## BUG: Dashboard muestra número incorrecto de residentes

**ID**: BUG-001
**Severidad**: 🟠 Alta

**Descripción:**
Después de agregar un residente, el dashboard muestra 47 pero debería mostrar 48.

**Pasos para Reproducir:**
1. Abrir Dashboard (muestra 47 residentes)
2. Ir a Base de Datos
3. Agregar nuevo residente
4. Volver a Dashboard
5. Número sigue siendo 47

**Resultado Esperado:**
Dashboard debería mostrar 48 residentes

**Resultado Actual:**
Muestra 47 residentes

**Evidencia:**
- Screenshot 1: Dashboard muestra 47
- Screenshot 2: Base de Datos muestra 48

**Entorno:**
- Chrome 120
- Windows 10
- http://localhost:3000
- admin@test.com

**Notas:**
El dato está bien en BD, problema es en frontend
```

---

## ✅ CHECKLIST PRE-RELEASE

Antes de cada release, validar:

```
[ ] Todos casos de prueba pasan
[ ] Sin bugs críticos abiertos
[ ] Performance aceptable
[ ] Compatibilidad OK (Chrome, Firefox, Safari)
[ ] Seguridad: SQL injection, XSS prevenidos
[ ] Responsive en móvil
[ ] Emails se envían correctamente
[ ] IA responde OK
[ ] Base de datos consistente
[ ] Backups funcionan
[ ] Documentación actualizada
[ ] Release notes preparadas
```

---

## 📞 Contacto

**Reporte de Bugs**: GitHub Issues o Email a QA@paic.com  
**Testing Lead**: QA Manager

---

**Versión**: 1.0.0  
**Última actualización**: 10 de junio de 2026  
**Próxima revisión**: Agosto 2026
