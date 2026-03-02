# Gatherly 🎯

Finds the ideal meeting spot on UW-Madison campus for a group, factoring in everyone's schedules and walking distances.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Azure SQL Server
- **Graph Library**: NetworkX
- **API Routes**: Modular router structure for users, groups, schedules, and algorithms

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS variables with component-based design
- **State Management**: Context API (AuthContext)

### Graph & Algorithms
- **NetworkX**: Directed graph representing campus buildings and walking times
- **Campus Graph**: Digraph dataset with buildings as nodes and travel times as edges
- **Shortest Path**: Dijkstra's algorithm precomputed for all node pairs
- **Node Coordinates**: CSV-based location database with latitude/longitude

## How It Works

### 1. Free Time Calculation
- Retrieves all group members' busy schedules from database
- Subtracts busy slots from full day (7 AM - 7 PM)
- Identifies common free intervals where ALL users are available

### 2. Meeting Location Selectionwith Dijkstra's shortest path distances:

```
fairness_score = average_travel_time + 0.5 * standard_deviation
```

Where travel times are calculated using Dijkstra's algorithm on the campus digraph:```

- Calculates walking time from each user's location to candidate buildings
- Penalizes buildings where one person travels significantly more than others
- Selects location that distributes travel burden fairly across the group

### 3. User Location Tracking
- Determines each user's starting location as the last known location before the meeting slot
- Falls back to home location if user has no prior activities
- Calculates optimal walking route with intermediate step-by-step nodes

## Database Schema
- **Users**: User profiles with home locations
- **Groups**: Group memberships and metadata
- **Availability**: User busy/free time slots with location information
- **Relationships**: Links between users, groups, and schedules

## Key Features
- 🎯 Fairness-based meeting location algorithm
- 📍 Campus graph with accurate walking distances
- 👥 Group-based scheduling
- 📊 Real-time availability calculations
- 🗓️ Multi-day schedule support

## Data Sources
**External Dataset**: Our algorithm leverages an external UW-Madison campus graph dataset containing buildings, nodes, and travel times as edges. This dataset powers all shortest path calculations and location scoring computations. Additional data collection and validation were conducted by our team to ensure accuracy of walking times and building locations.
