"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Plus } from 'lucide-react'

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

export default function StaffByBranch() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openBranches, setOpenBranches] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesResponse, usersResponse] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/users')
        ])

        if (!branchesResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const branchesData = await branchesResponse.json()
        const usersData = await usersResponse.json()

        setBranches(branchesData)
        setUsers(usersData)
      } catch (err) {
        setError('An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleBranch = (branchId: string) => {
    setOpenBranches(prevOpen => {
      const newOpen = new Set(prevOpen)
      if (newOpen.has(branchId)) {
        newOpen.delete(branchId)
      } else {
        newOpen.add(branchId)
      }
      return newOpen
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Staff by Branch</h1>
      <div className='flex justify-end w-full'>
        <Link href="/register">
        <button className='bg-black px-10 py-2 rounded-md m-10 text-white flex justify-center items-center gap-3'><Plus color='#fff' size={20} className='pr-'/> Create a Staff Account</button>
        </Link>
      </div>
      {branches.map(branch => (
        <Collapsible
          key={branch.id}
          open={openBranches.has(branch.id)}
          onOpenChange={() => toggleBranch(branch.id)}
        >
          <Card className="mb-4">
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-between items-center">
                  <CardTitle>{branch.name}</CardTitle>
                  {openBranches.has(branch.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="mb-4">
                  <p><strong>Location:</strong> {branch.location}, {branch.city}, {branch.state}, {branch.country}</p>
                  <p><strong>Opening Hours:</strong> {branch.openingHours}</p>
                  <p><strong>Status:</strong> <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>{branch.status}</Badge></p>
                </div>
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
                      .filter(user => user.branchId === branch.id)
                      .map(user => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullname}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}

