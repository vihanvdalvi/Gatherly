from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection # function to get a database connection
from schemas import TimeSlotCreate, TimeSlotResponse, GroupFreeTimesResponse, CommonSlotWithLocations, UserLocationSlot # format for user data
from typing import List

# create a router for schedule-related endpoints
router = APIRouter()

# --------
# Add availability time slot for a user
# POST /schedule/{user_id}/add
# --------
@router.post("/{user_id}/addTimeSlot", response_model=TimeSlotResponse)
def add_time_slot(user_id: int, slot: TimeSlotCreate):
    
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
@router.get("/{user_id}", response_model=List[TimeSlotResponse])
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


# --------
# Get common free intervals for all members of a group on a specific day
# GET /schedule/group/{group_id}/free_times?day_of_week=...
# --------

# --------
# Helper file to convert seconds past 7:00 am to HH:MM format for easier debugging (not an API endpoint)
# --------

def seconds_to_hhmm(seconds: int) -> str:
    """Convert seconds past 7AM to HH:MM string."""
    total_seconds = seconds + 7 * 3600  # 7AM offset
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    return f"{hours:02d}:{minutes:02d}"

def hhmm_to_seconds(hhmm: str) -> int:
    """Convert HH:MM string to seconds past 7AM."""
    hours, minutes = map(int, hhmm.split(":"))
    return hours * 3600 + minutes * 60 - 7 * 3600

@router.get("/group/{group_id}/free_times", response_model=GroupFreeTimesResponse)
def get_group_free_times(group_id: int, day_of_week: int):
    if not (0 <= day_of_week <= 6):
        raise HTTPException(status_code=400, detail="Invalid day_of_week")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # --- Get all users in the group ---
        cursor.execute("""
            SELECT u.user_id, u.home_location
            FROM GroupMemberships gm
            JOIN Users u ON gm.user_id = u.user_id
            WHERE gm.group_id = ?
        """, (group_id,))
        users = cursor.fetchall()  # list of (user_id, home_location)
        if not users:
            raise HTTPException(status_code=404, detail="No users found in this group")

        # --- Get busy slots for each user on the given day ---
        user_busy_slots = {}
        for user_id, home_location in users:
            cursor.execute("""
                SELECT start_seconds, end_seconds, location
                FROM Availability
                WHERE user_id = ? AND day_of_week = ?
                ORDER BY start_seconds
            """, (user_id, day_of_week))
            slots = cursor.fetchall()  # list of (start_seconds, end_seconds, location)
            user_busy_slots[user_id] = {
                "home_location": home_location,
                "slots": slots
            }

        # --- Initialize free intervals as the full day: 0 -> 43200 seconds (7AM–7PM) ---
        day_start = 0
        day_end = 12 * 3600  # 7 AM to 7 PM
        free_intervals = [(day_start, day_end)]

        # --- Subtract each user's busy slots from the current free intervals ---
        for user_id, info in user_busy_slots.items():
            next_free = []
            user_slots = info["slots"]

            for free_start, free_end in free_intervals:
                curr_start = free_start
                for busy_start, busy_end, _loc in user_slots:
                    if busy_end <= curr_start:
                        continue  # busy slot ends before free interval start
                    if busy_start >= free_end:
                        break  # busy slot starts after free interval ends
                    if curr_start < busy_start:
                        next_free.append((curr_start, busy_start))
                    curr_start = max(curr_start, busy_end)
                if curr_start < free_end:
                    next_free.append((curr_start, free_end))
            free_intervals = next_free

        # --- For each free interval, determine each user's location ---
        common_slots: List[CommonSlotWithLocations] = []

        for start, end in free_intervals:
            user_locations = []
            for user_id, info in user_busy_slots.items():
                last_loc = info["home_location"]
                # find the last busy slot ending before this free interval
                for busy_start, busy_end, loc in info["slots"]:
                    if busy_end <= start:
                        last_loc = loc
                    else:
                        break
                user_locations.append(UserLocationSlot(user_id=user_id, location=last_loc))

            # Add HH:MM strings for frontend
            common_slots.append(CommonSlotWithLocations(
                start_seconds=start,
                end_seconds=end,
                start_hhmm=seconds_to_hhmm(start),
                end_hhmm=seconds_to_hhmm(end),
                user_locations=user_locations
            ))

    finally:
        conn.close()  # always close DB connection

    # --- Return the response ---
    return GroupFreeTimesResponse(
        day_of_week=day_of_week,
        slots=common_slots
    )