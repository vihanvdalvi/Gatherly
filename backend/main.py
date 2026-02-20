from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from database import get_db_connection

app = FastAPI(title = "Gatherly API")

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
        
