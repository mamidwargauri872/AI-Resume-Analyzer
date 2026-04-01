#!/bin/bash
# Render deployment script for joining both Frontend and Backend
set -e

echo "Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing Python Backend Dependencies..."
cd backend
pip install -r requirements.txt
echo "Build Complete!"
