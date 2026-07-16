# Prototype Next - Market Scrapper

Migración del comparador de ofertas a Next.js 16 con TypeScript.

## ¿Qué incluye?

- **Frontend**: Next.js App Router + React 19 + Tailwind CSS v4
- **Backend**: Route Handlers de Next.js reemplazando la API de Go
- **Scrapers**: TypeScript unificando scrapers de Go y Node/Puppeteer
- **Datos**: archivos JSON por defecto, con migración opcional a Supabase
- **Deploy**: Docker + docker-compose + GitHub Actions

## Estructura

```
prototype-next/
├── app/                    # Rutas de Next.js
│   ├── page.tsx            # Home
│   └── api/                # API Routes
├── components/             # Componentes React
├── lib/
│   ├── scrapers/           # Scrapers en TypeScript
│   ├── data.ts             # Capa de datos (JSON / Supabase)
│   ├── analytics.ts        # Lógica de analytics
│   ├── search.ts           # Lógica de búsqueda
│   ├── categories.ts       # Mapa de categorías
│   └── supabase.ts         # Cliente y helpers de Supabase
├── scripts/
│   └── scrape.ts           # Script CLI para correr scrapers
├── supabase/
│   └── schema.sql          # Schema de Supabase
├── data/                   # Datos scrapeados (ignorados en git)
├── Dockerfile
└── docker-compose.yml
```

## Instalación

```bash
cd prototype-next
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

## Scraping manual

```bash
# Todos los scrapers
pnpm scrape all

# Un scraper específico
pnpm scrape dia
pnpm scrape jumbo
pnpm scrape farmacity
pnpm scrape farma
pnpm scrape carrefour
pnpm scrape coto
```

## Build y producción

```bash
pnpm build
pnpm start
```

Con Docker:

```bash
docker-compose up -d --build
```

## Endpoints API

- `GET /api/search?q=leche`
- `GET /api/analytics/available-categories`
- `GET /api/analytics/categories`
- `GET /api/analytics/stores-comparison`
- `GET /api/analytics/cheapest-by-category/[category]`
- `POST /api/scrapers/run` (requiere header `Authorization: Bearer SCRAPER_SECRET`)

## Migración a Supabase

1. Crear proyecto en Supabase
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Copiar `.env.example` a `.env` y completar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (para escritura desde el servidor)
4. La app usa Supabase automáticamente si las variables están configuradas

## Variables de entorno

Ver `.env.example`.
