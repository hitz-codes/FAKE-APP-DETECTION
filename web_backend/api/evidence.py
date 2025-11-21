from fastapi import APIRouter, HTTPException
from typing import List
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

from src.evidence import generate_evidence
from src.takedown import generate_takedown_email
from models import (
    EvidenceRequest, EvidenceResponse,
    TakedownRequest, TakedownResponse, AppData
)

router = APIRouter()

def get_all_apps_data() -> List[AppData]:
    """Get all apps data (import from main module)"""
    # Import here to avoid circular imports
    sys.path.insert(0, WEB_BACKEND_DIR)
    from main import load_apps_data
    return load_apps_data()

def find_app_by_package_name(package_name: str) -> AppData:
    """Find app by package name"""
    apps = get_all_apps_data()
    for app in apps:
        if app.package_name == package_name:
            return app
    return None

@router.post("/generate", response_model=EvidenceResponse)
async def generate_evidence_files(request: EvidenceRequest):
    """
    Generate evidence for suspicious apps
    """
    try:
        apps = get_all_apps_data()

        # Filter apps by threshold and specified app IDs
        suspicious_apps = []
        for app in apps:
            if app.risk_score >= request.threshold:
                if not request.app_ids or app.package_name in request.app_ids:
                    suspicious_apps.append(app)

        if not suspicious_apps:
            return EvidenceResponse(
                evidence_text="No suspicious apps found matching the criteria.",
                apps_processed=0
            )

        # Generate evidence for each suspicious app
        evidence_texts = []
        for app in suspicious_apps:
            app_dict = {
                "app_name": app.app_name,
                "package_name": app.package_name,
                "publisher": app.publisher,
                "brand": app.brand,
                "risk_score": app.risk_score
            }
            evidence_text = generate_evidence(app_dict)
            evidence_texts.append(evidence_text)

        combined_evidence = "\n".join(evidence_texts)

        return EvidenceResponse(
            evidence_text=combined_evidence,
            apps_processed=len(suspicious_apps)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating evidence: {str(e)}")

@router.post("/takedown", response_model=TakedownResponse)
async def generate_takedown_email(request: TakedownRequest):
    """
    Generate takedown email for a specific app
    """
    try:
        app = find_app_by_package_name(request.app_id)

        if not app:
            raise HTTPException(
                status_code=404,
                detail=f"App with package name '{request.app_id}' not found"
            )

        # Generate takedown email using existing function
        email_text = generate_takedown_email(
            app.app_name,
            app.package_name,
            app.publisher,
            app.risk_score,
            app.brand
        )

        return TakedownResponse(
            email_text=email_text,
            app_details=app
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating takedown email: {str(e)}")

@router.get("/app/{app_id}/evidence")
async def get_app_evidence(app_id: str):
    """
    Get evidence for a specific app by package name
    """
    try:
        app = find_app_by_package_name(app_id)

        if not app:
            raise HTTPException(
                status_code=404,
                detail=f"App with package name '{app_id}' not found"
            )

        # Generate evidence
        app_dict = {
            "app_name": app.app_name,
            "package_name": app.package_name,
            "publisher": app.publisher,
            "brand": app.brand,
            "risk_score": app.risk_score
        }
        evidence_text = generate_evidence(app_dict)

        return {
            "app": app,
            "evidence": evidence_text
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting evidence: {str(e)}")
