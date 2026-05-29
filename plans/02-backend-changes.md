# Backend API Changes for Seat Classes

## Overview
This document details all backend modifications needed to support the three seat classes: Economy, Business, and Galaxium.

## 1. Models Changes (`models.py`)

### Flight Model Update

**Current (lines 12-20):**
```python
class Flight(Base):
    __tablename__ = 'flights'
    flight_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    seats_available = Column(Integer, nullable=False)
```

**New:**
```python
class Flight(Base):
    __tablename__ = 'flights'
    flight_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    
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

### Booking Model Update

**Current (lines 22-28):**
```python
class Booking(Base):
    __tablename__ = 'bookings'
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    flight_id = Column(Integer, ForeignKey('flights.flight_id'), nullable=False)
    status = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
```

**New:**
```python
class Booking(Base):
    __tablename__ = 'bookings'
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    flight_id = Column(Integer, ForeignKey('flights.flight_id'), nullable=False)
    seat_class = Column(String, nullable=False)  # 'economy', 'business', 'galaxium'
    price_paid = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
```

## 2. Schemas Changes (`schemas.py`)

### FlightOut Schema Update

**Current (lines 5-15):**
```python
class FlightOut(BaseModel):
    flight_id: int
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    price: int
    seats_available: int

    class Config:
        from_attributes = True
```

**New:**
```python
class FlightOut(BaseModel):
    flight_id: int
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    
    # Economy class
    economy_price: int
    economy_seats_available: int
    
    # Business class
    business_price: int
    business_seats_available: int
    
    # Galaxium class
    galaxium_price: int
    galaxium_seats_available: int

    class Config:
        from_attributes = True
```

### BookingRequest Schema Update

**Current (lines 18-22):**
```python
class BookingRequest(BaseModel):
    user_id: int
    name: str
    flight_id: int
```

**New:**
```python
class BookingRequest(BaseModel):
    user_id: int
    name: str
    flight_id: int
    seat_class: str  # 'economy', 'business', or 'galaxium'
```

### BookingOut Schema Update

**Current (lines 24-32):**
```python
class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    flight_id: int
    status: str
    booking_time: str

    class Config:
        from_attributes = True
```

**New:**
```python
class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    flight_id: int
    seat_class: str
    price_paid: int
    status: str
    booking_time: str

    class Config:
        from_attributes = True
```

## 3. Service Layer Changes

### `services/booking.py` - book_flight Function

**Current Logic (lines 7-54):**
- Checks if flight exists
- Checks if `seats_available < 1`
- Decrements `seats_available` by 1
- Creates booking without seat class

**New Logic:**
```python
def book_flight(db: Session, user_id: int, name: str, flight_id: int, seat_class: str) -> BookingOut | ErrorResponse:
    """Book a seat on a specific flight for a user in the specified class."""
    
    # Validate seat_class
    if seat_class not in ['economy', 'business', 'galaxium']:
        return ErrorResponse(
            error="Invalid seat class",
            error_code="INVALID_SEAT_CLASS",
            details=f"Seat class must be 'economy', 'business', or 'galaxium'. Got: '{seat_class}'"
        )
    
    # Check flight exists
    flight = db.query(Flight).filter(Flight.flight_id == flight_id).first()
    if not flight:
        return ErrorResponse(
            error="Flight not found",
            error_code="FLIGHT_NOT_FOUND",
            details=f"The specified flight_id {flight_id} does not exist in our system."
        )
    
    # Check seats available for the specific class
    seats_field = f"{seat_class}_seats_available"
    price_field = f"{seat_class}_price"
    
    seats_available = getattr(flight, seats_field)
    price = getattr(flight, price_field)
    
    if seats_available < 1:
        return ErrorResponse(
            error=f"No {seat_class} seats available",
            error_code="NO_SEATS_AVAILABLE",
            details=f"The flight has no available {seat_class} class seats. Please try a different class or flight."
        )
    
    # Check user exists and name matches
    user = db.query(User).filter(User.user_id == user_id, User.name == name).first()
    if not user:
        # ... existing user validation logic ...
    
    # Decrement seats for the specific class
    setattr(flight, seats_field, seats_available - 1)
    
    # Create booking with seat class and price
    new_booking = Booking(
        user_id=user_id,
        flight_id=flight_id,
        seat_class=seat_class,
        price_paid=price,
        status="booked",
        booking_time=datetime.utcnow().isoformat()
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return BookingOut.model_validate(new_booking)
```

### `services/booking.py` - cancel_booking Function

**Current Logic (lines 57-82):**
- Restores `flight.seats_available += 1`

**New Logic:**
```python
def cancel_booking(db: Session, booking_id: int) -> BookingOut | ErrorResponse:
    """Cancel an existing booking by its booking_id."""
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        return ErrorResponse(
            error="Booking not found",
            error_code="BOOKING_NOT_FOUND",
            details=f"Booking with ID {booking_id} not found."
        )
    
    if booking.status == "cancelled":
        return ErrorResponse(
            error="Booking already cancelled",
            error_code="ALREADY_CANCELLED",
            details=f"Booking {booking_id} is already cancelled."
        )
    
    # Restore seat to the correct class
    flight = db.query(Flight).filter(Flight.flight_id == booking.flight_id).first()
    if flight:
        seats_field = f"{booking.seat_class}_seats_available"
        current_seats = getattr(flight, seats_field)
        setattr(flight, seats_field, current_seats + 1)
    
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)
```

### `services/flight.py` - No Changes Required

The [`list_flights`](booking_system_backend/services/flight.py:1) function returns all flight data, which will automatically include the new fields once the model is updated.

## 4. REST API Endpoints (`server.py`)

### Update POST /api/book Endpoint

**Current:**
```python
@app.post("/api/book", response_model=BookingOut)
def book_flight_endpoint(request: BookingRequest, db: Session = Depends(get_db)):
    result = booking_service.book_flight(db, request.user_id, request.name, request.flight_id)
    # ...
