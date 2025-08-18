'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Minus, Plus, ShoppingBag, Star, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PriceType, MenuItem } from '@/lib/types/types';

type MenuItemCardProps = {
  item: MenuItem;
  currency: string;
  onAddToCart: (
    item: MenuItem,
    selectedPrice: PriceType,
    quantity: number,
    notes?: string
  ) => void;
};

export default function MenuItemCard({
  item,
  onAddToCart,
  currency,
}: MenuItemCardProps) {
  const itemPrices = item.price || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceType | null>(
    Array.isArray(itemPrices) && itemPrices.length > 0 ? itemPrices[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    if (selectedPrice) {
      onAddToCart(item, selectedPrice, quantity);
      setQuantity(1);
      setIsModalOpen(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const rating = 4.5;
  const isAvailable = true;
  const basePrice =
    Array.isArray(itemPrices) && itemPrices.length > 0
      ? itemPrices[0].price
      : typeof itemPrices === 'object' && 'price' in itemPrices
        ? itemPrices.price
        : 0;

  return (
    <>
      {/* Simplified Card */}
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card
          className='cursor-pointer overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-gray-100'
          onClick={() => setIsModalOpen(true)}
        >
          {/* Image */}
          <div className='relative w-full h-40 overflow-hidden'>
            <Image
              src={item.imageUrl || '/placeholder.svg?height=160&width=240'}
              alt={item.name}
              fill
              className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
            />

            {/* Price Badge */}
            <div className='absolute top-3 right-3'>
              <Badge className='bg-white/90 text-gray-900 font-semibold'>
                {currency}
                {basePrice.toFixed(2)}
              </Badge>
            </div>

            {/* Rating Badge */}
            <div className='absolute top-3 left-3'>
              <Badge className='bg-amber-500 text-white flex items-center gap-1'>
                <Star className='h-3 w-3 fill-current' />
                {rating}
              </Badge>
            </div>

            {!isAvailable && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                <Badge variant='destructive'>Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className='p-4'>
            <h3 className='font-semibold text-lg text-gray-900 mb-2 line-clamp-1'>
              {item.name}
            </h3>
            <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
              {item.description ||
                'Delicious menu item prepared with fresh ingredients'}
            </p>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1 text-xs text-gray-500'>
                <Clock className='h-3 w-3' />
                <span>15-20 min</span>
              </div>
              <Button size='sm' className='bg-primary hover:bg-primary/90'>
                View Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>{item.name}</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsModalOpen(false)}
                className='h-6 w-6'
              >
                <X className='h-4 w-4' />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Item Image & Info */}
            <div className='flex gap-4'>
              <div className='relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'>
                <Image
                  src={item.imageUrl || '/placeholder.svg?height=80&width=80'}
                  alt={item.name}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg'>{item.name}</h3>
                <p className='text-sm text-gray-600 line-clamp-2'>
                  {item.description || 'Delicious menu item'}
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  <Star className='h-3 w-3 fill-amber-500 text-amber-500' />
                  <span className='text-sm text-gray-600'>{rating}</span>
                </div>
              </div>
            </div>

            {/* Price Selection */}
            <div className='space-y-3'>
              <h4 className='font-medium text-gray-900'>Select Size</h4>
              <div className='space-y-2'>
                {(Array.isArray(itemPrices) ? itemPrices : [itemPrices]).map(
                  (price: PriceType) => (
                    <div
                      key={price.id}
                      className={`
                      flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        selectedPrice?.id === price.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                      onClick={() => setSelectedPrice(price)}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${selectedPrice?.id === price.id ? 'border-primary' : 'border-gray-300'}
                      `}
                        >
                          {selectedPrice?.id === price.id && (
                            <div className='w-2 h-2 rounded-full bg-primary' />
                          )}
                        </div>
                        <span className='font-medium'>{price.name}</span>
                      </div>
                      <span className='font-semibold text-primary'>
                        {currency}
                        {price.price.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className='space-y-3'>
              <h4 className='font-medium text-gray-900'>Quantity</h4>
              <div className='flex items-center justify-center gap-4'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className='h-10 w-10 bg-transparent'
                >
                  <Minus className='h-4 w-4' />
                </Button>
                <div className='w-16 h-10 flex items-center justify-center bg-gray-50 rounded-md border'>
                  <span className='font-semibold text-lg'>{quantity}</span>
                </div>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={incrementQuantity}
                  disabled={quantity >= 99}
                  className='h-10 w-10'
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Total & Add to Cart */}
            <div className='space-y-4 pt-4 border-t'>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-medium'>Total:</span>
                <span className='text-xl font-bold text-primary'>
                  {currency}
                  {selectedPrice
                    ? (selectedPrice.price * quantity).toFixed(2)
                    : '0.00'}
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!selectedPrice || !isAvailable}
                className='w-full h-12 bg-primary hover:bg-primary/90 flex items-center gap-2'
              >
                <ShoppingBag className='h-5 w-5' />
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
