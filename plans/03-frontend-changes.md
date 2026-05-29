# Frontend UI/UX Changes for Seat Classes

## Overview
This document outlines the frontend changes needed to display flights by seat class and allow users to book specific classes.

## Design Approach

Based on requirements: **"list flights separately by class on the flights page"**

Each flight will be displayed as **three separate cards** (one per class) on the Flights page, allowing users to see all options at a glance and book their preferred class directly.

## 1. Type Definitions (`types/index.ts`)

### Update Flight Interface

**Current (lines 3-11):**
```typescript
export interface Flight {
  flight_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  seats_available: number;
}
```

**New:**
```typescript
export interface Flight {
  flight_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  
  // Economy class
  economy_price: number;
  economy_seats_available: number;
  
  // Business class
  business_price: number;
  business_seats_available: number;
  
  // Galaxium class
  galaxium_price: number;
  galaxium_seats_available: number;
}
```

### Add New Types

```typescript
// Seat class type
export type SeatClass = 'economy' | 'business' | 'galaxium';

// Flight with selected class (for display purposes)
export interface FlightWithClass {
  flight: Flight;
  seatClass: SeatClass;
  price: number;
  seatsAvailable: number;
}

// Seat class display information
export interface SeatClassInfo {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  description: string;
}
```

### Update BookingRequest Interface

**Current (lines 28-32):**
```typescript
export interface BookingRequest {
  user_id: number;
  name: string;
  flight_id: number;
}
```

**New:**
```typescript
export interface BookingRequest {
  user_id: number;
  name: string;
  flight_id: number;
  seat_class: SeatClass;
}
```

### Update Booking Interface

**Current (lines 13-19):**
```typescript
export interface Booking {
  booking_id: number;
  user_id: number;
  flight_id: number;
  status: 'booked' | 'cancelled' | 'completed';
  booking_time: string;
}
```

**New:**
```typescript
export interface Booking {
  booking_id: number;
  user_id: number;
  flight_id: number;
  seat_class: SeatClass;
  price_paid: number;
  status: 'booked' | 'cancelled' | 'completed';
  booking_time: string;
}
```

## 2. API Service Updates (`services/api.ts`)

### Update bookFlight Function

**Current:**
```typescript
export const bookFlight = async (request: BookingRequest): Promise<Booking | ErrorResponse> => {
  const response = await api.post<Booking>('/book', request);
  return response.data;
};
```

**New (add seat_class parameter):**
```typescript
export const bookFlight = async (request: BookingRequest): Promise<Booking | ErrorResponse> => {
  // Validate seat_class before sending
  if (!['economy', 'business', 'galaxium'].includes(request.seat_class)) {
    return {
      success: false,
      error: 'Invalid seat class',
      error_code: 'INVALID_SEAT_CLASS',
      details: 'Seat class must be economy, business, or galaxium'
    };
  }
  
  const response = await api.post<Booking>('/book', request);
  return response.data;
};
```

## 3. Utility Functions

### Create `utils/seatClass.ts`

```typescript
import { Flight, FlightWithClass, SeatClass, SeatClassInfo } from '../types';
import { Sparkles, Briefcase, Plane } from 'lucide-react';

// Seat class configuration
export const SEAT_CLASS_INFO: Record<SeatClass, SeatClassInfo> = {
  economy: {
    name: 'economy',
    displayName: 'Economy',
    color: 'text-blue-400',
    icon: 'Plane',
    description: 'Comfortable and affordable space travel'
  },
  business: {
    name: 'business',
    displayName: 'Business',
    color: 'text-purple-400',
    icon: 'Briefcase',
    description: 'Premium comfort with extra amenities'
  },
  galaxium: {
    name: 'galaxium',
    displayName: 'Galaxium',
    color: 'text-yellow-400',
    icon: 'Sparkles',
    description: 'Ultimate luxury across the cosmos'
  }
};

// Convert a Flight to multiple FlightWithClass entries (one per class)
export const expandFlightByClass = (flight: Flight): FlightWithClass[] => {
  return [
    {
      flight,
      seatClass: 'economy',
      price: flight.economy_price,
      seatsAvailable: flight.economy_seats_available
    },
    {
      flight,
      seatClass: 'business',
      price: flight.business_price,
      seatsAvailable: flight.business_seats_available
    },
    {
      flight,
      seatClass: 'galaxium',
      price: flight.galaxium_price,
      seatsAvailable: flight.galaxium_seats_available
    }
  ];
};

// Get icon component for seat class
export const getSeatClassIcon = (seatClass: SeatClass) => {
  const icons = {
    economy: Plane,
    business: Briefcase,
    galaxium: Sparkles
  };
  return icons[seatClass];
};

// Get price for a specific class
export const getClassPrice = (flight: Flight, seatClass: SeatClass): number => {
  const priceMap = {
    economy: flight.economy_price,
    business: flight.business_price,
    galaxium: flight.galaxium_price
  };
  return priceMap[seatClass];
};

// Get seats available for a specific class
export const getClassSeats = (flight: Flight, seatClass: SeatClass): number => {
  const seatsMap = {
    economy: flight.economy_seats_available,
    business: flight.business_seats_available,
    galaxium: flight.galaxium_seats_available
  };
  return seatsMap[seatClass];
};
```

