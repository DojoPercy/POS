# Dynamic Online Ordering System

A comprehensive online ordering system for restaurants and food businesses, featuring dynamic company-specific pages, Google Places integration, and a modern responsive interface.

## Features

### 🏢 Dynamic Company Pages

- **URL-based routing**: `/order/[companySlug]` - Each company gets its own ordering page
- **Company-specific data**: Menu items, pricing, branches, and branding
- **Public company listing**: `/order` - Browse all available companies

### 🛒 Shopping Experience

- **Interactive cart system**: Add, remove, and modify items
- **Real-time pricing**: Dynamic price calculations
- **Category filtering**: Browse menu by categories
- **Search functionality**: Find items quickly
- **Mobile-optimized cart**: Floating cart drawer for mobile devices

### 📍 Location & Delivery

- **Google Places integration**: Address autocomplete with coordinates
- **Nearest branch detection**: Automatic branch selection based on user location
- **Delivery/Pickup options**: Choose between delivery and pickup
- **Geolocation services**: Get user's current location
- **Distance calculations**: Find the closest branch

### 💳 Checkout Process

- **Customer information**: Name, phone, email collection
- **Delivery details**: Address, instructions, coordinates
- **Order validation**: Client-side and server-side validation
- **Order confirmation**: Success page with order details
- **Responsive design**: Works on all device sizes

### 🎨 Design & UX

- **Purple theme**: Consistent branding throughout
- **Modern UI**: Clean, professional interface
- **Responsive design**: Mobile-first approach
- **Smooth animations**: Framer Motion transitions
- **Loading states**: Skeleton screens and spinners

## Technical Architecture

### Frontend Components

#### Core Pages

- **`/order/[companySlug]`**: Main ordering page
- **`/order`**: Company listing page

#### Key Components

- **`CheckoutForm`**: Complete checkout process with Google Places
- **`MobileCart`**: Mobile-optimized cart drawer
- **`AddressAutocomplete`**: Google Places address input
- **`GoogleMapsLoader`**: Google Maps API loader

#### State Management

- **React hooks**: Local state management
- **Context API**: Shared state where needed
- **Form validation**: Client-side validation with error handling

### Backend API

#### Order Management

```typescript
POST /api/orders
{
  companyId: string;
  branchId: string;
  orderType: 'delivery' | 'pickup';
  orderLines: OrderLine[];
  totalPrice: number;
  customerInfo: CustomerInfo;
  deliveryInfo?: DeliveryInfo;
}
```

#### Company Data

- **`/api/company/by-slug/[slug]`**: Get company by URL slug
- **`/api/company/public`**: List public companies
- **`/api/branches`**: Get company branches
- **`/api/menu`**: Get menu items
- **`/api/menu/category`**: Get menu categories

### Database Schema

#### Core Models

```prisma
model Company {
  id          String   @id @default(cuid())
  name        String
  slug        String?  @unique
  logo        String?
  currency    String   @default("GHS")
  isActivated Boolean  @default(false)
  branches    Branch[]
  menuItems   Menu[]
  orders      Order[]
}

model Branch {
  id          String   @id @default(cuid())
  name        String
  location    String
  city        String
  country     String
  latitude    Float?
  longitude   Float?
  status      String   @default("active")
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  orders      Order[]
}

model Order {
  id                    String      @id @default(cuid())
  orderNumber           String      @unique
  orderType             String      // 'delivery' | 'pickup'
  status                String      @default("pending")
  totalPrice            Float
  customerName          String
  customerPhone         String
  customerEmail         String?
  customerAddress       String?
  deliveryAddress       String?
  deliveryInstructions  String?
  deliveryLatitude      Float?
  deliveryLongitude     Float?
  companyId             String
  branchId              String
  company               Company     @relation(fields: [companyId], references: [id])
  branch                Branch       @relation(fields: [branchId], references: [id])
  orderLines            OrderLine[]
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}
```

## Google Places Integration

### Features

- **Address autocomplete**: Search for places in Ghana
- **Coordinate resolution**: Get latitude/longitude from addresses
- **Place details**: Retrieve detailed location information
- **Geocoding fallback**: Convert addresses to coordinates

### Implementation

```typescript
// Address autocomplete component
<AddressAutocomplete
  value={deliveryInfo.address}
  onChange={(value) => setDeliveryInfo(prev => ({ ...prev, address: value }))}
  onPlaceChange={handlePlaceChange}
  placeholder="Search for a place in Ghana..."
  required
/>

// Coordinate resolution
const getCoordinates = async () => {
  if (selectedPlace.geometry?.location) {
    const coords = {
      lat: selectedPlace.geometry.location.lat(),
      lng: selectedPlace.geometry.location.lng(),
    };
    setDeliveryInfo(prev => ({ ...prev, coordinates: coords }));
  }
};
```

## Order Placement Flow

### 1. Cart Management

```typescript
// Add item to cart
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
};
```

### 2. Checkout Process

