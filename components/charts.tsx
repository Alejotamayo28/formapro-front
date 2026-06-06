import type { MoneyMetric, PaymentsSummaryResponse } from "@/types/payments";
import { formatCurrencyWithCode, formatNumber, getCurrencyLabel } from "@/lib/format";
import { Card, SectionTitle, Spinner } from "@/components/ui";

type ChartsProps = {
  summary: PaymentsSummaryResponse | null;
  loading: boolean;
};

function RatioBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-950">{formatNumber(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function MoneyRows({ title, rows, emptyLabel }: { title: string; rows: MoneyMetric[]; emptyLabel: string }) {
  const max = Math.max(...rows.map((row) => row.amount), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      {rows.length ? (
        rows.map((row) => {
          const width = max > 0 ? Math.max(8, Math.round((row.amount / max) * 100)) : 0;
          return (
            <div key={`${title}-${row.currency}`}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                  {getCurrencyLabel(row.currency)}
                </span>
                <span className="font-bold text-slate-950">{formatCurrencyWithCode(row.amount, row.currency)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })
      ) : (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}

export function Charts({ summary, loading }: ChartsProps) {
  const maxCount = Math.max(summary?.total_payments ?? 0, summary?.total_refunds ?? 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <SectionTitle
          eyebrow="Comparativo"
          title="Pagos vs reembolsos"
          description="Vista rápida de volumen total y devoluciones."
        />
        <div className="mt-6 space-y-5">
          {loading ? (
            <Spinner />
          ) : summary ? (
            <>
              <RatioBar label="Pagos" value={summary.total_payments} max={maxCount} color="bg-brand-600" />
              <RatioBar label="Reembolsos" value={summary.total_refunds} max={maxCount} color="bg-rose-500" />
            </>
          ) : (
            <p className="text-sm text-slate-500">No hay información para graficar.</p>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle
          eyebrow="Monedas"
          title="Ingresos y ticket promedio"
          description="Métricas monetarias agrupadas por moneda."
        />
        <div className="mt-6 grid gap-7 md:grid-cols-2">
          {loading ? (
            <Spinner />
          ) : summary ? (
            <>
              <MoneyRows
                title="Ingresos completados"
                rows={summary.completed_revenue_by_currency}
                emptyLabel="Sin ingresos completados."
              />
              <MoneyRows
                title="Ticket promedio"
                rows={summary.average_ticket_by_currency}
                emptyLabel="Sin ticket promedio disponible."
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">No hay métricas monetarias disponibles.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
