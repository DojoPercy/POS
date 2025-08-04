"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Bell, X, Check, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
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

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

const priorityIcons = {
  LOW: Info,
  MEDIUM: AlertCircle,
  HIGH: AlertTriangle,
  URGENT: AlertTriangle,
}

const typeLabels = {
  COMPANY: "Company",
  BRANCH: "Branch",
  USER: "Personal",
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const decodedToken: DecodedToken = jwtDecode(token)
      const response = await fetch(`/api/notification?userId=${decodedToken.userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const decodedToken: DecodedToken = jwtDecode(token)
      const response = await fetch(`/api/notification/unread-count?userId=${decodedToken.userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const decodedToken: DecodedToken = jwtDecode(token)
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
          title: "Notification marked as read",
          description: "The notification has been marked as read",
        })
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }, [toast])

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const decodedToken: DecodedToken = jwtDecode(token)
      const response = await fetch("/api/notification/mark-all-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: decodedToken.userId }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast({
          title: "All notifications marked as read",
          description: "All notifications have been marked as read",
        })
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
  }, [toast])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const decodedToken: DecodedToken = jwtDecode(token)
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
          title: "Notification deleted",
          description: "The notification has been deleted",
        })
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }, [notifications, toast])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchNotifications()
    }
  }

  const sortedNotifications = notifications.sort((a, b) => {
    // Sort by priority first, then by creation date
    const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs bg-red-500">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
              <p className="text-xs text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedNotifications.map((notification) => {
                const PriorityIcon = priorityIcons[notification.priority as keyof typeof priorityIcons]
                const priorityColor = priorityColors[notification.priority as keyof typeof priorityColors]
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? "bg-gray-50 border-gray-200" 
                        : "bg-white border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${notification.isRead ? "bg-gray-100" : "bg-blue-100"}`}>
                          <PriorityIcon className={`h-4 w-4 ${notification.isRead ? "text-gray-600" : "text-blue-600"}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                              {notification.title}
                            </h4>
                            <Badge variant="secondary" className={`text-xs ${priorityColor}`}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[notification.type as keyof typeof typeLabels]}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm ${notification.isRead ? "text-gray-600" : "text-gray-700"} mb-2`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{format(new Date(notification.createdAt), "MMM d, h:mm a")}</span>
                              {notification.company && (
                                <span className="flex items-center gap-1">
                                  <span>•</span>
                                  {notification.company.name}
                                </span>
                              )}
                              {notification.branch && (
                                <span className="flex items-center gap-1">
                                  <span>•</span>
                                  {notification.branch.name}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 