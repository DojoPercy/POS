import {
  Check,
  CreditCard,
  Building,
  Settings,
  Users,
  User,
  Menu,
} from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { title: 'Sign Up', icon: User },
    { title: 'Business', icon: Building },
    { title: 'Settings', icon: Settings },
    { title: 'Branches', icon: Users },
    { title: 'Menu', icon: Menu },
    { title: 'Activation', icon: CreditCard },
  ];

  return (
    <div className='flex justify-between items-center mt-4'>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={stepNumber} className='flex flex-col items-center'>
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                ${
          isActive
            ? 'bg-primary text-white'
            : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }
                transition-all duration-200
              `}
            >
              {isCompleted ? (
                <Check className='w-5 h-5' />
              ) : (
                <step.icon className='w-5 h-5' />
              )}
            </div>
            <span
              className={`
                text-xs mt-2 font-medium
                ${isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}
              `}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
