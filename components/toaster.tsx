'use client';

import { useToast } from '@/hooks/use-toast';
import { Toast } from '@radix-ui/react-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
