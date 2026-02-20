import os 
import pyodbc
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# SQL Server connection string from environment variable
connection_string = os.getenv('DATABASE_URL')

def get_db_connection():
    """Establishes a connection to the SQL Server database."""
    try:
        conn = pyodbc.connect(connection_string)
        print("Database connection established successfully.")
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None