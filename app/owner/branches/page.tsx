"use client"

import { useEffect, useState } from "react"
import { Edit, Trash2, Plus, Search, MapPin, Users, Star, Heart, MoreVertical, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { toast } from "@/hooks/use-toast"
import BranchForm from "@/components/branchmanagement"


export interface Branch {
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

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token not found")
      return
    }

    const decoded: DecodedToken = jwtDecode(token)
    setDecodedToken(decoded)
    fetchBranches(decoded.companyId)
  }, [])

  const fetchBranches = async (companyId?: string) => {
    if (!companyId) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/branches?companyId=${companyId}`)
      console.log("Fetched branches:", response.data)
      // Add mock data for demo purposes
      const branchesWithMockData = response.data.map((branch: Branch, index: number) => ({
        ...branch,
        employeeCount: Math.floor(Math.random() * 50) + 10,
        rating: (Math.random() * 2 + 3).toFixed(1),
        image: `https://via.placeholder.com/300x200`, // Mock images
      }))
      setBranches(branchesWithMockData)
    } catch (err: any) {
      console.error("Failed to fetch branches:", err.response?.data?.error || err.message)
       toast({
      title: "error",
      description: `Failed to fetch branches`,
    })
      
    } finally {
      setLoading(false)
    }
  }

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/branches?id=${id}`)
      setBranches(branches.filter((branch) => branch.id !== id))
      toast({
      title: "success",
      description: `Branch deleted successfully`,
    })
    } catch (error) {
      toast({
      title: "error",
      description: `Failed to delete branch`,
    })
      
    }
  }

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch)
    setEditDialogOpen(true)
  }

  const handleBranchCreated = (newBranch: Branch) => {
    setBranches([...branches, newBranch])
    setCreateDialogOpen(false)
     toast({
      title: "success",
      description: `Branch Added successfully`,
    })
  }

  const handleBranchUpdated = (updatedBranch: Branch) => {
    setBranches(branches.map((branch) => (branch.id === updatedBranch.id ? updatedBranch : branch)))
    setEditDialogOpen(false)
    setSelectedBranch(null)
    toast({
      title: "success",
      description: `Branch Updated successfully`,
    })
  }

  const BranchCard = ({ branch }: { branch: Branch }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-100 to-red-100">
          {branch.image ? (
            <img
              src={branch.image || "/placeholder.svg"}
              alt={branch.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-purple-300" />
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => handleEdit(branch)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(branch.id)} className="text-purple-600 focus:text-purple-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute top-3 left-3">
          <Badge variant={branch.status === "active" ? "default" : "secondary"}>{branch.status}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{branch.name}</h3>
          {branch.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-purple-400 text-purple-400" />
              <span className="font-medium">{branch.rating}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{branch.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>
              {branch.city}
              {branch.state && `, ${branch.state}`}
            </span>
          </div>

          {branch.employeeCount && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{branch.employeeCount} Employees</span>
            </div>
          )}
        </div>

        {branch.openingHours && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Hours: {branch.openingHours}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const BranchSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant locations and track performance</p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-br from-blue-500 to-purple-500 hover:bg-purple-600 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                </DialogHeader>
                <BranchForm
                  onSuccess={handleBranchCreated}
                  companyId={decodedToken?.companyId}
                  userId={decodedToken?.userId}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search branches by name, city, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredBranches.length} branches
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <BranchSkeleton key={index} />
            ))}
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first branch"}
            </p>
            {!searchTerm && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Branch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Branch</DialogTitle>
                  </DialogHeader>
                  <BranchForm
                    onSuccess={handleBranchCreated}
                    companyId={decodedToken?.companyId}
                    userId={decodedToken?.userId}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
            </DialogHeader>
            {selectedBranch && (
              <BranchForm
                branch={selectedBranch}
                onSuccess={handleBranchUpdated}
                companyId={decodedToken?.companyId}
                userId={decodedToken?.userId}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
