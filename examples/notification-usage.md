# Notification System Usage Guide

## Overview

The POSnext notification system provides both manual and automatic notifications for various system events. Here's how to use it:

## 1. Manual Notifications

### Via UI (Owner Dashboard)
1. Navigate to `/owner/notifications`
2. Click "Create Notification"
3. Fill in the form:
   - **Type**: Company-wide, Branch-specific, or User-specific
   - **Priority**: Low, Medium, High, or Urgent
   - **Title**: Notification title
   - **Message**: Detailed message
   - **Expires At**: Optional expiration date

### Via Code
```typescript
import { NotificationUtils } from "@/lib/notification-utils"

// Create a simple notification
await NotificationUtils.createNotification({
  title: "System Update",
  message: "The system will be updated tonight at 2 AM",
  type: "COMPANY",
  priority: "MEDIUM",
  companyId: "your-company-id"
})

// Create user-specific notification
await NotificationUtils.createUserSpecificNotification(
  "user-id",
  "Welcome!",
  "Welcome to our platform",
  "MEDIUM"
)
```

## 2. Automatic System Notifications

### Available Automatic Notifications

#### 🏆 Top Branch Performance
```typescript
// Automatically triggered when dashboard loads
await AutomaticNotificationService.checkTopBranches(companyId)

// Manual trigger
await NotificationUtils.createTopBranchNotification(
  { name: "Downtown Branch" },
  "revenue",
  "$50,000"
)
```

#### 🎯 Highest Order Achievement
```typescript
// Automatically triggered when new orders are processed
await AutomaticNotificationService.checkHighestOrders(companyId)

// Manual trigger
await NotificationUtils.createHighestOrderNotification(
  { totalAmount: 500, items: [/* order items */] },
  "Downtown Branch"
)
```

#### ⭐ Top Attendance
```typescript
// Automatically triggered daily
await AutomaticNotificationService.checkTopAttendance(companyId)

// Manual trigger
await NotificationUtils.createTopAttendanceNotification(
  { fullname: "John Doe" },
  { daysPresent: 25 }
)
```

#### 📊 Daily Performance Summary
```typescript
// Automatically triggered daily at end of day
await AutomaticNotificationService.generateDailySummary(companyId)

// Manual trigger
await NotificationUtils.createDailyPerformanceSummary({
  totalOrders: 150,
  totalRevenue: 7500,
  topBranch: "Downtown Branch"
})
```

#### ⚠️ Low Stock Alerts
```typescript
// Automatically triggered daily
await AutomaticNotificationService.checkLowStockAlerts(companyId)

// Manual trigger
await NotificationUtils.createAutomaticLowStockAlert({
  ingredientName: "Tomatoes",
  currentStock: 5,
  unit: "kg"
})
```

#### 🎉 Sales Milestones
```typescript
// Automatically triggered when milestones are reached
await AutomaticNotificationService.checkSalesMilestones(companyId)

// Manual trigger
await NotificationUtils.createSalesMilestoneNotification({
  branchName: "Downtown Branch",
  amount: "100,000"
})
```

## 3. API Endpoints

### Trigger Automatic Notifications
```bash
POST /api/notification/auto
Content-Type: application/json

{
  "type": "top-branches",
  "companyId": "your-company-id"
}
```

Available types:
- `top-branches` - Check for top performing branches
- `highest-orders` - Check for record-breaking orders
- `top-attendance` - Check for perfect attendance
- `low-stock` - Check for low stock alerts
- `sales-milestones` - Check for sales milestones
- `daily-summary` - Generate daily summary
- `weekly-achievements` - Generate weekly achievements
- `all` - Run all checks

### Get Available Types
```bash
GET /api/notification/auto
```

## 4. Integration Examples

### In Order Processing
```typescript
// When a new order is created
export async function createOrder(orderData: any) {
  // ... create order logic ...
  
  // Create order notification
  await NotificationUtils.createOrderNotification(orderData)
  
  // Check if it's a record-breaking order
  await AutomaticNotificationService.checkHighestOrders(companyId)
}
```

### In Inventory Management
```typescript
// When stock is updated
export async function updateStock(stockData: any) {
  // ... update stock logic ...
  
  // Check for low stock alerts
  if (stockData.currentStock < stockData.recommendedStock * 0.1) {
    await NotificationUtils.createAutomaticLowStockAlert(stockData)
  }
}
```

### In Staff Management
```typescript
// When staff is added/updated/removed
export async function updateStaff(staffData: any, action: string) {
  // ... update staff logic ...
  
  // Create staff notification
  await NotificationUtils.createStaffNotification(staffData, action)
}
```

### In Branch Management
```typescript
// When branch performance is calculated
export async function calculateBranchPerformance(branchData: any) {
  // ... calculate performance logic ...
  
  // Check for top performers
  await AutomaticNotificationService.checkTopBranches(companyId)
}
```

## 5. Scheduled Notifications

### Daily Summary (End of Day)
```typescript
// Set up a cron job or scheduled task
setInterval(async () => {
  const now = new Date()
  if (now.getHours() === 23 && now.getMinutes() === 0) {
    await AutomaticNotificationService.runDailySummary(companyId)
  }
}, 60000) // Check every minute
```

### Weekly Achievements (End of Week)
```typescript
// Set up a cron job or scheduled task
setInterval(async () => {
  const now = new Date()
  if (now.getDay() === 0 && now.getHours() === 23 && now.getMinutes() === 0) {
    await AutomaticNotificationService.generateWeeklyAchievements(companyId)
  }
}, 60000) // Check every minute
```

## 6. Notification Types and Priorities

### Types
- **COMPANY**: Visible to all company users
- **BRANCH**: Visible to branch users
- **USER**: Visible to specific user

### Priorities
- **LOW**: Blue color, Info icon
- **MEDIUM**: Yellow color, AlertCircle icon
- **HIGH**: Orange color, AlertTriangle icon
- **URGENT**: Red color, AlertTriangle icon

## 7. Real-time Features

### Auto-refresh
- Notifications automatically refresh every 30 seconds
- New notifications show toast alerts
- Unread count updates in real-time

### Mobile Responsive
- All notifications work on mobile devices
- Touch-friendly interactions
- Optimized layouts for different screen sizes

## 8. Best Practices

1. **Use Appropriate Priorities**: Don't overuse HIGH/URGENT for routine notifications
2. **Keep Messages Concise**: Notifications should be brief and actionable
3. **Use Emojis Sparingly**: They can help with visual recognition but don't overdo it
4. **Set Expiration Dates**: For time-sensitive notifications
5. **Test Notifications**: Always test before deploying to production
6. **Monitor Performance**: Automatic notifications should not impact system performance

## 9. Troubleshooting

### Common Issues
1. **Notifications not showing**: Check if user has proper permissions
2. **Automatic notifications not triggering**: Verify API endpoints are accessible
3. **Performance issues**: Ensure automatic checks don't run too frequently

### Debug Mode
```typescript
// Enable debug logging
console.log("Notification debug:", {
  type: "top-branches",
  companyId: "your-company-id",
  timestamp: new Date().toISOString()
})
```

This notification system provides a comprehensive solution for keeping users informed about important events and achievements in the POSnext application. 