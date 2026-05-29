// API Data Models matching backend schemas

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

export interface Booking {
  booking_id: number;
  user_id: number;
  flight_id: number;
  seat_class: SeatClass;
  price_paid: number;
  includes_infant: boolean;
  infant_name?: string | null;
  infant_fee: number;
  status: 'booked' | 'cancelled' | 'completed';
  booking_time: string;
}

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

export interface User {
  user_id: number;
  name: string;
  email: string;
}

// Request/Response types
export interface BookingRequest {
  user_id: number;
  name: string;
  flight_id: number;
  seat_class: SeatClass;
  includes_infant?: boolean;
  infant_name?: string;
}

export interface UserRegistration {
  name: string;
  email: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  error_code: string;
  details?: string;
}

// Extended types for UI
export interface BookingWithFlight extends Booking {
  flight?: Flight;
}

export interface FlightFilters {
  origin?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}

// User context type
export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Made with Bob
