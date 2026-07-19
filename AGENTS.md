# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **PAIC 2** (API base `https://6vgumkqu.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## MateriaProgramable — Flujo de publicación de artículos

### Procesar un artículo nuevo

Cuando el usuario diga **"procesa el archivo"** o similar, seguir este flujo:

1. **Leer el .txt** desde `materiaprogramable/_articulos_text_plano/` (o la ruta que indique)
2. **Extraer metadatos** del contenido: título, descripción, fecha, categoría, etc.
3. **Crear el .md** en `materiaprogramable/src/content/blog/` con frontmatter completo:
   - `title`, `description`, `pubDate`, `category`, `lang`, `translationOf` (si aplica)
   - `animation:` block según la temática del artículo
4. **Generar imagen hero** ejecutando:
   ```
   python tools/generate_article_image.py "<title>" "<description>" "<content_preview>"
   ```
   El script intenta **Gemini API** primero; si falla, hace **fallback a HuggingFace FLUX.1-schnell**.
   Si la imagen se genera, actualizar el frontmatter con `heroImage: /media/<filename>` y `ogImage: <filename>`.
   Si ambos métodos fallan, publicar sin imagen.
5. **Crear traducción EN** con `tools/translate.mjs` si aplica (requiere `GEMINI_API_KEY`)
6. **Verificar build**: `npx astro build` en `materiaprogramable/`
7. **Commit y push** a GitHub

### Environment variables (`.env` en `materiaprogramable/`)

| Variable | Propósito |
|---|---|
| `GEMINI_API_KEY` | Imagen hero (primario) + traducción EN |
| `HF_API_KEY` | Imagen hero (fallback con FLUX.1-schnell) |

### Plan B (fallback imagen)

Si Gemini falla al generar la imagen, el script `generate_article_image.py` automáticamente usa HuggingFace. Si ambos fallan, se publica sin imagen (como se hacía antes).
