"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Users, MapPin, MoreVertical, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  fullname: string
  status: string
  email: string
  role: string
  branchId: string | null
  phone?: string
  avatar?: string
  joinDate?: string
}

interface Branch {
  id: string
  name: string
  location: string
  city: string
  state: string | null
  country: string
  openingHours: string
  status: string
  managerId: string | null
}

interface DecodedToken {
  companyId: string
}

const getRoleColor = (role: string) => {
  const colors = {
    manager: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300",
    waiter: "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300",
    chef: "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300",
    barista: "bg-gradient-to-br from-green-100 to-green-200 border-green-300",
    cashier: "bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300",
    default: "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300",
  }
  return colors[role.toLowerCase() as keyof typeof colors] || colors.default
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function StaffManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "branches">("cards")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication token not found. Please log in again.")
          setLoading(false)
          return
        }

        const decodedToken: DecodedToken = jwtDecode(token)
        const [branchesResponse, usersResponse] = await Promise.all([
          fetch("/api/branches?companyId=" + decodedToken.companyId),
          fetch("/api/users?companyId=" + decodedToken.companyId),
        ])

        if (!branchesResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const branchesData = await branchesResponse.json()
        const usersData = await usersResponse.json()

        setBranches(branchesData)
        setUsers(usersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch === "all" || user.branchId === selectedBranch
    const matchesRole = selectedRole === "all" || user.role.toLowerCase() === selectedRole.toLowerCase()

    return matchesSearch && matchesBranch && matchesRole
  })

  // Group users by branch for branch view
  const usersByBranch = branches.map((branch) => ({
    ...branch,
    users: users.filter((user) => user.branchId === branch.id),
  }))

  const StaffCard = ({ user }: { user: User }) => {
    const branch = branches.find((b) => b.id === user.branchId)

    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 border-2 ${getRoleColor(user.role)}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullname} />
                <AvatarFallback className="bg-white text-gray-700 font-semibold">
                  {getInitials(user.fullname)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{user.fullname}</h3>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{user.email}</span>
            </div>

            {branch && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{branch.name}</span>
              </div>
            )}

            {user.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/50">
            <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
              {user.status}
            </Badge>
            {user.joinDate && (
              <span className="text-xs text-gray-500">Joined {new Date(user.joinDate).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const BranchSection = ({ branch, users: branchUsers }: { branch: Branch; users: User[] }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MapPin className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{branch.name}</h2>
            <p className="text-sm text-gray-600">
              {branch.city}, {branch.country}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={branch.status === "active" ? "default" : "secondary"}>{branch.status}</Badge>
          <Badge variant="outline" className="text-xs">
            {branchUsers.length} staff
          </Badge>
        </div>
      </div>

      {branchUsers.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">No staff assigned to this branch</p>
            <p className="text-sm text-gray-400">Invite employees to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {branchUsers.map((user) => (
            <StaffCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant team across all locations</p>
        </div>

        <Link href="/register">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          

            <div className="flex gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === "branches" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("branches")}
              >
                By Branch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "cards" ? (
        /* Card View */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              All Staff
              <span className="text-gray-500 ml-2">({filteredUsers.length})</span>
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Start by inviting your first employee"}
                </p>
                <Link href="/register">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite First Employee
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <StaffCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Branch View */
        <div>
          {usersByBranch.map((branch) => (
            <BranchSection key={branch.id} branch={branch} users={branch.users} />
          ))}
        </div>
      )}
    </div>
  )
}