```

**New:**
```python
@app.post("/api/book", response_model=BookingOut)
def book_flight_endpoint(request: BookingRequest, db: Session = Depends(get_db)):
    result = booking_service.book_flight(
        db, 
        request.user_id, 
        request.name, 
        request.flight_id,
        request.seat_class  # Add seat_class parameter
    )
    # ... rest of error handling
```

### Update MCP Tools

**MCP book_flight tool:**
```python
@mcp.tool()
def book_flight(user_id: int, name: str, flight_id: int, seat_class: str) -> str:
    """
    Book a seat on a specific flight for a user in the specified class.
    
    Args:
        user_id: The ID of the user making the booking
        name: The name of the user (must match registered name)
        flight_id: The ID of the flight to book
        seat_class: The seat class to book ('economy', 'business', or 'galaxium')
    """
    db = SessionLocal()
    try:
        result = booking_service.book_flight(db, user_id, name, flight_id, seat_class)
        # ... rest of implementation
```

## 5. Error Handling Updates

### New Error Codes:
- `INVALID_SEAT_CLASS`: When seat_class is not one of the valid options
- `NO_SEATS_AVAILABLE`: Updated to include seat class in message

### Updated Error Messages:
- Include seat class context in all booking-related errors
- Provide helpful suggestions (e.g., "Try a different class")

## 6. Testing Updates

### Update `tests/test_services.py`

**New Test Cases Needed:**
1. `test_book_flight_economy_class()` - Book economy seat
2. `test_book_flight_business_class()` - Book business seat
3. `test_book_flight_galaxium_class()` - Book galaxium seat
4. `test_book_flight_invalid_class()` - Invalid seat class error
5. `test_book_flight_no_economy_seats()` - Economy sold out
6. `test_book_flight_no_business_seats()` - Business sold out
7. `test_cancel_booking_restores_correct_class()` - Verify seat restoration to correct class
8. `test_multiple_bookings_different_classes()` - Book different classes on same flight

### Update `tests/test_rest.py`

**Update Existing Tests:**
- Add `seat_class` to all booking request payloads
- Update assertions to check for new fields in responses
- Test all three seat classes via REST API

## 7. Migration Script

Create `booking_system_backend/migrate_seat_classes.py`:

```python
from db import SessionLocal, engine
from models import Base, Flight, Booking
from sqlalchemy import text

def migrate():
    """Migrate existing data to support seat classes."""
    db = SessionLocal()
    
    try:
        # Add new columns to Flight table
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE flights 
                ADD COLUMN economy_price INTEGER,
                ADD COLUMN economy_seats_available INTEGER,
                ADD COLUMN business_price INTEGER,
                ADD COLUMN business_seats_available INTEGER,
                ADD COLUMN galaxium_price INTEGER,
                ADD COLUMN galaxium_seats_available INTEGER
            """))
            conn.commit()
        
        # Migrate flight data
        flights = db.query(Flight).all()
        for flight in flights:
            flight.economy_price = flight.price
            flight.economy_seats_available = flight.seats_available
            flight.business_price = flight.price * 2
            flight.business_seats_available = 0
            flight.galaxium_price = flight.price * 3
            flight.galaxium_seats_available = 0
        
        # Add new columns to Booking table
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE bookings
                ADD COLUMN seat_class TEXT,
                ADD COLUMN price_paid INTEGER
            """))
            conn.commit()
        
        # Migrate booking data
        bookings = db.query(Booking).all()
        for booking in bookings:
            booking.seat_class = 'economy'
            flight = db.query(Flight).filter(Flight.flight_id == booking.flight_id).first()
            booking.price_paid = flight.economy_price if flight else 0
        
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
```

## Implementation Order

1. ✅ Update [`models.py`](booking_system_backend/models.py:1) - Add new columns
2. ✅ Run migration script to update existing data
3. ✅ Update [`schemas.py`](booking_system_backend/schemas.py:1) - Update Pydantic models
4. ✅ Update [`services/booking.py`](booking_system_backend/services/booking.py:1) - Update business logic
5. ✅ Update [`server.py`](booking_system_backend/server.py:1) - Update REST and MCP endpoints
6. ✅ Update [`seed.py`](booking_system_backend/seed.py:1) - Update seed data
7. ✅ Update tests - Add new test cases
8. ✅ Test thoroughly before frontend changes

## Backward Compatibility Notes

⚠️ **Breaking Changes:**
- API response structure changes (Flight and Booking objects)
- API request structure changes (BookingRequest requires seat_class)
- Frontend must be updated simultaneously

## Next Steps

See [03-frontend-changes.md](plans/03-frontend-changes.md) for frontend implementation details.