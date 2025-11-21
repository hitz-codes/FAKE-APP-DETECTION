# src/takedown.py
# Multi‑Brand Takedown Email Generator (FINAL VERSION)

from .brand_config import BRANDS


def generate_takedown_email(app_name, package_name, publisher, risk_score, brand):
    brand = brand.lower().strip()

    cfg = BRANDS.get(brand, {})

    # Official names may be a list — choose the primary display name
    official_display = cfg.get("official_names", ["Unknown Brand"])[0]
    official_pub = cfg.get("official_publisher", "N/A")

    return f"""
To: App Store Compliance Team
Subject: URGENT — Fake {official_display} Impersonator Detected

Dear Team,

We have detected a potentially fraudulent or impersonator application targeting the brand **{official_display}**.

The following suspicious app has been flagged by our Fake App Detection System:

App Details:
- App Name: {app_name}
- Package Name: {package_name}
- Publisher: {publisher}
- Risk Score: {risk_score}/100
- Expected Official Publisher: {official_pub}

Based on multiple indicators (publisher mismatch, naming similarity, suspicious keywords, and typosquatting patterns),
this application is likely attempting to impersonate the legitimate {official_display} app.

We request an immediate review and appropriate action (removal / suspension) to protect users from fraud, phishing,
or unauthorized data collection.

Thank you,
Fake App Detection Team
"""
