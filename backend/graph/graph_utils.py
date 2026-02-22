import networkx as nx
import os
import csv

class CampusGraph:
    
    # ------
    # Endpoint: Encapsulate the campus graph and precompute shortest paths for efficient queries
    # This class will be instantiated once at application startup and used for all graph-related queries
    # ------ 
    def __init__(self):
        
        """
        Load the campus graph from .dot file and precompute shortest paths
        """
        
        # Get the directory where this file is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load the graph from the .dot file
        dot_file = os.path.join(current_dir, 'campus.dot')
        self.graph = nx.DiGraph(nx.nx_pydot.read_dot(dot_file))
        
        # convert edge weights to float seconds (they are read as strings from the .dot file)
        for u, v, d in self.graph.edges(data=True):
            d['seconds'] = float(d.get('seconds', 0.0))
        
        # precompute all-pairs shortest path lengths (in seconds) and store in a dictionary for O(1) access later
        self.all_pairs = dict(nx.all_pairs_dijkstra_path_length(self.graph, weight='seconds'))
        
        # --- read node coordinates ---
        self.node_coords = {}
        nodes_csv = os.path.join(current_dir, 'nodes.csv')
        with open(nodes_csv, 'r', encoding='utf-8') as f:
            next(f)  # skip header
            for line in f:
                parts = line.strip().split(',')
                if len(parts) >= 3:
                    # Last two parts are always latitude and longitude
                    try:
                        lon = float(parts[-1].strip())
                        lat = float(parts[-2].strip())
                        # Everything else is the location name
                        node = ','.join(parts[:-2]).strip()
                        self.node_coords[node] = (lat, lon)
                    except ValueError:
                        # Skip malformed lines
                        print(f"[WARNING] Skipping malformed coordinate line: {line.strip()}")
                        continue
    
    # ------
    # Endpoint: Get the shortest travel time between two locations on campus
    # GET /graph/shortest_time?start=LocationA&end=LocationB
    # ------
    def get_shortest_time(self, start: str, end: str) -> float:
        """
        Get the shortest travel time in seconds between two locations on campus
        """
        return self.all_pairs.get(start, {}).get(end, float('inf')) 
    
    # ------
    # Endpoint: Get the shortest path that a user would take to get from their starting location to a candidate meeting building
    # GET /graph/shortest_path?start=LocationA&end=LocationB
    # ------
    def get_shortest_path(self, start: str, end: str) -> list[str]:
        """Returns the sequence of nodes from start to end along the shortest path."""
        try:
            return nx.shortest_path(self.graph, source=start, target=end, weight='seconds')
        except nx.NetworkXNoPath:
            return []  # Return empty list if no path exists
    
    # ------
    # Endpoint: Get shortest path with coords
    # GET /graph/shortest_path_with_coords?start=LocationA&end=LocationB
    # ------
    def get_shortest_path_with_coords(self, start: str, end: str) -> list[dict]:
        """
        Returns a list of nodes from start to end, each with coordinates.
        Skips nodes that don't have coordinates in the database.
        Example output:
        [
            {"location": "DormA", "lat": 40.1, "lon": -88.2},
            {"location": "BuildingB", "lat": 40.12, "lon": -88.21},
            {"location": "MeetingHall", "lat": 40.15, "lon": -88.25}
        ]
        """
        
        path_nodes = self.get_shortest_path(start, end)
        result = []
        for node in path_nodes:
            # Skip nodes without coordinates
            if node in self.node_coords:
                result.append({
                    "location": node,
                    "lat": self.node_coords[node][0],
                    "lon": self.node_coords[node][1]
                })
        return result
    
    # ------
    # Endpoint: Get all locations on campus
    # GET /graph/all_locations
    # ------
    def get_all_locations(self) -> list[str]:
        """
        Returns a list of all nodes/locations in the campus graph.
        Can be used to populate a frontend search/dropdown component.
        """
        return list(self.graph.nodes)
    
    def best_meeting_building(self, user_starts: list[str], candidate_buildings: list[str] = None):
        """
        Score each candidate building by sum of shortest path from all users
        user_starts: list of starting locations for each user
        candiddate_buildings: optional list of buildings to evaluate (default: all nodes in the graph)
        Returns: list of tuples (building_name, total_seconds) sorted by total_seconds ascending
        """
        
        # scores will hold tuples of (building_name, total_seconds) for each candidate building
        scores = []
        for b in candidate_buildings:
            # total_seconds is the sum of shortest times from each user's starting location to this building
            total_time = 0
            # for each user's starting location, get the shortest time to this building and add to total_time
            for start in user_starts:
                total_time += self.get_shortest_time(start, b)
            scores.append((b, total_time))
        
        # sort by total travel time ascending
        scores.sort(key=lambda x: x[1])
        return scores
        
        
    
        