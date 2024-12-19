"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Edit, Trash2, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import axios from 'axios'
import { ClipLoader } from 'react-spinners'

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  status: "active" | "inactive";
}

const mockBranches: Branch[] = [
  
]

export default function BranchList() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {

    const fetchBranches = async () => {
      setLoading(true);
      try {

        const response = await axios.get("/api/branches");
        setLoading(false);
        setBranches(response.data);
      } catch (err: any) {
        console.error(
          "Failed to fetch branches:",
          err.response?.data?.error || err.message
        );
      }
    };
    fetchBranches();
  }, [])

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async  (id: any) => {
    const response = await axios.delete(`/api/branches?id=${id}`);
    
    if (response.status === 200) {
      console.log('Branch deleted successfully')
    }
    setBranches(branches.filter(branch => branch.id !== id))
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Branches</CardTitle>
          <CardDescription>Manage your restaurant branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => router.push('branches/create')}>
              Add New Branch
            </Button>
          </div>
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
    <div className=''>
      <ClipLoader
      color={"#000"}
      loading={loading}
      cssOverride={{}}
      size={20}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
    </div>
  ) : (
    filteredBranches.map((branch) => (
      <TableRow key={branch.id}>
        <TableCell className="font-medium">{branch.name}</TableCell>
        <TableCell>{branch.address}</TableCell>
        <TableCell>{branch.city}</TableCell>
        <TableCell>
          <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
            {branch.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/branch/${branch.id}`)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`branches/${branch.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelete(branch.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

