# Prototype Next - Market Scrapper

Comparador de ofertas de supermercados argentinos. Migración del proyecto original a Next.js con Supabase como data store y deploy en Vercel.

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Actions │ ──► │    Supabase      │ ◄── │ Next.js (Vercel)│
│  Scrapea +      │     │   (PostgreSQL)   │     │ Solo lee datos  │
│  Backup a GH    │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- **GitHub Actions** corre los scrapers (incluido Puppeteer) diariamente, sube los productos a Supabase y genera un backup.
- **Supabase** guarda el catálogo vigente y el historial de ejecuciones.
- **Next.js en Vercel** lee de Supabase y muestra la UI. No corre scrapers.

## Estructura

```
prototype-next/
├── app/                    # Rutas de Next.js (App Router)
│   ├── page.tsx            # Home
│   ├── cena/page.tsx       # Cena con IA
│   └── api/                # API Routes (incluye /api/dinner)
├── components/             # Componentes React (incluye DinnerPlanner)
├── lib/
│   ├── ai/                 # Pipeline de cena con IA (búsqueda + receta + costo)
│   ├── scrapers/           # Scrapers en TypeScript
│   ├── data.ts             # Capa de datos (Supabase / JSON fallback local)
│   ├── analytics.ts        # Lógica de analytics
│   ├── search.ts           # Lógica de búsqueda
│   ├── categories.ts       # Mapa de categorías
│   └── supabase.ts         # Cliente y helpers de Supabase
├── scripts/
│   ├── scrape.ts                    # Script CLI para correr scrapers
│   ├── migrate-to-supabase.ts       # Migración JSON → Supabase
│   └── backup.ts                    # Backup SQL → archivo .sql.gz
├── supabase/
│   └── schema.sql          # Schema de la DB
├── data/                   # Datos scrapeados (gitignored, local only)
└── .github/workflows/
    └── scrape-and-backup.yml   # Action diaria
```

## Setup local

```bash
cd prototype-next
pnpm install
cp .env.example .env.local
# Completar las variables de Supabase
pnpm dev
```

## Supabase

1. Crear proyecto en [supabase.com](https://supabase.com/dashboard)
2. Aplicar `supabase/schema.sql` desde el SQL Editor del dashboard
3. Copiar URL y key al `.env.local`

## Cena con IA

Página **`/cena`**: elegís porciones, presupuesto, supermercado y dieta. La IA elige
productos reales del catálogo y **el código** calcula el total (formato de venta,
despensa excluida, aviso de precios viejos).

- API: `POST /api/dinner` con `{ "servings": 2, "budgetArs": 20000, "store": "dia", "diet": "vegan" }`.
- Lógica: `lib/ai/` — dos fases: búsqueda agéntica (`search_products`) y structured output.
- Modelo: `alibaba/qwen3.7-flash` vía Vercel AI Gateway (configurable con `AI_MODEL`).
- Requiere `AI_GATEWAY_API_KEY`.
- La primera request carga el catálogo desde Supabase (puede tardar ~40s en frío);
  después queda cacheado en memoria 10 min. En Vercel, la ruta usa `maxDuration = 60`.

```bash
curl -X POST http://localhost:3000/api/dinner \
  -H 'content-type: application/json' \
  -d '{"servings":2,"budgetArs":20000,"store":"dia","diet":"vegan"}'
```

## Scripts útiles

```bash
# Scraping
pnpm scrape all                    # Todos los scrapers
pnpm scrape dia                    # Un scraper específico

# Migración de datos (JSON → Supabase)
pnpm migrate:supabase              # Migración real
pnpm migrate:supabase:dry          # Simulación (no sube nada)

# Backup (Supabase → archivo SQL)
pnpm backup                        # Genera backup-YYYY-MM-DD.sql.gz
```

## Backup y restore

Los backups se generan automáticamente cada día desde GitHub Actions y se suben como:
1. **GitHub Actions artifact** (90 días de retención)
2. **GitHub Release** del repo (permanente, 2GB gratis)

### Restaurar un backup localmente

```bash
# 1. Descargar el .sql.gz de GitHub Releases
# 2. Descomprimir y aplicar a la DB
zcat backup-XXXXX.sql.gz | psql "postgresql://USER:PASS@HOST:5432/postgres"
```

### Verificar datos actuales

```bash
node -e "
import('@supabase/supabase-js').then(async ({ createClient }) => {
  const c = createClient('https://XXX.supabase.co', 'sb_publishable_...');
  const { count } = await c.from('products').select('*', { count: 'exact', head: true });
  console.log('Productos:', count);
});
"
```

## API Endpoints

- `GET /api/search?q=leche` — Búsqueda de productos
- `POST /api/dinner` — Cena con IA + lista de compras y total calculado
- `GET /api/analytics/available-categories` — Categorías con productos
- `GET /api/analytics/categories` — Resumen por categoría
- `GET /api/analytics/stores-comparison` — Comparación entre tiendas
- `GET /api/analytics/cheapest-by-category/[category]` — Más barato por categoría

## GitHub Action

`.github/workflows/scrape-and-backup.yml`:

- **Schedule**: diario a las 06:00 UTC
- **Manual**: desde la tab Actions del repo
- Pasos: install → scrape → upsert a Supabase → backup → release
- Los scrapers activos (Día, Jumbo, Farmacity, FarmaOnline) usan las APIs VTEX por `fetch`.
  Puppeteer solo se usa en los scrapers experimentales (Carrefour/Coto).

Secrets requeridos en GitHub:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (lectura)
- `SUPABASE_SERVICE_ROLE_KEY` (escrituras; bypassa RLS)

## Seguridad

- `supabase/schema.sql` deja `products` y `scraping_runs` en **solo lectura pública**.
  Las escrituras requieren `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS). Aplicá el SQL en el
  SQL Editor de Supabase para que tome efecto en la base existente.
- Configurá `SUPABASE_SERVICE_ROLE_KEY` en GitHub Actions y en `.env.local` para
  `scrape`, `migrate:supabase` y `backup`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` es pública (solo lectura).
- `/api/dinner` es público y consume AI Gateway: agregá rate limiting/WAF o auth antes de
  exponerlo masivamente.
- Nunca commitees `.env.local` (ya está en `.gitignore`).

## Deploy en Vercel

1. Conectar el repo a Vercel
2. Configurar las env vars de Supabase **y `AI_GATEWAY_API_KEY`** en el dashboard de Vercel
3. Deploy

No requiere Docker ni configuración adicional. Vercel detecta Next.js automáticamente.

## Variables de entorno

Ver `.env.example`. Las dos claves son:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Key pública (anon) — sirve para frontend y scripts con RLS permisivo |
| `SUPABASE_SERVICE_ROLE_KEY` | Key privada — **requerida para escrituras** con RLS endurecido; nunca va al cliente |
| `AI_GATEWAY_API_KEY` | Key de Vercel AI Gateway — requerida por `/api/dinner` |
| `AI_MODEL` | Opcional: modelo a usar (default `alibaba/qwen3.7-flash`) |
