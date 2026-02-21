from fastapi import APIRouter, HTTPException
from database import get_db_connection # function to get a database connection
import random # for generating random group codes
import string # for generating random group codes

# create a router for group-related endpoints
router = APIRouter()

# groups.py is for all creator-related group operations

# --------
# Helper function to generate a 6-character alphanumeric group code
# --------
def generate_group_code(length=6):
    """Generate a random alphanumeric group code for users to join group"""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))

# --------
# Endpoint: Change the group's code (creator only) for letting users join the group
# POST /groups/{group_id}/change_code
# --------
@router.post("/{group_id}/change_code")
def change_group_code(group_id: int, creator_user_id: int):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Generate a new group code
        new_code = generate_group_code()

        # Check if the group exists and if the creator_user_id matches the group's creator
        cursor.execute("SELECT creator_user_id FROM Groups WHERE group_id = ?", group_id)
        result = cursor.fetchone()
        
        # If no group is found with the given group_id, raise a 404 error
        if not result:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # If the creator_user_id does not match the group's creator, raise a 403 error
        if result[0] != creator_user_id:
            raise HTTPException(status_code=403, detail="Only the group creator can change the group code")

        # Update the group code in the database
        cursor.execute("UPDATE Groups SET group_code = ? WHERE group_id = ?", new_code, group_id)
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Group not found")

        conn.commit() # finalize changes to the database
    finally:
        conn.close() # always close the database connection

    return {"group_id": group_id, "new_group_code": new_code}

# --------
# Endpoint: Create a new group (creator only)
# POST /groups/create
# --------
@router.post("/create")
def create_group(group_name: str, creator_user_id: int):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Generate a group code
        group_code = generate_group_code()
        
        # Insert new group and get generated group_id
        cursor.execute("""
            INSERT INTO Groups (group_name, creator_user_id, group_code)
            OUTPUT INSERTED.group_id
            VALUES (?, ?, ?)
        """, group_name, creator_user_id, group_code)
        
        # fetchone() retrieves the first row of the result set returned by the SQL query, which contains the generated group_id. We store this group_id in a variable for later use.
        group_id = cursor.fetchone()[0]
        
        conn.commit() # commit the transaction
    finally:
        conn.close() # close the database connection
    
    return {"group_id": group_id, "group_code": group_code}

# --------
# Endpoint: Get group information including creator and members
# GET /groups/{group_id}/displayInfo
# --------
@router.get("/{group_id}/displayInfo")
def get_group_info(group_id: int):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get group info including creator
        cursor.execute("""
            SELECT g.group_name, u.user_id, u.name
            FROM Groups g
            JOIN Users u ON g.creator_user_id = u.user_id
            WHERE g.group_id = ?
        """, group_id)
        
        group_row = cursor.fetchone()
        
        # If no group is found with the given group_id, raise a 404 error
        if not group_row:
            raise HTTPException(status_code=404, detail="Group not found")

        # Unpack the group information into individual variables
        group_name, creator_id, creator_name = group_row

        # Get all members of the group (user_id and name)
        cursor.execute("""
            SELECT u.user_id, u.name
            FROM GroupMemberships gm
            JOIN Users u ON gm.user_id = u.user_id
            WHERE gm.group_id = ?
        """, group_id)
        members_rows = cursor.fetchall()

    finally:
        conn.close() # always close connection

    # Convert the members_rows into a list of dictionaries with user_id and name for each member
    members = [{"user_id": uid, "name": name} for uid, name in members_rows]

    # Return the group information including group name, creator info, and members list
    return {
        "group_id": group_id,
        "group_name": group_name,
        "creator": {"user_id": creator_id, "name": creator_name},
        "members": members
    }

# --------
# Endpoint: remove a member from the group (creator only)
# POST /groups/{group_id}/remove_member
# --------
@router.post("/{group_id}/remove_member")
def remove_member(group_id: int, creator_user_id: int, member_user_id: int):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the group exists and if the creator_user_id matches the group's creator
        cursor.execute("SELECT creator_user_id FROM Groups WHERE group_id = ?", group_id)
        result = cursor.fetchone()
        
        # If no group is found with the given group_id, raise a 404 error
        if not result:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # If the creator_user_id does not match the group's creator, raise a 403 error
        if result[0] != creator_user_id:
            raise HTTPException(status_code=403, detail="Only the group creator can remove members")

        # Remove the member from the group in the database
        cursor.execute("DELETE FROM GroupMemberships WHERE group_id = ? AND user_id = ?", group_id, member_user_id)
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Member not found in the group")

        conn.commit() # finalize changes to the database

    finally:
        conn.close() # always close connection

    return {"message": f"User {member_user_id} removed from group {group_id}"}

# --------
# Endpoint: User joins a group using group code
# POST /groups/{group_id}/join
# --------
@router.post("/{group_id}/join")
def join_group(group_id: int, user_id: int, group_code: str):
    """
    Adds a user to a group if the group_code matches and the user is not already a member.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if the group exists and get its code
        cursor.execute("SELECT group_code FROM Groups WHERE group_id = ?", group_id)
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Group not found")

        expected_code = row[0]

        # Validate group code
        if group_code != expected_code:
            raise HTTPException(status_code=400, detail="Invalid group code")

        # Check if the user is already a member
        cursor.execute("""
            SELECT membership_id FROM GroupMemberships
            WHERE user_id = ? AND group_id = ?
        """, user_id, group_id)
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already a member of this group")

        # Add user to group
        cursor.execute(
            "INSERT INTO GroupMemberships (user_id, group_id) VALUES (?, ?)",
            user_id, group_id
        )
        conn.commit()

    finally:
        conn.close()

    return {"group_id": group_id, "user_id": user_id, "message": "Successfully joined the group"}