import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { jwtDecode } from "jwt-decode"

interface Notification {
  id: string
  title: string
  message: string
  type: "COMPANY" | "BRANCH" | "USER"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  isRead: boolean
  createdAt: string
  company?: { name: string }
  branch?: { name: string }
  user?: { fullname: string }
}

interface DecodedToken {
  userId: string
  companyId: string
  branchId?: string
}

interface CreateNotificationData {
  title: string
  message: string
  type: "COMPANY" | "BRANCH" | "USER"
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  companyId?: string
  branchId?: string
  userId?: string
  expiresAt?: Date
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getToken = useCallback(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }
    return jwtDecode<DecodedToken>(token)
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const decodedToken = getToken()
      const response = await fetch(`/api/notification?userId=${decodedToken.userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0)
      } else {
        throw new Error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    }
  }, [getToken, toast])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const decodedToken = getToken()
      const response = await fetch(`/api/notification/unread-count?userId=${decodedToken.userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      } else {
        throw new Error("Failed to fetch unread count")
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }, [getToken])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const decodedToken = getToken()
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: decodedToken.userId }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast({
          title: "Success",
          description: "Notification marked as read",
        })
      } else {
        throw new Error("Failed to mark notification as read")
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }, [getToken, toast])

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true)
      const decodedToken = getToken()
      const response = await fetch("/api/notification/mark-all-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: decodedToken.userId }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast({
          title: "Success",
          description: "All notifications marked as read",
        })
      } else {
        throw new Error("Failed to mark all notifications as read")
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [getToken, toast])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const decodedToken = getToken()
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: decodedToken.userId }),
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId)
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev
        })
        toast({
          title: "Success",
          description: "Notification deleted",
        })
      } else {
        throw new Error("Failed to delete notification")
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }, [getToken, notifications, toast])

  const createNotification = useCallback(async (data: CreateNotificationData) => {
    try {
      const decodedToken = getToken()
      const response = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          createdBy: decodedToken.userId,
        }),
      })

      if (response.ok) {
        const newNotification = await response.json()
        setNotifications(prev => [newNotification.data, ...prev])
        if (!newNotification.data.isRead) {
          setUnreadCount(prev => prev + 1)
        }
        toast({
          title: "Success",
          description: "Notification created successfully",
        })
        return newNotification.data
      } else {
        throw new Error("Failed to create notification")
      }
    } catch (error) {
      console.error("Failed to create notification:", error)
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      })
      throw error
    }
  }, [getToken, toast])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  }
} 