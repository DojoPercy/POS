'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from './login';
import Skeleton from '@/components/loading';

export default function LoginPage() {
  const [checkingToken, setCheckingToken] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/owner/dashboard');
    } else {
      console.log('No token found, redirecting to login page.');
      setCheckingToken(false);
    }
  }, [router]);

  if (checkingToken) {
    return <Skeleton />;
  }

  return <Login />;
}
