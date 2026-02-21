# ==== routes/users.py ====
from fastapi import APIRouter, HTTPException
from database import get_db_connection # function to get a database connection
from auth import hash_password, verify_password # password utilities
from schemas import UserCreate, UserLogin, UserResponse # format for user data
import random # for generating random group codes

# create a router for user-related endpoints
router = APIRouter()

# ------
# Endpoint: Signup for a new user 
# Post /users/signup
# ------
@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate):
    
    # If connection fails, raise an HTTP 500 error
    conn = get_db_connection()
    # cursor is a pyodbc cursor object that allows us to execute SQL queries
    cursor = conn.cursor()
    
    # check if the email already exists in the database
    cursor.execute("SELECT user_id FROM Users WHERE email = ?", user.email)
    
    # If a record is found, it means the email is already registered, so we raise an HTTP 400 error
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before storing it
    hashed_pwd = hash_password(user.password)
    
    # Insert new user and get generated user_id
    cursor.execute("""
        INSERT INTO Users (name, email, password_hash, home_location)
        OUTPUT INSERTED.user_id
        VALUES (?, ?, ?, ?)
    """, user.name, user.email, hashed_pwd, user.home_location)
    
    user_id = cursor.fetchone()[0] # get the generated user_id
    conn.commit() # commit the transaction
    conn.close() # close the cursor connection with the database

    # Return the user_id in the schema response model
    return UserResponse(
        user_id=user_id,
        name=user.name,
        email=user.email,
        home_location=user.home_location
    )

# ------
# Endpoint: Login
# POST /users/login
# ------
@router.post("/login")
def login(credentials: UserLogin):
    
    # establish a database connection
    conn = get_db_connection()
    # create a cursor to execute SQL queries using the connection established by get_db_connection()
    cursor = conn.cursor()
    
    # retrieve the user record based on the provided email
    cursor.execute(
        "SELECT user_id, name, email, password_hash, home_location FROM Users WHERE email = ?", 
        credentials.email
    )
    
    # fetchone() retrieves the first row of the result set returned by the SQL query. If no record is found, it returns None.
    row = cursor.fetchone()
    # close the database connection after fetching the user record
    conn.close() 
    
    # if user record is found, verify the provided password against the stored hashed password
    if not row:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # unpack the user record into individual variables
    user_id, name, email, hashed_pwd, home_location = row
    
    # verify the password 
    # no need to rehash the provided password, we can directly compare it with the stored hashed password using the verify_password function from auth module
    if not verify_password(credentials.password, hashed_pwd):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # return the user info using the UserResponse schema, excluding the password
    return UserResponse(
        user_id=user_id,
        name=name,
        email=email,
        home_location=home_location
    )
    
# ------
# Endpoint: List all groups a user belongs to
# GET /users/{user_id}/list-groups
# ------
@router.get("/{user_id}/list-groups")
def list_user_groups(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Only fetch group ID and name for groups this user belongs to
    cursor.execute("""
        SELECT g.group_id, g.group_name
        FROM GroupMemberships gm
        JOIN Groups g ON gm.group_id = g.group_id
        WHERE gm.user_id = ?
    """, user_id)
    
    rows = cursor.fetchall()
    conn.close()
    
    return [{"group_id": gid, "group_name": gname} for gid, gname in rows]
    