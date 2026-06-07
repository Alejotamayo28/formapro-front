import type {
  HealthResponse,
  PaymentFilters,
  PaymentsQuery,
  PaymentsSummaryResponse,
  PaymentsWithPagesResponse,
} from "@/types/payments";

export const API_BASE_URL = "https://api-logali.alejotamayo.com/";

function appendParams(url: URL, params: Record<string, string | number | undefined>) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    url.searchParams.set(key, String(value));
  });
}

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(path.replace(/^\//, ""), API_BASE_URL);
  appendParams(url, params);
  return url;
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText || "No se pudo consultar la API"}`);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(signal?: AbortSignal) {
  return fetchJson<HealthResponse>(buildUrl("/health"), signal);
}

export async function getPaymentsSummary(signal?: AbortSignal) {
  return fetchJson<PaymentsSummaryResponse>(buildUrl("/payments/summary"), signal);
}

export async function getPayments(query: PaymentsQuery, signal?: AbortSignal) {
  return fetchJson<PaymentsWithPagesResponse>(
    buildUrl("/payments", {
      status: query.status,
      currency: query.currency,
      course: query.course,
      name: query.name,
      email: query.email,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
      offset: query.offset,
    }),
    signal,
  );
}

export function getPaymentsCsvUrl(filters: PaymentFilters) {
  return buildUrl("/payments/export.csv", {
    status: filters.status,
    currency: filters.currency,
    course: filters.course,
    name: filters.name,
    email: filters.email,
  }).toString();
}

export async function exportPaymentsCsv(filters: PaymentFilters) {
  const response = await fetch(getPaymentsCsvUrl(filters));

  if (!response.ok) {
    throw new Error(`Error ${response.status}: no se pudo exportar el CSV`);
  }

  return response.blob();
}
