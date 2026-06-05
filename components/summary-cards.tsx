import type { PaymentsSummaryResponse } from "@/types/payments";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, Spinner } from "@/components/ui";

type SummaryCardsProps = {
  summary: PaymentsSummaryResponse | null;
  loading: boolean;
};

function moneyList(items: PaymentsSummaryResponse["completed_revenue_by_currency"] | undefined) {
  if (!items?.length) return "—";
  return items.map((item) => formatCurrency(item.amount, item.currency)).join(" · ");
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total pagos",
      value: summary ? formatNumber(summary.total_payments) : "—",
      helper: "Registros procesados",
      accent: "bg-blue-500",
    },
    {
      label: "Reembolsos",
      value: summary ? formatNumber(summary.total_refunds) : "—",
      helper: "Pagos devueltos",
      accent: "bg-rose-500",
    },
    {
      label: "Ingresos completados",
      value: summary ? moneyList(summary.completed_revenue_by_currency) : "—",
      helper: "Agrupado por moneda",
      accent: "bg-emerald-500",
    },
    {
      label: "Ticket promedio",
      value: summary ? moneyList(summary.average_ticket_by_currency) : "—",
      helper: "Promedio por moneda",
      accent: "bg-violet-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="relative overflow-hidden">
          <div className={`absolute right-5 top-5 h-10 w-10 rounded-2xl ${card.accent} opacity-15`} />
          <div className={`mb-5 h-2 w-12 rounded-full ${card.accent}`} />
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <div className="mt-2 min-h-9 text-2xl font-black tracking-tight text-slate-950">
            {loading ? <Spinner label="" /> : card.value}
          </div>
          <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
        </Card>
      ))}
    </div>
  );
}
