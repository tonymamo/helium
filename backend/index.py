from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import your FastAPI app directly since we're in the same directory
from localization_management_api.main import app as fastapi_app

# Create a new FastAPI app instance
app = FastAPI()

# Copy all routes from the original app
for route in fastapi_app.routes:
    app.routes.append(route)

# Define allowed origins
ALLOWED_ORIGINS = [
    "https://helium-localization.fly.dev",
    "http://localhost:3000",  # For local development
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create handler for AWS Lambda
handler = Mangum(app)

# Export the handler directly
__all__ = ["handler"]

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 