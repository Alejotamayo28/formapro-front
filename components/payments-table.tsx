import type { PaymentRecord, PaymentSortBy, PaymentSortOrder } from "@/types/payments";
import { formatCurrency, formatDate, getPaymentStatus, getStatusLabel } from "@/lib/format";
import { Card, SectionTitle, Spinner } from "@/components/ui";

type Column = {
  key: PaymentSortBy;
  label: string;
  className?: string;
};

const columns: Column[] = [
  { key: "id_pago", label: "ID pago" },
  { key: "email", label: "Email" },
  { key: "nombre", label: "Nombre" },
  { key: "curso", label: "Curso" },
  { key: "importe", label: "Importe", className: "text-right" },
  { key: "moneda", label: "Moneda" },
  { key: "estado", label: "Estado" },
  { key: "fecha", label: "Fecha" },
  { key: "refunded_at", label: "Reembolso" },
];

function SortIcon({ active, order }: { active: boolean; order: PaymentSortOrder }) {
  if (!active) return <span className="text-slate-300">↕</span>;
  return <span className="text-brand-600">{order === "ASC" ? "↑" : "↓"}</span>;
}

export function PaymentsTable({
  payments,
  loading,
  error,
  sortBy,
  sortOrder,
  onSort,
}: {
  payments: PaymentRecord[];
  loading: boolean;
  error: string | null;
  sortBy: PaymentSortBy;
  sortOrder: PaymentSortOrder;
  onSort: (field: PaymentSortBy) => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
        <SectionTitle title="Pagos" description="Tabla paginada y ordenable de transacciones." />
        {loading ? <Spinner label="Actualizando tabla" /> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-4 py-3 font-bold ${column.className ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={`inline-flex items-center gap-1 rounded-lg transition hover:text-brand-700 ${column.className ?? ""}`}
                  >
                    {column.label}
                    <SortIcon active={sortBy === column.key} order={sortOrder} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-rose-600">
                  {error}
                </td>
              </tr>
            ) : loading && !payments.length ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Spinner label="Cargando pagos" />
                </td>
              </tr>
            ) : payments.length ? (
              payments.map((payment) => {
                const status = getPaymentStatus(payment);
                return (
                  <tr key={payment.pago_id} className="transition hover:bg-brand-50/50">
                    <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">{payment.pago_id}</td>
                    <td className="px-4 py-4 text-slate-600">{payment.email}</td>
                    <td className="px-4 py-4 text-slate-800">{payment.nombre ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{payment.curso}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-950">
                      {formatCurrency(payment.importe, payment.moneda)}
                    </td>
                    <td className="px-4 py-4 font-bold uppercase text-slate-600">{payment.moneda}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                        }`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(payment.fecha)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(payment.refunded_at)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                  No se encontraron pagos con los filtros activos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
