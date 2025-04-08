"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Loader2, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  fullname: string
  status: string
  email: string
  role: string
  branchId: string | null
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

export default function StaffByBranch() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openBranches, setOpenBranches] = useState<Set<string>>(new Set())
  const [creatingStaff, setCreatingStaff] = useState(false)

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

        const branchesResponse = await  fetch("/api/branches?companyId=" + decodedToken.companyId)
        const usersResponse = await fetch("/api/users?companyId=" + decodedToken.companyId)

        if (!branchesResponse.ok) {
          throw new Error(`Failed to fetch branches: ${branchesResponse.statusText}`)
        }

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users: ${usersResponse.statusText}`)
        }

        const branchesData = await branchesResponse.json()
        const usersData = await usersResponse.json()
        console.log("Branches:", branchesData)
        console.log("Users:", usersData)

        setBranches(branchesData)
        setUsers(usersData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleBranch = (branchId: string) => {
    setOpenBranches((prevOpen) => {
      const newOpen = new Set(prevOpen)
      if (newOpen.has(branchId)) {
        newOpen.delete(branchId)
      } else {
        newOpen.add(branchId)
      }
      return newOpen
    })
  }

  const handleCreateStaff = () => {
    setCreatingStaff(true)
    // This would be reset when navigation completes, but we're simulating it here
    setTimeout(() => setCreatingStaff(false), 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                {[1, 2].map((j) => (
                  <div key={j} className="p-4 border-b">
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Staff by Branch</h1>
        <Link href="/register" onClick={handleCreateStaff}>
          <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
            {creatingStaff ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create a Staff Account
              </>
            )}
          </Button>
        </Link>
      </div>

      {branches.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">No branches found</h3>
              <p className="text-muted-foreground">Create a branch to start adding staff members.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        branches.map((branch) => (
          <Collapsible
            key={branch.id}
            open={openBranches.has(branch.id)}
            onOpenChange={() => toggleBranch(branch.id)}
            className="mb-4"
          >
            <Card>
              <CardHeader className="p-0">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center rounded-none h-auto py-4 px-6"
                  >
                    <div className="flex flex-col items-start">
                      <CardTitle className="text-left">{branch.name}</CardTitle>
                      <CardDescription className="text-left">
                        {branch.city}, {branch.country}
                      </CardDescription>
                    </div>
                    <Badge variant={branch.status === "active" ? "default" : "secondary"} className="mr-4">
                      {branch.status}
                    </Badge>
                    {openBranches.has(branch.id) ? (
                      <ChevronDown className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 flex-shrink-0" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p>
                          {branch.location}, {branch.city}, {branch.state || ""}, {branch.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Opening Hours</p>
                        <p>{branch.openingHours}</p>
                      </div>
                    </div>
                  </div>

                  {users.filter((user) => user.branchId === branch.id).length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">No staff members assigned to this branch</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .filter((user) => user.branchId === branch.id)
                            .map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.fullname}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                    {user.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      )}
    </div>
  )
}