```typescript
// Order validation
const validateForm = () => {
  const errors: string[] = [];

  if (!customerInfo.name.trim()) errors.push('Name is required');
  if (!customerInfo.phone.trim()) errors.push('Phone is required');

  if (orderType === 'delivery') {
    if (!deliveryInfo.address.trim())
      errors.push('Delivery address is required');
    if (!deliveryInfo.coordinates)
      errors.push('Please set delivery coordinates');
  }

  return errors.length === 0;
};

// Order submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  const orderData: OrderRequest = {
    companyId: company.id,
    branchId: selectedBranch.id,
    orderType,
    orderLines: cart.map(item => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.selectedPrice.price,
      totalPrice: item.selectedPrice.price * item.quantity,
      notes: item.notes,
    })),
    totalPrice: getCartTotal(),
    customerInfo,
    deliveryInfo: orderType === 'delivery' ? deliveryInfo : undefined,
  };

  const order = await createOrderFromCart(orderData);
  onSuccess(order.id);
};
```

## Mobile Optimization

### Responsive Design

- **Mobile-first approach**: Designed for mobile devices first
- **Touch-friendly**: Large buttons and touch targets
- **Swipe gestures**: Smooth cart interactions
- **Progressive enhancement**: Enhanced features on larger screens

### Mobile Cart

```typescript
// Floating cart drawer
<MobileCart
  cart={cart}
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  onUpdateQuantity={updateCartItemQuantity}
  onRemoveItem={removeFromCart}
  onClearCart={clearCart}
  onCheckout={() => setIsCheckoutOpen(true)}
  company={company}
  selectedBranch={selectedBranch}
  orderType={orderType}
/>
```

## Performance Optimizations

### Caching Strategy

- **Redis caching**: API responses cached for 60 seconds
- **IndexedDB**: Client-side caching for menu items
- **Image optimization**: Optimized images with Next.js Image component

### Code Splitting

- **Dynamic imports**: Components loaded on demand
- **Route-based splitting**: Each page optimized separately
- **Bundle optimization**: Minimal JavaScript bundles

## Security Considerations

### Input Validation

- **Client-side validation**: Immediate feedback to users
- **Server-side validation**: Secure data processing
- **SQL injection prevention**: Prisma ORM protection
- **XSS prevention**: Sanitized user inputs

### Data Protection

- **HTTPS only**: Secure data transmission
- **Input sanitization**: Clean user inputs
- **Rate limiting**: Prevent abuse
- **Error handling**: Secure error messages

## Configuration

### Environment Variables

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Database
DATABASE_URL=your_database_url

# Redis
REDIS_URL=your_redis_url
```

### Google Maps Setup

1. Create a Google Cloud Project
2. Enable Maps JavaScript API and Places API
3. Create API key with appropriate restrictions
4. Add key to environment variables

## Usage Examples

### Creating a Company Ordering Page

```typescript
// Navigate to company ordering page
const companySlug = 'my-restaurant';
window.location.href = `/order/${companySlug}`;
```

### Adding Items to Cart

```typescript
// Add menu item to cart
const menuItem = {
  id: 'item-1',
  name: 'Chicken Burger',
  priceTypes: [
    { id: 'price-1', name: 'Regular', price: 15.0 },
    { id: 'price-2', name: 'Large', price: 18.0 },
  ],
};

addToCart(menuItem, menuItem.priceTypes[0]);
```

### Processing Orders

```typescript
// Place order
const order = await createOrderFromCart({
  companyId: 'company-1',
  branchId: 'branch-1',
  orderType: 'delivery',
  orderLines: [...],
  totalPrice: 45.00,
  customerInfo: {
    name: 'John Doe',
    phone: '+233123456789',
    email: 'john@example.com'
  },
  deliveryInfo: {
    address: '123 Main St, Accra',
    coordinates: { lat: 5.5600, lng: -0.2057 }
  }
});
```

## Future Enhancements

### Planned Features

- **Payment integration**: Online payment processing
- **Order tracking**: Real-time order status updates
- **Push notifications**: Order updates and promotions
- **Loyalty program**: Customer rewards system
- **Analytics dashboard**: Sales and customer insights
- **Multi-language support**: Internationalization
- **Dark mode**: Theme customization
- **Offline support**: PWA capabilities

### Technical Improvements

- **Real-time updates**: WebSocket integration
- **Advanced caching**: Intelligent cache invalidation
- **Performance monitoring**: Analytics and error tracking
- **A/B testing**: Feature experimentation
- **Automated testing**: Comprehensive test suite

## Troubleshooting

### Common Issues

#### Google Maps Not Loading

- Check API key configuration
- Verify API restrictions
- Ensure billing is enabled

#### Order Creation Fails

- Validate all required fields
- Check database connectivity
- Review server logs for errors

#### Location Services Not Working

- Ensure HTTPS is enabled
- Check browser permissions
- Verify geolocation API support

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Order data:', orderData);
  console.log('Validation errors:', errors);
}
```

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Compatibility**: Next.js 14+, React 18+, TypeScript 5+
