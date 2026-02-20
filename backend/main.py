from fastapi import FastAPI
from fastapi.responses import HTMLResponse

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

