'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/authSlice';
import {
  Mail,
  Lock,
  Building2,
  Store,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClipLoader from 'react-spinners/ClipLoader';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';

interface FormData {
  email: string;
  password: string;
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValidEmail(emailRegex.test(value));
    }
    if (name === 'password') {
      setIsValidPassword(value.length >= 2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/login', formData);
      if (response.status === 200) {
        const token = response.data.token;
        if (!token) throw new Error('Token is missing in the response.');

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decoded: DecodedToken = jwtDecode(token);
        dispatch(setUser({ token, user: decoded }));
        setIsMatch(true);
        router.push('/');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500'></div>
      </div>

      {/* Left Side - Hero Section */}
      <div className='hidden lg:flex lg:w-1/2 relative items-center justify-center'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-indigo-900/90'></div>
        <Image
          src='/loginbg.png'
          alt='Modern restaurant interior with elegant dining setup'
          fill
          className='object-cover mix-blend-overlay'
          priority
        />
        <div className='relative z-10 flex flex-col items-center justify-center p-8 text-white text-center max-w-lg'>
          <div
            className={`transform transition-all duration-1000 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl'>
              <Building2 className='w-8 h-8 text-white' />
            </div>
            <h2 className='text-4xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
              Elevate Your <br /> Restaurant Empire
            </h2>
            <p className='text-lg mb-8 text-blue-100 leading-relaxed'>
              Transform your restaurant chain with intelligent management,
              real-time insights, and seamless operations across all locations.
            </p>
          </div>

          <div
            className={`space-y-4 text-left w-full max-w-sm transform transition-all duration-1000 delay-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className='flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg'>
                <Building2 className='w-5 h-5 text-white' />
              </div>
              <div>
                <span className='text-base font-semibold text-white'>
                  Multi-location Control
                </span>
                <p className='text-xs text-blue-200'>
                  Manage all branches from one dashboard
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20'>
              <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg'>
                <Store className='w-5 h-5 text-white' />
              </div>
              <div>
                <span className='text-base font-semibold text-white'>
                  Centralized Operations
                </span>
                <p className='text-xs text-blue-200'>
                  Streamline workflows across your chain
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20'>
              <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg'>
                <div className='w-5 h-5 bg-white rounded'></div>
              </div>
              <div>
                <span className='text-base font-semibold text-white'>
                  Advanced Analytics
                </span>
                <p className='text-xs text-blue-200'>
                  Data-driven insights for growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12'>
        <div
          className={`w-full max-w-md transform transition-all duration-1000 delay-500 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {/* Logo and Brand */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300'>
              <Building2 className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              ChainPOS
            </h1>
            <p className='text-base text-gray-600 mb-1 font-medium'>
              Restaurant Chain Management Platform
            </p>
            <p className='text-sm text-gray-500'>
              Welcome back! Sign in to your dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20'>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Email Address
                  </label>
                  <div className='relative group'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200' />
                    <Input
                      id='email'
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className='pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all duration-200'
                      placeholder='your@company.com'
                    />
                    {formData.email && (
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        {isValidEmail ? (
                          <CheckCircle className='w-5 h-5 text-green-500' />
                        ) : (
                          <AlertCircle className='w-5 h-5 text-red-500' />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Password
                  </label>
                  <div className='relative group'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200' />
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className='pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all duration-200'
                      placeholder='••••••••'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200'
                    >
                      {showPassword ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </button>
                    {formData.password && (
                      <div className='absolute right-10 top-1/2 transform -translate-y-1/2'>
                        {isValidPassword ? (
                          <CheckCircle className='w-5 h-5 text-green-500' />
                        ) : (
                          <AlertCircle className='w-5 h-5 text-red-500' />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className='bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300'>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                    <p className='text-sm text-red-600 font-medium'>{error}</p>
                  </div>
                </div>
              )}

              <Button
                type='submit'
                disabled={
                  loading || isMatch || !isValidEmail || !isValidPassword
                }
                className='w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {loading || isMatch ? (
                  <div className='flex items-center space-x-2'>
                    <ClipLoader
                      color='#fff'
                      loading={loading || isMatch}
                      size={18}
                    />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in to Dashboard'
                )}
              </Button>
            </form>

            {/* Additional Options */}
            <div className='mt-6 space-y-3'>
              <div className='text-center'>
                <button className='text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline'>
                  Forgot your password?
                </button>
              </div>

              <div className='border-t border-gray-200 pt-4'>
                <p className='text-center text-sm text-gray-500'>
                  Need access?{' '}
                  <button className='text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline'>
                    Contact your administrator
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 text-center'>
            <p className='text-xs text-gray-400'>
              © 2025 ChainPOS. Enterprise restaurant management solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
