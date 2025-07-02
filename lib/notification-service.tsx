import { PrismaClient, NotificationType, NotificationPriority } from "@prisma/client"

const prisma = new PrismaClient()

export class NotificationService {
  // Get notifications based on user role and permissions
  static async getNotificationsForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    let notifications = []

    switch (user.role) {
      case "owner":
        // Company owner sees company-wide and their personal notifications
        notifications = await prisma.notification.findMany({
          where: {
            OR: [
              { companyId: user.companyId, type: NotificationType.COMPANY },
              { userId: userId, type: NotificationType.USER },
              { expiresAt: null }, { expiresAt: { gte: new Date() } }
            ],
          },
          include: {
            company: true,
            branch: true,
            user: true,
          },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        })
        break

      case "manager":
        // Branch manager sees branch and their personal notifications
        notifications = await prisma.notification.findMany({
          where: {
            OR: [
              { branchId: user.branchId, type: NotificationType.BRANCH },
              { userId: userId, type: NotificationType.USER },
              { expiresAt: null }, { expiresAt: { gte: new Date() } }
            ],
            
          },
          include: {
            company: true,
            branch: true,
            user: true,
            
          },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        })
        break

      case "waiter":
      case "kitchen":
      default:
        // Regular users only see their personal notifications
        notifications = await prisma.notification.findMany({
          where: {
            userId: userId,
            type: NotificationType.USER,
           
          },
          include: {
            company: true,
            branch: true,
            user: true,
            
          },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        })
        break
    }

    return notifications
  }

  // Create a new notification
  static async createNotification(data: {
    title: string
    message: string
    type: NotificationType
    priority?: NotificationPriority
    companyId?: string
    branchId?: string
    userId?: string
    createdBy: string
    expiresAt?: Date
  }) {
    return await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || NotificationPriority.MEDIUM,
        companyId: data.companyId,
        branchId: data.branchId,
        userId: data.userId,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt,
      },
      include: {
        company: true,
        branch: true,
        user: true,
        
      },
    })
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
        readBy: userId,
      },
    })
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    let whereClause = {}

    switch (user.role) {
      case "owner":
        whereClause = {
          OR: [
            { companyId: user.companyId, type: NotificationType.COMPANY },
            { userId: userId, type: NotificationType.USER },
            { expiresAt: null }, { expiresAt: { gte: new Date() } }
          ],
          isRead: false,
        }
        break
      case "manager":
        whereClause = {
          OR: [
            { branchId: user.branchId, type: NotificationType.BRANCH },
            { userId: userId, type: NotificationType.USER },
            { expiresAt: null }, { expiresAt: { gte: new Date() } }
          ],
          isRead: false,
        }
        break
      default:
        whereClause = {
          userId: userId,
          type: NotificationType.USER,
          isRead: false,
        }
        break
    }

    return await prisma.notification.updateMany({
      where: whereClause,
      data: {
        isRead: true,
        readAt: new Date(),
        readBy: userId,
      },
    })
  }

  // Delete notification (only creator or admin can delete)
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!notification || !user) {
      throw new Error("Notification or user not found")
    }

    // Check if user has permission to delete
    if (notification.createdBy !== userId && user.role !== "owner") {
      throw new Error("Unauthorized to delete this notification")
    }

    return await prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  // Get unread count for user
  static async getUnreadCount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    let whereClause = {}

    switch (user.role) {
      case "owner":
        whereClause = {
          OR: [
            { companyId: user.companyId, type: NotificationType.COMPANY },
            { userId: userId, type: NotificationType.USER },
            { expiresAt: null }, { expiresAt: { gte: new Date() } }
          ],
          isRead: false,
         
        }
        break
      case "manager":
        whereClause = {
          OR: [
            { branchId: user.branchId, type: NotificationType.BRANCH },
            { userId: userId, type: NotificationType.USER },
            { expiresAt: null }, { expiresAt: { gte: new Date() } }
          ],
          isRead: false,
         
        }
        break
      default:
        whereClause = {
          userId: userId,
          type: NotificationType.USER,
          isRead: false,
         
        }
        break
    }

    return await prisma.notification.count({
      where: whereClause,
    })
  }
}
