# test-ai

Experimento aislado: capa de IA sobre los datos scrapeados de supermercados argentinos (precios en ARS).
No toca el resto del repo. Acá se aprende por etapas, una por vez.

## Etapas

1. ✅ **Structured output**: llamar al modelo y obtener JSON validado. Sin herramientas.
2. ✅ **Una herramienta** `search_products(query)` + loop de tool calling con límite de pasos, y precios calculados por código desde los datos.
3. **Retrieval**: empezar por búsqueda simple y mejorarla solo cuando falle.
4. **Deploy + tracing**.
5. **Evals** (lo más importante).
6. Recién ahí, probar un framework y comparar.

## Estructura del código

```
src/
  config.ts          # modelo, límites, resolución de súper
  text.ts            # normalización (acentos/mayúsculas)
  data/products.ts   # carga + búsqueda (filtro por súper)
  domain/
    recipe.ts        # schemas zod + tipos
    grounding.ts     # productId → producto, mismatch, total
  llm/
    phaseA.ts        # búsquedas agrupadas (1 request)
    phaseB.ts        # finalización estructurada
  pipeline.ts        # orquesta fase A → valida → fase B → retry
  cli/
    stage1.ts
    stage2.ts
tests/baseline.ts
```

Se divide por **responsabilidad**, no por súper ni por dieta: el súper es un filtro
de datos y la dieta será un parámetro. Cada archivo tiene una sola razón para cambiar.

## Modelo

`alibaba/qwen3.7-flash` vía Vercel AI Gateway.

Ojo con dos cosas:
- Es un modelo de **reasoning**: el "thinking" viene prendido por defecto. El structured output (JSON Schema) solo funciona en modo **no-thinking**, por eso el código pasa `enableThinking: false`.
- El structured output de Qwen hace *fallback* silencioso a JSON sin schema si hay input multimodal o si el thinking queda prendido. Si el JSON sale raro, revisá primero el modo thinking.

## Setup

```bash
cp .env.example .env      # completá AI_GATEWAY_API_KEY
npm install
```

## Correr

```bash
npm run stage1                    # etapa 1: solo structured output (precios inventados)
npm run stage2                    # etapa 2: ambos súper, omnívora, $20.000
npm run stage2 -- 2 20000 jumbo   # solo Jumbo
npm run stage2 -- 2 20000 dia     # solo Día
npm run stage2 -- 2 20000 dia vegetarian
npm run stage2 -- 2 20000 dia vegan
npm run stage2 -- 4 30000 both omnivore
npm run typecheck
```

## Baseline de confiabilidad (antes de la etapa 3)

```bash
npm run test:unit                  # costo/dieta, sin API
npm run test:dia                   # 3 corridas de Día
npm run test:jumbo                 # 3 corridas de Jumbo
npm run test:baseline              # ambos
npm run test:dia -- 5              # 5 corridas
npm run test:dia -- 3 90000        # 3 corridas, 90s de espera entre cada una
npm run test:dia -- 1 0 vegetarian # 1 corrida, dieta vegetariana
npm run test:dia -- 1 0 vegan      # 1 corrida, dieta vegana
```

Args: `[dia|jumbo] [repeticiones=3] [delayMs=60000] [dieta=omnivore|vegetarian|vegan]`.

### Elegir modelo

El modelo se configura por env (default `alibaba/qwen3.7-flash`):

```bash
AI_MODEL=deepseek/deepseek-v4.1-flash npm run test:dia -- 3 60000
```

- Modelos `alibaba/*` → se apaga thinking con `providerOptions.alibaba.enableThinking=false`.
- Otros modelos → se apaga con el parámetro portable `reasoning: "none"`.

