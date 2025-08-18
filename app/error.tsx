'use client';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import GridShape from '@/components/GridShape';

export const metadata: Metadata = {
  title: 'Next.js Error 500 Page | ChainPos - Dashboard ',
  description:
    'This is Next.js Error 500 page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function Error500({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1'>
      <GridShape />
      <div className='mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]'>
        <h1 className='mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl'>
          ERROR
        </h1>

        <Image
          src='/images/error/500.svg'
          alt='500'
          className='dark:hidden'
          width={472}
          height={152}
        />
        <Image
          src='/images/error/500-dark.svg'
          alt='500'
          className='hidden dark:block'
          width={472}
          height={152}
        />

        <p className='mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg'>
          Something went wrong! We're working to fix the problem.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={reset}
            className='inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
          >
            Try Again
          </button>

          <Link
            href='/'
            className='inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
          >
            Back to Home Page
          </Link>
        </div>
      </div>
      {/* <!-- Footer --> */}
      <p className='absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400'>
        &copy; {new Date().getFullYear()} - ChainPos
      </p>
    </div>
  );
}
