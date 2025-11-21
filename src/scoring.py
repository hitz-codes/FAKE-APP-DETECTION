# src/scoring.py
# Multi‑Brand Risk Scoring (FINAL VERSION)

from .brand_config import BRANDS
from .similarity import similarity


def calculate_risk(app_name: str, publisher: str, brand: str) -> int:
    """
    Multi-brand risk scoring for PhonePe / Paytm / GPay.
    Uses:
    - name similarity
    - publisher mismatch
    - suspicious keywords
    - alias / typosquat detection
    """

    brand = brand.lower().strip()
    cfg = BRANDS.get(brand)

    # If brand unknown → consider highly risky
    if not cfg:
        return 100

    score = 0
    name_low = app_name.lower()
    publisher_low = publisher.lower().strip()

    # -------------------------
    # 1. Name similarity vs official names
    # -------------------------
    similarities = []
    for off in cfg.get("official_names", []):
        similarities.append(similarity(app_name, off))

    max_sim = max(similarities) if similarities else 0

    if max_sim < 60:
        score += 30
    if max_sim < 40:
        score += 20

    # -------------------------
    # 2. Publisher mismatch
    # -------------------------
    official_pub = cfg.get("official_publisher", "").lower()
    if official_pub and publisher_low != official_pub:
        score += 30

    # -------------------------
    # 3. Suspicious keywords in app name
    # -------------------------
    for k in cfg.get("keywords", []):
        if k.lower() in name_low:
            score += 10

    # -------------------------
    # 4. Alias / typosquat patterns
    # -------------------------
    for alias in cfg.get("aliases", []):
        if alias.lower() in name_low:
            score += 20

    # -------------------------
    # Bound score (0–100)
    # -------------------------
    return min(score, 100)
