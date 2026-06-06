export type PaymentCurrency = string;

export type PaymentStatus = "completed" | "refunded";

export type PaymentSortBy =
  | "id_pago"
  | "email"
  | "nombre"
  | "curso"
  | "importe"
  | "moneda"
  | "estado"
  | "fecha"
  | "refunded_at";

export type PaymentSortOrder = "ASC" | "DESC";

export interface MoneyMetric {
  currency: PaymentCurrency;
  amount: number;
}

export interface PaymentsSummaryResponse {
  total_payments: number;
  total_refunds: number;
  completed_revenue_by_currency: MoneyMetric[];
  average_ticket_by_currency: MoneyMetric[];
}

export interface PaymentRecord {
  pago_id: string;
  email: string;
  nombre: string | null;
  curso: string;
  importe: number;
  moneda: PaymentCurrency;
  fecha: string;
  refunded_at: string | null;
}

export interface PaymentsWithPagesResponse {
  payments: PaymentRecord[];
  number_of_pages: number;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  currency?: PaymentCurrency;
  course?: string;
  name?: string;
  email?: string;
}

export interface PaymentsQuery extends PaymentFilters {
  sortBy?: PaymentSortBy;
  sortOrder?: PaymentSortOrder;
  limit?: number;
  offset?: number;
}

export interface HealthResponse {
  ok: boolean;
}
