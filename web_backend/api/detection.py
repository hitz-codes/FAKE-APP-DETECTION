from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os

# Add parent directories to path for imports
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(ROOT, "src")
WEB_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)
if WEB_BACKEND_DIR not in sys.path:
    sys.path.insert(0, WEB_BACKEND_DIR)

from src.scoring import calculate_risk
from src.evidence import generate_evidence
from models import (
    AppData, DetectionRequest, DetectionResponse,
    SingleAppRequest, SingleAppResponse, PaginationParams,
    PaginatedResponse, BrandType
)

router = APIRouter()

def get_all_apps_data() -> List[AppData]:
    """Get all apps data (import from main module)"""
    # Import here to avoid circular imports
    sys.path.insert(0, WEB_BACKEND_DIR)
    from main import load_apps_data
    return load_apps_data()

@router.post("/run", response_model=DetectionResponse)
async def run_detection(request: DetectionRequest):
    """
    Run detection on all apps with optional brand and threshold filters
    """
    try:
        apps = get_all_apps_data()

        # Filter by brand if specified
        if request.brand != BrandType.ALL:
            apps = [app for app in apps if app.brand == request.brand.value]

        # Filter by threshold
        suspicious_apps = [app for app in apps if app.risk_score >= request.threshold]

        return DetectionResponse(
            results=apps,
            total_detected=len(apps),
            suspicious_count=len(suspicious_apps)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running detection: {str(e)}")

@router.get("/results", response_model=PaginatedResponse)
async def get_results(
    brand: Optional[str] = Query(None, description="Filter by brand"),
    threshold: Optional[int] = Query(None, ge=0, le=100, description="Minimum risk score"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get paginated detection results with optional filtering
    """
    try:
        apps = get_all_apps_data()

        # Filter by brand if specified
        if brand and brand != "all":
            apps = [app for app in apps if app.brand == brand.lower()]

        # Filter by threshold if specified
        if threshold is not None:
            apps = [app for app in apps if app.risk_score >= threshold]

        # Sort by risk score (highest first)
        apps.sort(key=lambda x: x.risk_score, reverse=True)

        # Pagination
        total = len(apps)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_apps = apps[start_idx:end_idx]

        return PaginatedResponse(
            results=paginated_apps,
            pagination={
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            },
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting results: {str(e)}")

@router.post("/single", response_model=SingleAppResponse)
async def check_single_app(request: SingleAppRequest):
    """
    Analyze a single app manually
    """
    try:
        # Calculate risk score
        risk_score = calculate_risk(
            request.app_name,
            request.publisher,
            request.brand.value
        )

        # Create app data object
        app_data = AppData(
            app_name=request.app_name,
            package_name=request.package_name,
            publisher=request.publisher,
            brand=request.brand.value,
            risk_score=risk_score,
            is_official=False  # Manual checks are assumed non-official
        )

        # Generate evidence
        evidence_dict = {
            "app_name": request.app_name,
            "package_name": request.package_name,
            "publisher": request.publisher,
            "brand": request.brand.value,
            "risk_score": risk_score
        }
        evidence_text = generate_evidence(evidence_dict)

        return SingleAppResponse(
            risk_score=risk_score,
            evidence=evidence_text,
            app_data=app_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing app: {str(e)}")

@router.get("/brands")
async def get_supported_brands():
    """
    Get list of supported brands
    """
    return [
        {"value": "all", "label": "All Brands"},
        {"value": "phonepe", "label": "PhonePe"},
        {"value": "paytm", "label": "Paytm"},
        {"value": "gpay", "label": "GPay"}
    ]
