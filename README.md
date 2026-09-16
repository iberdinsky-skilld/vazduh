# Vazduh

Air quality in Belgrade, one municipality at a time. A model estimate plus the
citizen sensors near you, updated every hour, in Serbian, English and Russian.

Live: https://vazduh-check.netlify.app

## Why

Belgrade has six official air stations for 1.7 million people, and most sites
show one number for the whole city. Vazduh shows your municipality, tells you
where the number comes from, and admits when the model and the sensors disagree.

## How it works

```
every hour:  Drupal cron  →  Open-Meteo + sensor.community  →  database
                          →  POST /api/revalidate  →  Next.js rebuilds pages
```

- **Backend**: Drupal 11 on Pantheon. One custom module: a `measurement` table,
  the two data sources, sensor-to-municipality matching, a read-only GraphQL API.
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4,
  shadcn/ui, Apollo Client, next-intl, MapLibre + Protomaps, Sentry. Hosted on
  Netlify.
- **Data**: [Open-Meteo](https://open-meteo.com) (CAMS model) and
  [sensor.community](https://sensor.community). Colours and health advice follow
  the [European Air Quality Index](https://airindex.eea.europa.eu/AQI/index.html).

## Decisions

Short version of the choices that shaped the code, and what they cost.

**Pages are static and rebuilt on demand.** All 54 pages (3 languages × 18) are
prebuilt and cached for an hour. When Drupal has a new hour of data, its cron
calls `/api/revalidate` and the pages expire. If Drupal is down, the cached
pages keep serving.

**The first visitor after an update waits, everyone else is fast.** Next.js
can serve a stale page while rebuilding in the background (`"max"` profile).
That is fine for a blog, but here 54 pages would each need two visits to catch
up. So the webhook uses `{ expire: 0 }`: stale is never served, the first
request after an update waits about a second and gets the current hour. Then
`after()` warms the three home pages, so that first visitor is usually us.
An end-to-end test checks this chain against a mock backend.

**Two caches, two invalidations.** Drupal tags its GraphQL responses; a new row
invalidates the API cache. Next.js tags its fetches with `air`; the webhook
invalidates the page cache. Each side only knows about its own cache.

**Server fetch for pages, Apollo in the browser.** Server components fetch
GraphQL with plain `fetch`, which gives Next.js caching for free. Apollo runs
only in the browser, for the parts that change on click without a page load
(municipality picker, map). The two can be up to an hour apart; we accept that.

**One slug, three languages.** URLs are `/sr/opstina/vracar`, `/en/…`, `/ru/…`.
Slugs never change; only the name is translated (from Drupal's taxonomy).

**Map without a tile server.** A 14 MB PMTiles file of Belgrade lives in
`public/`; the browser fetches byte ranges from Netlify. MapLibre 6 loads its
worker as an ES module relative to its own file, which Turbopack cannot serve,
so `postinstall` copies the worker into `public/` and we point MapLibre at it.

**Sentry Session Replay loads lazily.** It was the heaviest thing in the bundle
and nothing on first paint needs it. Lighthouse performance went from 59 to 95.

**shadcn/ui copies components into the repo.** Full control over markup and
accessibility; upstream fixes have to be pulled in by hand.

**Schema changes go backend first.** The build asks the live GraphQL endpoint for
the list of municipalities, so a query using a field Drupal does not have yet
fails the build. Deploy Drupal, then merge the frontend.

**Health advice is quoted, not written.** English texts are the EEA's, verbatim.
Serbian and Russian are our translations, and the page says so.

## Looking at the cache

Netlify reports every cache layer a response went through:

```bash
curl -sI https://vazduh-check.netlify.app/sr | grep -i 'cache-status\|x-nextjs-date'
```

```
cache-status: "Next.js"; hit, "Netlify Durable"; hit; ttl=3221, "Netlify Edge"; fwd=miss; stored
x-nextjs-date: Wed, 16 Sep 2026 07:08:07 GMT
```

Three caches in one line: Next.js inside the function, Netlify's shared durable
cache, and the edge node that answered. `x-nextjs-date` is when the page was
built. Right after an hourly update the date jumps and one layer reports a
miss; a minute later everything is `hit` again.

## Numbers

Lighthouse, desktop, production `/sr`:

|                                    | Before lazy Replay | After         |
| ---------------------------------- | ------------------ | ------------- |
| Performance                        | 59                 | 95            |
| Total Blocking Time                | 1,740 ms           | 70 ms         |
| LCP / CLS                          | 1.1 s / 0.001      | 0.7 s / 0.001 |
| Accessibility, Best practices, SEO | 100 each           | 100 each      |

## Working on it

```bash
nvm use                      # Node 22
npm install                  # also copies the MapLibre worker
cp .env.example .env.local   # fill in the values
npm run dev
```

| Variable                  | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | Drupal GraphQL endpoint                              |
| `REVALIDATE_SECRET`       | shared with Drupal's cron for `POST /api/revalidate` |
| `SENTRY_AUTH_TOKEN`       | source maps on build, optional locally               |

```bash
npm test            # Vitest: component and unit tests
npm run test:e2e    # Playwright against a production build + mock backend
npm run typecheck && npm run lint && npm run format:check
```

Every pull request runs all of the above in CI and gets a Netlify deploy
preview. `main` is protected; merging deploys to production. Errors go to
Sentry through a same-origin tunnel so ad blockers do not eat them.

## Credits

Open-Meteo (CC-BY 4.0), sensor.community (ODbL), map data © OpenStreetMap
contributors, tiles by Protomaps, health messages © European Environment Agency.
Not medical advice.
