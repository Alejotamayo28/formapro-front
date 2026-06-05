import type { PaymentCurrency, PaymentRecord } from "@/types/payments";

const localeByCurrency: Record<PaymentCurrency, string> = {
  cop: "es-CO",
  usd: "en-US",
};

export function formatCurrency(amount: number, currency: PaymentCurrency) {
  return new Intl.NumberFormat(localeByCurrency[currency], {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: currency === "cop" ? 0 : 2,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getPaymentStatus(payment: PaymentRecord) {
  return payment.refunded_at ? "refunded" : "completed";
}

export function getStatusLabel(status: "completed" | "refunded") {
  return status === "completed" ? "Completado" : "Reembolsado";
}

export function getCurrencyLabel(currency: PaymentCurrency) {
  return currency.toUpperCase();
}
