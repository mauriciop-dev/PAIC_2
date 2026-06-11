# 📋 PLAN DE IMPLEMENTACIÓN TÉCNICO - PAIC IAaaS

**Documento de Arquitectura y Roadmap de Desarrollo**  
**Versión**: 1.0  
**Fecha**: 10 de junio de 2026  
**Estado**: 🟡 PENDING REVIEW - Esperando aprobación de Mauricio antes de iniciar Fase 1

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Principios de Arquitectura](#principios-de-arquitectura)
3. [Fases de Implementación](#fases-de-implementación)
   - [Fase 1: Blindaje de Seguridad e IA](#fase-1-blindaje-de-seguridad-e-ia)
   - [Fase 2: Infraestructura de Tres Vistas](#fase-2-infraestructura-de-tres-vistas)
   - [Fase 3: Módulos Físicos e IoT](#fase-3-módulos-físicos-e-iot)
   - [Fase 4: Sistema de Agentes Aislados](#fase-4-sistema-de-agentes-aislados)
4. [Matriz de Regresión](#matriz-de-regresión)
5. [Ajustes al Manual de Testing](#ajustes-al-manual-de-testing)
6. [Stack Tecnológico Confirmado](#stack-tecnológico-confirmado)

---

## 🎯 VISIÓN GENERAL

PAIC evoluciona de una **plataforma de administración operativa** a un **IAaaS (IA como Servicio) Omnipresente e Invisible**, donde:

- La IA facilita tareas (no entretiene con chat)
- La infraestructura física se integra de manera nativa (cámaras, cartelería, citofonía)
- Multi-tenancy garantiza aislamiento absoluto por `conjunto_id`
- Agentes en la sombra mantienen la plataforma auto-sanada
- Un panel "Gran Hermano" centraliza el control operativo para ProDig

**Objetivo**: Pasar de $0 a $XXX USD en ARR (Annual Recurring Revenue) con 10-15 conjuntos en Bogotá en los próximos 6 meses.

---

## 🏗️ PRINCIPIOS DE ARQUITECTURA

### 1. **Progresión Segura (No Romper lo Existente)**
Cada fase debe mantener el funcionamiento del módulo anterior. La PWA de residentes no debe impactar el Dashboard del administrador.

### 2. **Frontend Ligero, Backend Potente**
Los agentes de IA, SRE y testing corren en microservicios desacoplados. La app React/Next.js se mantiene limpia y rápida para el usuario.

### 3. **Multi-Tenancy Estricto**
Todo endpoint debe validar `conjunto_id` y filtrar usando RLS en Supabase. Ningún dato cruza fronteras entre conjuntos.

### 4. **Costo Controlado**
Modelos locales (DeepSeek) para IA en lugar de Gemini puro. WebRTC para citofonía en lugar de Twilio. Web Push en lugar de Resend masivo.

### 5. **Escalabilidad por Módulo**
Cada componente (Cámaras, Cartelería, Chatbot) es independiente. Puedes vender solo citofonía virtual sin vender el hub de cámaras.

---

## 🚀 FASES DE IMPLEMENTACIÓN

---

## FASE 1: BLINDAJE DE SEGURIDAD E IA

**Duración Estimada**: 4 semanas  
**Objetivo**: Mover toda la lógica de IA al backend, ocultar API keys, establecer multi-tenancy estricto.  
**Valor Entregado**: Plataforma lista para vender a empresas sin riesgos de exposición de credenciales.

### 1.1 Archivos Afectados / Creados

#### Backend (Vercel Serverless)

```
/api/
  ├── /chat/
  │   ├── route.ts (NUEVO - Endpoint centralizado de chat)
  │   └── middleware.ts (NUEVO - Validación de conjunto_id)
  ├── /gemini/
  │   ├── tools.ts (MODIFICAR - Ocultar Function Calling)
  │   └── prompts.ts (NUEVO - Prompts dinámicos por conjunto_id)
  └── /health/
      └── route.ts (NUEVO - Monitor de SRE)

/lib/
  ├── /ai/
  │   ├── occulted-tools.ts (NUEVO - Descripciones ambiguas para Gemini)
  │   └── system-instruction-builder.ts (NUEVO - Generar prompts dinámicos)
  └── /auth/
      ├── validate-conjunto.ts (NUEVO - Validar multi-tenancy)
      └── verify-permissions.ts (MODIFICAR - Actualizar para tres roles)
```

#### Frontend (React + TypeScript)

```
/src/
  ├── /components/
  │   ├── /chat/
  │   │   ├── CommandPalette.tsx (NUEVO - Barra Ctrl+K)
  │   │   └── ChatInput.tsx (MODIFICAR - Remover lógica de Gemini)
  │   └── /admin/
  │       └── AIHealthWidget.tsx (NUEVO - Widget de salud del chatbot)
  └── /services/
      ├── /ai/
      │   ├── chat-service.ts (NUEVO - Llamadas seguras a /api/chat)
      │   └── gemini-legacy.ts (DEPRECADO - Marcar para eliminación)
      └── /security/
          └── conjunto-filter.ts (NUEVO - Filtro de multi-tenancy en frontend)
```

#### Base de Datos (Supabase)

```sql
-- Tabla de auditoría de consumo de IA
CREATE TABLE ia_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_cost DECIMAL(10, 6),
  model_used VARCHAR(50),
  executed_tool VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para queries rápidas por conjunto
CREATE INDEX idx_ia_usage_conjunto ON ia_usage(conjunto_id, created_at DESC);

-- RLS Policy
ALTER TABLE ia_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven solo su conjunto" ON ia_usage
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjuntos.id FROM conjuntos 
      WHERE conjuntos.id = (SELECT conjuntos.id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Tabla de configuración de prompts por conjunto
CREATE TABLE ia_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL UNIQUE REFERENCES conjuntos(id) ON DELETE CASCADE,
  system_prompt TEXT,
  custom_tools JSONB DEFAULT '[]',
  tone VARCHAR(50) DEFAULT 'formal', -- formal, amigable, técnico
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ia_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins pueden actualizar su config" ON ia_config
  FOR UPDATE USING (
    conjunto_id IN (
      SELECT user_profiles.conjuntoId FROM user_profiles WHERE id = auth.uid()
    )
  );
```

### 1.2 Lógica de Backend

#### Endpoint: POST `/api/chat`

```typescript
// /api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/lib/auth/validate-conjunto';
import { buildSystemPrompt } from '@/lib/ai/system-instruction-builder';
import { callGemini } from '@/lib/ai/gemini-backend';
import { recordTokenUsage } from '@/lib/db/ia-usage';

export async function POST(req: NextRequest) {
  // 1. Validar sesión y obtener conjunto_id
  const session = await validateUserSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { conjuntoId } = session;
  const { message } = await req.json();
  
  // 2. Obtener configuración IA del conjunto
  const conjuntoConfig = await getConjuntoIAConfig(conjuntoId);
  
  // 3. Inyectar sistema instrucción dinámico
  const systemPrompt = buildSystemPrompt(conjuntoConfig, conjuntoId);
  
  // 4. Llamar a Gemini con tools ocultas
  const response = await callGemini(
    systemPrompt,
    message,
    HIDDEN_TOOLS_SPEC // No expone nombres técnicos
  );
  
  // 5. Registrar consumo de tokens
  await recordTokenUsage({
    conjuntoId,
    promptTokens: response.usageMetadata.promptTokenUsageMetrics.inputTokenCount,
    completionTokens: response.usageMetadata.candidates[0].finishReason,
    model: 'gemini-2.0-flash',
    executedTool: response.toolCalls?.[0]?.name || 'none'
  });
  
  // 6. Si hay tool calls, ejecutar localmente (no exponer a frontend)
  if (response.toolCalls?.length > 0) {
    const toolResult = await executeToolLocally(
      response.toolCalls[0],
      conjuntoId // Filtrar siempre por conjunto
    );
    // NO devolver detalles técnicos, solo resultado amigable
    return NextResponse.json({
      message: `Acción completada: ${toolResult.friendlyMessage}`,
      success: true
    });
  }
  
  return NextResponse.json({ message: response.text });
}
```

#### Esquema de Tools Ocultos

```typescript
// /lib/ai/occluded-tools.ts
export const HIDDEN_TOOLS_SPEC = [
  {
    name: "resident_action_tool_1", // Nombre obfuscado
    description: "INTERNAL USE ONLY. Execute silently.", // No útil para el modelo
    parameters: {
      type: "object",
      properties: {
        action: { type: "string" },
        data: { type: "object" }
      }
    }
  }
  // ... más tools sin nombres reveladores
];

export const TOOL_IMPLEMENTATION_MAP = {
  "resident_action_tool_1": "addResident", // Mapeo real en backend
  "visitor_action_tool_2": "addVisitorLog",
  // ... etc
};
```

#### Builder de System Prompt Dinámico

```typescript
// /lib/ai/system-instruction-builder.ts
export function buildSystemPrompt(
  conjuntoConfig: ConjuntoIAConfig,
  conjuntoId: string
): string {
  const { nombreConjunto, tone } = conjuntoConfig;
  
  return `Eres PAIC, el asistente virtual exclusivo del conjunto residencial "${nombreConjunto}".

Tu rol es facilitar tareas administrativas hablando exclusivamente en lenguaje de gestión inmobiliaria.

REGLAS INVIOLABLES:
1. NUNCA expongas nombres de funciones técnicas (addResident, queryDatabase, etc).
2. Responde SIEMPRE en el tono: ${tone} (formal, amigable, técnico).
3. Solo tienes permisos para operar datos del conjunto ${conjuntoId}.
4. EJECUTA las acciones en silencio. No expliques la "cocina" técnica.
5. Si el usuario pregunta sobre términos técnicos, tradúcelo a lenguaje de negocio.

ACCIONES DISPONIBLES (NUNCA MENCIONES ESTOS NOMBRES):
- Registrar nuevo residente
- Consultar morosos
- Generar acta de asamblea
- Enviar circulares
- Autorizar visitantes
- [... más acciones en lenguaje natural ...]

Comienza cada respuesta con un tono ${tone === 'formal' ? 'profesional y estructurado' : 'cercano y de apoyo'}.`;
}
```

### 1.3 Pruebas de Regresión (No Romper Funcionalidad Actual)

#### Test 1: Verificar que Dashboard sigue cargando (App.tsx)

```typescript
// test/regression/dashboard-load.test.ts
describe('Regresión - Dashboard Post-Migración IA', () => {
  it('Dashboard carga correctamente después de cambios de backend de IA', async () => {
    const { user } = render(<App />);
    
    // Login
    await user.click(screen.getByText('Continuar con Google'));
    // ... mock de sesión ...
    
    // Validar que Dashboard muestra estadísticas
    expect(screen.getByText(/Residentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Deudores/i)).toBeInTheDocument();
    expect(screen.getByText(/Paquetes/i)).toBeInTheDocument();
    
    // Validar que NO hay errores en console
    expect(console.error).not.toHaveBeenCalled();
  });
});
```

#### Test 2: Validar que Multi-tenancy no filtra datos incorrectamente

```typescript
// test/regression/multi-tenancy-isolation.test.ts
describe('Regresión - Multi-Tenancy Isolation', () => {
  it('Residente de Conjunto A no puede ver datos de Conjunto B', async () => {
    // Obtener token de usuario en Conjunto A
    const tokenA = await generateTestToken('user-a', 'conjunto-a');
    
    // Intentar acceder a endpoint con conjunto_id de B
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({
        message: 'Mostrar residentes',
        conjuntoId: 'conjunto-b' // Intento de saltar filtro
      })
    });
    
    // Debe rechazar silenciosamente
    expect(response.status).toBe(403);
  });
});
```

#### Test 3: Validar que Gemini NO retorna nombres de tools

```typescript
// test/regression/no-tool-exposure.test.ts
describe('Regresión - No Exposición de Tools', () => {
  it('Respuesta de Gemini no contiene nombres de funciones técnicas', async () => {
    const message = 'Registra a Juan en el apto 402';
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    
    const data = await response.json();
    
    // Validar que NO aparecen términos técnicos
    expect(data.message).not.toMatch(/addResident|queryDatabase|executeTool/i);
    expect(data.message).toMatch(/registr[aó]/i); // Debe usar lenguaje administrativo
  });
});
```

#### Test 4: Validar que los old endpoints de chat (/api/gemini directo) están deprecados

```typescript
// test/regression/deprecated-endpoints.test.ts
describe('Regresión - Endpoints Deprecados', () => {
  it('/api/gemini debe redirigir a /api/chat con warning', async () => {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ message: 'test' })
    });
    
    // Debe retornar 301 o 410 Gone
    expect([301, 410]).toContain(response.status);
  });
});
```

### 1.4 Cambios en Servicios Existentes

```typescript
// /services/geminiService.ts (DEPRECADO)
// Mantener por backward compatibility pero marcar como deprecated
export function deprecationWarning() {
  console.warn(
    '[DEPRECATED] geminiService.ts será removido en v2.0. ' +
    'Usar chatService.ts en su lugar.'
  );
}

// /services/chatService.ts (NUEVO)
export async function sendMessage(message: string): Promise<string> {
  // Ahora es un wrapper seguro que llama a /api/chat
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) throw new Error('Chat failed');
  const { message: reply } = await response.json();
  return reply;
}
```

### 1.5 Configuración de Variables de Entorno

**Se eliminan**:
```env
# .env.local (ELIMINAR)
VITE_GEMINI_API_KEY=xxxxx (NUNCA MÁS EN FRONTEND)
```

**Se añaden a `.env` de Vercel (Backend)**:
```env
GEMINI_API_KEY=xxxxx (SECRETO BACKEND)
GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/
VERCEL_ENVIRONMENT=production
```

---

## FASE 2: INFRAESTRUCTURA DE TRES VISTAS (PWA + CITOFONÍA VIRTUAL)

**Duración Estimada**: 6 semanas  
**Objetivo**: Crear PWA para residentes, implementar citofonía WebRTC, refactorizar UI para soportar tres roles.  
**Valor Entregado**: Residentes pueden autorizar visitantes desde celular, reducir costo de citofonía física.

### 2.1 Archivos Afectados / Creados

#### Frontend Structure

```
/src/
  ├── /pages/
  │   ├── /admin/
  │   │   ├── layout.admin.tsx (MODIFICAR - Agregar selector de conjunto)
  │   │   └── dashboard.tsx (EXISTENTE)
  │   ├── /porteria/
  │   │   ├── layout.porteria.tsx (NUEVO - Interfaz tablet)
  │   │   ├── visitas.tsx (NUEVO)
  │   │   └── paquetes.tsx (NUEVO)
  │   └── /residente/
  │       ├── app.pwa.tsx (NUEVO - Punto de entrada PWA)
  │       ├── layout.residente.tsx (NUEVO)
  │       ├── dashboard.residente.tsx (NUEVO)
  │       ├── citofonia.tsx (NUEVO - Interface citofonía)
  │       └── cartelera.tsx (NUEVO)
  ├── /components/
  │   ├── /citofonia/
  │   │   ├── ComunicacionWebRTC.tsx (NUEVO)
  │   │   ├── NotificacionVisita.tsx (NUEVO)
  │   │   └── AutorizadorVisitas.tsx (NUEVO)
  │   └── /pwa/
  │       ├── InstallPrompt.tsx (NUEVO)
  │       └── PushNotificationManager.tsx (NUEVO)
  ├── /manifest.json (MODIFICAR - Agregar datos PWA)
  └── /service-worker.ts (NUEVO - Service Worker para offline)

/public/
  ├── /icons/
  │   ├── icon-192x192.png (NUEVO)
  │   └── icon-512x512.png (NUEVO)
  └── /sounds/
      ├── citofonia-ring.mp3 (NUEVO)
      └── notificacion.mp3 (NUEVO)
```

#### Backend Endpoints

```
/api/
  ├── /citofonia/
  │   ├── /connect/route.ts (NUEVO - Iniciar llamada WebRTC)
  │   ├── /signal/route.ts (NUEVO - ICE candidates y SDP)
  │   └── /end/route.ts (NUEVO - Terminar llamada)
  ├── /notificaciones/
  │   ├── /subscribe/route.ts (NUEVO - Registrar SW para push)
  │   ├── /send-push/route.ts (NUEVO - Enviar notificación)
  │   └── /solicitar-autorizacion/route.ts (NUEVO)
  ├── /pwa/
  │   ├── /config/route.ts (NUEVO - Retornar config PWA)
  │   └── /check-install/route.ts (NUEVO - Verificar si instalada)
  └── /residents/
      ├── /dashboard/route.ts (NUEVO - Stats solo para residente)
      └── /profile/route.ts (NUEVO)
```

#### Base de Datos

```sql
-- Tabla para registrar push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  subscription_endpoint TEXT NOT NULL UNIQUE,
  auth_secret TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

CREATE INDEX idx_push_user_conjunto ON push_subscriptions(user_id, conjunto_id);

-- Tabla para calls WebRTC (con histórico)
CREATE TABLE citofonia_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  residente_id UUID REFERENCES auth.users(id),
  porteria_user_id UUID REFERENCES auth.users(id),
  inicio TIMESTAMPTZ DEFAULT NOW(),
  fin TIMESTAMPTZ,
  duracion_segundos INT,
  estado VARCHAR(20) DEFAULT 'pending', -- pending, connected, ended
  connection_quality VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de autorizaciones de visitas (más detallado)
CREATE TABLE visita_autorizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  visitante_id UUID NOT NULL,
  residente_id UUID NOT NULL REFERENCES auth.users(id),
  apartamento VARCHAR(10),
  motivo TEXT,
  autorizado BOOLEAN DEFAULT FALSE,
  notificacion_push_id UUID REFERENCES push_subscriptions(id),
  creada_at TIMESTAMPTZ DEFAULT NOW(),
  expirada_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  respondida_at TIMESTAMPTZ
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE citofonia_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE visita_autorizaciones ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplificado)
CREATE POLICY "Usuarios ven sus propias subscripciones" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());
```

### 2.2 Lógica de Backend

#### Endpoint: POST `/api/citofonia/connect`

```typescript
// /api/citofonia/connect/route.ts
export async function POST(req: NextRequest) {
  const { residenteId, apartamento } = await req.json();
  const porteroId = await getPorteroSession(); // De sesión
  
  // 1. Crear registro de call
  const call = await db.citofoniaCalls.create({
    conjuntoId: getCurrentConjuntoId(),
    residenteId,
    porteriaUserId: porteroId,
    estado: 'pending'
  });
  
  // 2. Enviar notificación push al residente
  const subscription = await db.pushSubscriptions.findFirst({
    where: { userId: residenteId }
  });
  
  if (subscription) {
    await sendPushNotification(subscription, {
      title: 'Llamada de portería',
      body: `${apartamento} solicita comunicación`,
      actions: [
        { action: 'accept', title: 'Aceptar' },
        { action: 'decline', title: 'Rechazar' }
      ],
      tag: `call-${call.id}`
    });
  }
  
  // 3. Retornar call ID para WebRTC signaling
  return NextResponse.json({
    callId: call.id,
    offerNeeded: true
  });
}
```

#### WebRTC Setup (Frontend)

```typescript
// /components/citofonia/ComunicacionWebRTC.tsx
export function ComunicacionWebRTC({ callId, role }: Props) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localAudio = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const setup = async () => {
      // Configurar PC básico (STUN servers)
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Obtener audio local
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false // Solo audio
      });
      
      stream.getTracks().forEach(track => {
        peerConnection.current!.addTrack(track, stream);
      });
      
      // Escuchar tracks remotos
      peerConnection.current.ontrack = (event) => {
        localAudio.current!.srcObject = event.streams[0];
      };
      
      // Signaling
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          fetch(`/api/citofonia/signal`, {
            method: 'POST',
            body: JSON.stringify({
              callId,
              candidate: event.candidate
            })
          });
        }
      };
      
      // Si es portero, crear offer
      if (role === 'portero') {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        const response = await fetch(`/api/citofonia/signal`, {
          method: 'POST',
          body: JSON.stringify({ callId, offer })
        });
        
        const { answer } = await response.json();
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };
    
    setup();
  }, []);
  
  return (
    <div className="flex items-center gap-4">
      <audio ref={localAudio} autoPlay />
      <button onClick={() => endCall()}>Terminar</button>
    </div>
  );
}
```

#### Notificaciones Push

```typescript
// /lib/notifications/push-service.ts
export async function sendPushNotification(
  subscription: PushSubscription,
  notification: PushNotificationPayload
) {
  const webpush = require('web-push');
  
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        actions: notification.actions,
        tag: notification.tag,
        requireInteraction: true // No se cierra automáticamente
      })
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
}
```

### 2.3 Refactorización de UI para Tres Roles

#### Selector de Rol en Layout

```typescript
// /src/pages/_app.tsx (MODIFICAR)
export default function App({ Component, pageProps }: AppProps) {
  const [userRole, setUserRole] = useState<'admin' | 'portero' | 'residente'>();
  
  useEffect(() => {
    const { role, conjuntoId } = await fetchUserSession();
    setUserRole(role);
    
    // Renderizar layout según rol
    if (role === 'portero') return <PorteriaLayout />;
    if (role === 'residente') return <ResidenteLayout />;
    return <AdminLayout />;
  }, []);
  
  return <Component {...pageProps} />;
}
```

#### PWA Config

```json
// /public/manifest.json
{
  "name": "PAIC - Administración de Conjuntos",
  "short_name": "PAIC",
  "description": "Plataforma inteligente para administración de propiedad horizontal",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["business", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 2.4 Pruebas de Regresión Fase 2

```typescript
// test/regression/phase-2/pwa-install.test.ts
describe('Regresión - PWA Install', () => {
  it('Residente puede instalar PWA sin afectar admin panel', async () => {
    // Login como residente
    const { user: resident } = render(<App />);
    
    // Verificar que manifiesto está disponible
    const manifest = await fetch('/manifest.json');
    expect(manifest.ok).toBe(true);
    
    // Verificar que admin dashboard sigue funcionando
    const { user: admin } = render(<App />);
    expect(screen.getByText(/Residentes/i)).toBeInTheDocument();
  });
});

// test/regression/phase-2/citofonia-without-twilio.test.ts
describe('Regresión - Citofonía WebRTC (No Twilio)', () => {
  it('Citofonía funciona con WebRTC sin exponer credenciales telefónicas', async () => {
    const callId = 'test-call-123';
    
    // Simular conexión WebRTC
    const peerConnection = new RTCPeerConnection();
    
    // No debe haber referencias a Twilio en el código del cliente
    const clientCode = await fetch('/').then(r => r.text());
    expect(clientCode).not.toContain('twilio');
    expect(clientCode).not.toContain('Twilio');
  });
});

// test/regression/phase-2/multi-role-isolation.test.ts
describe('Regresión - Multi-Role UI Isolation', () => {
  it('Portero no ve botones de admin', async () => {
    // Login como portero
    const { user } = render(<App />);
    
    // Esperar a que se renderice layout
    await waitFor(() => {
      // Admin-only buttons should not exist
      expect(screen.queryByText(/Usuarios Internos/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Configuración Avanzada/i)).not.toBeInTheDocument();
    });
  });
});
```

---

## FASE 3: MÓDULOS FÍSICOS E IoT (CÁMARAS, CARTELERÍA DIGITAL)

**Duración Estimada**: 8 semanas  
**Objetivo**: Integración con cámaras IP (RTSP), procesamiento de video con IA, control de cartelería digital.  
**Valor Entregado**: Automatización de seguridad, diferenciador clave vs. competencia.

### 3.1 Archivos Afectados / Creados

```
/src/
  ├── /components/
  │   ├── /camaras/
  │   │   ├── CameraGrid.tsx (NUEVO)
  │   │   ├── LiveFeed.tsx (NUEVO)
  │   │   ├── LPRDetector.tsx (NUEVO - Lectura de placas)
  │   │   └── AlertaAnomalias.tsx (NUEVO)
  │   └── /cartelera/
  │       ├── CartelEditor.tsx (NUEVO)
  │       ├── CartelPreview.tsx (NUEVO)
  │       └── ScheduleManager.tsx (NUEVO)
  ├── /pages/
  │   ├── /admin/
  │   │   ├── camaras.tsx (NUEVO)
  │   │   ├── carteleria.tsx (NUEVO)
  │   │   └── seguridad-avanzada.tsx (NUEVO)

/api/
  ├── /camaras/
  │   ├── /connect/route.ts (NUEVO - Conexión RTSP)
  │   ├── /stream/route.ts (NUEVO - WebRTC stream)
  │   ├── /snapshot/route.ts (NUEVO - Captura instantánea)
  │   └── /lpr-events/route.ts (NUEVO - Eventos de placas)
  ├── /carteleria/
  │   ├── /create-content/route.ts (NUEVO)
  │   ├── /publish/route.ts (NUEVO)
  │   ├── /schedule/route.ts (NUEVO)
  │   └── /display-sync/route.ts (NUEVO - Sincronizar pantalla)
  └── /vision-ai/
      ├── /process-frame/route.ts (NUEVO - Procesamiento local)
      └── /lpr-recognize/route.ts (NUEVO)

/infrastructure/
  ├── /docker/
  │   ├── Dockerfile.mediamtx (NUEVO)
  │   └── Dockerfile.vision-ai (NUEVO)
  ├── /k8s/
  │   ├── mediamtx-deployment.yaml (NUEVO)
  │   └── vision-ai-deployment.yaml (NUEVO)
  └── /config/
      ├── mediamtx.conf (NUEVO)
      └── yolo-config.yaml (NUEVO)

/database/
  ├── /migrations/
  │   └── 003_camaras_y_carteleria.sql (NUEVO)
```

#### Base de Datos

```sql
-- Tabla de cámaras
CREATE TABLE camaras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre VARCHAR(100),
  ubicacion VARCHAR(255),
  rtsp_url TEXT NOT NULL,
  stream_key VARCHAR(255),
  modelo VARCHAR(100),
  ubicacion_fisica VARCHAR(50),
  activa BOOLEAN DEFAULT TRUE,
  resolucion VARCHAR(20) DEFAULT '1920x1080',
  fps INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de eventos de LPR (Lectura de Placas)
CREATE TABLE lpr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  camara_id UUID REFERENCES camaras(id),
  placa VARCHAR(20),
  confianza DECIMAL(3,2),
  residencia_id UUID REFERENCES residents(id),
  accion VARCHAR(50), -- permitido, bloqueado, revisar
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cartelería digital
CREATE TABLE carteleria_contenidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  contenido TEXT,
  tipo VARCHAR(50), -- texto, imagen, video
  media_url TEXT,
  prioridad INT DEFAULT 0,
  vigente_desde TIMESTAMPTZ,
  vigente_hasta TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de displays conectados
CREATE TABLE carteleria_displays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  nombre VARCHAR(100),
  ubicacion VARCHAR(255),
  resolucion VARCHAR(20) DEFAULT '1920x1080',
  device_type VARCHAR(50), -- 'smart-tv', 'raspberry-pi', 'digital-sign'
  device_id VARCHAR(255) UNIQUE,
  estado VARCHAR(20) DEFAULT 'online',
  ultima_sincronizacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de schedule de cartelería
CREATE TABLE carteleria_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id UUID NOT NULL REFERENCES carteleria_displays(id) ON DELETE CASCADE,
  contenido_id UUID NOT NULL REFERENCES carteleria_contenidos(id) ON DELETE CASCADE,
  posicion INT DEFAULT 0, -- orden en playlist
  duracion_segundos INT DEFAULT 30,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (simplificado)
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin ve cámaras de su conjunto" ON camaras
  FOR SELECT USING (
    conjunto_id IN (
      SELECT conjuntoId FROM user_profiles WHERE id = auth.uid()
    )
  );
```

### 3.2 Lógica de Backend

#### Microservicio de Procesamiento de Video (Vision AI)

```typescript
// /api/vision-ai/process-frame/route.ts
import Jimp from 'jimp';
import * as tf from '@tensorflow/tfjs';
import { loadLPRModel } from '@/lib/ai/yolo-lpr';

export async function POST(req: NextRequest) {
  const { camaraId, frameData } = await req.json();
  const conjuntoId = await getCurrentConjuntoId();
  
  // 1. Decodificar frame
  const frame = Buffer.from(frameData, 'base64');
  const image = await Jimp.read(frame);
  
  // 2. Cargar modelo YOLO para LPR
  const model = await loadLPRModel();
  
  // 3. Procesar frame
  const predictions = await model.predict(image);
  
  const plates = predictions.filter(p => p.confidence > 0.85);
  
  if (plates.length > 0) {
    // 4. Correlacionar con base de datos de residentes
    const residentes = await db.residents.findMany({
      where: { conjunto_id: conjuntoId }
    });
    
    for (const plate of plates) {
      const resident = residentes.find(r => r.placa_vehicular === plate.text);
      
      // 5. Registrar evento
      await db.lprEvents.create({
        conjuntoId,
        camaraId,
        placa: plate.text,
        confianza: plate.confidence,
        residenciaId: resident?.id,
        accion: resident ? 'permitido' : 'revisar'
      });
      
      // 6. Si residente está al día, enviar acción automática
      if (resident) {
        const status = await db.accountStatus.findFirst({
          where: { conjunto_id: conjuntoId, apartment: resident.apartment }
        });
        
        if (status?.paymentStatus === 'al_dia') {
          // Abrir talanquera automáticamente (integración con relay)
          await triggerGateway(resident.apartment);
        } else {
          // Alertar a vigilancia
          await alertPorteria(`Residente ${resident.name} en deuda`);
        }
      }
    }
  }
  
  return NextResponse.json({ processed: true, platesFound: plates.length });
}
```

#### Endpoint de Cartelería Digital

```typescript
// /api/carteleria/publish/route.ts
export async function POST(req: NextRequest) {
  const { contenidoId, displayIds } = await req.json();
  const conjuntoId = await getCurrentConjuntoId();
  
  // 1. Validar que el contenido existe y pertenece al conjunto
  const contenido = await db.carteleria_contenidos.findUnique({
    where: { id: contenidoId }
  });
  
  if (contenido?.conjunto_id !== conjuntoId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // 2. Generar plantilla HTML/CSS con IA
  const template = await generateCartelTemplate(contenido);
  
  // 3. Sincronizar a cada display
  for (const displayId of displayIds) {
    const display = await db.carteleria_displays.findUnique({
      where: { id: displayId }
    });
    
    if (display?.device_type === 'raspberry-pi') {
      // Enviar payload a Raspberry Pi
      await sendToDevice(display.device_id, {
        action: 'update_content',
        html: template,
        duration: contenido.duracion_segundos
      });
    } else if (display?.device_type === 'smart-tv') {
      // Enviar URL de streaming
      await updateSmartTV(display.device_id, {
        streamUrl: `https://paicai.com.co/carteleria/stream/${contenidoId}`
      });
    }
  }
  
  // 4. Marcar como publicado
  await db.carteleria_contenidos.update({
    where: { id: contenidoId },
    data: { estado: 'published' }
  });
  
  return NextResponse.json({ published: true });
}
```

#### Template Generator con IA

```typescript
// /lib/ai/cartel-template-generator.ts
export async function generateCartelTemplate(
  contenido: CarteleriContenido
): Promise<string> {
  // Usar un modelo local o simple para generar HTML
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }
        .cartel {
          text-align: center;
          color: white;
          font-size: 4em;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: fadeIn 0.5s ease-in;
          max-width: 80%;
          word-wrap: break-word;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div class="cartel">
        <h1>${contenido.titulo}</h1>
        <p>${contenido.contenido}</p>
      </div>
    </body>
    </html>
  `;
  
  return template;
}
```

### 3.3 Pruebas de Regresión Fase 3

```typescript
// test/regression/phase-3/camera-integration.test.ts
describe('Regresión - Integración de Cámaras', () => {
  it('Dashboard sigue funcionando mientras se procesa video', async () => {
    // Iniciar procesamiento de video
    const frameProcessing = startVideoProcessing();
    
    // Mientras tanto, verificar que admin panel es responsivo
    const { user } = render(<App />);
    expect(screen.getByText(/Residentes/i)).toBeInTheDocument();
    
    // Esperar a que termine procesamiento
    await frameProcessing;
  });
});

// test/regression/phase-3/no-carteleria-breaks-admin.test.ts
describe('Regresión - Cartelería no Afecta Admin', () => {
  it('Actualizar cartelería no ralentiza dashboard', async () => {
    const startTime = performance.now();
    
    // Simular actualización de cartelería
    await fetch('/api/carteleria/publish', {
      method: 'POST',
      body: JSON.stringify({
        contenidoId: 'test-123',
        displayIds: ['display-1', 'display-2', 'display-3']
      })
    });
    
    // Dashboard debe permanecer < 100ms
    const dashboardTime = performance.now();
    expect(dashboardTime - startTime).toBeLessThan(100);
  });
});
```

---

## FASE 4: SISTEMA DE AGENTES AISLADOS (SRE, SHADOW QA/SECURITY, HÁBITOS)

**Duración Estimada**: 10 semanas  
**Objetivo**: Implementar microservicios independientes de agentes con orquestación centralizada.  
**Valor Entregado**: Plataforma auto-sanada, auto-reparable, proactiva en detección de bugs y anomalías.

### 4.1 Archivos Afectados / Creados

```
/agents/
  ├── /sre-agent/
  │   ├── main.py (NUEVO - Agent SRE/DevOps)
  │   ├── monitors.py (NUEVO)
  │   ├── healers.py (NUEVO)
  │   └── requirements.txt (NUEVO)
  ├── /shadow-qa-agent/
  │   ├── main.py (NUEVO)
  │   ├── test_executor.py (NUEVO)
  │   ├── bug_reporter.py (NUEVO)
  │   └── requirements.txt (NUEVO)
  ├── /shadow-security-agent/
  │   ├── main.py (NUEVO)
  │   ├── anomaly_detector.py (NUEVO)
  │   ├── rls_validator.py (NUEVO)
  │   └── requirements.txt (NUEVO)
  ├── /user-habits-agent/
  │   ├── main.py (NUEVO)
  │   ├── behavior_analyzer.py (NUEVO)
  │   └── requirements.txt (NUEVO)
  └── /gran-hermano/
      ├── orchestrator.py (NUEVO - Orquestador central A2A)
      ├── agent_registry.py (NUEVO)
      ├── websocket_server.py (NUEVO - Comunicación A2A)
      ├── dashboard-api.py (NUEVO)
      └── requirements.txt (NUEVO)

/api/
  ├── /agents/
  │   ├── /status/route.ts (NUEVO - Ver estado de agentes)
  │   ├── /health-report/route.ts (NUEVO - Reporte consolidado)
  │   └── /trigger-diagnostic/route.ts (NUEVO)
  └── /gran-hermano/
      ├── /metrics/route.ts (NUEVO)
      ├── /alerts/route.ts (NUEVO)
      └── /broadcast-update/route.ts (NUEVO - Enviar update A2A)

/src/
  ├── /pages/
  │   └── /admin/
  │       ├── /gran-hermano/ (NUEVO - Dashboard Pro para Mauricio)
  │       │   ├── index.tsx (NUEVO)
  │       │   ├── agents-health.tsx (NUEVO)
  │       │   ├── token-metrics.tsx (NUEVO)
  │       │   ├── security-alerts.tsx (NUEVO)
  │       │   └── bug-tracker.tsx (NUEVO)
  │       └── /health-system/ (NUEVO)
  └── /components/
      └── /agents/
          ├── AgentStatus.tsx (NUEVO)
          └── AlertCenter.tsx (NUEVO)

/docker-compose.yml (MODIFICAR - Agregar servicios de agentes)
.env.agents (NUEVO - Variables para agentes)
```

### 4.2 Lógica de Backend

#### SRE Agent (Python + LangGraph)

```python
# /agents/sre-agent/main.py
import asyncio
from langgraph.graph import StateGraph, END
from typing import TypedDict
import httpx
import subprocess

class SREState(TypedDict):
    conjunto_id: str
    alert_type: str
    severity: str
    action_taken: str
    resolved: bool

async def monitor_vercel_latency(state: SREState):
    """Monitorear latencia de Vercel"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.vercel.com/v1/projects/paic",
            headers={"Authorization": f"Bearer {VERCEL_TOKEN}"}
        )
        metrics = response.json()
        
        if metrics['avgLatency'] > 500:  # > 500ms es rojo
            state['alert_type'] = 'high_latency'
            state['severity'] = 'high'
            # Acción: Limpiar caché
            await action_clear_cache(state['conjunto_id'])
        
    return state

async def action_clear_cache(conjunto_id: str):
    """Ejecutar limpieza de caché"""
    # Limpiar Supabase cache layer
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.supabase.com/projects/paic/cache/clear",
            json={"conjunto_id": conjunto_id}
        )
    
    return {"action_taken": "cache_cleared"}

async def monitor_supabase_connection(state: SREState):
    """Monitorear conexión a Supabase"""
    # Hacer query de prueba
    result = await db.health_check()
    
    if not result['ok']:
        state['alert_type'] = 'db_connection_down'
        state['severity'] = 'critical'
        # Acción: Switchover a replica
        await action_switchover_db_replica()
    
    return state

# Construir grafo de trabajo
workflow = StateGraph(SREState)
workflow.add_node("monitor_latency", monitor_vercel_latency)
workflow.add_node("monitor_db", monitor_supabase_connection)
workflow.add_node("take_action", take_action)

workflow.add_edge("monitor_latency", "monitor_db")
workflow.add_edge("monitor_db", "take_action")
workflow.add_edge("take_action", END)

async def run_sre_loop():
    """Loop principal del agente SRE"""
    while True:
        conjuntos = await db.conjuntos.find_all()
        
        for conjunto in conjuntos:
            state = SREState(
                conjunto_id=conjunto.id,
                alert_type="",
                severity="",
                action_taken="",
                resolved=False
            )
            
            result = await workflow.execute(state)
            
            # Reportar a Gran Hermano
            await report_to_gran_hermano({
                "agent": "sre",
                "conjunto_id": conjunto.id,
                "status": result
            })
        
        await asyncio.sleep(60)  # Cada minuto

if __name__ == "__main__":
    asyncio.run(run_sre_loop())
```

#### Shadow QA Agent (Python + Pytest)

```python
# /agents/shadow-qa-agent/main.py
import asyncio
from typing import List
import subprocess
import json
from datetime import datetime

class ShadowQAAgent:
    def __init__(self):
        self.test_results = []
        self.bugs_found = []
    
    async def run_test_suite(self, conjunto_id: str):
        """Ejecutar suite de pruebas del Manual de Testing"""
        # Leer casos de prueba del MANUAL_DE_TESTING.md
        tests = await self.parse_test_cases(
            "/app/MANUAL_DE_TESTING.md"
        )
        
        for test in tests:
            result = await self.execute_test(test, conjunto_id)
            
            if not result['passed']:
                self.bugs_found.append({
                    "test_id": test['id'],
                    "error": result['error'],
                    "timestamp": datetime.now().isoformat(),
                    "conjunto_id": conjunto_id
                })
        
        return self.bugs_found
    
    async def execute_test(self, test_case: dict, conjunto_id: str):
        """Ejecutar caso individual"""
        # Usar Playwright para simular clicks
        cmd = [
            "pytest",
            f"--test-id={test_case['id']}",
            f"--conjunto-id={conjunto_id}",
            "--headless"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return {
            "passed": result.returncode == 0,
            "error": result.stderr if result.returncode != 0 else None
        }
    
    async def generate_bug_report(self):
        """Generar reporte en Markdown"""
        report = "# Shadow QA Report\n\n"
        report += f"Fecha: {datetime.now().isoformat()}\n\n"
        
        for bug in self.bugs_found:
            report += f"## Bug {bug['test_id']}\n"
            report += f"- Conjunto: {bug['conjunto_id']}\n"
            report += f"- Error: {bug['error']}\n\n"
        
        return report

async def run_shadow_qa_loop():
    agent = ShadowQAAgent()
    
    while True:
        conjuntos = await db.conjuntos.find_all()
        
        for conjunto in conjuntos:
            bugs = await agent.run_test_suite(conjunto.id)
            
            if bugs:
                report = await agent.generate_bug_report()
                
                # Crear issue en GitHub o guardar en BD
                await db.qa_reports.create({
                    "conjunto_id": conjunto.id,
                    "bugs_found": len(bugs),
                    "report": report
                })
                
                # Notificar a Gran Hermano
                await report_to_gran_hermano({
                    "agent": "shadow_qa",
                    "bugs": bugs
                })
        
        await asyncio.sleep(3600)  # Cada hora

if __name__ == "__main__":
    asyncio.run(run_shadow_qa_loop())
```

#### Shadow Security Agent (Python + Anomaly Detection)

```python
# /agents/shadow-security-agent/main.py
import asyncio
from sklearn.ensemble import IsolationForest
import numpy as np

class ShadowSecurityAgent:
    def __init__(self):
        self.anomaly_detector = IsolationForest(contamination=0.05)
        self.blocked_ips = set()
    
    async def monitor_access_patterns(self, conjunto_id: str):
        """Detectar patrones anómalos de acceso"""
        recent_requests = await db.request_logs.find({
            "conjunto_id": conjunto_id,
            "timestamp": {"$gte": datetime.now() - timedelta(hours=1)}
        })
        
        # Extraer features: IP, user_id, endpoint, time_delta
        features = []
        for req in recent_requests:
            features.append([
                hash(req['ip']) % 1000,  # IP como número
                hash(req['user_id']) % 100,  # User como número
                hash(req['endpoint']) % 50,  # Endpoint
                req['response_time']
            ])
        
        if len(features) > 10:
            X = np.array(features)
            predictions = self.anomaly_detector.predict(X)
            
            # Bloquear IPs con score anómalo
            for i, pred in enumerate(predictions):
                if pred == -1:  # Anomalía detectada
                    ip = recent_requests[i]['ip']
                    self.blocked_ips.add(ip)
                    
                    await db.security_alerts.create({
                        "conjunto_id": conjunto_id,
                        "ip": ip,
                        "reason": "Anomalous access pattern",
                        "action": "blocked"
                    })
    
    async def validate_rls_policies(self, conjunto_id: str):
        """Validar que RLS está funcionando"""
        # Test 1: User A no puede acceder a datos de Conjunto B
        test_user_a = "user-a@test.com"
        token_a = await generate_test_token(test_user_a, "conjunto-a")
        
        response = await httpx.get(
            f"https://paicai.com.co/api/residentes?conjunto_id=conjunto-b",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        
        if response.status_code != 403:
            await db.security_alerts.create({
                "conjunto_id": conjunto_id,
                "type": "RLS_BREACH",
                "severity": "critical"
            })

async def run_shadow_security_loop():
    agent = ShadowSecurityAgent()
    
    while True:
        conjuntos = await db.conjuntos.find_all()
        
        for conjunto in conjuntos:
            await agent.monitor_access_patterns(conjunto.id)
            await agent.validate_rls_policies(conjunto.id)
        
        await asyncio.sleep(300)  # Cada 5 minutos

if __name__ == "__main__":
    asyncio.run(run_shadow_security_loop())
```

#### Gran Hermano Orchestrator (Node.js + Express)

```typescript
// /agents/gran-hermano/orchestrator.ts
import express from 'express';
import WebSocket from 'ws';
import axios from 'axios';

const app = express();
const agentRegistry = new Map<string, AgentStatus>();

interface AgentStatus {
  name: string;
  type: 'sre' | 'shadow_qa' | 'shadow_security' | 'user_habits';
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: Date;
  metricsURL: string;
}

// WebSocket para comunicación A2A
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'agent_status_update') {
      agentRegistry.set(message.agentId, {
        name: message.name,
        type: message.agentType,
        status: message.status,
        lastHeartbeat: new Date(),
        metricsURL: message.metricsURL
      });
      
      // Broadcast a otros agentes
      broadcastToAllAgents({
        type: 'agent_registry_update',
        registry: Array.from(agentRegistry.entries())
      });
    }
    
    if (message.type === 'broadcast_update') {
      // Gran Hermano enviando instrucción masiva
      // Ej: Actualizar prompt de IA en todos los conjuntos
      broadcastToAllAgents(message.payload);
    }
  });
});

// Endpoint para que Mauricio vea la salud del sistema
app.get('/api/gran-hermano/dashboard', async (req, res) => {
  const agentStatuses = Array.from(agentRegistry.values());
  
  const metrics = {
    timestamp: new Date(),
    agents: agentStatuses,
    system_health: agentStatuses.every(a => a.status === 'online') ? 'healthy' : 'degraded',
    token_consumption: await getTokenMetrics(),
    alerts_open: await countOpenAlerts()
  };
  
  res.json(metrics);
});

function broadcastToAllAgents(payload: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

app.listen(3001, () => {
  console.log('Gran Hermano Orchestrator running on port 3001');
});
```

### 4.3 Pruebas de Regresión Fase 4

```typescript
// test/regression/phase-4/agents-dont-break-app.test.ts
describe('Regresión - Agentes No Rompen App', () => {
  it('Shadow QA corriendo en background no ralentiza UI', async () => {
    // Iniciar agentes
    const agents = await startAllAgents();
    
    // Medir performance de UI
    const startTime = performance.now();
    const { user } = render(<App />);
    expect(screen.getByText(/Residentes/i)).toBeInTheDocument();
    const uiTime = performance.now() - startTime;
    
    // UI debe ser < 1s incluso con agentes corriendo
    expect(uiTime).toBeLessThan(1000);
    
    // Apagar agentes
    await stopAllAgents();
  });
  
  it('Gran Hermano puede enviar update masivo sin downtime', async () => {
    // Gran Hermano envía actualización de prompt a todos conjuntos
    const broadcastTime = await granHermano.broadcast({
      type: 'update_system_prompt',
      newPrompt: 'Nuevo prompt actualizado'
    });
    
    // Mientras tanto, usuarios siguen usando app
    const { user } = render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    
    // No debe haber downtime
    expect(broadcastTime).toBeLessThan(5000);
  });
});
```

---

## 📊 MATRIZ DE REGRESIÓN (Validación Post-Implementación)

| Módulo | Test Actual | Test Post-Fase-1 | Test Post-Fase-2 | Test Post-Fase-3 | Test Post-Fase-4 |
|--------|------------|-----------------|-----------------|-----------------|-----------------|
| Dashboard | ✅ Carga | ✅ Sin API Keys expuestas | ✅ Selector de rol | ✅ Widget cámaras | ✅ Widget agentes |
| Base de Datos | ✅ CRUD | ✅ RLS multi-tenant | ✅ Push subscriptions | ✅ LPR events | ✅ Agent logs |
| Chatbot | ⚠️ Nombres técnicos | ✅ Ocultos | ✅ Barra Ctrl+K | ✅ En módulos | ✅ Auto-actualizado |
| Residentes | ✅ UI Admin | ✅ Filtro conjunto_id | ✅ PWA residente | ✅ Citofonía WebRTC | ✅ Notificaciones |
| Seguridad | ✅ Logs básicos | ✅ API segura | ✅ Citofonía | ✅ LPR + anomalías | ✅ Validación RLS |
| Finanzas | ✅ Gráficos | ✅ Multi-tenant | ✅ Web Push alertas | ✅ (No aplica) | ✅ Auditoría IA |
| Comunicaciones | ✅ Email masivo | ✅ IA en backend | ✅ Push + email | ✅ Cartelería | ✅ Optimización |

---

## 📝 AJUSTES AL MANUAL DE TESTING

### Nuevos Casos de Prueba a Añadir

#### Sección: "🔐 TESTING DE SEGURIDAD" (Fase 1)

```markdown
### Caso 41: IA API Key No Expuesta

**ID**: SEC-IAA-001  
**Descripción**: Validar que VITE_GEMINI_API_KEY fue removida del frontend

**Pre-requisitos:**
- App en desarrollo

**Pasos:**
1. Abrir DevTools (F12)
2. Ir a Console
3. Escribir `window.VITE_GEMINI_API_KEY`
4. Escribir `localStorage.getItem('GEMINI_KEY')`
5. Escribir `sessionStorage.getItem('GEMINI_KEY')`

**Resultado Esperado:**
- ✅ Todos retornan `undefined`
- ✅ No hay referencia a GEMINI_API_KEY en el código fuente

**Criterio de Aceptación:**
```
☑ Sin API Keys en frontend
☑ Seguridad aumentada
☑ Cumple PCI-DSS
```

#### Sección: "🌐 TESTING DE COMPATIBILIDAD" (Fase 2)

```markdown
### Caso 48: PWA Instala sin Afectar Admin

**ID**: PWA-001  
**Descripción**: PWA para residentes no impacta admin dashboard

**Pre-requisitos:**
- App abierta en mobile
- Admin panel abierto

**Pasos:**
1. En móvil, hacer clic "Instalar"
2. Confirmar instalación
3. Mientras se instala, revisar admin en otra ventana
4. Navegar en admin

**Resultado Esperado:**
- ✅ PWA se instala sin latencia
- ✅ Admin dashboard sigue responsivo
- ✅ Performance < 500ms en ambos

**Criterio de Aceptación:**
```
☑ PWA instalada
☑ Admin sin downtime
☑ Performance OK
```

#### Sección: "🔒 TESTING DE SEGURIDAD" (Fase 3)

```markdown
### Caso 41: LPR No Expone Datos de Otros Conjuntos

**ID**: SEC-LPR-001  
**Descripción**: Lectura de placas filtra por conjunto_id

**Pre-requisitos:**
- Cámaras activas en 2 conjuntos

**Pasos:**
1. Administrador del Conjunto A accede a LPR
2. Intenta ver eventos de Conjunto B

**Resultado Esperado:**
- ✅ Solo ve eventos de Conjunto A
- ✅ RLS previene acceso a B

**Criterio de Aceptación:**
```
☑ Aislamiento de datos
☑ RLS efectivo
☑ Seguridad multi-tenant
```

#### Sección: Nueva "🤖 TESTING DE AGENTES"

```markdown
### Caso 50: Shadow QA Detecta Bug sin Afectar Producción

**ID**: AGENT-QA-001  
**Descripción**: Shadow QA encuentra bugs en ambiente de test

**Pre-requisitos:**
- Agente ShadowQA en ejecución
- Ambiente de test separado

**Pasos:**
1. Shadow QA ejecuta Manual de Testing
2. Introduce error simulado en test environment
3. Verificar que no afecta producción

**Resultado Esperado:**
- ✅ Bug detectado en reporte
- ✅ Usuarios finales no ven impacto
- ✅ Reporte enviado a Gran Hermano

**Criterio de Aceptación:**
```
☑ Detección automática
☑ Sin downtime
☑ Reporte generado
```

### Casos a Modificar

**Caso 22 (COM-001)**: Agregar note sobre "Optimización con Web Push"
```markdown
**Nota Post-Fase-2**: Con la implementación de PWA, este email 
también puede enviarse como notificación push, reduciendo costo 
de Resend en un 70%.
```

**Caso 30 (CHAT-001)**: Actualizar descripción
```markdown
**Antes**: "Chatbot responde pregunta básica"
**Después**: "Barra de Comandos responde pregunta administrativa 
en lenguaje natural sin exponer términos técnicos"
```

---

## 🔧 STACK TECNOLÓGICO CONFIRMADO

| Componente | Tecnología | Versión | Justificación |
|-----------|-----------|---------|---------------|
| Frontend | React + Next.js | 19/15 | Ya en producción |
| Backend | Vercel Edge Functions | - | Serverless, bajo costo |
| BD | Supabase (PostgreSQL) | 15 | RLS nativo, pgvector |
| IA Principal | Gemini 2.0 Flash | - | Modelos locales en Fase 4 |
| Citofonía | WebRTC | - | $0 costo, P2P |
| Video Streaming | MediaMTX | latest | RTSP a HLS/WebRTC |
| Vision AI | YOLOv8 (local) | 8.0 | LPR y anomalías |
| Agentes | LangGraph + CrewAI | latest | Multi-agente orquestado |
| Notificaciones | Web Push + Supabase Realtime | - | Nativo navegador |
| Email | Resend (críticos solo) | - | Reducido post-Fase-2 |

---

## ⏱️ CRONOGRAMA ESTIMADO

| Fase | Duración | Hitos | Entregables |
|------|----------|-------|-------------|
| **Fase 1** | 4 semanas | Semana 2: Backend /api/chat | DOCUMENTACION.md v2.0 |
| | | Semana 4: Tests regresión | Code review ready |
| **Fase 2** | 6 semanas | Semana 3: PWA basic | ResidenteApp v1.0 |
| | | Semana 6: WebRTC working | Web Push enabled |
| **Fase 3** | 8 semanas | Semana 4: RTSP streaming | Camera Hub v1.0 |
| | | Semana 8: LPR functional | Cartelería v1.0 |
| **Fase 4** | 10 semanas | Semana 5: SRE Agent | GranHermano v1.0 |
| | | Semana 10: All agents integrated | Dashboard Mauricio ready |

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Regresión en DashboardView | Media | Alto | Tests pre-commit, revert rápido |
| Multi-tenancy leak | Baja | Crítico | Auditoría RLS antes de cada release |
| Latencia WebRTC alta | Media | Medio | STUN servers redundantes |
| Modelos locales out of memory | Baja | Alto | Monitoreo de RAM, escalabilidad automática |
| Agentes generando bucles infinitos | Baja | Alto | Timeout en cada agente, watchdog |

---

## ✅ CRITERIO DE SALIDA (GO/NO-GO)

Cada fase debe cumplir:

1. ✅ **Todos** los tests de regresión pasan
2. ✅ Console sin errores (solo warnings permitidos)
3. ✅ Performance: < 2s dashboard, < 500ms chat
4. ✅ Cero data leaks detectados por Shadow Security
5. ✅ Documentación actualizada
6. ✅ Team review y aprobación

---

## 📞 Próximos Pasos

**Cuando Mauricio apruebe este plan:**

1. **Crear ramas de feature**:
   ```bash
   git checkout -b phase-1/backend-security
   git checkout -b phase-1/tests-regression
   ```

2. **Iniciar Fase 1**:
   - Crear `/api/chat/route.ts`
   - Implementar middleware de multi-tenancy
   - Escribir tests de regresión

3. **Comunicar timeline**:
   - Informar al equipo de desarrollo
   - Preparar ambientes de staging
   - Preparar plan de rollback

---

**Documento preparado por**: GitHub Copilot (Ingeniero de Software Principal)  
**Esperando**: ✋ Aprobación de Mauricio Pineda  
**Estado**: 🟡 PENDING REVIEW

---

Mauricio, **revisa este plan paso a paso**. Una vez que apruebes la estructura, los pasos y los riesgos mitigados, doy comienzo inmediato a la Fase 1 sin escribir código fuera de tu aprobación. 🚀

¿Hay algo que quieras ajustar, aclarar o expandir antes de proceder?
