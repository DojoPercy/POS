'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCard,
  Utensils,
  BarChart,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';

interface FormData {
  email: string;
  fullname: string;
  password: string;
  role: string;
  phone?: string;
  branchId?: string;
  status: string;
}
export default function LandingPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullname: '',
    password: '',
    role: 'owner',
    phone: '',
    branchId: '',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
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
  const scrollToSignUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
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
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'>
      {/* Header */}
      <header className='container mx-auto px-4 py-6'>
        <nav className='flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <CreditCard className='h-8 w-8 text-primary' />
            <span className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600'>
              RestaurantPOS
            </span>
          </div>
          <div className='space-x-6'>
            <Link
              href='#features'
              className='text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors'
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors'
            >
              Pricing
            </Link>
            <Link
              href='#contact'
              className='text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors'
            >
              Contact
            </Link>
            <Link
              href='/login'
              className='text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors'
            >
              <Button variant='outline'>Log In</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <h1 className='text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600'>
          Revolutionize Your Restaurant
        </h1>
        <p className='text-xl mb-10 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
          Empower your business with our cutting-edge point of sale system,
          tailored for modern restaurants.
        </p>

        <Link href='#sign-up' onClick={scrollToSignUp}>
          <Button
            size='lg'
            className='text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all'
          >
            Start Free Trial <ArrowRight className='ml-2' />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section id='features' className='container mx-auto px-4 py-20'>
        <h2 className='text-4xl font-bold mb-16 text-center text-gray-800 dark:text-white'>
          Powerful Features
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-10'>
          <FeatureCard
            icon={<CreditCard className='h-12 w-12 text-primary' />}
            title='Smart Payments'
            description='Seamlessly handle transactions with support for multiple payment methods.'
          />
          <FeatureCard
            icon={<Utensils className='h-12 w-12 text-primary' />}
            title='Dynamic Menu'
            description='Effortlessly manage and update your menu in real-time.'
          />
          <FeatureCard
            icon={<BarChart className='h-12 w-12 text-primary' />}
            title='Insightful Analytics'
            description='Gain valuable insights with detailed, real-time reporting.'
          />
          <FeatureCard
            icon={<Users className='h-12 w-12 text-primary' />}
            title='Team Management'
            description='Streamline staff scheduling and performance tracking.'
          />
          <FeatureCard
            icon={<CheckCircle className='h-12 w-12 text-primary' />}
            title='Order Precision'
            description='Minimize errors and enhance customer satisfaction with our intuitive system.'
          />
          <FeatureCard
            icon={<CreditCard className='h-12 w-12 text-primary' />}
            title='Cloud-Powered'
            description='Access your POS anytime, anywhere with our secure cloud solution.'
          />
        </div>
      </section>

      {/* Create Account Section */}
      <section
        id='create-account'
        ref={signUpRef}
        className='bg-gradient-to-r from-primary to-purple-600 text-white py-20'
      >
        <div className='container mx-auto px-4'>
          <div className='max-w-md mx-auto'>
            <h2 className='text-4xl font-bold mb-8 text-center'>
              Join RestaurantPOS Today
            </h2>
            <Card className='bg-white/10 backdrop-blur-lg border-none'>
              <CardHeader>
                <CardTitle className='text-2xl'>Create Your Account</CardTitle>
                <CardDescription className='text-gray-200'>
                  Start your 14-day free trial now
                </CardDescription>
              </CardHeader>
              <Link href='start/business-setup' className='w-full'>
                <Button size='lg' className='w-full'>
                  Get Started
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-100 dark:bg-gray-900 py-10'>
        <div className='container mx-auto px-4 text-center text-gray-600 dark:text-gray-400'>
          <p>&copy; 2023 RestaurantPOS. All rights reserved.</p>
          <div className='mt-4 space-x-4'>
            <Link href='#' className='hover:text-primary transition-colors'>
              Terms of Service
            </Link>
            <Link href='#' className='hover:text-primary transition-colors'>
              Privacy Policy
            </Link>
            <Link href='#' className='hover:text-primary transition-colors'>
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className='group hover:border-primary transition-colors'>
      <CardHeader>
        <div className='rounded-full bg-primary/10 p-3 w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors'>
          {icon}
        </div>
        <CardTitle className='text-xl text-center group-hover:text-primary transition-colors'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-gray-600 dark:text-gray-300 text-center'>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
