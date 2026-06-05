# Frontend Dashboard Plan

## Context
- Repository is currently empty: no existing Next.js app, package.json, or source files were found.
- Goal: create a frontend dashboard from scratch using Next.js and Tailwind CSS backed by the FormaPro payments API docs at `https://api-logali.alejotamayo.com/docs/`.
- User preferences confirmed:
  - New app from scratch.
  - Simple UI to begin with.
  - Include charts.
  - No authentication implementation.
  - Spanish UI labels/copy.
- API discovered from `https://api-logali.alejotamayo.com/openapi.json`:
  - `GET /health` returns `{ ok: boolean }`.
  - `GET /payments/summary` supports optional `course`; returns totals, refunds, completed revenue by currency, average ticket by currency.
  - `GET /payments` supports filters `status`, `currency`, `course`, `name`, `email`, sorting `sortBy`, `sortOrder`, pagination `limit`, `offset`; returns `payments` and `number_of_pages`.
  - `GET /payments/export.csv` supports `status`, `currency`, `course`, `name`, `email`; returns CSV.
- Sample production data confirms ISO date strings, nullable `nombre`/`refunded_at`, `cop` currency values, and `number_of_pages` pagination metadata.
- CSV endpoint returns `text/csv` with `Content-Disposition: attachment; filename="payments.csv"`.

## Approach
- Scaffold a new Next.js app with TypeScript, App Router, and Tailwind CSS.
- Build a Spanish payments dashboard with summary cards, lightweight charts, filters/search, sortable paginated payments table, and CSV export.
- Run the local frontend dev server on port `5173` (for example, `next dev -p 5173`).
- Send all API calls directly to `https://api-logali.alejotamayo.com/`.
- Keep the first version simple: Tailwind-styled custom components, no auth, no complex component system.
- For charts, use small custom React/SVG or Tailwind-based chart components instead of adding a heavier UI framework; visualize payments vs refunds and money metrics by currency.

## Files to modify
- `package.json`
- `next.config.*`
- `tsconfig.json`
- `postcss.config.*`
- `tailwind.config.*`
- `.gitignore`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `lib/api.ts`
- `types/payments.ts`
- Component files under `components/` for cards, filters, charts, table, pagination, and export.

## Reuse
- No existing code/utilities are available in this empty repository.
- API schemas and endpoint contracts will be reused from the OpenAPI document.

## Steps
- [x] Confirm dashboard scope, visual style, and data interaction preferences with the user.
- [x] Scaffold Next.js + TypeScript + Tailwind project structure from scratch.
- [x] Add typed API models for payment records, summary metrics, filters, sort fields, and sort order.
- [x] Add a typed API client for payments summary, payments list, and CSV export using the fixed API base URL `https://api-logali.alejotamayo.com/`.
- [x] Implement the Spanish dashboard layout: header, API/status indicator, summary section, charts section, filters, table, and pagination.
- [x] Implement summary metric cards for total pagos, reembolsos, ingresos completados, and ticket promedio.
- [x] Implement lightweight charts for pagos vs reembolsos and currency-based revenue/average-ticket metrics.
- [x] Implement filter controls for estado, moneda, curso, nombre, and email; keep URL/query state or component state simple and predictable.
- [x] Implement sortable, paginated payments table with Spanish column labels and formatted dates/currency.
- [x] Implement CSV export preserving the active exportable filters.
- [x] Add loading, empty, and error states.
- [x] Polish responsive styling with Tailwind.

## Verification
- [x] Run lint/type checks.
- [x] Start the Next.js dev server on port `5173` and verify the dashboard loads from `https://api-logali.alejotamayo.com/`.
- [x] Manually test filters, sorting, pagination, and CSV export.
- [x] Verify responsive behavior on desktop and mobile widths.
