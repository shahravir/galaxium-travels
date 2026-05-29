import type { Flight, FlightWithClass, SeatClass, SeatClassInfo } from '../types';
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

// Made with Bob
