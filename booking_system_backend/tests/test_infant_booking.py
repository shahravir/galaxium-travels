import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from models import User, Flight
from schemas import ErrorResponse
from services import booking
from services.booking import calculate_infant_fee
from tests.conftest import make_flight


class TestInfantBooking:
    """Tests for lap infant booking."""

    def test_calculate_infant_fee(self):
        assert calculate_infant_fee(1_000_000) == 100_000

    def test_book_flight_with_infant(self, db_session):
        db_session.add(User(name="Test User", email="test@example.com"))
        db_session.add(make_flight())
        db_session.commit()

        user_obj = db_session.query(User).first()
        flight_obj = db_session.query(Flight).first()

        result = booking.book_flight(
            db_session,
            user_obj.user_id,
            "Test User",
            flight_obj.flight_id,
            "economy",
            includes_infant=True,
            infant_name="Baby Voyager",
        )

        assert result.includes_infant is True
        assert result.infant_name == "Baby Voyager"
        assert result.infant_fee == 100_000
        assert result.price_paid == 1_100_000

        db_session.refresh(flight_obj)
        assert flight_obj.economy_seats_available == 4

    def test_book_flight_without_infant_defaults(self, db_session):
        db_session.add(User(name="Test User", email="test@example.com"))
        db_session.add(make_flight())
        db_session.commit()

        user_obj = db_session.query(User).first()
        flight_obj = db_session.query(Flight).first()

        result = booking.book_flight(
            db_session,
            user_obj.user_id,
            "Test User",
            flight_obj.flight_id,
            "economy",
        )

        assert result.includes_infant is False
        assert result.infant_name is None
        assert result.infant_fee == 0
        assert result.price_paid == 1_000_000

    def test_book_flight_infant_missing_name(self, db_session):
        db_session.add(User(name="Test User", email="test@example.com"))
        db_session.add(make_flight())
        db_session.commit()

        user_obj = db_session.query(User).first()
        flight_obj = db_session.query(Flight).first()

        result = booking.book_flight(
            db_session,
            user_obj.user_id,
            "Test User",
            flight_obj.flight_id,
            "economy",
            includes_infant=True,
            infant_name="   ",
        )

        assert isinstance(result, ErrorResponse)
        assert result.error_code == "INFANT_NAME_REQUIRED"
