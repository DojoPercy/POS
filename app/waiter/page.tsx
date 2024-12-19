"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserById } from '@/lib/auth'
import { getBranchById } from '@/lib/branch'
import { Utensils } from "lucide-react";
import { jwtDecode } from 'jwt-decode'
import { Clock, MapPin, Building, User } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId?: string;
  name: string; // Added name field
}

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  openingHours: string;
  status: "active" | "inactive" | "";
  managerId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface DecodedToken {
  role: string; 
  userId?: string; 
  [key: string]: any;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndBranch = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found");
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const userDetails = await getUserById(decodedToken.userId ?? '')
        const branchDetails = await getBranchById(userDetails.branchId ?? '')
        
        setUser(userDetails)
        setBranch(branchDetails)
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserAndBranch();
  }, [])

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!user || !branch) {
    return <div className="text-center py-10">Failed to load user profile.</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-8">
                  <Utensils className="mx-auto h-12 w-12 text-gray-900" />
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Restaurant POS System</h2>
                </div>
        <>
            <h1 className="text-2xl font-semibold text-center">Welcome {user.fullname}</h1>

        </>
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullname}`} alt={user.fullname} />
              <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileItem icon={<User className="w-4 h-4" />} label="User ID" value={user.id} />
            <ProfileItem icon={<Building className="w-4 h-4" />} label="Branch" value={branch.name} />
            <ProfileItem icon={<MapPin className="w-4 h-4" />} label="Location" value={`${branch.city}, ${branch.state || ''} ${branch.country}`} />
            <ProfileItem icon={<Clock className="w-4 h-4" />} label="Opening Hours" value={branch.openingHours} />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Branch Status</h3>
            <Badge variant={branch.status === 'active' ? 'default' : 'destructive'}>
              {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
            </Badge>
          </div>
          <Link href={'waiter/order/new'}>
          <button className=' bg-black text-white px-10 py-2 rounded-sm '>Create Orders</button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
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

function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

