# Plan: Cloudflare Worker cache for payment API reads

## Context

The dashboard frontend is deployed on Cloudflare Pages and reads payment data from `https://api-logali.alejotamayo.com/`, which is backed by the server API, Cloudflare Tunnel, Supabase, Kamal and GHCR.

The API documentation confirms these relevant read endpoints:

- `GET /payments/summary` with query filters: `status`, `currency`, `course`, `name`, `email`.
- `GET /payments` with query filters: `status`, `currency`, `course`, `name`, `email`, `sortBy`, `sortOrder`, `limit`, `offset`.
- `GET /payments/export.csv` and `GET /health` also exist, but should not be cached for this feature.

Goal: add a selective Cloudflare edge cache in front of the backend API to reduce repeated Supabase/backend reads while keeping the dashboard fresh.

## Approach

Implement a dedicated Cloudflare Worker as a proxy/cache layer for the API domain.

Recommended cache policy:

- `GET /payments/summary`: cache successful `200` JSON responses for **60 seconds**.
- `GET /payments`: cache successful `200` JSON responses for **10 seconds**.
- Bypass cache for all other paths, including `/payments/export.csv`, `/health`, `/docs/*` and `/openapi.json` unless separate documentation caching is configured later.
- Bypass cache for non-`GET` requests.
- Bypass cache when the request contains `Authorization` or `Cookie` headers, so the cache remains safe if auth is added later.
- Use a canonical full URL cache key, including all query parameters sorted by key/value, so filters, sorting and pagination generate distinct cache entries.
- Add debug headers to responses, for example:
  - `x-cache-status: HIT | MISS | BYPASS`
  - `x-cache-ttl: 60 | 10`
  - `x-cache-endpoint: payments-summary | payments`

Important deployment prerequisite:

- The Worker must forward requests to an origin URL that does **not** recursively trigger the same Worker route.
- We can hardcode the origin URL in the Worker because it is not a secret/key. The only requirement is that it points to a backend/tunnel hostname that bypasses the Worker route.
- The public API hostname can remain `https://api-logali.alejotamayo.com/`, but the Worker should internally fetch from a separate origin hostname such as `https://api-origin-logali.alejotamayo.com/`.

## Files to modify

Recommended new files:

- `workers/api-cache/src/index.ts` — Worker request handler, cache policy and proxy logic.
- `workers/api-cache/wrangler.toml` — Worker config and route.
- `workers/api-cache/README.md` — short operational notes: TTLs, routes, origin hostname and deployment command.

Cloudflare configuration outside the repo:

- Add Worker route for the API paths, for example:
  - `api-logali.alejotamayo.com/payments*`
- Add/configure a separate backend origin hostname that is not covered by the Worker route, for example:
  - `api-origin-logali.alejotamayo.com`

## Expected code shape

`workers/api-cache/wrangler.toml` would look like this:

```toml
name = "logali-api-cache"
main = "src/index.ts"
compatibility_date = "2026-06-06"

routes = [
  { pattern = "api-logali.alejotamayo.com/payments*", zone_name = "alejotamayo.com" }
]
```

`workers/api-cache/src/index.ts` would look like this conceptually:

```ts
const ORIGIN_API_BASE_URL = "https://api-origin-logali.alejotamayo.com";

const CACHE_RULES = {
  "/payments/summary": { ttl: 60, endpoint: "payments-summary" },
  "/payments": { ttl: 10, endpoint: "payments" },
} as const;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const rule = CACHE_RULES[url.pathname as keyof typeof CACHE_RULES];

    if (!rule || request.method !== "GET" || request.headers.has("Authorization") || request.headers.has("Cookie")) {
      return proxyToOrigin(request);
    }

    const cacheKey = new Request(buildCanonicalCacheUrl(url).toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);

    if (cached) {
      return withCacheHeaders(cached, "HIT", rule.ttl, rule.endpoint);
    }

    const originResponse = await proxyToOrigin(request);

    if (originResponse.ok && originResponse.headers.get("content-type")?.includes("application/json")) {
      const responseToCache = new Response(originResponse.body, originResponse);
      responseToCache.headers.set("Cache-Control", `public, max-age=${rule.ttl}`);
      await cache.put(cacheKey, responseToCache.clone());
      return withCacheHeaders(responseToCache, "MISS", rule.ttl, rule.endpoint);
    }

    return withCacheHeaders(originResponse, "BYPASS", rule.ttl, rule.endpoint);
  },
};

function buildCanonicalCacheUrl(url: URL) {
  const canonical = new URL(url.toString());
  canonical.search = "";

  [...url.searchParams.entries()]
    .sort(([keyA, valueA], [keyB, valueB]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB))
    .forEach(([key, value]) => canonical.searchParams.append(key, value));

  return canonical;
}

function proxyToOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const originUrl = new URL(requestUrl.pathname + requestUrl.search, ORIGIN_API_BASE_URL);
  return fetch(new Request(originUrl, request));
}

function withCacheHeaders(response: Response, status: "HIT" | "MISS" | "BYPASS", ttl: number, endpoint: string) {
  const next = new Response(response.body, response);
  next.headers.set("x-cache-status", status);
  next.headers.set("x-cache-ttl", String(ttl));
  next.headers.set("x-cache-endpoint", endpoint);
  return next;
}
```

