from fastapi import APIRouter
from graph.graph_utils import CampusGraph

# create router for graph endpoints
router = APIRouter()

# use the existing campus_graph instance (or you can pass it in during startup)
campus_graph = CampusGraph()

# ------
# Endpoint: Get all locations on campus
# GET /graph/all_locations
# ------
@router.get("/all_locations")
def get_all_locations():
    """
    Returns a list of all nodes/locations in the campus graph.
    Can be used to populate a frontend search/dropdown component.
    """
    return {"locations": campus_graph.get_all_locations()}

# ------
# Endpoint: Get shortest travel time between two locations
# GET /graph/shortest_time?start=LocationA&end=LocationB
# ------
@router.get("/shortest_time")
def shortest_time(start: str, end: str):
    """
    Returns the shortest travel time in seconds between two campus locations.
    """
    time_sec = campus_graph.get_shortest_time(start, end)
    return {"start": start, "end": end, "seconds": time_sec}

# ------
# Endpoint: Get shortest path between two locations
# GET /graph/shortest_path?start=LocationA&end=LocationB
# ------
@router.get("/shortest_path")
def shortest_path(start: str, end: str):
    """
    Returns the shortest path as a list of node names from start to end.
    """
    path = campus_graph.get_shortest_path(start, end)
    return {"start": start, "end": end, "path": path}

# ------
# Endpoint: Get shortest path with coordinates
# GET /graph/shortest_path_with_coords?start=LocationA&end=LocationB
# ------
@router.get("/shortest_path_with_coords")
def shortest_path_with_coords(start: str, end: str):
    """
    Returns the shortest path with coordinates for each node.
    """
    path_with_coords = campus_graph.get_shortest_path_with_coords(start, end)
    return {"start": start, "end": end, "path": path_with_coords}