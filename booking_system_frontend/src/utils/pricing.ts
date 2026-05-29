/** Lap infant fare is 10% of the adult seat price (matches backend). */
export const INFANT_FARE_RATE = 0.1;

export const calculateInfantFee = (seatPrice: number): number =>
  Math.floor(seatPrice * INFANT_FARE_RATE);

export const calculateTotalWithInfant = (
  seatPrice: number,
  includesInfant: boolean
): { adultFare: number; infantFee: number; total: number } => {
  const infantFee = includesInfant ? calculateInfantFee(seatPrice) : 0;
  return {
    adultFare: seatPrice,
    infantFee,
    total: seatPrice + infantFee,
  };
};
