# Fake App Detection Web Interface

A modern web interface for detecting fake financial apps across PhonePe, Paytm, and GPay platforms.

## Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
# Clone and navigate to the project
cd FAKE-APP-DETECTION/web_backend

# Run the setup script
./setup.sh

# Start the backend
python start_backend.py
```

### Option 2: Manual Setup

#### Backend Setup
1. **Install Python Dependencies**
   ```bash
   pip install pandas fastapi uvicorn pydantic python-multipart colorama
   ```

2. **Start the Backend**
   ```bash
   cd web_backend
   python start_backend.py
   ```

#### Frontend Setup
1. **Install Node.js Dependencies**
   ```bash
   cd web_frontend
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm start
   ```

## Access the Application

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## Features

### 🔍 Detection Dashboard
- Real-time detection with brand filtering
- Adjustable risk threshold (0-100)
- Color-coded results table
- Export to CSV functionality

### 📋 Evidence & Takedown
- Detailed evidence reports
- Modal-based evidence viewing
- Automated takedown email generation
- Copy to clipboard functionality

### 🔬 Manual App Analysis
- Single app checking
- Instant risk assessment
- Real-time evidence generation

## Project Structure
```
FAKE-APP-DETECTION/
├── web_backend/           # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── models.py         # Pydantic models
│   ├── api/              # API endpoints
│   ├── start_backend.py  # Startup script
│   └── setup.sh          # Setup script
├── web_frontend/         # React frontend
│   ├── src/              # React components
│   ├── public/           # Static files
│   └── package.json      # Dependencies
├── src/                  # Core detection logic
├── data/                 # Apps database
└── output/               # Generated reports
```

## API Endpoints

### Detection
- `POST /api/detection/run` - Run detection
- `GET /api/detection/results` - Get paginated results
- `POST /api/detection/single` - Analyze single app
- `GET /api/detection/brands` - Get supported brands

### Evidence
- `POST /api/evidence/generate` - Generate evidence
- `POST /api/evidence/takedown` - Generate takedown email

## Troubleshooting

### "No module named 'src'" Error
This has been fixed! All import paths have been updated to use relative imports.

### Missing Dependencies
Run the setup script or install manually:
```bash
pip install pandas fastapi uvicorn pydantic python-multipart colorama
```

### Frontend Not Working
Ensure Node.js is installed and run:
```bash
cd web_frontend && npm install && npm start
```

## Data Sources
- **Apps Database**: `data/apps.csv` - 51 apps across PhonePe, Paytm, GPay
- **Detection Logic**: `src/scoring.py` - Risk calculation algorithm
- **Evidence Generation**: `src/evidence.py` - Evidence report formatting
- **Takedown Templates**: `src/takedown.py` - Email generation
