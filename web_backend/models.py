from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class BrandType(str, Enum):
    ALL = "all"
    PHONEPE = "phonepe"
    PAYTM = "paytm"
    GPAY = "gpay"

class AppData(BaseModel):
    app_name: str
    package_name: str
    publisher: str
    brand: BrandType
    risk_score: int = Field(ge=0, le=100)
    is_official: Optional[bool] = None

class DetectionRequest(BaseModel):
    brand: BrandType = BrandType.ALL
    threshold: int = Field(default=50, ge=0, le=100)

class DetectionResponse(BaseModel):
    results: List[AppData]
    total_detected: int
    suspicious_count: int

class SingleAppRequest(BaseModel):
    app_name: str
    package_name: str
    publisher: str
    brand: BrandType

class SingleAppResponse(BaseModel):
    risk_score: int
    evidence: str
    app_data: AppData

class EvidenceRequest(BaseModel):
    app_ids: List[str]
    threshold: int = Field(default=50, ge=0, le=100)

class EvidenceResponse(BaseModel):
    evidence_text: str
    apps_processed: int

class TakedownRequest(BaseModel):
    app_id: str

class TakedownResponse(BaseModel):
    email_text: str
    app_details: AppData

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class PaginatedResponse(BaseModel):
    results: List[AppData]
    pagination: dict
    total: int
    page: int
    limit: int
    total_pages: int