**Free tier:** `deepseek/deepseek-v4.1-flash` está bloqueado ("Free tier users do not
have access"). Para usarlo hay que cargar créditos pagos.

**Latencia ≈ TTFT × requests + output_tokens / throughput.** Mirá la columna *Throughput
(tps)*, no el nombre "flash": `xiaomi/mimo-v2.6-flash` tiene solo 34 tps (más lento que
Qwen). `deepseek/deepseek-v4.1-flash` tiene ~241 tps.

**No uses modelos de razonamiento para esta tarea.** Thinking agrega tokens y segundos;
`reason=0` es lo correcto acá.

**Rate limit:** el team de Vercel AI Gateway tiene **5 requests/min** para
`alibaba/qwen3.7-flash`. Cada corrida hace ~3-4 requests (pasos de la fase 1 +
intentos de la fase 2), así que el baseline espera 60s entre corridas por defecto.
Si ves `GatewayRateLimitError`, subí el delay. Esas corridas se marcan como
**rate-limited** y **se excluyen** de los porcentajes: no son fallos de calidad.

Cada corrida imprime el desglose de tiempos:
`f1` (búsqueda agéntica) · `f2` (finalización, por intento) · `search` (tiempo real
dentro de `searchProducts`) · `req` (requests al modelo) · `reason` (tokens de
razonamiento). Así sabés si el tiempo se va en la API, en las búsquedas o en retries.

Mide por caso, no promedios:

- **JSON válido:** el modelo devolvió el objeto parseable.
- **dentro de budget:** el total calculado por código ≤ presupuesto.
- **limpio:** válido + dentro de budget + sin mismatch semántico + sin violación de dieta.

Guarda un snapshot en `tests/results/baseline-*.json` (gitignored).

El pipeline vive en `src/pipeline.ts` (`runPlan`), reutilizable por el CLI (`src/cli/stage2.ts`)
y por los tests (`tests/baseline.ts`).

## Ver el resultado en el navegador

```bash
npm run stage2     # genera public/recipe.json
npm run view       # sirve http://localhost:5173
```

El visor (`public/index.html`) es estático: solo lee `recipe.json` y lo dibuja.

## Etapa 2 — los precios salen de tus datos

- Lee los productos scrapeados de `../prototype-next/data/*-ofertas.json` (Día, Jumbo, FarmaOnline, Farmacity).
- El modelo tiene **una** herramienta: `search_products(query)`. Busca por palabras clave
  (sin distinguir mayúsculas ni acentos) y devuelve `productId`, precio, supermercado.
- El modelo arma la receta y, para cada ingrediente, debe elegir el **productId** de un
  resultado real de la búsqueda. Nunca inventa precios.
- **El total lo calcula el código** (`groundRecipe` en `src/domain/grounding.ts`): resuelve cada
  productId contra el catálogo y suma. Si supera el presupuesto, le devuelve el total
  real al modelo y reintenta (hasta 3 intentos).
- **Fase 1 en un solo request:** todas las búsquedas se piden en un único turno
  (`stopWhen: stepCountIs(1)`). Varias `search_products` dentro del mismo step no
  cuestan requests extra. Bajó `f1` de ~10s a ~3s.
- Reintento por presupuesto: si el total real supera el budget, se re-corre **solo la
  fase 2** con el total real como feedback (máx. 3 intentos).
- **Filtro por supermercado:** `--store=dia|jumbo|both` (default `both` = Día + Jumbo).
  La búsqueda filtra por tienda, así toda la lista es de un solo negocio.
- **Guard semántico:** si el `productId` elegido no comparte ninguna palabra con el
  nombre del ingrediente (ej. "puré de tomate" → "cebolla de verdeo"), se dispara un
  reintento. Es heurístico e imperfecto — lo definitivo es el LLM judge (etapa 5).
- Cada ingrediente muestra la **imagen** y el **link** del producto real elegido.
- Grounding garantiza precio real, **no** que el producto sea semánticamente correcto
  (ver el mismatch "Puré de Tomate" → "Cebolla de Verdeo" en la Bitácora).

## Dieta, despensa y costo por formato de venta

- **Dieta:** `omnivore | vegetarian | vegan`. Se aplica en dos capas: se filtran los
  candidatos en `search_products` (código) y se refuerza en el prompt. Además,
  `groundRecipe` valida y reintenta si aparece un producto prohibido.
  La detección es heurística por categoría + nombre (ej. "Quesos y Fiambres" mezcla
  queso con fiambres, por eso se valida por nombre).
- **Despensa:** sal, aceite, vinagre, condimentos y especias se marcan `pantry` y
  **no suman** al total (se asume que ya los tenés).
- **Costo según formato de venta** (`src/domain/cost.ts`):
  - paquete (`500 Gr.`, `1 Lt.`) → precio × paquetes necesarios
    (`ceil(cantidad / tamaño)`).
  - por kg (`X Kg`, `Por Kg`) → `cantidad_kg × $/kg`.
  - por unidad (`X 2 Ud`, `X Un`) → `ceil(cantidad / packSize) × precio`.
  - desconocido → precio del paquete.

Esto respeta que en un súper comprás el paquete, no gramos sueltos: la receta muestra
gramos para cocinar, pero el costo usa la **unidad de compra**.

## Fuente de datos

`DATA_SOURCE=supabase|json` (default: `supabase` si hay credenciales, si no `json`).

- **`supabase`** (recomendado): lee la tabla `products` por REST, paginando 1000 filas.
  El primer load contra el free tier puede tardar 15–35s; después usa un **cache en disco**
  (`.cache/supabase-products.json`, TTL 10 min) y tarda ~0.1s.
  - `REFRESH_DATA=1` fuerza a ignorar el cache.
  - `CACHE_TTL_MINUTES=60` cambia el TTL.
- **`json`**: lee el snapshot local `../prototype-next/data/*-ofertas.json` (julio 2026).
  Útil para comparar o trabajar sin red.

Los scripts de `test-ai` cargan automáticamente `../prototype-next/.env.local`, así que
toman `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sin duplicar
credenciales.

```bash
npm run test:dia -- 1 0              # usa Supabase (default)
DATA_SOURCE=json npm run test:dia    # usa el snapshot local
REFRESH_DATA=1 npm run test:dia      # ignora el cache y rebaja de Supabase
```

## Precios viejos (stale)

Cada producto conserva `scraped_at`. Al armar la receta, el código calcula la edad del
producto elegido **más viejo**. Si supera `STALE_AFTER_DAYS` (7 días), el resultado se
marca `stale: true` y el visor muestra un aviso con la fecha del último scrape.
**No bloquea**: avisa fuerte. La política es no confiar en el total sin mirar la fecha.

### Estado de los datos (2026-10-19)

- **Supabase (`products`): 10.049 productos, scrapeados 2026-10-19** (fuente por defecto).
  El scraper diario estaba roto y se arregló; ahora corre todos los días.
- Local (`../prototype-next/data/*.json`): 10.046 productos, scrapeados **2026-07-15**
  (solo con `DATA_SOURCE=json`).
- Con Supabase, `stale` es `false` y `priceAgeDays` es 0. Con el JSON local sigue
  disparando el aviso de precios viejos.

## Nota de la etapa 1

Los precios (`estimatedTotalArs`) los **inventa el modelo**. Eso es esperado en esta etapa.
A partir de la etapa 2, todo precio tiene que salir de los datos scrapeados y el cálculo lo hace el código, no el modelo.

## Bitácora

### Etapa 2 — fallo encontrado y corrección

**Fallo:** con `output: Output.object` + `tools` en la misma llamada, el modelo
devolvía markdown en vez del objeto → `AI_NoObjectGeneratedError` (`could not parse
the response`). Además intentaba calcular el presupuesto él mismo ("$10.206… quito la
sal… $9.216") y quemaba los 10 pasos buscando ingrediente por ingrediente.

**Causa:** Qwen 3.7 Flash no combina bien `response_format: json_schema` *y* tool
calling en el mismo request; con tools presentes cae a texto libre. (La etapa 1
funcionaba justamente porque no había tools.)

**Corrección:** partir en dos fases.
1. **Fase 1 (agéntica):** tool loop con `search_products`, sin schema. Los resultados
   se acumulan en un `Map` desde el `execute` de la tool.
2. **Fase 2 (estructurada):** `generateText` con `Output.object` y **sin tools**, que
   arma la receta eligiendo `productId` de la lista de candidatos.
El reintento por presupuesto re-corre solo la Fase 2 (más barato).

**Antes:** crash, 10 búsquedas, JSON inválido.
**Después:** 5 búsquedas en 2 pasos, JSON válido, total 8717 ARS ≤ 10000 en el 1º intento.

### Etapa 2 — mismatch semántico (encontrado al agregar imagen/link)

**Fallo:** un ingrediente llamado "Puré de Tomate Dia" quedó enganchado al `productId`
de "Cebolla de Verdeo Orgánica x 1 Un" ($2.999). El precio es real (el id existe), pero
el producto **no es** el que pide el ingrediente.

**Causa:** el grounding valida que el `productId` exista, no que el producto corresponda
al ingrediente. El modelo eligió mal dentro de los candidatos.

**Conclusión:** precio real ≠ producto correcto. Esto lo atrapa el **LLM judge** (etapa 5)
y lo mitiga mejor retrieval/desambiguación (etapa 3). Guardar como caso de test.

### Etapa 2 — el reintento por presupuesto no converge

**Fallo:** con `--store=jumbo`, una cena de pollo quedó en **$11.196** (presupuesto 10000)
tras los 3 intentos → `status: over_budget`.

**Causa:** el modelo elige los ingredientes primero y después no puede bajar; y la
simplificación de "un paquete por ingrediente" infla el costo (cuarto de pollo $4.399,
sal 500 g $1.600 como ítems obligatorios).

**Pendiente (etapa 3):** conversión de unidades + permitir al modelo *quitar* ingredientes,
no solo cambiar productos.

### Etapa 3 — dieta, despensa y costo por formato de venta

**Implementado:** `diet` (omnivore/vegetarian/vegan) validado en código + prompt,
`pantry` (sal, aceite, condimentos) excluido del total, y costo según formato de venta
(paquete / por kg / por unidad). Budget default 20.000 ARS.

**Bug encontrado por la corrida vegana:** "Ajo X 2 Ud" ($2.290) se contaba como
2 × $2.290 = $4.580, cuando es un pack de 2 unidades → 1 pack ($2.290). Corregido:
`parseSaleFormat` ahora extrae `packSize` y el costo divide por el tamaño del pack.
Cubierto por test unitario.

**Tests unitarios:** 13/13 (formato de venta, costo, pack, despensa, dieta).

**Pruebas reales (1 corrida c/u, $20.000):**

| Caso | Total | Intentos | Req | Limpio |
|---|---|---|---|---|
| Día omnívora | $5.954 | 1 | 2 | sí |
| Día vegetariana | $4.473 | 1 | 2 | sí |
| Día vegana | $2.703 | 1 | 2 | sí |
| Jumbo omnívora | $9.428 | 1 | 2 | sí |

La receta vegana no mostró señales animales y excluyó aceite/sal como despensa.
