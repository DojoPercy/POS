'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Menu as MenuIcon,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import MobileCart from '@/components/mobile-cart';
import CheckoutForm from '@/components/checkout-form';
import { calculateDistance, findNearestBranch } from '@/lib/order-utils';

interface Company {
  id: string;
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  enableDiscount: boolean;
  paymentMethods: string[];
  orderProcessingMode: string;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  status: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

interface PriceType {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  price: PriceType[] | PriceType;
  isAvailable: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  selectedPrice: PriceType;
  quantity: number;
  notes?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

export default function CompanyOrderingPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const { toast } = useToast();

  // State
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/company/by-slug/${companySlug}`);
        if (!response.ok) {
          throw new Error('Company not found');
        }
        const companyData = await response.json();
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast({
          title: 'Error',
          description: 'Failed to load company information.',
          variant: 'destructive',
        });
      }
    };

    if (companySlug) {
      fetchCompanyData();
    }
  }, [companySlug, toast]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!company) return;

      try {
        const response = await fetch(`/api/branches?companyId=${company.id}`);
        if (response.ok) {
          const branchesData = await response.json();
          const activeBranches = branchesData.filter(
            (branch: Branch) => branch.status === 'active'
          );
          setBranches(activeBranches);

          // Set first branch as default if no branch is selected
          if (activeBranches.length > 0 && !selectedBranch) {
            setSelectedBranch(activeBranches[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, [company, selectedBranch]);

  // Fetch menu items and categories
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!company) return;

      try {
        const [menuResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/menu?companyId=${company.id}`),
          fetch(`/api/menu/category?companyId=${company.id}`),
        ]);

        if (menuResponse.ok && categoriesResponse.ok) {
          const [menuData, categoriesData] = await Promise.all([
            menuResponse.json(),
            categoriesResponse.json(),
          ]);
          console.log(`api/menu?companyId=${company.id}`, menuData);

          setMenuItems(menuData);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [company]);

  // Get user location
  useEffect(() => {
    const getUserLocation = () => {
      setIsLocationLoading(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setIsLocationLoading(false);
          },
          error => {
            console.error('Error getting location:', error);
            setIsLocationLoading(false);
          }
        );
      } else {
        setIsLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Find nearest branch when user location is available
  useEffect(() => {
    if (userLocation && branches.length > 0) {
      const nearest = findNearestBranch(
        branches,
        userLocation.lat,
        userLocation.lng
      );
      if (nearest && !selectedBranch) {
        setSelectedBranch(nearest);
        toast({
          title: 'Nearest branch selected',
          description: `We've selected ${nearest.name} as your nearest branch.`,
        });
      }
    }
  }, [userLocation, branches, selectedBranch, toast]);

  const addToCart = (menuItem: MenuItem, selectedPrice: PriceType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item =>
          item.menuItem.id === menuItem.id &&
          item.selectedPrice.id === selectedPrice.id
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.menuItem.id === menuItem.id &&
          item.selectedPrice.id === selectedPrice.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { menuItem, selectedPrice, quantity: 1 }];
      }
    });

    toast({
      title: 'Added to cart',
      description: `${menuItem.name} has been added to your cart.`,
    });
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart(prevCart =>
      prevCart.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.selectedPrice.price * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredCategories = [{ id: 'all', name: 'All Items' }, ...categories];

  const handleOrderSuccess = (orderId: string) => {
    setOrderSuccess(orderId);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  const handleOrderCancel = () => {
    setIsCheckoutOpen(false);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-6'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-12 w-full' />
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className='h-64 w-full' />
                ))}
              </div>
            </div>
            <div className='space-y-6'>
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-64 w-full' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Company Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The company you're looking for doesn't exist or is not available.
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-4'>
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className='h-8 w-8 rounded'
                />
              )}
              <h1 className='text-xl font-semibold text-gray-900'>
                {company.name}
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Order Type Selection */}
              <div className='hidden md:flex items-center space-x-2'>
                <Button
                  variant={orderType === 'pickup' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setOrderType('pickup')}
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
                  onClick={() => setOrderType('delivery')}
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

              {/* Cart Button */}
              <Button
                onClick={() => setIsCartOpen(true)}
                className='bg-purple-600 hover:bg-purple-700 relative'
              >
                <ShoppingCart className='h-5 w-5 mr-2' />
                Cart
                {getCartItemCount() > 0 && (
                  <Badge className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs'>
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
              <Input
                placeholder='Search menu items...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 border-purple-200 focus:border-purple-500'
              />
            </div>

            {/* Categories */}
            <div className='flex space-x-2 overflow-x-auto pb-2'>
              {filteredCategories.map(category => (
                <Button
                  key={category.id}
                  variant={
                    activeCategory === category.id ? 'default' : 'outline'
                  }
                  onClick={() => setActiveCategory(category.id)}
                  className={
                    activeCategory === category.id
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : ''
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredMenuItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className='h-full bg-white border-purple-200 hover:shadow-lg transition-shadow'>
                    <CardContent className='p-4'>
                      {item.imageUrl && (
                        <div className='aspect-square mb-4 overflow-hidden rounded-lg'>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}

                      <h3 className='font-semibold text-gray-900 mb-2'>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                          {item.description}
                        </p>
                      )}

                      <div className='space-y-2'>
                        {Array.isArray(item.price) ? (
                          item.price.map(priceType => (
                            <div
                              key={priceType.id}
                              className='flex items-center justify-between'
                            >
                              <div>
                                <span className='text-sm font-medium text-gray-900'>
                                  {priceType.name}
                                </span>
                                <span className='text-lg font-bold text-purple-600 ml-2'>
                                  {company.currency}{' '}
                                  {priceType.price.toFixed(2)}
                                </span>
                              </div>
                              <Button
                                size='sm'
                                onClick={() => addToCart(item, priceType)}
                                className='bg-purple-600 hover:bg-purple-700'
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            </div>
                          ))
                        ) : item.price ? (
                          // Handle single price type object
                          <div className='flex items-center justify-between'>
                            <div>
                              <span className='text-sm font-medium text-gray-900'>
                                {item.price.name}
                              </span>
                              <span className='text-lg font-bold text-purple-600 ml-2'>
                                {company.currency} {item.price.price.toFixed(2)}
                              </span>
                            </div>
                            <Button
                              size='sm'
                              onClick={() =>
                                addToCart(item, item.price as PriceType)
                              }
                              className='bg-purple-600 hover:bg-purple-700'
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className='text-center py-12'>
                <p className='text-gray-500'>No menu items found.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Branch Info */}
            {selectedBranch && (
              <Card className='bg-white border-purple-200'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <MapPin className='h-5 w-5 text-purple-600' />
                    <h3 className='font-semibold text-gray-900'>
                      Selected Branch
                    </h3>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-900'>
                      {selectedBranch.name}
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {selectedBranch.location}
                    </p>
                    {selectedBranch.openingHours && (
                      <div className='flex items-center gap-1 text-sm text-gray-600'>
                        <Clock className='h-3 w-3' />
                        <span>{selectedBranch.openingHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Branch Selection */}
                  {branches.length > 1 && (
                    <div className='mt-4'>
                      <label className='text-sm font-medium text-gray-700 mb-2 block'>
                        Change Branch
                      </label>
                      <select
                        value={selectedBranch.id}
                        onChange={e => {
                          const branch = branches.find(
                            b => b.id === e.target.value
                          );
                          if (branch) setSelectedBranch(branch);
                        }}
                        className='w-full p-2 border border-gray-300 rounded-md text-sm'
                      >
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            <Card className='bg-white border-purple-200'>
              <CardContent className='p-4'>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  About {company.name}
                </h3>
                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span>Multiple locations</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    <span>
                      Fast {orderType === 'delivery' ? 'delivery' : 'pickup'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4' />
                    <span>Quality guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Cart */}
      <MobileCart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        company={company}
        selectedBranch={selectedBranch}
        orderType={orderType}
      />

      {/* Checkout Dialog */}
      <Dialog
        open={isCheckoutOpen}
        onOpenChange={open => {
          // Prevent closing when clicking on Google Places Autocomplete
          if (!open) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.closest('.pac-container')) {
              return; // Don't close the modal
            }
          }
          setIsCheckoutOpen(open);
        }}
      >
        <DialogContent
          className='max-w-2xl max-h-[90vh] overflow-y-auto'
          onInteractOutside={e => {
            // Prevent closing when clicking on Google Places Autocomplete
            if (e.target && (e.target as Element).closest('.pac-container')) {
              e.preventDefault();
              return;
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5 text-purple-600' />
              Complete Your Order
            </DialogTitle>
          </DialogHeader>

          {orderSuccess ? (
            <div className='text-center py-8'>
              <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Order Placed Successfully!
              </h3>
              <p className='text-gray-600 mb-4'>
                Your order has been placed and is being processed. You'll
                receive a confirmation shortly.
              </p>
              <p className='text-sm text-gray-500 mb-6'>
                Order ID: {orderSuccess}
              </p>
              <Button
                onClick={() => {
                  setOrderSuccess(null);
                  setIsCheckoutOpen(false);
                }}
                className='bg-purple-600 hover:bg-purple-700'
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <CheckoutForm
              cart={cart}
              selectedBranch={selectedBranch!}
              orderType={orderType}
              company={company}
              onSuccess={handleOrderSuccess}
              onCancel={handleOrderCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