The final code can be refined, but this is the intended structure: classify endpoint, build canonical cache key, check Cloudflare cache, fetch origin on miss, store only successful JSON responses, and return debug headers.

## Reuse

Existing frontend/API knowledge to reuse:

- `lib/api.ts` — confirms the frontend consumes `/payments`, `/payments/summary`, `/payments/export.csv` and `/health`.
- `types/payments.ts` — confirms payment and summary response shapes.
- API OpenAPI docs at `https://api-logali.alejotamayo.com/openapi.json` — confirms supported query parameters and that `currency` is dynamic `string`.

Existing infrastructure to reuse:

- Cloudflare DNS and SSL.
- Cloudflare Tunnel exposing the backend.
- Current public API domain.
- Backend API as source of truth for Supabase access and business logic.

## Steps

- [ ] Create a standalone Cloudflare Worker folder under `workers/api-cache/`.
- [ ] Configure `wrangler.toml` with the Worker name, compatibility date and route.
- [ ] Implement request classification:
  - [ ] Cache only `GET /payments/summary` and `GET /payments`.
  - [ ] Assign TTL `60s` for summary and `10s` for payments.
  - [ ] Bypass everything else.
- [ ] Implement safety bypasses:
  - [ ] Non-GET methods.
  - [ ] Requests with `Authorization`.
  - [ ] Requests with `Cookie`.
- [ ] Build a canonical cache key from the request URL:
  - [ ] Preserve path.
  - [ ] Include all query params.
  - [ ] Sort query params to avoid duplicate cache entries caused by different parameter order.
- [ ] On cacheable requests:
  - [ ] Check `caches.default` first.
  - [ ] Return cached response with `x-cache-status: HIT` when available.
  - [ ] On miss, fetch from the hardcoded origin hostname constant.
  - [ ] Cache only `200 OK` JSON responses.
  - [ ] Store response with the endpoint TTL.
  - [ ] Return response with `x-cache-status: MISS`.
- [ ] Add bypass/debug headers for non-cacheable requests.
- [ ] Deploy Worker to Cloudflare.
- [ ] Attach the Worker route to the public API hostname.
- [ ] Confirm the origin fetch does not recurse into the Worker.

## Verification

Local/static checks:

- [ ] Run Worker typecheck/build if configured.
- [ ] Confirm frontend still passes:
  - [ ] `npm run typecheck`
  - [ ] `npm run lint`
  - [ ] `npm run build`

Manual API checks after deployment:

- [ ] Request `/payments/summary` twice with the same query:
  - First response should show `x-cache-status: MISS`.
  - Second response should show `x-cache-status: HIT`.
- [ ] Request `/payments` twice with the same pagination/sort/filter query:
  - First response should show `MISS`.
  - Second response should show `HIT`.
- [ ] Change a query param such as `offset`, `currency`, `sortBy` or `sortOrder` and confirm it creates a different cache entry.
- [ ] Confirm `/payments/export.csv` returns `x-cache-status: BYPASS` or no cache hit.
- [ ] Confirm `/health` returns `BYPASS` or no cache hit.
- [ ] Confirm requests with `Authorization` or `Cookie` bypass cache.
- [ ] Confirm dashboard still renders summary cards, charts, filters and table normally.

## Notes for challenge defense

This addition can be explained as selective edge optimization:

> We cache only read-only dashboard endpoints for a few seconds at Cloudflare's edge. This reduces repeated backend and Supabase load while keeping payment data fresh. Sensitive or operational endpoints such as CSV export and health checks are not cached. The frontend still consumes the public API, and Supabase credentials remain only on the backend.
