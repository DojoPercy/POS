'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Navigation,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { AddressAutocomplete } from './map';
import { GoogleMapsLoader } from './google_map';
import {
  createOrderFromCart,
  validateOrder,
  getEstimatedDeliveryTime,
  type CartItem,
  type OrderRequest,
} from '@/lib/order-utils';

interface CheckoutFormProps {
  cart: CartItem[];
  selectedBranch: any;
  orderType: 'delivery' | 'pickup';
  company: any;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export default function CheckoutForm({
  cart,
  selectedBranch,
  orderType,
  company,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    instructions: '',
    coordinates: null as { lat: number; lng: number } | null,
  });
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { toast } = useToast();

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.selectedPrice.price * item.quantity;
    }, 0);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      if (section === 'customer') {
        setCustomerInfo(prev => ({ ...prev, [key]: value }));
      } else if (section === 'delivery') {
        setDeliveryInfo(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setCustomerInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePlaceChange = (place: any) => {
    setSelectedPlace(place);

    let displayValue = '';
    if (place.name && place.formatted_address) {
      displayValue = `${place.name}, ${place.formatted_address}`;
    } else if (place.name) {
      displayValue = place.name;
    } else if (place.formatted_address) {
      displayValue = place.formatted_address;
    }

    if (displayValue) {
      setDeliveryInfo(prev => ({ ...prev, address: displayValue }));
    }
  };

  const getCoordinates = async () => {
    if (!selectedPlace || !window.google?.maps) return;

    setIsLoadingCoordinates(true);

    try {
      if (selectedPlace.geometry?.location) {
        const coords = {
          lat: selectedPlace.geometry.location.lat(),
          lng: selectedPlace.geometry.location.lng(),
        };
        setDeliveryInfo(prev => ({ ...prev, coordinates: coords }));
        toast({
          title: 'Location set',
          description: 'Delivery coordinates have been set successfully.',
        });
        return;
      }

      if (selectedPlace.place_id) {
        const success = await tryPlaceDetails(selectedPlace.place_id);
        if (success) return;
      }

      if (selectedPlace.formatted_address) {
        const success = await tryGeocoding(selectedPlace.formatted_address);
        if (success) return;
      }

      toast({
        title: 'Location error',
        description: 'Could not resolve location coordinates.',
        variant: 'destructive',
      });
    } catch (err) {
      console.error('Error resolving location', err);
      toast({
        title: 'Location error',
        description: 'Failed to get location coordinates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCoordinates(false);
    }
  };

  const tryPlaceDetails = (placeId: string): Promise<boolean> => {
    return new Promise(resolve => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry'],
        },
        (place: any, status: any) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            const coords = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setDeliveryInfo(prev => ({ ...prev, coordinates: coords }));
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  };

  const tryGeocoding = (address: string): Promise<boolean> => {
    return new Promise(resolve => {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode(
        {
          address: address,
          componentRestrictions: { country: 'GH' },
        },
        (results: any, status: any) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng(),
            };
            setDeliveryInfo(prev => ({ ...prev, coordinates: coords }));
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  };

  const validateForm = () => {
    const formErrors: string[] = [];

    // Validate customer info
    if (!customerInfo.name.trim()) {
      formErrors.push('Name is required');
    }
    if (!customerInfo.phone.trim()) {
      formErrors.push('Phone number is required');
    }
    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      formErrors.push('Please enter a valid email address');
    }

    // Validate delivery info for delivery orders
    if (orderType === 'delivery') {
      if (!deliveryInfo.address.trim()) {
        formErrors.push('Delivery address is required');
      }
      if (!deliveryInfo.coordinates) {
        formErrors.push('Please set delivery location coordinates');
      }
    }

    // Validate order
    const orderErrors = validateOrder(cart, selectedBranch);
    formErrors.push(...orderErrors);

    setErrors(formErrors);
    return formErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Please fix the errors',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: OrderRequest = {
        companyId: company.id,
        branchId: selectedBranch.id,
        orderType,
        orderLines: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.selectedPrice.price,
          totalPrice: item.selectedPrice.price * item.quantity,
          notes: item.notes,
        })),
        totalPrice: getCartTotal(),
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || undefined,
          address: customerInfo.address || undefined,
        },
        deliveryInfo:
          orderType === 'delivery'
            ? {
                address: deliveryInfo.address,
                instructions: deliveryInfo.instructions || undefined,
                coordinates: deliveryInfo.coordinates,
              }
            : undefined,
      };

      const order = await createOrderFromCart(orderData);

      toast({
        title: 'Order placed successfully!',
        description: `Your order #${order.orderNumber} has been placed.`,
      });

      onSuccess(order.id);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error placing order',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedTime = getEstimatedDeliveryTime(orderType);

  return (
    <GoogleMapsLoader>
      <div className='space-y-6'>
        {/* Order Summary */}
        <Card className='bg-white border-purple-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-purple-600' />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {cart.map((item, index) => (
                <div key={index} className='flex justify-between text-sm'>
                  <span>
                    {item.quantity} × {item.menuItem.name}
                  </span>
                  <span>
                    {company.currency}{' '}
                    {(item.selectedPrice.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className='flex justify-between font-medium'>
              <span>Total</span>
              <span className='text-purple-600'>
                {company.currency} {getCartTotal().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Branch & Delivery Info */}
        <Card className='bg-white border-purple-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {orderType === 'delivery' ? (
                <Truck className='h-5 w-5 text-purple-600' />
              ) : (
                <User className='h-5 w-5 text-purple-600' />
              )}
              {orderType === 'delivery' ? 'Delivery' : 'Pickup'} Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
              <h4 className='font-medium text-gray-900'>
                {selectedBranch.name}
              </h4>
              <p className='text-sm text-gray-600'>{selectedBranch.location}</p>
              {selectedBranch.openingHours && (
                <div className='flex items-center gap-1 text-sm text-gray-600 mt-1'>
                  <Clock className='h-3 w-3' />
                  <span>{selectedBranch.openingHours}</span>
                </div>
              )}
            </div>

            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Clock className='h-4 w-4 text-purple-600' />
              <span>
                Estimated {orderType === 'delivery' ? 'delivery' : 'pickup'}{' '}
                time: {estimatedTime}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Card className='bg-white border-purple-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-purple-600' />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>Full Name *</Label>
                  <Input
                    id='name'
                    value={customerInfo.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='Enter your full name'
                    className='border-purple-200 focus:border-purple-500'
                  />
                </div>
                <div>
                  <Label htmlFor='phone'>Phone Number *</Label>
                  <Input
                    id='phone'
                    value={customerInfo.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder='Enter your phone number'
                    className='border-purple-200 focus:border-purple-500'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={customerInfo.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder='Enter your email address'
                  className='border-purple-200 focus:border-purple-500'
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {orderType === 'delivery' && (
            <Card className='bg-white border-purple-200'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5 text-purple-600' />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='delivery-address'>Delivery Address *</Label>
                  <div className='flex gap-2 items-center'>
                    <div className='flex-1'>
                      <AddressAutocomplete
                        value={deliveryInfo.address}
                        onChange={value =>
                          handleInputChange('delivery.address', value)
                        }
                        onPlaceChange={handlePlaceChange}
                        placeholder='Search for a place in Ghana...'
                        required
                      />
                    </div>
                    <Button
                      type='button'
                      onClick={getCoordinates}
                      disabled={isLoadingCoordinates || !selectedPlace}
                      className='h-10 w-10 p-0'
                      variant='outline'
                    >
                      {isLoadingCoordinates ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Navigation className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                  {deliveryInfo.coordinates && (
                    <div className='text-xs text-green-600 bg-green-50 p-2 rounded'>
                      ✓ Location coordinates set:{' '}
                      {deliveryInfo.coordinates.lat.toFixed(6)},{' '}
                      {deliveryInfo.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor='instructions'>Delivery Instructions</Label>
                  <Textarea
                    id='instructions'
                    value={deliveryInfo.instructions}
                    onChange={e =>
                      handleInputChange('delivery.instructions', e.target.value)
                    }
                    placeholder='Any special instructions for delivery'
                    className='border-purple-200 focus:border-purple-500'
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <Card className='bg-red-50 border-red-200'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <span className='font-medium text-red-800'>
                    Please fix the following errors:
                  </span>
                </div>
                <ul className='list-disc list-inside space-y-1 text-sm text-red-700'>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='flex-1'
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-purple-600 hover:bg-purple-700'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Placing Order...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4' />
                  Place Order
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </GoogleMapsLoader>
  );
}
