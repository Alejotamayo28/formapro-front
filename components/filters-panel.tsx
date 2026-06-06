"use client";

import { useEffect, useState } from "react";
import type { PaymentCurrency, PaymentFilters, PaymentStatus } from "@/types/payments";
import { Card, SectionTitle } from "@/components/ui";

type FilterForm = {
  status: PaymentStatus | "";
  currency: PaymentCurrency;
  course: string;
  name: string;
  email: string;
};

const emptyForm: FilterForm = {
  status: "",
  currency: "",
  course: "",
  name: "",
  email: "",
};

function toForm(filters: PaymentFilters): FilterForm {
  return {
    status: filters.status ?? "",
    currency: filters.currency ?? "",
    course: filters.course ?? "",
    name: filters.name ?? "",
    email: filters.email ?? "",
  };
}

function toFilters(form: FilterForm): PaymentFilters {
  return {
    status: form.status || undefined,
    currency: form.currency.trim() || undefined,
    course: form.course.trim() || undefined,
    name: form.name.trim() || undefined,
    email: form.email.trim() || undefined,
  };
}

export function FiltersPanel({
  filters,
  loading,
  onApply,
  onReset,
  onExport,
  exporting,
}: {
  filters: PaymentFilters;
  loading: boolean;
  onApply: (filters: PaymentFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const [form, setForm] = useState<FilterForm>(() => toForm(filters));

  useEffect(() => {
    setForm(toForm(filters));
  }, [filters]);

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle
          eyebrow="Búsqueda"
          title="Filtros"
          description="Filtra por estado, moneda, curso, nombre o email. El resumen de la API solo acepta filtro por curso."
        />
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? "Exportando..." : "Exportar CSV"}
        </button>
      </div>

      <form
        className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          onApply(toFilters(form));
        }}
      >
        <label className="space-y-1.5 text-sm font-medium text-slate-600">
          <span>Estado</span>
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FilterForm["status"] }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Todos</option>
            <option value="completed">Completado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-600">
          <span>Moneda</span>
          <input
            value={form.currency}
            onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
            placeholder="Todas · Ej. COP, USD, EUR"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-600">
          <span>Curso</span>
          <input
            value={form.course}
            onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
            placeholder="Ej. Excel Avanzado"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-600">
          <span>Nombre</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nombre cliente"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-600">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="cliente@email.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-5">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Aplicando..." : "Aplicar filtros"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              onReset();
            }}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      </form>
    </Card>
  );
}
