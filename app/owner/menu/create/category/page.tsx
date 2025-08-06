import MenuCategoryForm from '@/components/menu-category-form';
import React from 'react';

export default function MenuCategoriesPage() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6'>Menu Categories</h1>
      <MenuCategoryForm />
    </div>
  );
}