## 4. Component Updates

### Update `components/flights/FlightCard.tsx`

**Current Approach:**
- Single card per flight
- Shows single price and seat count

**New Approach:**
- Card displays one specific seat class
- Shows class badge/indicator
- Price and seats specific to that class

**New FlightCard Component:**

```typescript
import type { FlightWithClass } from '../../types';
import { Card, Button } from '../common';
import { Clock, DollarSign, Users } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, calculateDuration } from '../../utils/formatters';
import { SEAT_CLASS_INFO, getSeatClassIcon } from '../../utils/seatClass';
import { motion } from 'framer-motion';

interface FlightCardProps {
  flightWithClass: FlightWithClass;
  onBook: (flightWithClass: FlightWithClass) => void;
}

export const FlightCard = ({ flightWithClass, onBook }: FlightCardProps) => {
  const { flight, seatClass, price, seatsAvailable } = flightWithClass;
  const classInfo = SEAT_CLASS_INFO[seatClass];
  const ClassIcon = getSeatClassIcon(seatClass);
  
  const isLowSeats = seatsAvailable <= 2;
  const isSoldOut = seatsAvailable === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        {/* Class Badge */}
        <div className="absolute top-4 right-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20`}>
            <ClassIcon className={classInfo.color} size={16} />
            <span className={`text-sm font-semibold ${classInfo.color}`}>
              {classInfo.displayName}
            </span>
          </div>
        </div>

        {/* Route Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cosmic-gradient">
              <ClassIcon className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-star-white">
                {flight.origin} → {flight.destination}
              </h3>
              <p className="text-sm text-star-white/60">
                Flight #{flight.flight_id} • {classInfo.displayName}
              </p>
            </div>
          </div>
        </div>

        {/* Class Description */}
        <p className="text-sm text-star-white/70 mb-4 italic">
          {classInfo.description}
        </p>

        {/* Flight Details */}
        <div className="space-y-3 mb-6 flex-1">
          {/* Departure & Arrival */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-star-white/60 mb-1">Departure</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.departure_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.departure_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-star-white/60 mb-1">Arrival</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.arrival_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.arrival_time)}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-star-white/70">
            <Clock size={16} />
            <span className="text-sm">
              Duration: {calculateDuration(flight.departure_time, flight.arrival_time)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-alien-green" />
            <span className="text-2xl font-bold text-star-white">
              {formatCurrency(price)}
            </span>
            <span className="text-sm text-star-white/60">per seat</span>
          </div>

          {/* Seats Available */}
          <div className="flex items-center gap-2">
            <Users size={16} className={isLowSeats ? 'text-solar-orange' : 'text-star-white/70'} />
            <span className={`text-sm ${isLowSeats ? 'text-solar-orange font-semibold' : 'text-star-white/70'}`}>
              {isSoldOut ? 'Sold Out' : `${seatsAvailable} seats available`}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={() => onBook(flightWithClass)}
          disabled={isSoldOut}
          className="w-full"
        >
          {isSoldOut ? 'Sold Out' : `Book ${classInfo.displayName}`}
        </Button>
      </Card>
    </motion.div>
  );
};
```

### Update `pages/Flights.tsx`

**Current Logic:**
- Maps flights directly to FlightCard components

**New Logic:**
- Expands each flight into three FlightWithClass entries
- Filters by seat class availability
- Groups by route for better organization (optional)

```typescript
import { useState, useEffect } from 'react';
import { FlightCard } from '../components/flights/FlightCard';
import { BookingModal } from '../components/bookings/BookingModal';
import { LoadingSpinner } from '../components/common';
import { getFlights } from '../services/api';
import type { Flight, FlightWithClass, SeatClass } from '../types';
import { expandFlightByClass } from '../utils/seatClass';
import toast from 'react-hot-toast';

