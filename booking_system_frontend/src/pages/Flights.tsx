import { useState, useEffect } from 'react';
import type { Flight, FlightWithClass, SeatClass } from '../types';
import { LoadingSpinner } from '../components/common';
import { FlightCard } from '../components/flights/FlightCard';
import { UserIdentification } from '../components/user/UserIdentification';
import { BookingModal } from '../components/bookings/BookingModal';
import { getFlights } from '../services/api';
import { useUser } from '../hooks/useUser';
import { expandFlightByClass } from '../utils/seatClass';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-star-white mb-4">
          Available <span className="bg-cosmic-gradient bg-clip-text text-transparent">Flights</span>
        </h1>
        <p className="text-star-white/70 text-lg">
          Choose your destination and embark on an interplanetary adventure
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-star-white/50" size={20} />
            <input
              type="text"
              placeholder="Search by origin or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-star-white placeholder-star-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-purple"
            />
          </div>

          {/* Class Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-star-white/70">
              <Filter size={20} />
              <span className="text-sm font-medium">Class:</span>
            </div>
            <button
              onClick={() => setClassFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                classFilter === 'all'
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-white/5 text-star-white/70 hover:bg-white/10'
              }`}
            >
              All Classes
            </button>
            <button
              onClick={() => setClassFilter('economy')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                classFilter === 'economy'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-star-white/70 hover:bg-white/10'
              }`}
            >
              Economy
            </button>
            <button
              onClick={() => setClassFilter('business')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                classFilter === 'business'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-star-white/70 hover:bg-white/10'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => setClassFilter('galaxium')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                classFilter === 'galaxium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/5 text-star-white/70 hover:bg-white/10'
              }`}
            >
              Galaxium
            </button>

            <label className="flex items-center gap-2 text-star-white/70 ml-auto">
              <input
                type="checkbox"
                checked={showSoldOut}
                onChange={(e) => setShowSoldOut(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show sold out</span>
            </label>
          </div>

          {/* Results count */}
          <div className="text-star-white/70 text-sm">
            Showing {filteredFlights.length} of {expandedFlights.length} options
          </div>
        </div>
      </motion.div>

      {/* Flights Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading flights..." />
      ) : filteredFlights.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-star-white/70 text-lg">
            {searchTerm ? 'No flights found matching your search' : 'No flights available'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredFlights.map((fw, index) => (
            <FlightCard
              key={`${fw.flight.flight_id}-${fw.seatClass}-${index}`}
              flightWithClass={fw}
              onBook={handleBookFlight}
            />
          ))}
        </motion.div>
      )}

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
