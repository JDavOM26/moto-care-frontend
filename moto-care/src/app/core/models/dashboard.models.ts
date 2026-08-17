export interface FinancialDashboardDto {
  monthlyRevenue: MonthlyRevenueDto[];
  revenueByType: RevenueByTypeDto[];
  pendingInvoices: PendingInvoicesDto;
  paymentMethods: PaymentMethodDto[];
  averageTicket: number;
}

export interface MonthlyRevenueDto {
  month: string;
  total: number;
}

export interface RevenueByTypeDto {
  elementType: string;
  total: number;
}

export interface PendingInvoicesDto {
  count: number;
  totalAmount: number;
}

export interface PaymentMethodDto {
  method: string;
  count: number;
  totalAmount: number;
}

export interface PerformanceDashboardDto {
  currentOrderStatuses: CurrentOrderStatusDto[];
  averageRepairTime: number;
  orderPerformanceStatus: OrderPerformanceStatusDto[];
}

export interface CurrentOrderStatusDto {
  statusName: string;
  total: number;
}

export interface OrderPerformanceStatusDto {
  statusName: string;
  total: number;
}
