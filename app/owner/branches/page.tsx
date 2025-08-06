'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MapPin,
  Users,
  Star,
  Heart,
  MoreVertical,
  Building2,
  Filter,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/components/error-boundary';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import BranchForm from '@/components/branchmanagement';
import AttendanceQRCode from '@/components/attendance-qr-code';

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  status: 'active' | 'inactive';
  managerId?: string;
  openingHours?: string;
  employeeCount?: number;
  rating?: number;
  image?: string;
  createdAt?: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

// Loading skeleton component
const BranchSkeleton = () => (
  <Card className='overflow-hidden'>
    <div className='aspect-video bg-slate-200 animate-pulse' />
    <CardContent className='p-4 space-y-3'>
      <Skeleton className='h-6 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <div className='flex gap-2'>
        <Skeleton className='h-6 w-16' />
        <Skeleton className='h-6 w-20' />
      </div>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-8 w-20' />
      </div>
    </CardContent>
  </Card>
);

// Mobile branch card component
const MobileBranchCard = ({
  branch,
  onEdit,
  onDelete,
  onShowQR,
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  onShowQR: (branch: Branch) => void;
}) => (
  <Card className='overflow-hidden'>
    <div className='relative'>
      <div className='aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center'>
        {' '}
        <img
          src={branch.imageUrl || '/images/default-branch.jpg'}
          alt={branch.name}
          className='object-cover w-full h-full'
          style={{ objectFit: 'cover' }}
        />
      </div>
      <Badge
        variant={branch.status === 'active' ? 'default' : 'secondary'}
        className='absolute top-2 right-2'
      >
        {branch.status}
      </Badge>
    </div>
    <CardContent className='p-4 space-y-3'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-slate-900 truncate'>
            {branch.name}
          </h3>
          <p className='text-sm text-slate-600 truncate flex items-center gap-1 mt-1'>
            <MapPin className='h-3 w-3' />
            {branch.city}, {branch.country}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowQR(branch)}>
              <QrCode className='h-4 w-4 mr-2' />
              Attendance QR Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(branch.id)}
              className='text-red-600'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1'>
            <Users className='h-4 w-4 text-slate-500' />
            {branch.employeeCount || 0}
          </span>
          <span className='flex items-center gap-1'>
            <Star className='h-4 w-4 text-yellow-500' />
            {branch.rating || 'N/A'}
          </span>
        </div>
        <Button variant='outline' size='sm' onClick={() => onShowQR(branch)}>
          <QrCode className='h-4 w-4 mr-1' />
          QR Code
        </Button>
        <Button variant='outline' size='sm'>
          View Details
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Desktop branch card component
const DesktopBranchCard = ({
  branch,
  onEdit,
  onDelete,
  onShowQR,
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  onShowQR: (branch: Branch) => void;
}) => (
  <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
    <div className='relative'>
      <div className='aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center'>
        <img
          src={branch.imageUrl || '/images/default-branch.jpg'}
          alt={branch.name}
          className='object-cover w-full h-full'
          style={{ objectFit: 'cover' }}
        />
      </div>
      <Badge
        variant={branch.status === 'active' ? 'default' : 'secondary'}
        className='absolute top-3 right-3'
      >
        {branch.status}
      </Badge>
    </div>
    <CardContent className='p-6 space-y-4'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 min-w-0'>
          <h3 className='text-lg font-semibold text-slate-900 truncate'>
            {branch.name}
          </h3>
          <p className='text-sm text-slate-600 mt-1 flex items-center gap-1'>
            <MapPin className='h-4 w-4' />
            {branch.address}, {branch.city}, {branch.country}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit Branch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowQR(branch)}>
              <QrCode className='h-4 w-4 mr-2' />
              Attendance QR Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(branch.id)}
              className='text-red-600'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete Branch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-slate-500' />
          <span>{branch.employeeCount || 0} employees</span>
        </div>
        <div className='flex items-center gap-2'>
          <Star className='h-4 w-4 text-yellow-500' />
          <span>Rating: {branch.rating || 'N/A'}</span>
        </div>
      </div>

      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='flex-1'
          onClick={() => onShowQR(branch)}
        >
          <QrCode className='h-4 w-4 mr-1' />
          QR Code
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function BranchManagement() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBranchForQR, setSelectedBranchForQR] = useState<Branch | null>(
    null,
  );

  // Memoized filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || branch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchTerm, statusFilter]);

  // Fetch branches with error handling
  const fetchBranches = useCallback(
    async (companyId?: string) => {
      if (!companyId) return;

      setLoading(true);
      clearError();

      try {
        const response = await axios.get(
          `/api/branches?companyId=${companyId}`,
        );

        // Add mock data for demo purposes
        const branchesWithMockData = response.data.map(
          (branch: Branch, index: number) => ({
            ...branch,
            employeeCount: Math.floor(Math.random() * 50) + 10,
            rating: (Math.random() * 2 + 3).toFixed(1),
            image: 'https://via.placeholder.com/300x200',
          }),
        );

        setBranches(branchesWithMockData);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch branches';
        handleError(new Error(errorMessage));
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError, toast],
  );

  // Initialize component
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleError(new Error('Authentication token not found'));
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setDecodedToken(decoded);
      fetchBranches(decoded.companyId);
    } catch (err) {
      handleError(new Error('Invalid authentication token'));
    }
  }, [fetchBranches, handleError]);

  const handleEdit = useCallback((branch: Branch) => {
    setSelectedBranch(branch);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this branch?')) return;

      try {
        await axios.delete(`/api/branches/${id}`);
        setBranches(prev => prev.filter(branch => branch.id !== id));
        toast({
          title: 'Success',
          description: 'Branch deleted successfully',
        });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Failed to delete branch';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleBranchCreated = useCallback(
    (newBranch: Branch) => {
      setBranches(prev => [...prev, newBranch]);
      setCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
    },
    [toast],
  );

  const handleBranchUpdated = useCallback(
    (updatedBranch: Branch) => {
      setBranches(prev =>
        prev.map(branch =>
          branch.id === updatedBranch.id ? updatedBranch : branch,
        ),
      );
      setEditDialogOpen(false);
      setSelectedBranch(null);
      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });
    },
    [toast],
  );

  const handleShowQRCode = useCallback((branch: Branch) => {
    setSelectedBranchForQR(branch);
    setQrDialogOpen(true);
  }, []);

  if (error) {
    return (
      <div className='p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error.message}. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-slate-900'>
            Branch Management
          </h1>
          <p className='text-slate-600 mt-1'>
            Manage your restaurant branches and locations
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Branch
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Search branches...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex border rounded-md'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='rounded-r-none'
            >
              <Grid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='rounded-l-none'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Total Branches
                </p>
                <p className='text-2xl font-bold text-slate-900'>
                  {branches.length}
                </p>
              </div>
              <Building2 className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Active Branches
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {branches.filter(b => b.status === 'active').length}
                </p>
              </div>
              <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Total Employees
                </p>
                <p className='text-2xl font-bold text-slate-900'>
                  {branches.reduce((sum, b) => sum + (b.employeeCount || 0), 0)}
                </p>
              </div>
              <Users className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Grid/List */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <BranchSkeleton key={i} />
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <Building2 className='h-12 w-12 text-slate-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-900 mb-2'>
              No branches found
            </h3>
            <p className='text-slate-600 mb-4'>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first branch'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add First Branch
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredBranches.map(branch =>
            isMobile ? (
              <MobileBranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowQR={handleShowQRCode}
              />
            ) : (
              <DesktopBranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowQR={handleShowQRCode}
              />
            ),
          )}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <BranchForm onSuccess={handleBranchCreated} />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm
              branch={selectedBranch}
              onSuccess={handleBranchUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <QrCode className='h-5 w-5' />
              Attendance QR Code
            </DialogTitle>
          </DialogHeader>
          {selectedBranchForQR && (
            <AttendanceQRCode
              branchId={selectedBranchForQR.id}
              branchName={selectedBranchForQR.name}
              branchAddress={`${selectedBranchForQR.address}, ${selectedBranchForQR.city}, ${selectedBranchForQR.country}`}
              employeeCount={selectedBranchForQR.employeeCount}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
