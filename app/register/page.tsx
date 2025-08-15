'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { getBranches } from '@/lib/branch';
import { jwtDecode } from 'jwt-decode';

interface FormData {
  email: string;
  fullname: string;
  password: string;
  role: string;
  phone?: string;
  branchId?: string;
  companyId?: string;
  status: string;
}
interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullname: '',
    password: '',
    role: '',
    phone: '',
    branchId: '',
    status: 'active',
    companyId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);

  const router = useRouter();

  useEffect(() => {
    setLoadingBranches(true);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        setDecodedToken(decodedToken);

        const branches = await getBranches(decodedToken.companyId || '');
        setLoadingBranches(false);

        if (decodedToken.role === 'owner') {
          setBranches(branches);
        } else if (decodedToken.role === 'manager') {
          const branch = branches.find(
            (branch: { id: string }) => branch.id === decodedToken.branchId
          );
          if (branch) {
            setBranches([branch]);
            setFormData(prev => ({
              ...prev,
              branchId: branch.id,
              companyId: decodedToken.companyId,
            }));
          }
        }
      } catch (error) {
        setLoadingBranches(false);
        console.error('Error fetching branches:', error);
      }
    })();
  }, []);

  const handleChange = (name: string, value: string, isSelect?: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (isSelect && name === 'branchId') {
      setFormData(prev => ({
        ...prev,
        branchId: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      formData.companyId = decodedToken?.companyId;
      const response = await axios.post('/api/users', formData);
      setLoading(false);
      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center'>
            <Utensils className='h-12 w-12 text-gray-900' />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>
            Register for POS
          </CardTitle>
          <CardDescription className='text-center'>
            Create an account for the restaurant POS system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullname'>Full Name</Label>
              <Input
                id='fullname'
                type='text'
                placeholder='Full Name'
                value={formData.fullname}
                onChange={e => handleChange('fullname', e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='your@email.com'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select
                onValueChange={value => handleChange('role', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select Role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value='owner'
                    disabled={decodedToken?.role !== 'owner'}
                  >
                    Owner
                  </SelectItem>
                  <SelectItem
                    value='manager'
                    disabled={decodedToken?.role !== 'owner'}
                  >
                    Manager
                  </SelectItem>
                  <SelectItem value='waiter'>Waiter</SelectItem>
                  <SelectItem value='kitchen'>Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone (optional)</Label>
              <Input
                id='phone'
                type='tel'
                placeholder='Your phone number'
                value={formData.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>
            {decodedToken?.role === 'owner' && (
              <div className='space-y-2'>
                <Label htmlFor='branchId'>Branch ID (optional)</Label>
                <Select
                  value={formData.branchId || ''}
                  onValueChange={e => handleChange('branchId', e, true)}
                  disabled={loadingBranches || decodedToken.role !== 'owner'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Branch' />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBranches ? (
                      <ClipLoader
                        color={'#000'}
                        loading={loading}
                        size={20}
                        aria-label='Loading Spinner'
                      />
                    ) : branches.length > 0 ? (
                      branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value=''>No branches available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                  size={20}
                  aria-label='Loading Spinner'
                />
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
