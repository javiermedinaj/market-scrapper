# Comparador de Ofertas Supermercados

Scraper y comparador de ofertas de supermercados argentinos. Recolecta precios a diario
y los presenta en una app web. La aplicación activa es **`prototype-next/`**.

## Estructura

```
prototype-next/   App activa: Next.js + Supabase + /cena (IA) (deploy en Vercel)
test-ai/          Laboratorio y evals del pipeline de IA (la versión de producción vive en prototype-next/lib/ai)
local-archives/   Backups de datos y archivo del código legacy (gitignored)
```

## Arquitectura

```
GitHub Actions (diario)  ──►  Scrapers (prototype-next/lib/scrapers)
                                      │
                                      ▼
                                Supabase (Postgres)
                                      │
                                      ▼
                             Next.js en Vercel (solo lee)
```

- **Scraping:** `prototype-next/lib/scrapers` (Día, Jumbo, Farmacity, FarmaOnline, Carrefour, Coto).
- **Automatización:** `.github/workflows/scrape-and-backup.yml` corre `pnpm scrape` todos los días
  a las 06:00 y genera un backup como Release de GitHub.
- **Datos:** no se commitean (ver `.gitignore`); viven en Supabase y en backups.
- **Cena con IA:** `/cena` + `POST /api/dinner`; la lógica vive en `prototype-next/lib/ai`.

## Instalación y uso

Requiere Node 22+ y pnpm.

```bash
cd prototype-next
pnpm install

cp .env.example .env.local   # Supabase + AI_GATEWAY_API_KEY
pnpm dev                     # http://localhost:3000

pnpm scrape [store|all]      # scrapea y escribe en Supabase
pnpm backup backup.sql.gz    # genera un backup
pnpm lint
```

## test-ai

Experimento para construir una capa de IA sobre los datos: dada una cantidad de porciones,
un presupuesto en ARS y un supermercado, arma una receta con productos reales y calcula el
total. Ver `test-ai/README.md`.

## Nota

Las carpetas legacy (`go-test`, `offers-scrap`, `scraper`) se archivaron en
`local-archives/legacy-go-test-offers-scrap-scraper-2026-10-16.zip` y se removieron del
árbol de trabajo. Su lógica quedó reemplazada por `prototype-next`.
