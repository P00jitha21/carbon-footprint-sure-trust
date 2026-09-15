from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_database
from app.api import upload, analytics, recommendations, nudges, supply_chain, meal_planning, predictions, achievements, search

app = FastAPI(
    title="CarbonSight API",
    description="AI-Powered Carbon Footprint Tracking System",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    print("✅ Database initialized")

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CarbonSight API",
        "version": "2.0.0"
    }

# Include routers
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["Recommendations"])
app.include_router(nudges.router, prefix="/api/v1", tags=["Nudges"])
app.include_router(supply_chain.router, prefix="/api/v1", tags=["Supply Chain"])
app.include_router(meal_planning.router, prefix="/api/v1", tags=["Meal Planning"])
app.include_router(predictions.router, prefix="/api/v1", tags=["Predictions"])
app.include_router(achievements.router, prefix="/api/v1", tags=["Achievements"])
app.include_router(search.router, prefix="/api/v1", tags=["Search"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CarbonSight API",
        "docs": "/docs",
        "version": "2.0.0"
    }