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
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClipLoader from 'react-spinners/ClipLoader';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import GridShape from '@/components/GridShape';

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
  const [isChecked, setIsChecked] = useState(false);
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
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {/* Left Side - Login Form */}
          <div className="flex flex-col flex-1 lg:w-1/2 w-full">
         
            
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div
                className={`transform transition-all duration-1000 delay-700 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="mb-5 sm:mb-8">
                  <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    Sign In
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your email and password to sign in!
                  </p>
                </div>
                
                <div>
                  {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                    <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                          fill="#EB4335"
                        />
                      </svg>
                      Sign in with Google
                    </button>
                    <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                      <svg
                        width="21"
                        className="fill-current"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                      </svg>
                      Sign in with X
                    </button>
                  </div>
                  
                  <div className="relative py-3 sm:py-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                        Or
                      </span>
                    </div>
                  </div> */}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
                          Email <span className="text-error-500">*</span>
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="info@gmail.com"
                          />
                          {formData.email && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isValidEmail ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
                          Password <span className="text-error-500">*</span>
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                          {formData.password && (
                            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                              {isValidPassword ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                            Keep me logged in
                          </span>
                        </div>
                        <Link
                          href="/reset-password"
                          className="text-sm text-purple-500 hover:text-purple-600 dark:text-purple-400"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300 dark:bg-red-900/20 dark:border-red-800">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600 font-medium dark:text-red-400">{error}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Button
                          type="submit"
                          disabled={loading || isMatch || !isValidEmail || !isValidPassword}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading || isMatch ? (
                            <div className="flex items-center space-x-2">
                              <ClipLoader
                                color="#fff"
                                loading={loading || isMatch}
                                size={18}
                              />
                              <span>Signing in...</span>
                            </div>
                          ) : (
                            'Sign in'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="mt-5">
                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                      Don&apos;t have an account? {""}
                      <Link
                        href="/signup"
                        className="text-purple-500 hover:text-purple-600 dark:text-purple-400"
                      >
                        Sign Up
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Grid Shape Design */}
          <div className="lg:w-1/2 w-full h-full bg-purple-950 bg-purple/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              {/* Grid Shape */}
              <GridShape />
              <div className="flex flex-col items-center max-w-sm text-center px-8 ">
                <Link href="/" className="block mb-6 bg-white rounded-lg p-2">
                  <Image
                    width={231}
                    height={48}
                    src="/logo.png"
                    alt="Logo"
                    className="h-12 w-auto"
                  />
                </Link>
                
                <h2 className="text-2xl font-bold text-white mb-4">
                  Restaurant Chain Management
                </h2>
                
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Streamline your restaurant operations with our comprehensive management platform. 
                  From order processing to inventory control, we've got you covered.
                </p>
                
                <div className="space-y-4 w-full">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">Multi-location Control</span>
                      <p className="text-xs text-gray-300">Manage all branches seamlessly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">Real-time Analytics</span>
                      <p className="text-xs text-gray-300">Data-driven insights for growth</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">Smart Inventory</span>
                      <p className="text-xs text-gray-300">Automated stock management</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-xs text-gray-400">
                    Trusted by restaurants worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Login;
