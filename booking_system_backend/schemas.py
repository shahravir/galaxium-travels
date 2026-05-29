from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional


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


class BookingRequest(BaseModel):
    user_id: int
    name: str
    flight_id: int
    seat_class: str  # 'economy', 'business', or 'galaxium'
    includes_infant: bool = False
    infant_name: Optional[str] = None

    @model_validator(mode='after')
    def validate_infant_name(self):
        if self.includes_infant and not (self.infant_name and self.infant_name.strip()):
            raise ValueError('infant_name is required when traveling with a lap infant')
        return self


class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    flight_id: int
    seat_class: str
    price_paid: int
    includes_infant: bool
    infant_name: Optional[str] = None
    infant_fee: int
    status: str
    booking_time: str

    class Config:
        from_attributes = True


class UserRegistration(BaseModel):
    name: str
    email: EmailStr


class UserOut(BaseModel):
    user_id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    error_code: str
    details: Optional[str] = None
