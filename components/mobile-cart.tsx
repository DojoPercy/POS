'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  User,
  Truck,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartItem {
  menuItem: any;
  selectedPrice: any;
  quantity: number;
  notes?: string;
}

interface MobileCartProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  company: any;
  selectedBranch: any;
  orderType: 'delivery' | 'pickup';
}

export default function MobileCart({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  company,
  selectedBranch,
  orderType,
}: MobileCartProps) {
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.selectedPrice.price * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={onClose}
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <ShoppingCart className='h-6 w-6 text-purple-600' />
                <div>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Your Cart
                  </h2>
                  <p className='text-sm text-gray-600'>
                    {getCartItemCount()} items
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='h-8 w-8 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* Order Type Selection */}
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>
                Order Type
              </h3>
              <div className='flex gap-2'>
                <Button
                  variant={orderType === 'pickup' ? 'default' : 'outline'}
                  size='sm'
                  className={
                    orderType === 'pickup'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : ''
                  }
                >
                  <User className='h-4 w-4 mr-1' />
                  Pickup
                </Button>
                <Button
                  variant={orderType === 'delivery' ? 'default' : 'outline'}
                  size='sm'
                  className={
                    orderType === 'delivery'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : ''
                  }
                >
                  <Truck className='h-4 w-4 mr-1' />
                  Delivery
                </Button>
              </div>
            </div>

            {/* Branch Info */}
            {selectedBranch && (
              <div className='p-4 border-b border-gray-200 bg-gray-50'>
                <div className='flex items-center gap-2 mb-2'>
                  <MapPin className='h-4 w-4 text-purple-600' />
                  <span className='text-sm font-medium text-gray-700'>
                    Selected Branch
                  </span>
                </div>
                <h4 className='font-medium text-gray-900 text-sm'>
                  {selectedBranch.name}
                </h4>
                <p className='text-xs text-gray-600'>
                  {selectedBranch.location}
                </p>
                {selectedBranch.openingHours && (
                  <div className='flex items-center gap-1 text-xs text-gray-600 mt-1'>
                    <Clock className='h-3 w-3' />
                    <span>{selectedBranch.openingHours}</span>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className='flex-1 overflow-hidden'>
              {cart.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full p-8'>
                  <ShoppingCart className='h-16 w-16 text-gray-300 mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Your cart is empty
                  </h3>
                  <p className='text-gray-600 text-center'>
                    Add some delicious items to get started!
                  </p>
                </div>
              ) : (
                <ScrollArea className='h-full'>
                  <div className='p-4 space-y-3'>
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.menuItem.id}-${item.selectedPrice.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-medium text-gray-900 text-sm truncate'>
                            {item.menuItem.name}
                          </h4>
                          <p className='text-xs text-gray-600'>
                            {item.selectedPrice.name}
                          </p>
                          {item.notes && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Note: {item.notes}
                            </p>
                          )}
                        </div>

                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                onUpdateQuantity(index, item.quantity - 1)
                              }
                              className='h-6 w-6 p-0'
                            >
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='text-sm font-medium w-6 text-center'>
                              {item.quantity}
                            </span>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                onUpdateQuantity(index, item.quantity + 1)
                              }
                              className='h-6 w-6 p-0'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>

                          <div className='text-right min-w-0'>
                            <p className='font-medium text-purple-600 text-sm'>
                              {company?.currency}{' '}
                              {(
                                item.selectedPrice.price * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>

                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => onRemoveItem(index)}
                            className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className='border-t border-gray-200 p-4 space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-900'>Subtotal</span>
                  <span className='font-semibold text-purple-600 text-lg'>
                    {company?.currency} {getCartTotal().toFixed(2)}
                  </span>
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={onClearCart}
                    className='flex-1'
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={onCheckout}
                    className='flex-1 bg-purple-600 hover:bg-purple-700'
                  >
                    <CreditCard className='h-4 w-4 mr-2' />
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
