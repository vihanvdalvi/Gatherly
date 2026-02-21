from fastapi import APIRouter, HTTPException
from database import get_db_connection # function to get a database connection
from auth import hash_password, verify_password # password utilities
from schemas import UserCreate, UserLogin, UserResponse # format for user data

# create a router for user-related endpoints
router = APIRouter()

# ---- Signup ----
@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM Users WHERE email = ?", user.email)
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pwd = hash_password(user.password)
        cursor.execute("""
            INSERT INTO Users (name, email, password_hash, home_location)
            OUTPUT INSERTED.user_id
            VALUES (?, ?, ?, ?)
        """, user.name, user.email, hashed_pwd, user.home_location)
        user_id = cursor.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return UserResponse(
        user_id=user_id,
        name=user.name,
        email=user.email,
        home_location=user.home_location
    )

# ---- Login ----
@router.post("/login")
def login(credentials: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT user_id, name, email, password_hash, home_location FROM Users WHERE email = ?", 
            credentials.email
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        user_id, name, email, hashed_pwd, home_location = row

        if not verify_password(credentials.password, hashed_pwd):
            raise HTTPException(status_code=400, detail="Invalid email or password")
    finally:
        conn.close()

    return UserResponse(
        user_id=user_id,
        name=name,
        email=email,
        home_location=home_location
    )

# ---- List User Groups ----
@router.get("/{user_id}/list-groups")
def list_user_groups(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT g.group_id, g.group_name
            FROM GroupMemberships gm
            JOIN Groups g ON gm.group_id = g.group_id
            WHERE gm.user_id = ?
        """, user_id)
        rows = cursor.fetchall()
    finally:
        conn.close()

    return [{"group_id": gid, "group_name": gname} for gid, gname in rows]