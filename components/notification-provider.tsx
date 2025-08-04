"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { useToast } from "@/hooks/use-toast"
import { jwtDecode } from "jwt-decode"

interface NotificationContextType {
  unreadCount: number
  hasNewNotifications: boolean
  markNotificationAsRead: (notificationId: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  createNotification: (data: any) => Promise<any>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const { toast } = useToast()
  const {
    unreadCount,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification: createNotificationHook,
  } = useNotifications()

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setHasNewNotifications(false)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }, [markAsRead])

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setHasNewNotifications(false)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }, [markAllAsRead])

  const createNotification = useCallback(async (data: any) => {
    try {
      const result = await createNotificationHook(data)
      // Show toast for new notifications
      toast({
        title: "New Notification",
        description: `"${data.title}" has been created`,
      })
      return result
    } catch (error) {
      console.error("Failed to create notification:", error)
      throw error
    }
  }, [createNotificationHook, toast])

  const refreshNotifications = useCallback(async () => {
    try {
      await fetchUnreadCount()
    } catch (error) {
      console.error("Failed to refresh notifications:", error)
    }
  }, [fetchUnreadCount])

  // Check for new notifications periodically
  useEffect(() => {
    const checkForNewNotifications = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const decodedToken: any = jwtDecode(token)
        const response = await fetch(`/api/notification/unread-count?userId=${decodedToken.userId}`)
        
        if (response.ok) {
          const data = await response.json()
          const currentUnreadCount = data.count || 0
          
          // If there are new unread notifications, show indicator
          if (currentUnreadCount > unreadCount) {
            setHasNewNotifications(true)
            // Show a subtle toast for new notifications
            if (currentUnreadCount === unreadCount + 1) {
              toast({
                title: "New Notification",
                description: "You have a new notification",
                duration: 3000,
              })
            }
          }
        }
      } catch (error) {
        console.error("Failed to check for new notifications:", error)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkForNewNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [unreadCount, toast])

  const value: NotificationContextType = {
    unreadCount,
    hasNewNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNotification,
    refreshNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
} 