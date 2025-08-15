export interface FinancialDataPoint {
  date: string;
  revenue: number;
  orders: number;
  expenses: number;
  profit: number;
  avgOrderValue: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  profitMargin: number;
  revenueTrend: number;
  profitTrend: number;
  expenseRatio: number;
}

export interface FinancialAnalyticsResponse {
  data: FinancialDataPoint[];
  summary: FinancialSummary;
  currency: string;
}

export class FinancialAnalyticsService {
  static async getFinancialAnalytics(
    companyId: string,
    options: {
      from?: Date;
      to?: Date;
      branchId?: string;
      groupBy?: 'day' | 'week' | 'month' | 'year';
    } = {}
  ): Promise<FinancialAnalyticsResponse> {
    const { from, to, branchId, groupBy = 'day' } = options;

    const params = new URLSearchParams({
      companyId,
      groupBy,
      ...(from && { from: from.toISOString() }),
      ...(to && { to: to.toISOString() }),
      ...(branchId && { branchId }),
    });

    const response = await fetch(`/api/summary/financial-analytics?${params}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch financial analytics: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async getMonthlyAnalytics(
    companyId: string,
    year: number,
    branchId?: string
  ): Promise<FinancialAnalyticsResponse> {
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);

    return this.getFinancialAnalytics(companyId, {
      from,
      to,
      branchId,
      groupBy: 'month',
    });
  }

  static async getWeeklyAnalytics(
    companyId: string,
    from: Date,
    to: Date,
    branchId?: string
  ): Promise<FinancialAnalyticsResponse> {
    return this.getFinancialAnalytics(companyId, {
      from,
      to,
      branchId,
      groupBy: 'week',
    });
  }

  static async getDailyAnalytics(
    companyId: string,
    from: Date,
    to: Date,
    branchId?: string
  ): Promise<FinancialAnalyticsResponse> {
    return this.getFinancialAnalytics(companyId, {
      from,
      to,
      branchId,
      groupBy: 'day',
    });
  }

  static async getYearlyAnalytics(
    companyId: string,
    fromYear: number,
    toYear: number,
    branchId?: string
  ): Promise<FinancialAnalyticsResponse> {
    const from = new Date(fromYear, 0, 1);
    const to = new Date(toYear, 11, 31);

    return this.getFinancialAnalytics(companyId, {
      from,
      to,
      branchId,
      groupBy: 'year',
    });
  }
}
