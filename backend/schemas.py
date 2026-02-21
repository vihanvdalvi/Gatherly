# BaseModel is a Pydantic class that provides data validation and parsing.
# EmailStr is a special type provided by Pydantic that validates that the input is a properly formatted email address.
from pydantic import BaseModel, EmailStr
from typing import Optional

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