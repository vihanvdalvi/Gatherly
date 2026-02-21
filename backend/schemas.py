# BaseModel is a Pydantic class that provides data validation and parsing.
# EmailStr is a special type provided by Pydantic that validates that the input is a properly formatted email address.
from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ------
# First 3 schemas are in user.py to validate incoming POST requests from frontend.
# ------

# ------
# Request body for user signup
# ------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    home_location: str

# ------
# Request body for user login
# ------
class UserLogin(BaseModel):
    # emailStr is a special type that validates the email format
    email: EmailStr
    password: str

# ------
# Response model for returning user information (excluding password)
# ------
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    home_location: str
    
# ------
# Schedule / Availability related schemas
# ------

# ------
# Request body for creating a time slot for a user
# ------
class TimeSlotCreate(BaseModel):
    day_of_week: int # 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    start_seconds: int # seconds past 7:00 am
    end_seconds: int # seconds past 7:00 am
    location: str
    purpose: Optional[str] = None # optional field for user to specify the purpose of this time slot (e.g., "gym", "work", "leisure")

# ------
# Response model for returning a time slot with its assigned availability_id
# ------
class TimeSlotResponse(BaseModel):
    availability_id: int
    day_of_week: int
    start_seconds: int
    end_seconds: int
    location: str
    purpose: Optional[str] = None

# ------
# Main Algorithm related schemas
# ------

# --------
# User location for a given free slot
# --------
class UserLocationSlot(BaseModel):
    user_id: int
    location: str

# --------
# A single free slot including each user's location
# --------
class CommonSlotWithLocations(BaseModel):
    start_seconds: int
    end_seconds: int
    start_hhmm: str
    end_hhmm: str
    user_locations: List[UserLocationSlot]

# --------
# Response for a group's free times on a specific day
# --------
class GroupFreeTimesResponse(BaseModel):
    day_of_week: int
    slots: List[CommonSlotWithLocations]