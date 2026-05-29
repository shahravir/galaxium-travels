import { useState, useEffect } from 'react';
import {
  Search as CarbonSearch,
  Checkbox,
  Tag,
  Grid,
  Column,
} from '@carbon/react';
import { Filter } from '@carbon/icons-react';
import type { Flight, FlightWithClass, SeatClass } from '../types';
import { LoadingSpinner } from '../components/common';
import { FlightCard } from '../components/flights/FlightCard';
import { UserIdentification } from '../components/user/UserIdentification';
import { BookingModal } from '../components/bookings/BookingModal';
import { getFlights } from '../services/api';
import { useUser } from '../hooks/useUser';
import { expandFlightByClass } from '../utils/seatClass';
import toast from 'react-hot-toast';

export const Flights = () => {
  const { user } = useUser();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [expandedFlights, setExpandedFlights] = useState<FlightWithClass[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightWithClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<SeatClass | 'all'>('all');
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [selectedFlightWithClass, setSelectedFlightWithClass] = useState<FlightWithClass | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch flights on mount
  useEffect(() => {
    loadFlights();
  }, []);

  // Expand flights by class when flights change
  useEffect(() => {
    const expanded = flights.flatMap(expandFlightByClass);
    setExpandedFlights(expanded);
  }, [flights]);

  // Filter flights when search term or filters change
  useEffect(() => {
    let filtered = expandedFlights;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (fw) =>
          fw.flight.origin.toLowerCase().includes(term) ||
          fw.flight.destination.toLowerCase().includes(term)
      );
    }

    // Filter by class
    if (classFilter !== 'all') {
      filtered = filtered.filter((fw) => fw.seatClass === classFilter);
    }

    // Filter sold out
    if (!showSoldOut) {
      filtered = filtered.filter((fw) => fw.seatsAvailable > 0);
    }

    setFilteredFlights(filtered);
  }, [searchTerm, expandedFlights, classFilter, showSoldOut]);

  const loadFlights = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    setIsLoading(true);
    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error: any) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Failed to load flights, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return loadFlights(retryCount + 1);
      }
      toast.error('Failed to load flights after multiple attempts');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = (flightWithClass: FlightWithClass) => {
    setSelectedFlightWithClass(flightWithClass);
    
    if (!user) {
      // Show user identification modal first
      setShowUserModal(true);
    } else {
      // Show booking confirmation modal
      setShowBookingModal(true);
    }
  };

  const handleUserIdentified = () => {
    // After user signs in, show booking modal
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // Reload flights to get updated seat availability
    loadFlights();
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Grid>
        <Column sm={4} md={8} lg={16}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Available Flights
            </h1>
            <p style={{ fontSize: '1.125rem', opacity: 0.8 }}>
              Choose your destination and embark on an interplanetary adventure
            </p>
          </div>

          {/* Search and Filters */}
          <div style={{ marginBottom: '2rem' }}>
            <CarbonSearch
              labelText="Search flights"
              placeholder="Search by origin or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
              style={{ marginBottom: '1.5rem' }}
            />

            {/* Class Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={20} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Class:</span>
              </div>
              <Tag
                type={classFilter === 'all' ? 'purple' : 'gray'}
                onClick={() => setClassFilter('all')}
                style={{ cursor: 'pointer' }}
              >
                All Classes
              </Tag>
              <Tag
                type={classFilter === 'economy' ? 'blue' : 'gray'}
                onClick={() => setClassFilter('economy')}
                style={{ cursor: 'pointer' }}
              >
                Economy
              </Tag>
              <Tag
                type={classFilter === 'business' ? 'purple' : 'gray'}
                onClick={() => setClassFilter('business')}
                style={{ cursor: 'pointer' }}
              >
                Business
              </Tag>
              <Tag
                type={classFilter === 'galaxium' ? 'magenta' : 'gray'}
                onClick={() => setClassFilter('galaxium')}
                style={{ cursor: 'pointer' }}
              >
                Galaxium
              </Tag>

              <div style={{ marginLeft: 'auto' }}>
                <Checkbox
                  id="show-sold-out"
                  labelText="Show sold out"
                  checked={showSoldOut}
                  onChange={(e) => setShowSoldOut(e.target.checked)}
                />
              </div>
            </div>

            {/* Results count */}
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Showing {filteredFlights.length} of {expandedFlights.length} options
            </div>
          </div>

          {/* Flights Grid */}
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading flights..." />
          ) : filteredFlights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '1.125rem', opacity: 0.8 }}>
                {searchTerm ? 'No flights found matching your search' : 'No flights available'}
              </p>
            </div>
          ) : (
            <Grid narrow style={{ marginTop: '1.5rem' }}>
              {filteredFlights.map((fw, index) => (
                <Column key={`${fw.flight.flight_id}-${fw.seatClass}-${index}`} sm={4} md={4} lg={5}>
                  <FlightCard
                    flightWithClass={fw}
                    onBook={handleBookFlight}
                  />
                </Column>
              ))}
            </Grid>
          )}
        </Column>
      </Grid>

      {/* User Identification Modal */}
      <UserIdentification
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={handleUserIdentified}
      />

      {/* Booking Confirmation Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        flightWithClass={selectedFlightWithClass}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

// Made with Bob
