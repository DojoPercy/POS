'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Building, MapPin, User, Mail } from 'lucide-react';

interface BranchesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function BranchesStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: BranchesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const hasCompleteBranch = formData.branches.some(
      (branch: any) =>
        branch.name &&
        branch.location &&
        branch.manager.name &&
        branch.manager.email,
    );

    if (!hasCompleteBranch) {
      newErrors.branches =
        'At least one branch with complete information is required';
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

  const addBranch = () => {
    const updatedBranches = [
      ...formData.branches,
      { name: '', location: '', manager: { name: '', email: '' } },
    ];
    updateFormData({ branches: updatedBranches });
  };

  const removeBranch = (index: number) => {
    if (formData.branches.length > 1) {
      const updatedBranches = [...formData.branches];
      updatedBranches.splice(index, 1);
      updateFormData({ branches: updatedBranches });
    }
  };

  const updateBranch = (index: number, field: string, value: string) => {
    const updatedBranches = [...formData.branches];

    if (field.includes('.')) {
      // Handle nested fields like manager.name
      const [parent, child] = field.split('.');
      updatedBranches[index][parent][child] = value;
    } else {
      updatedBranches[index][field] = value;
    }

    updateFormData({ branches: updatedBranches });

    // Clear error when user types
    if (errors.branches) {
      setErrors({ ...errors, branches: '' });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold'>Add Branches & Managers</h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Set up your business locations and assign managers
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {formData.branches.map((branch: any, index: number) => (
          <Card
            key={index}
            className='border border-gray-200 dark:border-gray-700'
          >
            <CardContent className='p-4'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-medium'>Branch #{index + 1}</h3>
                {formData.branches.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeBranch(index)}
                    className='h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                  >
                    <Trash2 className='h-4 w-4 mr-1' />
                    Remove
                  </Button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor={`branch-name-${index}`}
                    className='text-sm font-medium'
                  >
                    Branch Name
                  </Label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                      <Building className='h-5 w-5' />
                    </div>
                    <Input
                      id={`branch-name-${index}`}
                      value={branch.name}
                      onChange={e =>
                        updateBranch(index, 'name', e.target.value)
                      }
                      className='pl-10'
                      placeholder='Main Branch'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor={`branch-location-${index}`}
                    className='text-sm font-medium'
                  >
                    Branch Location
                  </Label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                      <MapPin className='h-5 w-5' />
                    </div>
                    <Input
                      id={`branch-location-${index}`}
                      value={branch.location}
                      onChange={e =>
                        updateBranch(index, 'location', e.target.value)
                      }
                      className='pl-10'
                      placeholder='123 Branch St, City'
                    />
                  </div>
                </div>
              </div>

              <div className='border-t border-gray-200 dark:border-gray-700 pt-4 mt-4'>
                <h4 className='font-medium mb-3'>Branch Manager</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor={`manager-name-${index}`}
                      className='text-sm font-medium'
                    >
                      Manager Name
                    </Label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                        <User className='h-5 w-5' />
                      </div>
                      <Input
                        id={`manager-name-${index}`}
                        value={branch.manager.name}
                        onChange={e =>
                          updateBranch(index, 'manager.name', e.target.value)
                        }
                        className='pl-10'
                        placeholder='Manager Name'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor={`manager-email-${index}`}
                      className='text-sm font-medium'
                    >
                      Manager Email
                    </Label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500'>
                        <Mail className='h-5 w-5' />
                      </div>
                      <Input
                        id={`manager-email-${index}`}
                        type='email'
                        value={branch.manager.email}
                        onChange={e =>
                          updateBranch(index, 'manager.email', e.target.value)
                        }
                        className='pl-10'
                        placeholder='manager@example.com'
                      />
                    </div>
                  </div>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  An email with login instructions will be sent to the manager
                  after setup.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {errors.branches && (
          <p className='text-sm text-red-500'>{errors.branches}</p>
        )}

        <Button
          type='button'
          variant='outline'
          onClick={addBranch}
          className='w-full border-dashed'
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Another Branch
        </Button>

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
