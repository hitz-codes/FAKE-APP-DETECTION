#!/usr/bin/env python3
"""
Backend startup script with proper error handling
"""
import sys
import os

# Add parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ['fastapi', 'uvicorn', 'pandas', 'pydantic']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        print(f"   {', '.join(missing_packages)}")
        print("\n📦 Install with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def main():
    """Start the FastAPI backend"""
    if not check_dependencies():
        sys.exit(1)
    
    try:
        print("🚀 Starting FastAPI backend...")
        import uvicorn
        import main
        
        print("✅ Dependencies loaded successfully!")
        print("🌐 API will be available at: http://localhost:8000")
        print("📚 API documentation: http://localhost:8000/docs")
        print("🔍 Health check: http://localhost:8000/api/health")
        print("\n🎯 Starting server...")
        
        uvicorn.run(main.app, host="0.0.0.0", port=8000, reload=True)
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
