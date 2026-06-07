# Plan: Decouple filters from main metrics

## Context
- The dashboard has two separate areas:
  - **Métricas principales** in `components/dashboard.tsx`.
  - **Búsqueda / Filtros** via `components/filters-panel.tsx`, rendered below the metrics.
- Current bug: applying search filters can appear to affect the first metrics section. In code, the summary request explicitly receives `filters.course`, and the metrics header displays the global active-filter count.
- Intended outcome: filters from the search/filter section should only affect the payments list/export area, not the main metrics section.

## Approach
- Keep the existing `filters` state for the payments search/table/export behavior only.
- Make the summary API call unfiltered so **Métricas principales** always shows global metrics.
- Remove the active-filter label from the metrics header because it visually makes the first section look filtered by the search form.
- Update filter panel copy so it no longer says that the summary accepts/applies course filtering.

## Files to modify
- `components/dashboard.tsx`
  - Remove `useMemo` import if it becomes unused.
  - Remove `describeFilters` / `filterDescription` if they are only used in the metrics header.
  - Change the summary effect to call the summary endpoint without `filters.course` and stop depending on filter changes.
  - Remove the metrics-header `<p>{filterDescription}</p>`.
- `components/filters-panel.tsx`
  - Update the description copy to describe only table/search filtering.
- `lib/api.ts`
  - Simplify `getPaymentsSummary` so its signature makes unfiltered metrics explicit.

## Code-level plan
Current bug source in `components/dashboard.tsx`:

```tsx
const filterDescription = useMemo(() => describeFilters(filters), [filters]);

getPaymentsSummary({ course: filters.course }, controller.signal)

return () => controller.abort();
}, [filters.course]);

<p className="text-sm font-medium text-slate-500">{filterDescription}</p>
```

Planned dashboard code shape:

```tsx
getPaymentsSummary(controller.signal)

return () => controller.abort();
}, []);
```

And remove this line from the **Métricas principales** header:

```tsx
<p className="text-sm font-medium text-slate-500">{filterDescription}</p>
```

Current helper in `lib/api.ts`:

```ts
export async function getPaymentsSummary(filters: Pick<PaymentFilters, "course"> = {}, signal?: AbortSignal) {
  return fetchJson<PaymentsSummaryResponse>(buildUrl("/payments/summary", { course: filters.course }), signal);
}
```

Planned helper:

```ts
export async function getPaymentsSummary(signal?: AbortSignal) {
  return fetchJson<PaymentsSummaryResponse>(buildUrl("/payments/summary"), signal);
}
```

Current filter panel copy in `components/filters-panel.tsx`:

```tsx
description="Filtra por estado, moneda, curso, nombre o email. El resumen de la API solo acepta filtro por curso."
```

Planned copy:

```tsx
description="Filtra la tabla de pagos por estado, moneda, curso, nombre o email."
```

## Reuse
- Reuse existing summary rendering with `SummaryCards` and `Charts`.
- Reuse existing payments filtering with `getPayments`, `exportPaymentsCsv`, `FiltersPanel`, `PaymentsTable`, and `Pagination`.
- Keep the existing API request helpers and only narrow `getPaymentsSummary` so it is clearly unfiltered.

## Steps
- [ ] In `lib/api.ts`, change `getPaymentsSummary` to accept only `signal?: AbortSignal` and call `buildUrl("/payments/summary")` without query params.
- [ ] In `components/dashboard.tsx`, update the summary-loading effect to call `getPaymentsSummary(controller.signal)`.
- [ ] In `components/dashboard.tsx`, change the summary effect dependency from `[filters.course]` to `[]`, so `Curso`, `Nombre`, `Email`, and other filters do not refetch metrics.
- [ ] In `components/dashboard.tsx`, remove the metrics header active-filter text (`filterDescription`).
- [ ] In `components/dashboard.tsx`, remove `describeFilters`, `filterDescription`, and the `useMemo` import if they are no longer used.
- [ ] In `components/filters-panel.tsx`, replace the description with copy that says filters apply to the payments table/search only.

## Verification
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Manually run the app with `npm run dev`.
- [ ] Confirm the initial metrics load normally.
- [ ] Apply `Curso`, `Nombre`, and `Email` filters and confirm the first metrics/cards/charts do not reload or change.
- [ ] Apply `Estado` and `Moneda` filters and confirm those also do not reload or change metrics.
- [ ] Confirm the payments table, pagination, and CSV export still use the active filters.
- [ ] Confirm clearing filters only resets the search/table/export behavior, not the metrics section.
