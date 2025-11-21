#!/bin/bash

echo "🔧 Setting up Fake App Detection Web Interface..."
echo

# Check Python version
python_version=$(python3 --version 2>/dev/null || echo "not found")
echo "📋 Python version: $python_version"

if [[ "$python_version" == *"not found"* ]]; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Install Python dependencies
echo
echo "📦 Installing Python dependencies..."
pip3 install pandas fastapi uvicorn pydantic python-multipart colorama

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully!"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Check Node.js
echo
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js version: $node_version"
    
    # Install Node.js dependencies
    echo
    echo "📦 Installing Node.js dependencies..."
    cd ../web_frontend
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Node.js dependencies installed successfully!"
    else
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
    cd ../web_backend
else
    echo "⚠️  Node.js not found. Frontend will not work."
    echo "   Install Node.js from https://nodejs.org/"
fi

echo
echo "🎉 Setup complete!"
echo
echo "🚀 To start the application:"
echo "   Backend:  cd web_backend && python start_backend.py"
echo "   Frontend: cd web_frontend && npm start"
echo
echo "🌐 Web interface will be available at: http://localhost:3000"
echo "📚 API documentation: http://localhost:8000/docs"
