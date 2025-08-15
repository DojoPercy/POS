import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface OrderLine {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageBase64?: string;
    category?: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  waiterId: string;
  branchId: string;
  orderLines: OrderLine[]; // An array of OrderLine objects
  totalPrice: number;
  discount: number;
  rounding: number;
  finalPrice: number;
  paymentType: string;
  receivedAmount: number;
  balance: number;
  isCompleted: boolean;
  isCheckedOut: boolean;
  requiredDate: string; // ISO string format
}

export function OrderCard({
  order,
  onComplete,
}: {
  order: any;
  onComplete: (orderId: string) => void;
}) {
  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          <span>Order #{order.id}</span>
          <Badge variant='outline'>
            {formatDistanceToNow(new Date(order.requiredDate), {
              addSuffix: true,
            })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <ul className='space-y-2'>
          {order.orderLines.map(
            (line: OrderLine, index: number | null | undefined) => (
              <li key={index} className='flex justify-between'>
                <span>
                  {line.quantity}x {line.menuItemId}
                </span>
                <span>${line.totalPrice.toFixed(2)}</span>
              </li>
            )
          )}
        </ul>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div>
          <p className='font-bold'>Total: ${order.name}</p>
          <p className='font-bold'>Total: ${order.finalPrice.toFixed(2)}</p>
          <p className='text-sm text-muted-foreground'>
            Waiter ID: {order.waiterId}
          </p>
        </div>
        <Button onClick={() => onComplete(order.id)}>Complete Order</Button>
      </CardFooter>
    </Card>
  );
}
