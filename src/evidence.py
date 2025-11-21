# src/evidence.py

from .brand_config import BRANDS

def generate_evidence(row):
    brand = row["brand"].lower()
    cfg = BRANDS.get(brand, {})

    app = row["app_name"]
    pkg = row["package_name"]
    pub = row["publisher"]
    score = row["risk_score"]

    lower_name = app.lower()
    reasons = []

    # ---------------------------
    # 1. Publisher mismatch
    # ---------------------------
    official_pub = cfg.get("official_publisher", "").lower()
    if official_pub and pub.lower() != official_pub:
        reasons.append(
            f"- Publisher mismatch (found: '{pub}', expected: '{cfg.get('official_publisher', 'N/A')}')"
        )

    # ---------------------------
    # 2. Suspicious keywords
    # ---------------------------
    for k in cfg.get("keywords", []):
        if k in lower_name:
            reasons.append(f"- Contains suspicious keyword: '{k}'")
            break

    # ---------------------------
    # 3. Typosquat / Alias match
    # ---------------------------
    for alias in cfg.get("aliases", []):
        if alias in lower_name:
            reasons.append(f"- Matches known typosquat pattern: '{alias}'")
            break

    # ---------------------------
    # Format output report
    # ---------------------------
    report = f"""
==============================
EVIDENCE REPORT — {app}
Brand: {brand.upper()}
Risk Score: {score}
Package: {pkg}
Publisher: {pub}
==============================

Reasons:
{chr(10).join(reasons) if reasons else "No suspicious indicators found."}

"""
    return report
