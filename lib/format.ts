import type { PaymentCurrency, PaymentRecord } from "@/types/payments";

function normalizeCurrency(currency: PaymentCurrency) {
  return currency.trim().toUpperCase();
}

export function formatCurrency(amount: number, currency: PaymentCurrency) {
  const currencyCode = normalizeCurrency(currency);

  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    return `${formatNumber(amount)} ${currencyCode}`;
  }
}

export function formatCurrencyWithCode(amount: number, currency: PaymentCurrency) {
  const currencyCode = normalizeCurrency(currency);
  return `${formatCurrency(amount, currencyCode)} ${currencyCode}`;
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
