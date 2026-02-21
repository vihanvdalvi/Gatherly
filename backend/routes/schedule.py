from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection # function to get a database connection
from schemas import UserResponse, TimeSlotResponse # format for user data

# create a router for schedule-related endpoints
router = APIRouter()

# --------
# Add availability time slot for a user
# POST /schedule/{user_id}/add
# --------
@router.post("/{user_id}/addTimeSlot")
def add_time_slot(user_id: int, slot: TimeSlotResponse):
    
    # validate input
    # day_of_week should be between 0 and 6, start_seconds and end_seconds should be between 0 and 43200 (7AM to 7PM)
    if not (0 <= slot.day_of_week <= 6):
        raise HTTPException(status_code=400, detail="Invalid day_of_week")
    if not (0 <= slot.start_seconds < slot.end_seconds <= 12*3600):
        raise HTTPException(status_code=400, detail="Time must be between 0 and 43200 seconds (7AM–7PM)")
    
    # connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # check for overlap 
        cursor.execute("""
            SELECT start_seconds, end_seconds FROM Availability
            WHERE user_id = ? AND day_of_week = ?
        """, user_id, slot.day_of_week)
        
        # check if the new time slot overlaps with any existing time slots for the same user and day
        for existing_start, existing_end in cursor.fetchall():
            if existing_start < slot.end_seconds and existing_end > slot.start_seconds:
                raise HTTPException(status_code=400, detail="Time slot overlaps existing slot")
        
        # insert the new time slot into the database
        cursor.execute("""
            INSERT INTO Availability (user_id, day_of_week, start_seconds, end_seconds, location, purpose)
            OUTPUT INSERTED.availability_id
            VALUES (?, ?, ?, ?, ?, ?)
        """, user_id, slot.day_of_week, slot.start_seconds, slot.end_seconds, slot.location, slot.purpose)

        # get the generated availability_id from the database
        availability_id = cursor.fetchone()[0]
        conn.commit() # finalize changes to the database
        
        # return the created time slot with its new availability_id
        return TimeSlotResponse(
            availability_id=availability_id,
            day_of_week=slot.day_of_week,
            start_seconds=slot.start_seconds,
            end_seconds=slot.end_seconds,
            location=slot.location,
            purpose=slot.purpose
        )
    finally:
        conn.close() # always close the database connection

# --------
# Get user schedule
# GET /schedule/{user_id}
# --------
@router.get("/{user_id}", response_model=list[TimeSlotResponse])
def get_schedule(user_id: int):
    
    # connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # query the database for all availability time slots for the given user_id, ordered by day_of_week and start_seconds
        cursor.execute("""
            SELECT availability_id, day_of_week, start_seconds, end_seconds, location, purpose
            FROM Availability
            WHERE user_id = ?
            ORDER BY day_of_week, start_seconds
        """, user_id)

        # fetch all rows returned by the query and convert them into a list of TimeSlotResponse objects to return as the API response
        rows = cursor.fetchall()
        return [
            TimeSlotResponse(
                availability_id=row[0],
                day_of_week=row[1],
                start_seconds=row[2],
                end_seconds=row[3],
                location=row[4],
                purpose=row[5]
            )
            for row in rows
        ]
    finally:
        conn.close() # always close the database connection

# --------
# Delete availability slot
# DELETE /schedule/{availability_id}
# --------
@router.delete("/{availability_id}")
def delete_time_slot(availability_id: int):
    
    # connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # delete the time slot with the given availability_id from the database
        cursor.execute("DELETE FROM Availability WHERE availability_id = ?", availability_id)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Time slot not found")
        conn.commit() # finalize changes to the database
    finally:
        conn.close() # always close the database connection
    
    return {"detail": "Time slot deleted successfully"}
