"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MapPin, Clock, UserIcon, CheckCircle, XCircle, AlertCircle, Building2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"

interface Branch {
  id: string
  name: string
  address: string
  city: string
  state?: string
  country: string
  status: "active" | "inactive"
  managerId?: string
  openingHours?: string
  employeeCount?: number
  rating?: number
  image?: string
  createdAt?: string
  imageUrl?: string
  latitude?: number | null
  longitude?: number | null
}

interface StaffUser {
  id: string
  fullname: string
  email: string
  role: string
  branchId: string | null
}

interface Attendance {
  id: string
  userId: string
  branchId: string
  email: string
  signInTime: string | null
  signOutTime: string | null
  date: string
  totalHours: number | null
  status: "SIGNED_IN" | "SIGNED_OUT" | "BREAK" | "OVERTIME"
  signInDistance: number | null
  signOutDistance: number | null
  notes: string | null
  user: StaffUser
  branch: {
    id: string
    name: string
    city: string
  }
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const formatTime = (dateString: string) => {
  return format(new Date(dateString), "HH:mm:ss")
}

const formatDuration = (hours: number) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
}

export default function AttendancePage() {
  const params = useParams()
  const branchId = params.branchId as string

  const [branch, setBranch] = useState<Branch | null>(null)
  const [email, setEmail] = useState("")
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [user, setUser] = useState<StaffUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch branch details
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await fetch(`/api/branches?branchId=${branchId}`)
        if (response.ok) {
          const branchData = await response.json()
          setBranch(branchData)
        } else {
          setError("Branch not found")
        }
      } catch (err) {
        setError("Failed to fetch branch details")
      }
    }

    if (branchId) {
      fetchBranch()
    }
  }, [branchId])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setLocationError(null)
        },
        (error) => {
          setLocationError("Location access denied. Please enable location services.")
          console.error("Geolocation error:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
    }
  }, [])

  const fetchAttendance = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/attendance?branchId=${branchId}&email=${encodeURIComponent(email.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setAttendance(data.attendance)
        setSuccess(null)
      } else {
        setError(data.error || "Failed to fetch attendance data")
        setUser(null)
        setAttendance(null)
      }
    } catch (err) {
      setError("Failed to connect to server")
      setUser(null)
      setAttendance(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceAction = async (action: "signin" | "signout") => {
    if (!location) {
      setError("Location is required for attendance. Please enable location services.")
      return
    }

    if (!user) {
      setError("Please verify your email first")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchId,
          email: user.email,
          action,
          latitude: location.latitude,
          longitude: location.longitude,
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAttendance(data.attendance)
        setSuccess(
          action === "signin"
            ? "Successfully signed in!"
            : `Successfully signed out! Total hours: ${formatDuration(data.attendance.totalHours || 0)}`,
        )
        setNotes("")
      } else if(response.status === 400) {
        setError(data.error || `Failed to ${action}`)
      }
    } catch (err) {
      setError(`Failed to ${action}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const calculateWorkingHours = () => {
    if (!attendance?.signInTime) return null

    const signInTime = new Date(attendance.signInTime)
    const endTime = attendance.signOutTime ? new Date(attendance.signOutTime) : currentTime
    const hours = (endTime.getTime() - signInTime.getTime()) / (1000 * 60 * 60)

    return hours
  }

  const workingHours = calculateWorkingHours()

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Staff Attendance</h1>
          <p className="text-gray-600">Check in and out for your work shift</p>
        </div>

        {/* Branch Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{branch.name}</span>
                <Badge variant={branch.status === "active" ? "default" : "secondary"}>{branch.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {branch.address}, {branch.city}, {branch.country}
                </span>
              </div>
              {branch.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{branch.openingHours}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Time */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{format(currentTime, "HH:mm:ss")}</div>
              <div className="text-sm text-gray-600">{format(currentTime, "EEEE, MMMM d, yyyy")}</div>
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        {locationError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        ) : location ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Location services enabled. You can now check in/out.</AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Getting your location...</AlertDescription>
          </Alert>
        )}

        {/* Email Input */}
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Verify Your Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  onKeyPress={(e) => e.key === "Enter" && fetchAttendance()}
                />
              </div>
              <Button onClick={fetchAttendance} disabled={loading || !email.trim()} className="w-full">
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User Info & Attendance */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Welcome, {user.fullname}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-500 text-white">{getInitials(user.fullname)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.fullname}</p>
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Attendance Status */}
              {attendance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Sign In</div>
                      <div className="text-lg font-bold text-green-800">
                        {attendance.signInTime ? formatTime(attendance.signInTime) : "Not signed in"}
                      </div>
                      {attendance.signInDistance && (
                        <div className="text-xs text-green-600">
                          {Math.round(attendance.signInDistance)}m from branch
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-600 font-medium">Sign Out</div>
                      <div className="text-lg font-bold text-red-800">
                        {attendance.signOutTime ? formatTime(attendance.signOutTime) : "Not signed out"}
                      </div>
                      {attendance.signOutDistance && (
                        <div className="text-xs text-red-600">
                          {Math.round(attendance.signOutDistance)}m from branch
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Working Hours */}
                  {workingHours && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">
                        {attendance.signOutTime ? "Total Hours Worked" : "Current Working Hours"}
                      </div>
                      <div className="text-2xl font-bold text-blue-800">{formatDuration(workingHours)}</div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge
                      variant={attendance.status === "SIGNED_IN" ? "default" : "secondary"}
                      className="text-sm px-4 py-2"
                    >
                      {attendance.status === "SIGNED_IN" ? "Currently Working" : "Not Working"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No attendance record for today</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about your shift..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!attendance?.signInTime ? (
                  <Button
                    onClick={() => handleAttendanceAction("signin")}
                    disabled={loading || !location}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                ) : !attendance?.signOutTime ? (
                  <Button
                    onClick={() => handleAttendanceAction("signout")}
                    disabled={loading || !location}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    {loading ? "Signing Out..." : "Sign Out"}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Shift Completed</p>
                    <p className="text-sm text-gray-600">
                      Total hours: {attendance.totalHours ? formatDuration(attendance.totalHours) : "0h 0m"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
