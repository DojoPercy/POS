'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { SignUpStep } from './components/sign-up-step';
import { BusinessDetailsStep } from './components/business-details-step';
import { BusinessSettingsStep } from './components/business-settings-step';
import { BranchesStep } from './components/branches-step';
import { MenuSetupStep } from './components/menu-setup-step';
import { ActivationStep } from './components/activation-step';
import { Progress } from '@/components/ui/progress';
import { StepIndicator } from './components/step-indicator';

export default function BusinessSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'owner',

    businessName: '',
    businessType: 'retail',
    businessCategory: '',
    businessLogo: null,
    businessAddress: '',

    orderProcessingMode: 'retail',
    currency: 'USD',
    taxRate: 0,
    enableDiscounts: true,
    paymentMethods: ['cash', 'card'],

    branches: [
      {
        name: '',
        location: '',
        city: '',
        state: '',
        country: '',
        openingHours: '',
        status: 'active',
        managerId: '',
        createdBy: '',

        manager: { name: '', email: '' },
      },
    ],

    menuCategories: [
      {
        id: 'cat1',
        name: '',
        description: '',
        menuItems: [
          {
            id: 'item1',
            name: '',
            description: '',
            imageBase64: null,
            priceTypes: [{ id: 'price1', name: 'Regular', price: 0 }],
            ingredients: [],
          },
        ],
      },
    ],

    subscriptionPlan: 'monthly',
  });

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  const nextStep = () => {
    console.log('Current Step:', currentStep);
    if (!isDialogOpen && currentStep < totalSteps) {
      console.log('Current Step:', currentStep);
      setCurrentStep(currentStep + 1);
      console.log('Next Step:', currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      console.log(
        'Waiting for dialog to close before proceeding to next step.',
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
    case 1:
      return (
        <SignUpStep
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
        />
      );
    case 2:
      return (
        <BusinessDetailsStep
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <BusinessSettingsStep
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 4:
      return (
        <BranchesStep
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 5:
      return (
        <MenuSetupStep
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      );
    case 6:
      return (
        <ActivationStep
          formData={formData}
          updateFormData={updateFormData}
          prevStep={prevStep}
        />
      );
    default:
      return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-10'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600'>
              Business Setup
            </h1>
            <p className='text-center text-gray-600 dark:text-gray-300 mb-6'>
              Complete the following steps to set up your business profile
            </p>

            <div className='mb-8'>
              <Progress value={progressPercentage} className='h-2' />
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>
          </div>

          <Card className='border-none shadow-lg bg-white dark:bg-gray-800'>
            <CardContent className='p-6'>{renderStep()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
