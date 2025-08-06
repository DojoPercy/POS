'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ClipLoader from 'react-spinners/ClipLoader';

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  openingHours: string;
  status: 'active' | 'inactive' | '';
  managerId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface User {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}

export default function BranchManagement() {
  const { branchId } = useParams();

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    location: '',
    city: '',
    state: '',
    country: '',
    openingHours: '',
    status: '',
    managerId: '',
    createdBy: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch users and branches on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        const managers = response.data.filter(
          (user: User) => user.role === 'manager',
        );
        setUsers(managers);
      } catch (err: any) {
        console.error(
          'Failed to fetch users:',
          err.response?.data?.error || err.message,
        );
      }
    };

    const fetchBranch = async () => {
      try {
        const response = await axios.get(`/api/branches?id=${branchId}`);
        setFormData(response.data);
      } catch (err: any) {
        console.error(
          'Failed to fetch branch:',
          err.response?.data?.error || err.message,
        );
      }
    };
    fetchBranch();
    fetchUsers();
  });

  const handleChange = (name: string, value: string) => {
    console.log(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userId = '675da00fe042d6a4dab19c40';
      console.log('userId', formData.status);
      const response = await axios.put('/api/branches', {
        id: branchId,
        ...formData,
      });
      setSuccessMessage(
        'Branch Updated Succefully successfully! Redirecting...',
      );
      setLoading(false);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to update branch. Please try again.',
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-4'>
      <Card className='w-full max-w-2xl mb-6'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center'>
            <Utensils className='h-12 w-12 text-gray-900' />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>
            Edit Branch
          </CardTitle>
          <CardDescription className='text-center'>
            Enter the details for the restaurant branch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Branch Name</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Textarea
                id='address'
                value={formData.location}
                onChange={(e: { target: { value: string } }) =>
                  handleChange('location', e.target.value)
                }
                required
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Input
                  id='state'
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='country'>Country</Label>
                <Input
                  id='country'
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='managerId'>Managers</Label>
                <Select
                  onValueChange={value => handleChange('managerId', value)}
                  value={formData.managerId || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a manager' />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='openingHours'>Opening Hours</Label>
              <Input
                id='openingHours'
                value={formData.openingHours}
                onChange={e => handleChange('openingHours', e.target.value)}
                placeholder='e.g., 9:00 AM - 10:00 PM'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                onValueChange={value => handleChange('status', value)}
                defaultValue={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <Button type='submit' className='w-full'>
              {loading ? (
                <ClipLoader
                  color={'#fff'}
                  loading={loading}
                  cssOverride={{}}
                  size={20}
                  aria-label='Loading Spinner'
                  data-testid='loader'
                />
              ) : (
                'Update Branch'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
