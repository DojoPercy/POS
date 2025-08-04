import { NextRequest, NextResponse } from "next/server"
import { AutomaticNotificationService } from "@/lib/automatic-notifications"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  userId: string
  companyId: string
  branchId?: string
}

// POST - Trigger automatic notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, companyId } = body

    // Validate required fields
    if (!type || !companyId) {
      return NextResponse.json({ 
        error: "Type and companyId are required" 
      }, { status: 400 })
    }

    let result

    switch (type) {
      case "top-branches":
        result = await AutomaticNotificationService.checkTopBranches(companyId)
        break
      
      case "highest-orders":
        result = await AutomaticNotificationService.checkHighestOrders(companyId)
        break
      
      case "top-attendance":
        result = await AutomaticNotificationService.checkTopAttendance(companyId)
        break
      
      case "low-stock":
        result = await AutomaticNotificationService.checkLowStockAlerts(companyId)
        break
      
      case "sales-milestones":
        result = await AutomaticNotificationService.checkSalesMilestones(companyId)
        break
      
      case "daily-summary":
        result = await AutomaticNotificationService.runDailySummary(companyId)
        break
      
      case "weekly-achievements":
        result = await AutomaticNotificationService.generateWeeklyAchievements(companyId)
        break
      
      case "all":
        result = await AutomaticNotificationService.runAllChecks(companyId)
        break
      
      default:
        return NextResponse.json({ 
          error: "Invalid notification type. Valid types: top-branches, highest-orders, top-attendance, low-stock, sales-milestones, daily-summary, weekly-achievements, all" 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Automatic notifications for ${type} triggered successfully`,
      data: result
    })

  } catch (error) {
    console.error("Error triggering automatic notifications:", error)
    return NextResponse.json({ 
      error: "Failed to trigger automatic notifications" 
    }, { status: 500 })
  }
}

// GET - Get available automatic notification types
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      types: [
        {
          type: "top-branches",
          description: "Check for top performing branches by revenue, orders, and customer satisfaction",
          frequency: "Daily"
        },
        {
          type: "highest-orders",
          description: "Check for record-breaking orders",
          frequency: "Real-time"
        },
        {
          type: "top-attendance",
          description: "Check for employees with perfect attendance and most hours worked",
          frequency: "Daily"
        },
        {
          type: "low-stock",
          description: "Check for low stock alerts",
          frequency: "Daily"
        },
        {
          type: "sales-milestones",
          description: "Check for sales milestone achievements",
          frequency: "Real-time"
        },
        {
          type: "daily-summary",
          description: "Generate daily performance summary",
          frequency: "Daily"
        },
        {
          type: "weekly-achievements",
          description: "Generate weekly achievement notifications",
          frequency: "Weekly"
        },
        {
          type: "all",
          description: "Run all automatic notification checks",
          frequency: "Daily"
        }
      ]
    }
  })
} 