export const Flights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [expandedFlights, setExpandedFlights] = useState<FlightWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<FlightWithClass | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Filter states
  const [classFilter, setClassFilter] = useState<SeatClass | 'all'>('all');
  const [showSoldOut, setShowSoldOut] = useState(false);

  useEffect(() => {
    loadFlights();
  }, []);

  useEffect(() => {
    // Expand flights and apply filters
    const expanded = flights.flatMap(expandFlightByClass);
    
    const filtered = expanded.filter(fw => {
      // Filter by class
      if (classFilter !== 'all' && fw.seatClass !== classFilter) {
        return false;
      }
      
      // Filter sold out
      if (!showSoldOut && fw.seatsAvailable === 0) {
        return false;
      }
      
      return true;
    });
    
    setExpandedFlights(filtered);
  }, [flights, classFilter, showSoldOut]);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      toast.error('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flightWithClass: FlightWithClass) => {
    setSelectedFlight(flightWithClass);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-star-white mb-8">
        Available Flights
      </h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setClassFilter('all')}
            className={`px-4 py-2 rounded-lg ${classFilter === 'all' ? 'bg-cosmic-purple' : 'bg-white/10'}`}
          >
            All Classes
          </button>
          <button
            onClick={() => setClassFilter('economy')}
            className={`px-4 py-2 rounded-lg ${classFilter === 'economy' ? 'bg-blue-500' : 'bg-white/10'}`}
          >
            Economy
          </button>
          <button
            onClick={() => setClassFilter('business')}
            className={`px-4 py-2 rounded-lg ${classFilter === 'business' ? 'bg-purple-500' : 'bg-white/10'}`}
          >
            Business
          </button>
          <button
            onClick={() => setClassFilter('galaxium')}
            className={`px-4 py-2 rounded-lg ${classFilter === 'galaxium' ? 'bg-yellow-500' : 'bg-white/10'}`}
          >
            Galaxium
          </button>
        </div>
        
        <label className="flex items-center gap-2 text-star-white">
          <input
            type="checkbox"
            checked={showSoldOut}
            onChange={(e) => setShowSoldOut(e.target.checked)}
            className="rounded"
          />
          Show sold out
        </label>
      </div>

      {/* Flight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expandedFlights.map((fw, index) => (
          <FlightCard
            key={`${fw.flight.flight_id}-${fw.seatClass}-${index}`}
            flightWithClass={fw}
            onBook={handleBookFlight}
          />
        ))}
      </div>

      {expandedFlights.length === 0 && (
        <div className="text-center text-star-white/60 py-12">
          No flights available with current filters
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        flightWithClass={selectedFlight}
        onSuccess={loadFlights}
      />
    </div>
  );
};
```

### Update `components/bookings/BookingModal.tsx`

**Changes:**
- Accept `FlightWithClass` instead of `Flight`
- Include seat class in booking request
- Display selected class prominently

```typescript
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightWithClass: FlightWithClass | null;
  onSuccess: () => void;
}

export const BookingModal = ({ isOpen, onClose, flightWithClass, onSuccess }: BookingModalProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!flightWithClass) return null;

  const { flight, seatClass, price } = flightWithClass;
  const classInfo = SEAT_CLASS_INFO[seatClass];
  const ClassIcon = getSeatClassIcon(seatClass);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a flight');
      return;
    }

    setIsLoading(true);

    try {
      const result = await bookFlight({
        user_id: user.user_id,
        name: user.name,
        flight_id: flight.flight_id,
        seat_class: seatClass  // Include seat class
      });

      if (isErrorResponse(result)) {
        toast.error(result.details || result.error);
        return;
      }

      toast.success(`${classInfo.displayName} class booked successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.details || error.error || 'Failed to book flight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Your Booking" size="md">
      <div className="space-y-6">
        {/* Class Badge - Prominent */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-cosmic-gradient">
          <ClassIcon className="text-white" size={32} />
          <div>
            <p className="text-white/70 text-sm">Selected Class</p>
            <p className="text-white text-2xl font-bold">{classInfo.displayName}</p>
          </div>
        </div>

        {/* Flight Summary */}
        <div className="glass-card p-4 bg-white/5">
          {/* ... existing flight details ... */}
        </div>

        {/* Passenger Info */}
        {/* ... existing passenger info ... */}

        {/* Price - use class-specific price */}
        <div className="flex items-center justify-between p-4 glass-card bg-cosmic-gradient">
          <div className="flex items-center gap-2">
            <DollarSign className="text-white" size={24} />
            <span className="text-white font-semibold">Total Price</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(price)}
          </span>
        </div>

        {/* Actions */}
        {/* ... existing buttons ... */}
      </div>
    </Modal>
  );
};
```

### Update `components/bookings/BookingCard.tsx`

**Add seat class display:**

```typescript
export const BookingCard = ({ booking, flight }: BookingCardProps) => {
  const classInfo = SEAT_CLASS_INFO[booking.seat_class];
  const ClassIcon = getSeatClassIcon(booking.seat_class);
  
  return (
    <Card>
      {/* Add class badge */}
      <div className="flex items-center gap-2 mb-2">
        <ClassIcon className={classInfo.color} size={16} />
        <span className={`text-sm font-semibold ${classInfo.color}`}>
          {classInfo.displayName}
        </span>
      </div>
      
      {/* Show price paid */}
      <p className="text-star-white/70">
        Paid: {formatCurrency(booking.price_paid)}
      </p>
      
      {/* ... rest of booking card ... */}
    </Card>
  );
};
```

## 5. Visual Design Enhancements

### Color Scheme by Class

```css
/* Economy - Blue theme */
.economy-gradient { background: linear-gradient(135deg, #3b82f6, #1e40af); }
.economy-border { border-color: #3b82f6; }

/* Business - Purple theme */
.business-gradient { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.business-border { border-color: #a855f7; }

/* Galaxium - Gold theme */
.galaxium-gradient { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.galaxium-border { border-color: #fbbf24; }
```

### Card Hover Effects

- Subtle glow effect matching class color
- Slight scale on hover
- Smooth transitions

## 6. Responsive Design

- **Mobile (< 768px):** Single column, stacked cards
- **Tablet (768px - 1024px):** Two columns
- **Desktop (> 1024px):** Three columns

## 7. Accessibility

- Clear class indicators with icons AND text
- Color is not the only differentiator
- Keyboard navigation support
- Screen reader friendly labels
- ARIA labels for class selection

## Implementation Order

1. ✅ Update [`types/index.ts`](booking_system_frontend/src/types/index.ts:1)
2. ✅ Create [`utils/seatClass.ts`](booking_system_frontend/src/utils/seatClass.ts:1)
3. ✅ Update [`services/api.ts`](booking_system_frontend/src/services/api.ts:1)
4. ✅ Update [`components/flights/FlightCard.tsx`](booking_system_frontend/src/components/flights/FlightCard.tsx:1)
5. ✅ Update [`pages/Flights.tsx`](booking_system_frontend/src/pages/Flights.tsx:1)
6. ✅ Update [`components/bookings/BookingModal.tsx`](booking_system_frontend/src/components/bookings/BookingModal.tsx:1)
7. ✅ Update [`components/bookings/BookingCard.tsx`](booking_system_frontend/src/components/bookings/BookingCard.tsx:1)
8. ✅ Test all flows thoroughly

## User Experience Flow

1. User visits Flights page
2. Sees all flights expanded by class (3 cards per flight)
3. Can filter by specific class or view all
4. Clicks "Book Economy/Business/Galaxium" on desired card
5. Modal shows selected class prominently
6. Confirms booking with class-specific price
7. Booking history shows class and price paid

## Next Steps

See implementation plan summary in the main README or proceed with backend implementation first.