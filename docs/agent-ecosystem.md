# Agent Ecosystem - PAIC 2.0

## Core Agents

### 1. ODÍN (Orquestador)
- **Estado:** Implementado
- **Rol:** Agente principal unificado con tool calling
- **Herramientas:** 7 (consulta DB, conteo, suma, memoria R/W, logs, curso)
- **Modelo:** gpt-4o
- **Acceso:** ChatWidget modo "ODÍN"

### 2. FINN (Analista Financiero)
- **Estado:** Planeado
- **Rol:** Análisis financiero, predicciones, alertas de presupuesto
- **Datos:** ingresos, gastos, vencimientos

### 3. CARLA (Seguridad y Vigilancia)
- **Estado:** Planeado
- **Rol:** Monitoreo de acceso, paquetes, visitantes, cámaras

### 4. TOM (Gestor de Tareas)
- **Estado:** Planeado
- **Rol:** Asignación, seguimiento y recordatorios de tareas

### 5. LEX (Asesor Legal)
- **Estado:** Planeado
- **Rol:** Información sobre propiedad horizontal, multas, reglamento

### 6. SOFIA (Comunicaciones)
- **Estado:** Planeado
- **Rol:** Notificaciones, cartelera, comunicados masivos

### 7. DATA (Analista de Datos)
- **Estado:** Planeado
- **Rol:** Reportes personalizados, exportación, tendencias

## Infrastructure
- **Memoria:** odin_memoria table (compartida entre agentes via tipo/tags)
- **Modelos:** gpt-4o para agentes, gpt-4o-mini para chat normal
- **Streaming:** SSE con eventos de tool calling
