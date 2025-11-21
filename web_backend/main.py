from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os
import sys
import pandas as pd
from typing import List, Optional

# Add src to path for imports
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

# Import existing modules
from src.scoring import calculate_risk
from src.evidence import generate_evidence
from src.takedown import generate_takedown_email

# Import API routers and models
from api.detection import router as detection_router
from api.evidence import router as evidence_router
from models import AppData, BrandType

# Initialize FastAPI app
app = FastAPI(
    title="Fake App Detection API",
    description="Web API for detecting fake financial apps",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(detection_router, prefix="/api/detection", tags=["detection"])
app.include_router(evidence_router, prefix="/api/evidence", tags=["evidence"])

# Global variables for caching
DATA_PATH = os.path.join(ROOT, "data", "apps.csv")
OUTPUT_DIR = os.path.join(ROOT, "output")
_cached_apps_data: Optional[List[AppData]] = None

def ensure_output_dir():
    """Ensure output directory exists"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_apps_data() -> List[AppData]:
    """Load and cache apps data from CSV"""
    global _cached_apps_data
    
    if _cached_apps_data is not None:
        return _cached_apps_data
    
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=500, detail=f"Data file not found: {DATA_PATH}")
    
    try:
        df = pd.read_csv(DATA_PATH)
        
        # Filter out comment lines and empty rows
        df = df[df['app_name'].notna() & (df['app_name'].str.strip() != '')]
        df = df[~df['app_name'].str.startswith('#')]
        
        # Convert to AppData objects
        apps = []
        for _, row in df.iterrows():
            try:
                # Calculate risk score for each app
                risk_score = calculate_risk(
                    row['app_name'], 
                    row['publisher'], 
                    row['brand']
                )
                
                app = AppData(
                    app_name=row['app_name'],
                    package_name=row['package_name'],
                    publisher=row['publisher'],
                    brand=row['brand'].lower(),
                    risk_score=risk_score,
                    is_official=row.get('is_official', '').upper() == 'YES' if pd.notna(row.get('is_official')) else None
                )
                apps.append(app)
            except Exception as e:
                # Skip invalid rows but continue processing
                continue
        
        _cached_apps_data = apps
        return apps
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")

@app.get("/")
async def root():
    """Redirect to API documentation"""
    return RedirectResponse(url="/docs")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Fake App Detection API is running"}

@app.get("/api/apps", response_model=List[AppData])
async def get_all_apps():
    """Get all apps with risk scores"""
    return load_apps_data()

@app.on_event("startup")
async def startup_event():
    """Preload data on startup"""
    ensure_output_dir()
    load_apps_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
