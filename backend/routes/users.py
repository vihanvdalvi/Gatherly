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
        user_id = str(cursor.fetchone()[0])
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
@router.post("/login", response_model=UserResponse)
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
        user_id=str(user_id),
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
        # First check if user exists
        cursor.execute("SELECT user_id FROM Users WHERE user_id = ?", user_id)
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        cursor.execute("""
            SELECT g.group_id, g.group_name, g.creator_user_id, g.group_code
            FROM GroupMemberships gm
            JOIN Groups g ON gm.group_id = g.group_id
            WHERE gm.user_id = ?
        """, user_id)
        rows = cursor.fetchall()
        
        groups = []
        for group_id, group_name, creator_id, group_code in rows:
            is_creator = (creator_id == user_id)
            
            # Fetch members for this group
            cursor.execute("""
                SELECT u.user_id, u.name
                FROM GroupMemberships gm
                JOIN Users u ON gm.user_id = u.user_id
                WHERE gm.group_id = ?
            """, group_id)
            members_rows = cursor.fetchall()
            members = []
            for member_user_id, member_name in members_rows:
                members.append({
                    "user_id": str(member_user_id),
                    "name": member_name,
                    "is_creator": (member_user_id == creator_id)
                })
            
            groups.append({
                "group_id": str(group_id),
                "name": group_name,
                "creator_id": str(creator_id),
                "is_creator": is_creator,
                "code": group_code,
                "members": members
            })
    except Exception as e:
        print(f"Error in list_user_groups: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

    return groups