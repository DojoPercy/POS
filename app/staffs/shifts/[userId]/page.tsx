"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Calendar, Clock, MapPin, Star, Play, CheckCircle, Coffee, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBranchById } from "@/lib/branch"

interface Shift {
  id: string
  userId: string
  branchId: string
  title: string
  dayOfWeek: number
  startTime: string
  endTime: string
  status: string
  shiftState: "INACTIVE" | "ACTIVE" | "ASSIST" | "BREAK" | "COMPLETED"
  role: string
  notes?: string
  branch: {
    id: string
    name: string
  }
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
]

const shiftStateConfig = {
  INACTIVE: {
    color: "bg-gray-50 border-gray-200 text-gray-700",
    badge: "bg-gray-100 text-gray-600",
    icon: <Circle className="h-4 w-4 text-gray-500" />,
    label: "Inactive",
  },
  ACTIVE: {
    color: "bg-blue-50 border-blue-200 text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    icon: <Play className="h-4 w-4 text-blue-600" />,
    label: "Active",
  },
  ASSIST: {
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    badge: "bg-yellow-100 text-yellow-700",
    icon: <Star className="h-4 w-4 text-yellow-600" />,
    label: "Assist",
  },
  BREAK: {
    color: "bg-orange-50 border-orange-200 text-orange-800",
    badge: "bg-orange-100 text-orange-700",
    icon: <Coffee className="h-4 w-4 text-orange-600" />,
    label: "Break",
  },
  COMPLETED: {
    color: "bg-green-50 border-green-200 text-green-800",
    badge: "bg-green-100 text-green-700",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    label: "Completed",
  },
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function StaffSchedulePage() {
  const params = useParams()
  const userId = params.userId as string
  const [user, setUser] = useState<any | null>(null)
    const [branch, setBranch] = useState<any | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState("current")

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId, selectedWeek])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userResponse, shiftsResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/shifts?week=${selectedWeek}`),
      ])



     

      if (userResponse.ok && shiftsResponse.ok) {
        const userData = await userResponse.json()
        const shiftsData = await shiftsResponse.json()
         const userBranch = await getBranchById(userData.branchId)
       
        setUser(userData)
        setShifts(shiftsData)
         setBranch(userBranch)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShiftStateChange = async (shiftId: string, newState: Shift["shiftState"]) => {
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftState: newState }),
      })

      if (response.ok) {
        const updatedShift = await response.json()
        setShifts((prev) => prev.map((shift) => (shift.id === shiftId ? updatedShift : shift)))
      }
    } catch (error) {
      console.error("Error updating shift state:", error)
    }
  }

  const getShiftsForDay = (dayOfWeek: number) => {
    return shifts
      .filter((shift) => shift.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getTotalHours = () => {
    return shifts.reduce((total, shift) => {
      const start = Number.parseInt(shift.startTime.split(":")[0])
      const end = Number.parseInt(shift.endTime.split(":")[0])
      return total + (end - start)
    }, 0)
  }

  const getUpcomingShifts = () => {
    const today = new Date().getDay()
    return shifts
      .filter((shift) => shift.dayOfWeek >= today)
      .sort((a, b) => {
        if (a.dayOfWeek === b.dayOfWeek) {
          return a.startTime.localeCompare(b.startTime)
        }
        return a.dayOfWeek - b.dayOfWeek
      })
      .slice(0, 3)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="text-gray-600">The requested user could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
              {getInitials(user.fullname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.fullname}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{branch.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="current">Current Week</SelectItem>
              <SelectItem value="next">Next Week</SelectItem>
              <SelectItem value="previous">Previous Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
                <p className="text-sm text-gray-600">Total Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalHours()}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {shifts.filter((s) => s.shiftState === "ACTIVE").length}
                </p>
                <p className="text-sm text-gray-600">Active Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {shifts.filter((s) => s.shiftState === "COMPLETED").length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Shifts */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getUpcomingShifts().map((shift) => {
              const stateConfig = shiftStateConfig[shift.shiftState]
              const day = DAYS_OF_WEEK.find((d) => d.value === shift.dayOfWeek)
              return (
                <div key={shift.id} className={`p-4 rounded-lg border ${stateConfig.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{day?.short}</div>
                        <div className="text-xs text-gray-600">{day?.label}</div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{shift.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <MapPin className="h-3 w-3 ml-2" />
                          <span>{shift.branch.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={stateConfig.badge}>
                        <div className="flex items-center gap-1">
                          {stateConfig.icon}
                          {stateConfig.label}
                        </div>
                      </Badge>
                      <Select
                        value={shift.shiftState}
                        onValueChange={(value) => handleShiftStateChange(shift.id, value as Shift["shiftState"])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ASSIST">Assist</SelectItem>
                          <SelectItem value="BREAK">Break</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )
            })}
            {getUpcomingShifts().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming shifts scheduled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayShifts = getShiftsForDay(day.value)
              return (
                <div key={day.value} className="space-y-2">
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="font-semibold text-sm text-gray-900">{day.short}</div>
                    <div className="text-xs text-gray-600">{day.label}</div>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {dayShifts.map((shift) => {
                      const stateConfig = shiftStateConfig[shift.shiftState]
                      return (
                        <div key={shift.id} className={`p-2 rounded border text-xs ${stateConfig.color}`}>
                          <div className="font-medium truncate">{shift.title}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {shift.startTime} - {shift.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {stateConfig.icon}
                            <span>{stateConfig.label}</span>
                          </div>
                        </div>
                      )
                    })}
                    {dayShifts.length === 0 && <div className="text-center py-4 text-gray-400 text-xs">No shifts</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
