#!/usr/bin/env python3
"""
Test script to verify core modules can be imported
"""
import sys
import os

# Add src to path
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

try:
    from src.scoring import calculate_risk
    print("✅ src.scoring imported successfully")
    
    from src.evidence import generate_evidence
    print("✅ src.evidence imported successfully")
    
    from src.takedown import generate_takedown_email
    print("✅ src.takedown imported successfully")
    
    # Test basic functionality
    score = calculate_risk("Fake PhonePe", "Fake Publisher", "phonepe")
    print(f"✅ Risk calculation works: {score}/100")
    
    # Test evidence generation
    test_app = {
        "app_name": "Fake PhonePe",
        "package_name": "com.fake.phonepe",
        "publisher": "Fake Publisher", 
        "brand": "phonepe",
        "risk_score": score
    }
    evidence = generate_evidence(test_app)
    print(f"✅ Evidence generation works: {len(evidence)} characters")
    
    print("\n🎉 All core modules are working correctly!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Runtime error: {e}")
