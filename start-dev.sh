#!/bin/bash

# Development setup script for Motion app with PostgreSQL

echo "🚀 Starting Motion development environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    sleep 3
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your actual values."
    echo ""
fi

# Start Docker Compose
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up --build -d

echo "🎉 Motion development environment is ready!"
echo "📝 App: http://localhost:3000"
echo "⚙️  Worker: http://localhost:3001" 
echo "🗄️  Database: localhost:5432 (motion_dev)"
