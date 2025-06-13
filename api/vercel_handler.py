from api.index import app
from mangum import Mangum
import asyncio

# Create a new handler instance specifically for Vercel
handler = Mangum(app, api_gateway_base_path="/api")

# Export the handler
__all__ = ["handler"]

# Ensure the event loop is properly configured
loop = asyncio.get_event_loop()
if not loop.is_running():
    loop.run_until_complete(app.startup()) 