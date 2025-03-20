"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserById } from "@/lib/auth"
import { getBranchById } from "@/lib/branch"
import { Utensils, Plus } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { Clock, MapPin, Building, User } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  fullname: string
  status: string
  email: string
  role: string
  branchId?: string
  name: string
}

interface Branch {
  id: string
  name: string
  location: string
  city: string
  state?: string
  country: string
  openingHours: string
  status: "active" | "inactive" | ""
  managerId?: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
}

interface Company {
  id: string
  name: string
  location: string
  city: string
  state?: string
  country: string
  logo?: string
}

interface DecodedToken {
  role: string
  userId?: string
  [key: string]: any
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserBranchAndCompanies = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token not found")
          return
        }
        const decodedToken: DecodedToken = jwtDecode(token)
        const userDetails = await getUserById(decodedToken.userId ?? "")
        const branchDetails = await getBranchById(userDetails.branchId ?? "")
        const companiesResponse = await fetch("/api/company")
        const companiesData = await companiesResponse.json()

        setUser(userDetails)
        setBranch(branchDetails)
        setCompanies(companiesData)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserBranchAndCompanies()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user || !branch) {
    return <div className="text-center py-10">Failed to load dashboard.</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <Utensils className="mx-auto h-12 w-12 text-gray-900" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Restaurant POS System</h2>
      </div>
      <h1 className="text-2xl font-semibold text-center mb-8">Welcome {user.fullname}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullname}`}
                  alt={user.fullname}
                />
                <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <ProfileItem icon={<User className="w-4 h-4" />} label="User ID" value={user.id} />
              <ProfileItem icon={<Building className="w-4 h-4" />} label="Branch" value={branch.name} />
              <ProfileItem
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={`${branch.city}, ${branch.state || ""} ${branch.country}`}
              />
              <ProfileItem icon={<Clock className="w-4 h-4" />} label="Opening Hours" value={branch.openingHours} />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Your Companies</CardTitle>
              
            </div>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Companies Added Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by adding your first restaurant company.
                </p>
                <Link href="/company_setup">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Company
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {companies.map((company) => (
                  <Card key={company.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={company.logo || `https://api.dicebear.com/6.x/initials/svg?seed=${company.name}`}
                            alt={company.name}
                          />
                          <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {company.city}, {company.country}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-12 mx-auto rounded-full" />
        <Skeleton className="h-8 w-64 mx-auto mt-6" />
      </div>
      <Skeleton className="h-8 w-48 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

