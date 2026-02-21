from fastapi import APIRouter, HTTPException  # for creating API routes and handling HTTP errors
from typing import List  # for type hinting lists
from database import get_db_connection  # function to get a database connection
from schemas import GroupFreeTimesResponseWithName, CommonSlotWithLocationsWithName, UserLocationSlotWithName  # new schemas
from main import campus_graph  # the preloaded CampusGraph instance

# create a router for algorithm-related endpoints
router = APIRouter()

# Helper function to convert seconds past 7:00 am to "HH:MM" format
def seconds_to_hhmm(seconds):
    # Convert seconds past 7:00 am to total seconds from midnight
    total_seconds = seconds + 7 * 3600
    # floor division to get hours
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    return f"{hours:02d}:{minutes:02d}"

# --------
# Endpoint: Get best meeting times for a group based on free slots and travel times
# GET /algorithm/group/{group_id}/best_meeting_times?day_of_week=...&meeting_duration=...
# duration (minimum time user wants to meet for is in minutes, e.g., 30 for 30 minutes)
# --------
@router.get("/group/{group_id}/best_meeting_times", response_model=GroupFreeTimesResponseWithName)
def get_best_meeting_times(group_id: int, day_of_week: int, meeting_duration: int):

    if not (0 <= day_of_week <= 6):
        raise HTTPException(status_code=400, detail="Invalid day_of_week")

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # --- Get all users in the group including names ---
        cursor.execute("""
            SELECT u.user_id, u.home_location, u.name
            FROM GroupMemberships gm
            JOIN Users u ON gm.user_id = u.user_id
            WHERE gm.group_id = ?
        """, (group_id,))
        users = cursor.fetchall()  # list of (user_id, home_location, name)
        
        if not users:
            raise HTTPException(status_code=404, detail="No users found in this group")

        # --- Get busy slots for each user on the given day ---
        user_busy_slots = {}
        for user_id, home_location, name in users:
            cursor.execute("""
                SELECT start_seconds, end_seconds, location
                FROM Availability
                WHERE user_id = ? AND day_of_week = ?
                ORDER BY start_seconds
            """, (user_id, day_of_week))
            slots = cursor.fetchall()  # list of (start_seconds, end_seconds, location)

            # Store busy slots and user info including name for later processing
            # We'll need names to show on frontend
            user_busy_slots[user_id] = {
                "home_location": home_location,
                "name": name,
                "slots_with_names": [(start, end, loc, name) for start, end, loc in slots]
            }

        # --- Initialize free intervals for the full day ---
        day_start = 0
        day_end = 12 * 3600  # 7 AM to 7 PM
        free_intervals = [(day_start, day_end)]

        # --- Subtract each user's busy slots from the current free intervals ---
        for user_id, info in user_busy_slots.items():
            next_free = []
            user_slots = info["slots_with_names"]

            for free_start, free_end in free_intervals:
                curr_start = free_start
                for busy_start, busy_end, _loc, _name in user_slots:
                    if busy_end <= curr_start:
                        continue  # busy slot ends before free interval starts
                    if busy_start >= free_end:
                        break  # busy slot starts after free interval ends
                    if curr_start < busy_start:
                        next_free.append((curr_start, busy_start))  # free interval before busy slot
                    curr_start = max(curr_start, busy_end)  # move current start past busy slot
                if curr_start < free_end:
                    next_free.append((curr_start, free_end))  # remaining free interval
            free_intervals = next_free  # update free intervals for next user

        # --- For each free interval, compute walking times to all buildings ---
        candidate_slots: List[CommonSlotWithLocationsWithName] = []
        all_buildings = list(campus_graph.graph.nodes)  # all campus buildings

        for start, end in free_intervals:
            user_starts = []
            user_names = {}

            # Determine last known location for each user before this free interval
            for user_id, info in user_busy_slots.items():
                last_loc = info["home_location"]
                for busy_start, busy_end, loc, _name in info["slots_with_names"]:
                    if busy_end <= start:
                        last_loc = loc
                    else:
                        break
                user_starts.append(last_loc)
                user_names[user_id] = info["name"]

            # Find best meeting building based on total travel time
            best_buildings = campus_graph.best_meeting_building(user_starts, candidate_buildings=all_buildings)
            top_building, _ = best_buildings[0]

            # Compute individual walking times and track max walk
            walking_times = []
            max_walk = 0
            for user_id, loc in zip(user_busy_slots.keys(), user_starts):
                walk_time = campus_graph.get_shortest_time(loc, top_building)
                walking_times.append(UserLocationSlotWithName(
                    user_id=user_id,
                    name=user_names[user_id],
                    location=loc,
                    walk_time=walk_time
                ))
                if walk_time > max_walk:
                    max_walk = walk_time

            # Only include interval if enough time for meeting + max walk
            if end - start >= meeting_duration * 60 + max_walk:
                candidate_slots.append(CommonSlotWithLocationsWithName(
                    start_seconds=start,
                    end_seconds=end,
                    start_hhmm=seconds_to_hhmm(start),
                    end_hhmm=seconds_to_hhmm(end),
                    meeting_location=top_building,
                    user_locations=walking_times
                ))

    finally:
        conn.close()  # always close the database connection

    return GroupFreeTimesResponseWithName(
        day_of_week=day_of_week,
        slots=candidate_slots
    )