from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from database import get_db_connection
from graph.graph_utils import CampusGraph # import the graph utilities to initialize the campus graph 

# create the main FastAPI application instance
app = FastAPI(title = "Gatherly API")

# include the routers for different API endpoints
# this allows us to organize our API endpoints into separate modules (users, groups, schedule, algorithm) while still having them all accessible under the main FastAPI application
from routes import user, groups, schedule, algorithm
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
app.include_router(algorithm.router, prefix="/algorithm", tags=["algorithm"])

# load the campus graph when the application starts
# can be used effeciently for all graph-related queries without needing to reload or recompute paths each time
campus_graph = CampusGraph()

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Gatherly backend</title>
        </head>
        <body>
            <h1>FAST API Backend is Running</h1>
        </body>
    </html>
    """

@app.get("/db-test", response_class=HTMLResponse)
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        return """
        <html>
            <head>
                <title>Gatherly backend</title>
            </head>
            <body>
                <h1>Azure SQL Database Connection Test Passed</h1>
            </body>
        </html>
        """
    except Exception as e:
        return {"message": "Database connection failed", "error": str(e)}
