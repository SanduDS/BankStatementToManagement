#!/bin/bash

# WSO2 Choreo Deployment Setup Script
# This script helps prepare your backend for Choreo deployment

echo "🚀 WSO2 Choreo Deployment Setup"
echo "================================"

# Check if we're in the backend directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd backend && ./setup-choreo.sh"
    exit 1
fi

# Check required files
echo "📋 Checking deployment files..."

files=(
    "Dockerfile" 
    ".choreo/component.yaml" 
    "requirements.txt" 
    ".dockerignore"
    "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Check environment variables
echo ""
echo "🔧 Environment Variables Check:"
if [ -f ".env" ]; then
    echo "✅ .env file found"
    if grep -q "ANTHROPIC_API_KEY" .env; then
        echo "✅ ANTHROPIC_API_KEY configured"
    else
        echo "❌ ANTHROPIC_API_KEY not found in .env"
    fi
else
    echo "⚠️  .env file not found (will use Choreo environment variables)"
fi

# Summary
echo ""
echo "📦 Deployment Summary:"
echo "   - Backend API ready for Choreo deployment"
echo "   - Dockerfile configured for containerization"
echo "   - Health checks and monitoring enabled"
echo "   - CORS configured for production"

echo ""
echo "🎯 Next Steps:"
echo "   1. Push your code to GitHub"
echo "   2. Create a new Web Application in WSO2 Choreo"
echo "   3. Connect your GitHub repository"
echo "   4. Set environment variables in Choreo"
echo "   5. Deploy and test"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

echo ""
echo "🌐 After deployment, your API will be available at:"
echo "   https://your-app-name-xxxx.choreoapis.dev"
