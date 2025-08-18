import { generateOrderNumber } from './utils';

export interface CartItem {
  menuItem: any;
  selectedPrice: any;
  quantity: number;
  notes?: string;
}

export interface OrderRequest {
  companyId: string;
  branchId: string;
  orderType: 'delivery' | 'pickup';
  orderLines: {
    menuItemId: string;
    quantity: number;
    price: number;
    totalPrice: number;
    notes?: string;
  }[];
  totalPrice: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  deliveryInfo?: {
    address: string;
    instructions?: string;
    coordinates?: { lat: number; lng: number } | null;
  };
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  createdAt: string;
}

export const createOrderFromCart = async (
  orderData: OrderRequest
): Promise<OrderResponse> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again.');
  }
};

export const validateOrder = (
  cart: CartItem[],
  selectedBranch: any
): string[] => {
  const errors: string[] = [];

  if (!cart || cart.length === 0) {
    errors.push('Cart is empty');
  }

  if (!selectedBranch) {
    errors.push('Please select a branch');
  }

  // Validate each cart item
  cart.forEach((item, index) => {
    if (!item.menuItem) {
      errors.push(`Invalid menu item at position ${index + 1}`);
    }
    if (!item.selectedPrice) {
      errors.push(`No price selected for ${item.menuItem?.name || 'item'}`);
    }
    if (item.quantity <= 0) {
      errors.push(`Invalid quantity for ${item.menuItem?.name || 'item'}`);
    }
  });

  return errors;
};

export const getEstimatedDeliveryTime = (
  orderType: 'delivery' | 'pickup'
): string => {
  const now = new Date();
  const estimatedMinutes = orderType === 'delivery' ? 45 : 20;
  const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000);

  return estimatedTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatCurrency = (
  amount: number,
  currency: string = 'GHS'
): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearestBranch = (
  branches: any[],
  userLat: number,
  userLng: number
): any => {
  if (!branches || branches.length === 0) return null;

  let nearestBranch = branches[0];
  let shortestDistance = Infinity;

  branches.forEach(branch => {
    if (branch.latitude && branch.longitude) {
      const distance = calculateDistance(
        userLat,
        userLng,
        branch.latitude,
        branch.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestBranch = branch;
      }
    }
  });

  return nearestBranch;
};

export const getOrderStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-orange-100 text-orange-800';
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getOrderStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '⏳';
    case 'confirmed':
      return '✅';
    case 'preparing':
      return '👨‍🍳';
    case 'ready':
      return '🚀';
    case 'delivered':
    case 'completed':
      return '🎉';
    case 'cancelled':
      return '❌';
    default:
      return '📋';
  }
};
