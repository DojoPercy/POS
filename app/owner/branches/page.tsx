"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, ChevronRight, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axios from "axios"
import { ClipLoader } from "react-spinners"
import { jwtDecode } from "jwt-decode"


interface Branch {
  id: string
  name: string
  address: string
  city: string
  status: "active" | "inactive"
}

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}

const mockBranches: Branch[] = []

export default function BranchList() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token not found")
      return
    }
    const decodedToken: DecodedToken = jwtDecode(token)
    setDecodedToken(decodedToken)

    const fetchBranches = async () => {
      setLoading(true)
      try {
        console.log("decodedTokenCm:", decodedToken.branchId)
        const response = await axios.get(`/api/branches?companyId=${decodedToken.companyId}`)
        setLoading(false)
        setBranches(response.data)
        console.log("Branches:", response.data)
      } catch (err: any) {
        console.error("Failed to fetch branches:", err.response?.data?.error || err.message)
      }
    }
    fetchBranches()
  }, [])

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: any) => {
    const response = await axios.delete(`/api/branches?id=${id}`)

    if (response.status === 200) {
      console.log("Branch deleted successfully")
    }
    setBranches(branches.filter((branch) => branch.id !== id))
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">Branches</CardTitle>
          <CardDescription>Manage your restaurant branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <Button onClick={() => router.push("branches/create")} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add New Branch
            </Button>
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden sm:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <ClipLoader
                        color={"#000"}
                        loading={loading}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.city}</TableCell>
                      <TableCell>
                        <Badge variant={branch.status === "active" ? "default" : "secondary"}>{branch.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/branch/${branch.id}`)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`branches/${branch.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(branch.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View - Shown only on mobile */}
          <div className="sm:hidden">
            {loading ? (
              <div className="flex justify-center py-8">
                <ClipLoader
                  color={"#000"}
                  loading={loading}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBranches.map((branch) => (
                  <Card key={branch.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-base">{branch.name}</h3>
                          <Badge variant={branch.status === "active" ? "default" : "secondary"} className="mt-1">
                            {branch.status}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/branch/${branch.id}`)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`branches/${branch.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(branch.id)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p className="truncate">{branch.address}</p>
                        <p>{branch.city}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
