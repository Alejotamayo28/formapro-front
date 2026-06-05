"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, exportPaymentsCsv, getHealth, getPayments, getPaymentsSummary } from "@/lib/api";
import type {
  PaymentFilters,
  PaymentRecord,
  PaymentSortBy,
  PaymentSortOrder,
  PaymentsSummaryResponse,
} from "@/types/payments";
import { Charts } from "@/components/charts";
import { FiltersPanel } from "@/components/filters-panel";
import { Pagination } from "@/components/pagination";
import { PaymentsTable } from "@/components/payments-table";
import { SummaryCards } from "@/components/summary-cards";

const PAGE_SIZE = 5;

type ApiStatus = "checking" | "online" | "offline";

function StatusIndicator({ status }: { status: ApiStatus }) {
  const copy = {
    checking: { label: "Verificando API", className: "bg-amber-400" },
    online: { label: "API conectada", className: "bg-emerald-500" },
    offline: { label: "API sin respuesta", className: "bg-rose-500" },
  }[status];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
      <span className={`h-2.5 w-2.5 rounded-full ${copy.className}`} />
      {copy.label}
    </div>
  );
}

function describeFilters(filters: PaymentFilters) {
  const active = Object.entries(filters).filter(([, value]) => value);
  if (!active.length) return "Sin filtros activos";
  return `${active.length} filtro${active.length === 1 ? "" : "s"} activo${active.length === 1 ? "" : "s"}`;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-2xl">
            <SkeletonBlock className="h-4 w-44" />
            <SkeletonBlock className="mt-4 h-11 w-full max-w-lg" />
            <SkeletonBlock className="mt-4 h-5 w-full max-w-xl" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <SkeletonBlock className="h-10 w-40 rounded-full" />
            <SkeletonBlock className="h-9 w-72 rounded-full" />
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-3 h-8 w-64" />
        </div>
        <SkeletonBlock className="h-5 w-36" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="mt-7 h-4 w-28" />
            <SkeletonBlock className="mt-3 h-9 w-36" />
            <SkeletonBlock className="mt-3 h-3 w-32" />
          </section>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <section key={index} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="mt-3 h-6 w-56" />
            <SkeletonBlock className="mt-3 h-4 w-full max-w-sm" />
            <div className="mt-8 space-y-5">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-10/12" />
              <SkeletonBlock className="h-4 w-8/12" />
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-6 w-28" />
            <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
          </div>
          <SkeletonBlock className="h-12 w-32" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-14 w-full" />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
        <SkeletonBlock className="h-7 w-32" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-12 w-full" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [summary, setSummary] = useState<PaymentsSummaryResponse | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<PaymentSortBy>("fecha");
  const [sortOrder, setSortOrder] = useState<PaymentSortOrder>("DESC");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filterDescription = useMemo(() => describeFilters(filters), [filters]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then((response) => setApiStatus(response.ok ? "online" : "offline"))
      .catch(() => setApiStatus("offline"));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setSummaryLoading(true);
    setSummaryError(null);

    getPaymentsSummary({ course: filters.course }, controller.signal)
      .then((data) => setSummary(data))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSummaryError(error instanceof Error ? error.message : "No se pudo cargar el resumen");
        setSummary(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSummaryLoading(false);
      });

    return () => controller.abort();
  }, [filters.course]);

  useEffect(() => {
    const controller = new AbortController();
    setPaymentsLoading(true);
    setPaymentsError(null);

    getPayments(
      {
        ...filters,
        sortBy,
        sortOrder,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      },
      controller.signal,
    )
      .then((data) => {
        const pages = Math.max(1, Math.ceil(data.number_of_pages));
        setPayments(data.payments);
        setTotalPages(pages);
        if (page > pages) setPage(pages);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPaymentsError(error instanceof Error ? error.message : "No se pudo cargar la tabla de pagos");
        setPayments([]);
        setTotalPages(1);
      })
      .finally(() => {
        if (!controller.signal.aborted) setPaymentsLoading(false);
      });

    return () => controller.abort();
  }, [filters, page, sortBy, sortOrder]);

  function handleSort(field: PaymentSortBy) {
    setPage(1);
    if (field === sortBy) {
      setSortOrder((current) => (current === "ASC" ? "DESC" : "ASC"));
      return;
    }

    setSortBy(field);
    setSortOrder(field === "fecha" || field === "refunded_at" || field === "importe" ? "DESC" : "ASC");
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);

    try {
      const blob = await exportPaymentsCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pagos-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "No se pudo exportar el CSV");
    } finally {
      setExporting(false);
    }
  }

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">FormaPro · Logali</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Dashboard de pagos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Controla pagos, reembolsos, ingresos por moneda y transacciones desde la API pública de pagos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <StatusIndicator status={apiStatus} />
            <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-500">
              API: {API_BASE_URL}
            </span>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Resumen</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Métricas principales</h2>
        </div>
        <p className="text-sm font-medium text-slate-500">{filterDescription}</p>
      </section>

      {summaryError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {summaryError}
        </div>
      ) : null}
      <SummaryCards summary={summary} loading={summaryLoading} />
      <Charts summary={summary} loading={summaryLoading} />

      <FiltersPanel
        filters={filters}
        loading={paymentsLoading}
        onApply={(nextFilters) => {
          setPage(1);
          setFilters(nextFilters);
        }}
        onReset={() => {
          setPage(1);
          setFilters({});
        }}
        onExport={handleExport}
        exporting={exporting}
      />

      {exportError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {exportError}
        </div>
      ) : null}

      <PaymentsTable
        payments={payments}
        loading={paymentsLoading}
        error={paymentsError}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <Pagination page={page} totalPages={totalPages} loading={paymentsLoading} onPageChange={setPage} />
    </main>
  );
}
