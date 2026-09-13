# Vazduh

Air quality in Belgrade, municipality by municipality: a model estimate plus the
citizen sensors nearest to you, refreshed hourly, in Serbian, English and Russian.

Live: https://vazduh-check.netlify.app

## Why it exists

Belgrade has six official monitoring stations for 1.7 million people, and the
popular aggregators show one number per city. Vazduh answers a narrower question:
what does the air look like in _your_ municipality right now, and how much
should you trust that number. The model and the citizen sensors often disagree.
Both are shown, with the reasons, on purpose.

## How it works

```
every hour ─ Drupal cron ─► Open-Meteo (17 centroids)  ┐
                          ─► sensor.community (radius) ┴► measurement table
                          ─► POST /api/revalidate ─► revalidateTag("air")
                                                        │
Next.js on Netlify ◄─ GraphQL (read-only) ◄─ Drupal on Pantheon
  static pages, 1h TTL, tag "air"; Apollo in the browser for the interactive parts
```

- **Backend**: Drupal 11 on Pantheon. A custom module owns a lean `measurement`
  entity (one table, indexes, unique key per source/sensor/hour), the two source
  adapters, point-in-polygon assignment of sensors to municipalities, and a
  hand-written GraphQL schema. Repo: separate.
- **Frontend**: Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4,
  shadcn/ui, Apollo Client, next-intl, MapLibre + Protomaps, Sentry.
- **Data**: [Open-Meteo](https://open-meteo.com) (CAMS Europe model, CC-BY 4.0)
  and [sensor.community](https://sensor.community). Health messages and colour
  bands follow the [European Air Quality Index](https://airindex.eea.europa.eu/AQI/index.html).

## Decisions and trade-offs

**Static pages with a one-hour TTL, plus on-demand revalidation.** Every page
(3 locales × 18) is prerendered. Time-based revalidation alone would work, but
the TTL is counted from the last rebuild, not from the source's schedule, so a
page could be almost two hours behind. Drupal's cron therefore calls
`/api/revalidate` right after it writes new rows; the TTL stays as a safety net.
If Drupal is down, cached pages keep serving. That is the point of static.

**Two caches, two invalidations.** Drupal tags its GraphQL responses with
`measurement_list`, so a new row invalidates the API's cache. Next.js tags its
fetches with `air`, so the webhook invalidates the page cache. Each layer only
knows about itself; both are needed.

**Server `fetch` for pages, Apollo only in the browser.** Server components
call GraphQL with plain `fetch` to get Next.js caching, tags and request
memoization. Apollo runs client-side for the parts that change on user action
without a navigation (municipality picker, map selection), where its normalized
cache means switching back and forth does not refetch. The two paths can be up
to an hour apart in freshness; the UI accepts that rather than forcing one path
to do the other's job.

**Municipality names in Latin script in every locale, for now.** They come from
Drupal's taxonomy; translated terms are a backend change, not a frontend one.

**shadcn/ui copies components into the repo.** Full control over markup and
accessibility; the cost is that upstream fixes have to be pulled in by hand.

**Map basemap is a 14 MB PMTiles file in `public/`.** No tile server, no API
key, no rate limits: the browser fetches byte ranges and Netlify serves 206s.
MapLibre 6 loads its worker as an ES module relative to `import.meta.url`,
which Turbopack cannot serve, so `postinstall` copies the worker into
`public/map/maplibre/` and `setWorkerUrl` points at it.

**Sentry Session Replay is loaded lazily.** It was the single heaviest thing in
the client bundle and nothing on first paint needs it. Errors are still
captured immediately; replay attaches once the page is idle.

**Localised 404 pages are rendered by the browser.** The root layout lives
inside `[locale]`, which Next.js documents as the hard case for `not-found`.
The status code is 404 and the translated page appears after hydration; a
crawler sees Next's fallback shell.

**Health advice is quoted, not written.** English texts are the EEA's verbatim;
Serbian and Russian are our translations and the page says so.

## From pull request to production

1. Branch, PR. CI runs typecheck, lint, Prettier, Vitest, and Playwright against
   a production build wired to a mock GraphQL server (`tests/mock`), so the
   suite needs neither Drupal nor secrets. One scenario takes the backend down
   mid-test and checks that cached pages still serve and the picker degrades to
   an error state with a working retry.
2. Netlify builds a deploy preview per PR. `main` is protected: PR only, CI
   green required.
3. Merge → production deploy. Environment variables live in Netlify; the app
   needs `NEXT_PUBLIC_GRAPHQL_URL`, `REVALIDATE_SECRET` and `SENTRY_AUTH_TOKEN`
   (source maps). `URL` and `CONTEXT` come from Netlify itself.
4. Errors go to Sentry via a same-origin tunnel (`/monitoring`) so ad blockers
   do not eat them; the environment tag distinguishes production, previews and
   local runs.

## Local development

```bash
nvm use            # Node 22, see .nvmrc
npm install        # also copies the MapLibre worker into public/
cp .env.example .env.local   # then fill in the values
npm run dev
```

| Variable                  | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | Drupal GraphQL endpoint (inlined at build time)         |
| `REVALIDATE_SECRET`       | shared with Drupal's cron for `POST /api/revalidate`    |
| `SENTRY_AUTH_TOKEN`       | source map upload during `next build`; optional locally |

```bash
npm test           # Vitest component and unit tests
npm run test:e2e   # Playwright, builds the app against the mock backend
npm run typecheck && npm run lint && npm run format:check
```

## Licences and attribution

Open-Meteo data under CC-BY 4.0. sensor.community data under ODbL. Map data
© OpenStreetMap contributors, tiles by Protomaps. Health messages © European
Environment Agency. Not medical advice.
