# Phase 8: ODÍN - Unified AI Agent

## Objetivo
Transformar ODÍN de 3 endpoints separados a un agente unificado con tool calling (7 herramientas), memoria persistente, y un ChatWidget con 3 modos.

## Pasos

### 1. Servicio ODÍN unificado (`src/services/ai/odin.ts`)
- [x] Servicio con `odinStream()` que soporta tool calling
- [x] 7 tools: consultar_db, contar_db, sumar_columna, guardar_memoria, buscar_memoria, leer_logs, buscar_en_curso
- [x] Bucle automático de tool calling (max 5 rounds)
- [x] Eventos SSE para tool:start / tool:end

### 2. API de chat extendida (`src/pages/api/chat/index.ts`)
- [x] Modo "agente" usa odinStream
- [x] Emite tool:start/tool:end vía SSE

### 3. ChatWidget (`src/components/chat/ChatWidget.tsx`)
- [x] 3 modos: Chat / Curso / ODÍN
- [x] Toggle con íconos (MessageCircle / BookOpen / Zap)
- [x] Indicador de herramienta ejecutándose ("Ejecutando: consultar_db...")

### 4. Memoria persistente (`odin_memoria`)
- [x] Tabla con tipo, contenido, conjunto_id, user_id, metadata, created_at
- [x] Índices: btree en conjunto_id/tipo/created_at, GIN en contenido
- [x] RLS con políticas admin y usuario

### 5. Verificación
Pendiente:
- [ ] Probar en producción con datos reales
- [ ] Verificar que el bucle de tool calling no excede límites de API

## Herramientas de ODÍN
| Tool | Descripción |
|------|-------------|
| consultar_db | Consulta cualquier tabla de la DB |
| contar_db | Cuenta registros con filtros |
| sumar_columna | Suma valores numéricos |
| guardar_memoria | Guarda en memoria persistente |
| buscar_memoria | Busca en memoria previa |
| leer_logs | Diagnóstico del sistema |
| buscar_en_curso | Consulta el curso de copropiedades |

## Modelo
ODÍN usa `openai/gpt-4o` (definido en ODIN_MODEL). Chat normal usa `gpt-4o-mini`.
