'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Utensils, ShoppingBag, DollarSign, Percent } from 'lucide-react';

interface BusinessSettingsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function BusinessSettingsStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: BusinessSettingsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'GHS', label: 'Ghanaian Cedi (GH₵)' },
  ];

  const paymentMethods = [
    { id: 'cash', label: 'Cash' },
    { id: 'card', label: 'Credit/Debit Card' },
    { id: 'mobile', label: 'Mobile Money' },
    { id: 'bank', label: 'Bank Transfer' },
    { id: 'crypto', label: 'Cryptocurrency' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderProcessingMode)
      newErrors.orderProcessingMode = 'Order processing mode is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';
    if (formData.taxRate === undefined || formData.taxRate === null)
      newErrors.taxRate = 'Tax rate is required';
    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'At least one payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      nextStep();
    }
  };

  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePaymentMethodChange = (id: string, checked: boolean) => {
    const currentMethods = [...(formData.paymentMethods || [])];

    if (checked) {
      if (!currentMethods.includes(id)) {
        currentMethods.push(id);
      }
    } else {
      const index = currentMethods.indexOf(id);
      if (index !== -1) {
        currentMethods.splice(index, 1);
      }
    }

    handleChange('paymentMethods', currentMethods);
  };

  return (
    <div className='space-y-6'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold'>Business Settings</h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Configure your business operations
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <Label className='text-base font-medium'>Order Processing Mode</Label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${
    formData.orderProcessingMode === 'restaurant'
      ? 'border-primary bg-primary/5'
      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
    }
              `}
              onClick={() => handleChange('orderProcessingMode', 'restaurant')}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
    formData.orderProcessingMode === 'restaurant'
      ? 'border-primary'
      : 'border-gray-300 dark:border-gray-600'
    }
                `}
                >
                  {formData.orderProcessingMode === 'restaurant' && (
                    <div className='w-3 h-3 rounded-full bg-primary' />
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  <Utensils className='h-5 w-5 text-primary' />
                  <span className='font-medium'>Restaurant Mode</span>
                </div>
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 ml-8'>
                Orders go to kitchen for preparation before completion
              </p>
            </div>

            <div
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${
    formData.orderProcessingMode === 'retail'
      ? 'border-primary bg-primary/5'
      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
    }
              `}
              onClick={() => handleChange('orderProcessingMode', 'retail')}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
    formData.orderProcessingMode === 'retail'
      ? 'border-primary'
      : 'border-gray-300 dark:border-gray-600'
    }
                `}
                >
                  {formData.orderProcessingMode === 'retail' && (
                    <div className='w-3 h-3 rounded-full bg-primary' />
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  <ShoppingBag className='h-5 w-5 text-primary' />
                  <span className='font-medium'>Retail Mode</span>
                </div>
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 ml-8'>
                Instant order completion without kitchen preparation
              </p>
            </div>
          </div>
          {errors.orderProcessingMode && (
            <p className='text-sm text-red-500'>{errors.orderProcessingMode}</p>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='currency' className='text-sm font-medium'>
              Currency
            </Label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                <DollarSign className='h-5 w-5' />
              </div>
              <Select
                value={formData.currency}
                onValueChange={value => handleChange('currency', value)}
              >
                <SelectTrigger id='currency' className='pl-10'>
                  <SelectValue placeholder='Select currency' />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.currency && (
              <p className='text-sm text-red-500'>{errors.currency}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='taxRate' className='text-sm font-medium'>
              Tax Rate (%)
            </Label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                <Percent className='h-5 w-5' />
              </div>
              <Input
                id='taxRate'
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={formData.taxRate}
                onChange={e =>
                  handleChange('taxRate', Number.parseFloat(e.target.value))
                }
                className='pl-10'
                placeholder='0.00'
              />
            </div>
            {errors.taxRate && (
              <p className='text-sm text-red-500'>{errors.taxRate}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='enableDiscounts' className='text-sm font-medium'>
              Enable Discounts & Offers
            </Label>
            <Switch
              id='enableDiscounts'
              checked={formData.enableDiscounts}
              onCheckedChange={checked =>
                handleChange('enableDiscounts', checked)
              }
            />
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Allow your staff to apply discounts and special offers to orders
          </p>
        </div>

        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Payment Methods</Label>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {paymentMethods.map(method => (
              <div key={method.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={method.id}
                  checked={formData.paymentMethods?.includes(method.id)}
                  onCheckedChange={checked =>
                    handlePaymentMethodChange(method.id, checked === true)
                  }
                />
                <Label
                  htmlFor={method.id}
                  className='text-sm font-medium cursor-pointer'
                >
                  {method.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.paymentMethods && (
            <p className='text-sm text-red-500'>{errors.paymentMethods}</p>
          )}
        </div>

        <div className='flex justify-between pt-4'>
          <Button type='button' variant='outline' onClick={prevStep}>
            Back
          </Button>
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    </div>
  );
}
