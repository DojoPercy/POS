'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, CreditCard, ArrowRight } from 'lucide-react';
import { completeBusiness } from '@/lib/business-setup-steps';

interface ActivationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  prevStep: () => void;
}

export function ActivationStep({
  formData,
  updateFormData,
  prevStep,
}: ActivationStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activationCode, setActivationCode] = useState('');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$49',
      period: 'per month',
      features: [
        'All POS features',
        'Up to 3 branches',
        '5 staff accounts',
        '24/7 support',
        'Regular updates',
      ],
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      price: '$39',
      period: 'per month, billed annually',
      features: [
        'All POS features',
        'Up to 10 branches',
        'Unlimited staff accounts',
        'Priority 24/7 support',
        'Regular updates',
        '20% discount',
      ],
      popular: true,
    },
  ];

  const handlePlanChange = (value: string) => {
    updateFormData({ subscriptionPlan: value });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    await completeBusiness(formData);

    setTimeout(() => {
      setIsProcessing(false);
      setIsActivated(true);
      setActivationCode(
        `POS-${Math.floor(10000 + Math.random() * 90000)}-${generateRandomString(3)}`
      );
    }, 2000);
  };

  const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  return (
    <div className='space-y-6'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold'>Activate Your Account</h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Choose a subscription plan to get started
        </p>
      </div>

      {!isActivated ? (
        <div className='space-y-6'>
          <RadioGroup
            value={formData.subscriptionPlan}
            onValueChange={handlePlanChange}
            className='grid grid-cols-1 md:grid-cols-2 gap-4'
          >
            {plans.map(plan => (
              <div key={plan.id} className='relative'>
                {plan.popular && (
                  <div className='absolute -top-3 right-4 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full'>
                    Most Popular
                  </div>
                )}
                <Label
                  htmlFor={plan.id}
                  className={`
                    flex flex-col h-full p-5 rounded-lg border-2 cursor-pointer
                    ${
                      formData.subscriptionPlan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${plan.popular ? 'pt-6' : ''}
                  `}
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className='sr-only'
                  />
                  <div className='mb-4'>
                    <h3 className='font-bold text-lg'>{plan.name}</h3>
                    <div className='flex items-baseline mt-2'>
                      <span className='text-3xl font-bold'>{plan.price}</span>
                      <span className='ml-1 text-gray-500 dark:text-gray-400 text-sm'>
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className='space-y-2 flex-grow'>
                    {plan.features.map((feature, index) => (
                      <li key={index} className='flex items-center'>
                        <Check className='h-4 w-4 text-primary mr-2 flex-shrink-0' />
                        <span className='text-sm'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className='bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg'>
            <h4 className='font-medium mb-2 flex items-center'>
              <CreditCard className='h-5 w-5 mr-2 text-primary' />
              Payment Information
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
              In a real application, this would connect to a payment gateway
              like Stripe, Paystack, or Flutterwave.
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              For this demo, click the button below to simulate payment and
              receive your activation code.
            </p>
          </div>

          <div className='flex justify-between pt-4'>
            <Button type='button' variant='outline' onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className='min-w-[150px]'
            >
              {isProcessing ? (
                <div className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <div className='flex items-center'>
                  Proceed to Payment
                  <ArrowRight className='ml-2 h-4 w-4' />
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className='text-center space-y-6'>
          <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
            <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>

          <div>
            <h3 className='text-xl font-bold mb-2'>
              Account Activated Successfully!
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              Your business is now ready to use the POS system.
            </p>
          </div>

          <Card className='bg-gray-50 dark:bg-gray-800/50 mx-auto max-w-xs'>
            <CardContent className='p-4 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                Your Activation Code
              </p>
              <p className='text-xl font-mono font-bold tracking-wider'>
                {activationCode}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                Keep this code safe for future reference
              </p>
            </CardContent>
          </Card>

          <div className='pt-6'>
            <Button
              onClick={() => (window.location.href = '/')}
              className='min-w-[200px]'
            >
              Go to Dashboard
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
