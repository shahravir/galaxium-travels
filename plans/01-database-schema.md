# Database Schema Design for Seat Classes

## Overview
This document outlines the database schema changes required to support three seat classes: Economy, Business, and Galaxium.

## Current Schema Issues

The current [`Flight`](booking_system_backend/models.py:12) model has:
- Single `price` field (line 19)
- Single `seats_available` field (line 20)

The current [`Booking`](booking_system_backend/models.py:22) model lacks:
- Seat class information
- Price paid at booking time

## Proposed Schema Changes

### 1. Flight Model Modifications

**Remove:**
- `price: Integer` (single price field)
- `seats_available: Integer` (single availability field)

**Add:**
```python
# Economy class
economy_price = Column(Integer, nullable=False)
economy_seats_available = Column(Integer, nullable=False)

# Business class  
business_price = Column(Integer, nullable=False)
business_seats_available = Column(Integer, nullable=False)

# Galaxium class
galaxium_price = Column(Integer, nullable=False)
galaxium_seats_available = Column(Integer, nullable=False)
```

**Rationale:**
- Each class has independent pricing (custom multipliers per flight)
- Separate seat inventories per class
- Allows flexible pricing strategies (e.g., premium routes can have different multipliers)

### 2. Booking Model Modifications

**Add:**
```python
seat_class = Column(String, nullable=False)  # 'economy', 'business', or 'galaxium'
price_paid = Column(Integer, nullable=False)  # Price at time of booking
```

**Rationale:**
- `seat_class`: Track which class was booked for proper seat restoration on cancellation
- `price_paid`: Historical record of transaction amount (prices may change over time)

### 3. Database Migration Strategy

**Phase 1: Schema Update**
1. Add new columns to Flight table with default values
2. Add new columns to Booking table with default values
3. Keep old columns temporarily for backward compatibility

**Phase 2: Data Migration**
1. For existing flights:
   - Set `economy_price = price`
   - Set `economy_seats_available = seats_available`
   - Set `business_price = price * 2`
   - Set `business_seats_available = 0` (no business seats initially)
   - Set `galaxium_price = price * 3`
   - Set `galaxium_seats_available = 0` (no galaxium seats initially)

2. For existing bookings:
   - Set `seat_class = 'economy'` (all existing bookings become economy)
   - Set `price_paid = flight.price` (use original flight price)

**Phase 3: Cleanup**
1. Remove old `price` and `seats_available` columns from Flight
2. Update all queries and services to use new fields

### 4. Seed Data Updates

Update [`seed.py`](booking_system_backend/seed.py:30) to include all three classes:

```python
Flight(
    origin="Earth", 
    destination="Mars",
    departure_time="2099-01-01T09:00:00Z",
    arrival_time="2099-01-01T17:00:00Z",
    economy_price=1000000,
    economy_seats_available=10,
    business_price=2000000,
    business_seats_available=5,
    galaxium_price=3000000,
    galaxium_seats_available=2
)
```

## Schema Validation Rules

1. **Price Constraints:**
   - All prices must be > 0
   - Typically: `business_price >= economy_price`
   - Typically: `galaxium_price >= business_price`

2. **Seat Constraints:**
   - All seat counts must be >= 0
   - Total seats per flight should be reasonable (e.g., < 1000)

3. **Booking Constraints:**
   - `seat_class` must be one of: 'economy', 'business', 'galaxium'
   - `price_paid` must match the flight's class price at booking time

## Impact Analysis

### Files to Modify:
1. [`models.py`](booking_system_backend/models.py:1) - Update Flight and Booking models
2. [`schemas.py`](booking_system_backend/schemas.py:1) - Update Pydantic schemas
3. [`seed.py`](booking_system_backend/seed.py:1) - Update seed data
4. [`db.py`](booking_system_backend/db.py:1) - May need migration script

### Backward Compatibility:
- Breaking change: Existing API responses will change structure
- Frontend must be updated simultaneously with backend
- Consider API versioning if gradual rollout needed

## Next Steps

1. Review and approve schema design
2. Create database migration script
3. Update backend models and schemas (see [02-backend-changes.md](plans/02-backend-changes.md))
4. Update frontend types and components (see [03-frontend-changes.md](plans/03-frontend-changes.md))