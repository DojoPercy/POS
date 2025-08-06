'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token not found');
        return;
      }

      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (!decodedToken.companyId) {
          setError('Company ID not found');
          return;
        }

        setLoading(true);
        const response = await axios.get(
          `/api/branches?companyId=${decodedToken.companyId}`
        );
        setBranches(response.data);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.error || err.message || 'Failed to fetch branches'
        );
        console.error('Failed to fetch branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const activeBranches = branches.filter(branch => branch.status === 'active');
  const inactiveBranches = branches.filter(
    branch => branch.status === 'inactive'
  );

  return {
    branches,
    activeBranches,
    inactiveBranches,
    loading,
    error,
    refetch: () => {
      // Re-run the effect by updating a dependency
    },
  };
}
