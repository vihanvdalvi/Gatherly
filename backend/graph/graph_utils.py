import networkx as nx

class CampusGraph:
    
    # ------
    # Endpoint: Encapsulate the campus graph and precompute shortest paths for efficient queries
    # This class will be instantiated once at application startup and used for all graph-related queries
    # ------ 
    def __init__(self):
        
        """
        Load the campus graph from .dot file and precompute shortest paths
        """
        
        # Load the graph from the .dot file
        self.graph = nx.DiGraph(nx.nx_pydot.read_dot('./graph/campus.dot'))
        
        # convert edge weights to float seconds (they are read as strings from the .dot file)
        for u, v, d in self.graph.edges(data=True):
            d['seconds'] = float(d.get('seconds', 0.0))
        
        # precompute all-pairs shortest path lengths (in seconds) and store in a dictionary for O(1) access later
        self.all_pairs = dict(nx.all_pairs_dijkstra_path_length(self.graph, weight='seconds'))
        
        # --- read node coordinates ---
        self.node_coords = {}
        with open('./graph/nodes.csv', 'r') as f:
            next(f)  # skip header
            for line in f:
                node, x, y = line.strip().split(',')
                self.node_coords[node] = (float(x), float(y))
    
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
        Example output:
        [
            {"location": "DormA", "lat": 40.1, "lon": -88.2},
            {"location": "BuildingB", "lat": 40.12, "lon": -88.21},
            {"location": "MeetingHall", "lat": 40.15, "lon": -88.25}
        ]
        """
        
        path_nodes = self.get_shortest_path(start, end)
        return [
            # for each node in the path, return a dictionary with the location name and its coordinates
            {"location": node, "lat": self.node_coords[node][0], "lon": self.node_coords[node][1]}
            for node in path_nodes
        ]
    
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
        
        
    
        