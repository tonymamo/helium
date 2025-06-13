from api.index import app
from mangum import Mangum

# Create a new handler instance specifically for Vercel
handler = Mangum(app)

# Export the handler
__all__ = ["handler"] 