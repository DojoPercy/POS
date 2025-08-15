import { NotificationUtils } from './notification-utils';

interface BranchPerformance {
  branch: string;
  sales: number;
  revenue: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  totalPrice: number;
  orderLines: any[];
  branchId: string;
  branch: { name: string };
  createdAt: string;
}

interface PerformanceSummary {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
}

export class AutomaticNotificationService {
  // Check for top performing branches and create notifications
  static async checkTopBranches(companyId: string) {
    try {
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch branch performance data using your real API
      const response = await fetch(
        `/api/summary/branches?companyId=${companyId}&fromDate=${startDate.toISOString()}&toDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        console.error('Failed to fetch branch data:', response.statusText);
        return;
      }

      const branches: BranchPerformance[] = await response.json();

      if (branches.length === 0) return;

      // Find top branch by revenue
      const topRevenueBranch = branches.reduce((prev, current) =>
        prev.revenue > current.revenue ? prev : current
      );

      // Find top branch by orders (sales)
      const topOrdersBranch = branches.reduce((prev, current) =>
        prev.sales > current.sales ? prev : current
      );

      // Create notifications for top performers
      if (topRevenueBranch.revenue > 0) {
        await NotificationUtils.createTopBranchNotification(
          { name: topRevenueBranch.branch },
          'revenue',
          `$${topRevenueBranch.revenue.toLocaleString()}`
        );
      }

      if (topOrdersBranch.sales > 0) {
        await NotificationUtils.createTopBranchNotification(
          { name: topOrdersBranch.branch },
          'orders',
          `${topOrdersBranch.sales} orders`
        );
      }
      console.log('Top branches checked');
    } catch (error) {
      console.error('Failed to check top branches:', error);
    }
  }

  // Check for highest orders and create notifications
  static async checkHighestOrders(companyId: string) {
    try {
      // Get date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Fetch recent orders using your real API
      const response = await fetch(
        `/api/orders?companyId=${companyId}&from=${startDate.toISOString()}&to=${endDate.toISOString()}`
      );
      if (!response.ok) {
        console.error('Failed to fetch orders:', response.statusText);
        return;
      }

      const orders: OrderData[] = await response.json();

      if (orders.length === 0) return;

      // Find highest order by amount
      const highestOrder = orders.reduce((prev, current) =>
        prev.totalPrice > current.totalPrice ? prev : current
      );

      // Check if this is a record-breaking order (2x above average)
      const averageOrderValue =
        orders.reduce((sum, order) => sum + order.totalPrice, 0) /
        orders.length;

      if (highestOrder.totalPrice > averageOrderValue * 2) {
        await NotificationUtils.createHighestOrderNotification(
          {
            totalAmount: highestOrder.totalPrice,
            items: highestOrder.orderLines,
            orderNumber: highestOrder.orderNumber,
          },
          highestOrder.branch.name
        );
      }
    } catch (error) {
      console.error('Failed to check highest orders:', error);
    }
  }

  // Check for top attendance and create notifications
  static async checkTopAttendance(companyId: string) {
    try {
      // Get date range for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date();

      // Fetch attendance data using your real API
      const response = await fetch(
        `/api/attendance/analytics?companyId=${companyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        console.error('Failed to fetch attendance data:', response.statusText);
        return;
      }

      const attendanceData = await response.json();

      if (!attendanceData.userStats || attendanceData.userStats.length === 0)
        return;

      // Find employee with most hours worked
      const topHours = attendanceData.userStats.reduce(
        (prev: any, current: any) =>
          prev.totalHours > current.totalHours ? prev : current
      );

      // Find employee with most shifts (days present)
      const topShifts = attendanceData.userStats.reduce(
        (prev: any, current: any) =>
          prev.totalShifts > current.totalShifts ? prev : current
      );

      // Create notifications for top attendance
      if (topShifts.totalShifts >= 20) {
        // Threshold for perfect attendance
        await NotificationUtils.createTopAttendanceNotification(
          { fullname: topShifts.userName },
          { daysPresent: topShifts.totalShifts }
        );
      }

      // Create notification for most hours worked
      if (topHours.totalHours >= 160) {
        // Threshold for full-time equivalent
        await NotificationUtils.createEmployeePerformanceNotification(
          { fullname: topHours.userName },
          {
            ordersProcessed: topHours.ordersProcessed || 0,
            satisfactionRating: topHours.satisfactionRating || 95,
          }
        );
      }
    } catch (error) {
      console.error('Failed to check top attendance:', error);
    }
  }

  // Generate daily performance summary
  static async generateDailySummary(companyId: string) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch today's performance data using your real API
      const response = await fetch(
        `/api/summary/expense_revenue?companyId=${companyId}&from=${todayStr}&to=${todayStr}`
      );
      if (!response.ok) {
        console.error('Failed to fetch daily summary:', response.statusText);
        return;
      }

      const summaryData: PerformanceSummary = await response.json();

      // Get top branch for today
      const branchResponse = await fetch(
        `/api/summary/branches?companyId=${companyId}&fromDate=${todayStr}&toDate=${todayStr}`
      );
      let topBranch = 'No branches';
      if (branchResponse.ok) {
        const branches = await branchResponse.json();
        if (branches.length > 0) {
          const topBranchData = branches.reduce((prev: any, current: any) =>
            prev.revenue > current.revenue ? prev : current
          );
          topBranch = topBranchData.branch;
        }
      }

      // Create daily summary notification
      await NotificationUtils.createDailyPerformanceSummary({
        totalOrders: Math.round(summaryData.totalRevenue / 50), // Estimate based on average order value
        totalRevenue: summaryData.totalRevenue,
        topBranch: topBranch,
      });
    } catch (error) {
      console.error('Failed to generate daily summary:', error);
    }
  }

  // Check for low stock alerts
  static async checkLowStockAlerts(companyId: string) {
    try {
      // Fetch inventory data using your real API
      const response = await fetch(
        `/api/inventory_stock?companyId=${companyId}`
      );
      if (!response.ok) {
        console.error('Failed to fetch inventory data:', response.statusText);
        return;
      }

      const inventoryData = await response.json();

      // Check for low stock items (less than 10% of recommended stock)
      const lowStockItems = inventoryData.filter((item: any) => {
        const stockPercentage =
          (item.currentStock / item.recommendedStock) * 100;
        return stockPercentage < 10;
      });

      // Create notifications for low stock items
      for (const item of lowStockItems) {
        await NotificationUtils.createAutomaticLowStockAlert({
          ingredientName: item.ingredientName,
          currentStock: item.currentStock,
          unit: item.unit,
        });
      }
    } catch (error) {
      console.error('Failed to check low stock alerts:', error);
    }
  }

  // Check for sales milestones
  static async checkSalesMilestones(companyId: string) {
    try {
      // Get date range for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date();

      // Fetch sales data using your real API
      const response = await fetch(
        `/api/summary/branches?companyId=${companyId}&fromDate=${startDate.toISOString()}&toDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        console.error('Failed to fetch sales data:', response.statusText);
        return;
      }

      const branches: BranchPerformance[] = await response.json();

      // Check for sales milestones (e.g., $10k, $50k, $100k)
      const milestones = [10000, 50000, 100000, 500000, 1000000];

      for (const branch of branches) {
        for (const milestone of milestones) {
          if (
            branch.revenue >= milestone &&
            branch.revenue < milestone + 1000
          ) {
            await NotificationUtils.createSalesMilestoneNotification({
              branchName: branch.branch,
              amount: milestone.toLocaleString(),
            });
            break; // Only notify once per milestone
          }
        }
      }
    } catch (error) {
      console.error('Failed to check sales milestones:', error);
    }
  }

  // Generate weekly achievements
  static async generateWeeklyAchievements(companyId: string) {
    try {
      // Get date range for current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      const endOfWeek = new Date(now);

      // Fetch weekly performance data using your real API
      const response = await fetch(
        `/api/summary/expense_revenue?companyId=${companyId}&from=${startOfWeek.toISOString()}&to=${endOfWeek.toISOString()}`
      );
      if (!response.ok) {
        console.error('Failed to fetch weekly data:', response.statusText);
        return;
      }

      const weeklyData = await response.json();

      // Get order count for the week
      const ordersResponse = await fetch(
        `/api/orders?companyId=${companyId}&from=${startOfWeek.toISOString()}&to=${endOfWeek.toISOString()}`
      );
      let totalOrders = 0;
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        totalOrders = orders.length;
      }

      // Calculate average order value
      const averageOrderValue =
        totalOrders > 0 ? weeklyData.totalRevenue / totalOrders : 0;

      // Define achievement criteria
      const achievements = [
        {
          title: 'High Volume Week',
          description: `Processed ${totalOrders} orders this week`,
          condition: totalOrders >= 100,
        },
        {
          title: 'Revenue Champion',
          description: `Generated $${weeklyData.totalRevenue.toLocaleString()} in revenue`,
          condition: weeklyData.totalRevenue >= 50000,
        },
        {
          title: 'Efficiency Expert',
          description: `Average order value of $${averageOrderValue.toFixed(2)}`,
          condition: averageOrderValue >= 50,
        },
      ];

      // Check and create notifications for achievements
      for (const achievement of achievements) {
        if (achievement.condition) {
          await NotificationUtils.createWeeklyAchievementNotification(
            achievement
          );
        }
      }
    } catch (error) {
      console.error('Failed to generate weekly achievements:', error);
    }
  }

  // Run all automatic checks
  static async runAllChecks(companyId: string) {
    try {
      console.log('Running automatic notification checks...');

      await Promise.all([
        this.checkTopBranches(companyId),
        this.checkHighestOrders(companyId),
        this.checkTopAttendance(companyId),
        this.checkLowStockAlerts(companyId),
        this.checkSalesMilestones(companyId),
      ]);

      console.log('Automatic notification checks completed');
    } catch (error) {
      console.error('Failed to run automatic checks:', error);
    }
  }

  // Run daily summary
  static async runDailySummary(companyId: string) {
    try {
      console.log('Generating daily performance summary...');

      await this.generateDailySummary(companyId);
      await this.generateWeeklyAchievements(companyId);

      console.log('Daily summary completed');
    } catch (error) {
      console.error('Failed to generate daily summary:', error);
    }
  }
}
