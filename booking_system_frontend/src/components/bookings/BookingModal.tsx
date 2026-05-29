import { useState } from 'react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  TextInput,
  Stack,
} from '@carbon/react';
import { Calendar, Time, Currency, UserAvatar } from '@carbon/icons-react';
import type { FlightWithClass } from '../../types';
import { Button } from '../common';
import { formatCurrency, formatDate, calculateDuration } from '../../utils/formatters';
import { SEAT_CLASS_INFO, getSeatClassIcon } from '../../utils/seatClass';
import { calculateTotalWithInfant } from '../../utils/pricing';
import { bookFlight, isErrorResponse } from '../../services/api';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightWithClass: FlightWithClass | null;
  onSuccess: () => void;
}

export const BookingModal = ({ isOpen, onClose, flightWithClass, onSuccess }: BookingModalProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [includesInfant, setIncludesInfant] = useState(false);
  const [infantName, setInfantName] = useState('');

  if (!flightWithClass) return null;

  const { flight, seatClass, price } = flightWithClass;
  const classInfo = SEAT_CLASS_INFO[seatClass];
  const ClassIcon = getSeatClassIcon(seatClass);
  const { adultFare, infantFee, total } = calculateTotalWithInfant(price, includesInfant);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a flight');
      return;
    }

    if (includesInfant && !infantName.trim()) {
      toast.error('Please enter the lap infant\'s name');
      return;
    }

    setIsLoading(true);

    try {
      const result = await bookFlight({
        user_id: user.user_id,
        name: user.name,
        flight_id: flight.flight_id,
        seat_class: seatClass,
        includes_infant: includesInfant,
        infant_name: includesInfant ? infantName.trim() : undefined,
      });

      if (isErrorResponse(result)) {
        toast.error(result.details || result.error);
        return;
      }

      const infantNote = includesInfant ? ' (with lap infant)' : '';
      toast.success(`${classInfo.displayName} class booked successfully${infantNote}!`);
      setIncludesInfant(false);
      setInfantName('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.details || error.error || 'Failed to book flight');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIncludesInfant(false);
    setInfantName('');
    onClose();
  };

  return (
    <ComposedModal
      open={isOpen}
      onClose={handleClose}
      size="md"
    >
      <ModalHeader title="Confirm Your Booking" />
      <ModalBody>
        <Stack gap={6}>
          {/* Class Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '0.5rem'
          }}>
            <ClassIcon size={32} />
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Selected Class</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{classInfo.displayName}</p>
            </div>
          </div>

          {/* Flight Summary */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              {flight.origin} → {flight.destination}
            </h4>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
              Flight #{flight.flight_id} • {classInfo.displayName}
            </p>

            <Stack gap={4}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Calendar size={20} />
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Departure</p>
                  <p style={{ fontWeight: 500 }}>{formatDate(flight.departure_time)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Calendar size={20} />
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Arrival</p>
                  <p style={{ fontWeight: 500 }}>{formatDate(flight.arrival_time)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Time size={20} />
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Duration</p>
                  <p style={{ fontWeight: 500 }}>
                    {calculateDuration(flight.departure_time, flight.arrival_time)}
                  </p>
                </div>
              </div>
            </Stack>
          </div>

          {/* Passenger Info */}
          {user && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Passenger Information
              </h4>
              <p>{user.name}</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{user.email}</p>
            </div>
          )}

          {/* Lap infant */}
          <div>
            <Checkbox
              id="includes-infant"
              labelText={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserAvatar size={20} />
                  Traveling with a lap infant
                </span>
              }
              checked={includesInfant}
              onChange={(e) => {
                setIncludesInfant(e.target.checked);
                if (!e.target.checked) setInfantName('');
              }}
            />
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Lap infants do not use an extra seat. Infant fare is 10% of the {classInfo.displayName} seat price.
            </p>
            {includesInfant && (
              <TextInput
                id="infant-name"
                labelText="Infant name"
                placeholder="Infant's full name"
                value={infantName}
                onChange={(e) => setInfantName(e.target.value)}
                style={{ marginTop: '1rem' }}
              />
            )}
          </div>

          {/* Price breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Adult fare ({classInfo.displayName})</span>
              <span>{formatCurrency(adultFare)}</span>
            </div>
            {includesInfant && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <UserAvatar size={14} />
                  Lap infant (10%)
                </span>
                <span>{formatCurrency(infantFee)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Currency size={20} />
                <span style={{ fontWeight: 600 }}>Total</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
            By confirming, you agree to our terms and conditions
          </p>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmBooking}
          isLoading={isLoading}
        >
          Confirm Booking
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};
