import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  companyId: string;
  branchId?: string;
}

interface NotificationData {
  title: string;
  message: string;
  type: 'COMPANY' | 'BRANCH' | 'USER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  companyId?: string;
  branchId?: string;
  userId?: string;
  expiresAt?: Date;
}

export class NotificationUtils {
  static getToken(): DecodedToken {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return jwtDecode<DecodedToken>(token);
  }

  static async createNotification(data: NotificationData) {
    try {
      const decodedToken = this.getToken();
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: decodedToken.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // System notification creators
  static async createOrderNotification(orderData: any) {
    const decodedToken = this.getToken();
    const priority = orderData.orderStatus === 'PENDING' ? 'HIGH' : 'MEDIUM';

    return this.createNotification({
      title: `New Order #${orderData.orderNumber}`,
      message: `Order ${orderData.orderStatus.toLowerCase()} - ${orderData.orderLines?.length || 0} items`,
      type: 'BRANCH',
      priority,
      branchId: decodedToken.branchId,
    });
  }

  static async createInventoryAlertNotification(stockData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: 'Low Stock Alert',
      message: `${stockData.ingredientName} is running low (${stockData.currentStock} ${stockData.unit} remaining)`,
      type: 'BRANCH',
      priority: 'HIGH',
      branchId: decodedToken.branchId,
    });
  }

  static async createExpenseNotification(expenseData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: 'New Expense Recorded',
      message: `${expenseData.category} expense of $${expenseData.amount} has been recorded`,
      type: 'BRANCH',
      priority: 'MEDIUM',
      branchId: decodedToken.branchId,
    });
  }

  static async createStaffNotification(
    staffData: any,
    action: 'added' | 'updated' | 'removed',
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: `Staff ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${staffData.fullname} has been ${action} to the team`,
      type: 'COMPANY',
      priority: 'MEDIUM',
      companyId: decodedToken.companyId,
    });
  }

  static async createMenuNotification(
    menuData: any,
    action: 'added' | 'updated' | 'removed',
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: `Menu Item ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${menuData.name} has been ${action} to the menu`,
      type: 'COMPANY',
      priority: 'LOW',
      companyId: decodedToken.companyId,
    });
  }

  static async createBranchNotification(
    branchData: any,
    action: 'added' | 'updated' | 'removed',
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: `Branch ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${branchData.name} branch has been ${action}`,
      type: 'COMPANY',
      priority: 'HIGH',
      companyId: decodedToken.companyId,
    });
  }

  static async createAttendanceNotification(attendanceData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: 'Attendance Update',
      message: `${attendanceData.userName} has ${attendanceData.action} (${attendanceData.time})`,
      type: 'BRANCH',
      priority: 'LOW',
      branchId: decodedToken.branchId,
    });
  }

  static async createPaymentNotification(paymentData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: 'Payment Received',
      message: `Payment of $${paymentData.amount} received for order #${paymentData.orderNumber}`,
      type: 'BRANCH',
      priority: 'MEDIUM',
      branchId: decodedToken.branchId,
    });
  }

  static async createSystemMaintenanceNotification(
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: 'System Maintenance',
      message,
      type: 'COMPANY',
      priority,
      companyId: decodedToken.companyId,
    });
  }

  static async createUserSpecificNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  ) {
    return this.createNotification({
      title,
      message,
      type: 'USER',
      priority,
      userId,
    });
  }

  // Bulk notification creators
  static async createBulkBranchNotification(
    branchIds: string[],
    title: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  ) {
    const promises = branchIds.map(branchId =>
      this.createNotification({
        title,
        message,
        type: 'BRANCH',
        priority,
        branchId,
      }),
    );

    return Promise.all(promises);
  }

  static async createBulkUserNotification(
    userIds: string[],
    title: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  ) {
    const promises = userIds.map(userId =>
      this.createNotification({
        title,
        message,
        type: 'USER',
        priority,
        userId,
      }),
    );

    return Promise.all(promises);
  }

  // ===== AUTOMATIC SYSTEM NOTIFICATIONS =====

  // Top Branch Performance Notification
  static async createTopBranchNotification(
    branchData: any,
    metric: string,
    value: string,
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '🏆 Top Performing Branch',
      message: `${branchData.name} is leading in ${metric}: ${value}`,
      type: 'COMPANY',
      priority: 'MEDIUM',
      companyId: decodedToken.companyId,
    });
  }

  // Highest Order Achievement Notification
  static async createHighestOrderNotification(
    orderData: any,
    branchName: string,
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '🎯 Record Order Achieved',
      message: `${branchName} processed the highest order: $${orderData.totalAmount} (${orderData.items?.length || 0} items)`,
      type: 'COMPANY',
      priority: 'HIGH',
      companyId: decodedToken.companyId,
    });
  }

  // Top Attendance Notification
  static async createTopAttendanceNotification(
    userData: any,
    attendanceData: any,
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '⭐ Perfect Attendance',
      message: `${userData.fullname} has achieved ${attendanceData.daysPresent} days of perfect attendance this month`,
      type: 'BRANCH',
      priority: 'MEDIUM',
      branchId: decodedToken.branchId,
    });
  }

  // Daily Performance Summary Notification
  static async createDailyPerformanceSummary(summaryData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '📊 Daily Performance Summary',
      message: `Today's highlights: ${summaryData.totalOrders} orders, $${summaryData.totalRevenue} revenue, ${summaryData.topBranch} top branch`,
      type: 'COMPANY',
      priority: 'LOW',
      companyId: decodedToken.companyId,
    });
  }

  // Weekly Achievement Notification
  static async createWeeklyAchievementNotification(achievementData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '🏅 Weekly Achievement Unlocked',
      message: `${achievementData.title}: ${achievementData.description}`,
      type: 'COMPANY',
      priority: 'MEDIUM',
      companyId: decodedToken.companyId,
    });
  }

  // Low Stock Alert (Automatic)
  static async createAutomaticLowStockAlert(stockData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '⚠️ Low Stock Alert',
      message: `${stockData.ingredientName} is running low (${stockData.currentStock} ${stockData.unit} remaining)`,
      type: 'BRANCH',
      priority: 'HIGH',
      branchId: decodedToken.branchId,
    });
  }

  // Sales Milestone Notification
  static async createSalesMilestoneNotification(milestoneData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '🎉 Sales Milestone Reached',
      message: `Congratulations! ${milestoneData.branchName} reached $${milestoneData.amount} in sales`,
      type: 'COMPANY',
      priority: 'HIGH',
      companyId: decodedToken.companyId,
    });
  }

  // Employee Performance Notification
  static async createEmployeePerformanceNotification(
    employeeData: any,
    performanceData: any,
  ) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '👨‍💼 Employee Performance Highlight',
      message: `${employeeData.fullname} processed ${performanceData.ordersProcessed} orders with ${performanceData.satisfactionRating}% satisfaction`,
      type: 'BRANCH',
      priority: 'MEDIUM',
      branchId: decodedToken.branchId,
    });
  }

  // System Health Notification
  static async createSystemHealthNotification(healthData: any) {
    const decodedToken = this.getToken();

    return this.createNotification({
      title: '💻 System Health Update',
      message: `System performance: ${healthData.uptime}% uptime, ${healthData.activeUsers} active users`,
      type: 'COMPANY',
      priority: 'LOW',
      companyId: decodedToken.companyId,
    });
  }
}
