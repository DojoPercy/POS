'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  city?: string;
  country?: string;
  status: string;
  createdAt: string;
}

export default function OrderingLandingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/company/public');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
          setFilteredCompanies(data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(
      company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.country?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const getCompanySlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-purple-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center mb-12'>
            <Skeleton className='h-12 w-96 mx-auto mb-4' />
            <Skeleton className='h-6 w-64 mx-auto' />
          </div>

          <div className='relative mb-8'>
            <Skeleton className='h-12 w-full max-w-md mx-auto' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className='bg-white border-purple-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <Skeleton className='h-12 w-12 rounded-full' />
                    <div className='flex-1'>
                      <Skeleton className='h-4 w-32 mb-2' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                  <Skeleton className='h-4 w-full mb-2' />
                  <Skeleton className='h-4 w-3/4' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-purple-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-purple-200'>
        <div className='container mx-auto px-4 py-6'>
          <div className='text-center'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center justify-center gap-3 mb-4'
            >
              <ShoppingBag className='h-8 w-8 text-purple-600' />
              <h1 className='text-3xl font-bold text-gray-900'>
                Online Ordering
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='text-lg text-gray-600 max-w-2xl mx-auto'
            >
              Discover and order from your favorite local businesses. Choose
              from a variety of restaurants and shops in your area.
            </motion.p>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='relative mb-8 max-w-md mx-auto'
        >
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search companies, cities, or countries...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10 bg-white border-purple-200 focus:border-purple-500'
          />
        </motion.div>

        {/* Companies Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <AnimatePresence>
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/order/${getCompanySlug(company.name)}`}>
                  <Card className='h-full bg-white hover:shadow-lg transition-all duration-300 border-purple-200 hover:border-purple-300 cursor-pointer group'>
                    <CardContent className='p-6'>
                      <div className='flex items-center gap-4 mb-4'>
                        <div className='h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden'>
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <Store className='h-6 w-6 text-purple-600' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-900 group-hover:text-purple-600 transition-colors'>
                            {company.name}
                          </h3>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            {company.city && (
                              <>
                                <MapPin className='h-3 w-3' />
                                <span>{company.city}</span>
                              </>
                            )}
                            {company.country && company.city && (
                              <span>, {company.country}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors' />
                      </div>

                      {company.description && (
                        <p className='text-sm text-gray-600 line-clamp-2 mb-4'>
                          {company.description}
                        </p>
                      )}

                      <div className='flex items-center justify-between'>
                        <Badge
                          variant='outline'
                          className='border-purple-200 text-purple-700'
                        >
                          Online Ordering
                        </Badge>
                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                          <Star className='h-3 w-3 text-yellow-500 fill-current' />
                          <span>4.5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCompanies.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-12'
          >
            <Store className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No companies found
            </h3>
            <p className='text-gray-600'>
              {searchQuery
                ? `No companies match "${searchQuery}". Try a different search term.`
                : 'No companies are currently available for online ordering.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className='bg-white border-t border-purple-200 mt-12'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>
            <p className='text-gray-600'>
              © 2024 Online Ordering Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
