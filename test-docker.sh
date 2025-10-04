#!/bin/bash

# CroabBoard Docker Test Script
# This script tests the Docker setup

echo "🐳 Testing CroabBoard Docker Configuration..."
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating from .env.example${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Test Docker files exist
files=("Backend/Dockerfile" "Frontend/Dockerfile" "docker-compose.yml" "docker-compose.prod.yml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
        exit 1
    fi
done

# Test Docker build (dry run)
echo
echo "🔧 Testing Docker configurations..."

# Test backend Dockerfile
echo "Testing Backend Dockerfile..."
docker build --no-cache --dry-run ./Backend > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Dockerfile is valid${NC}"
else
    echo -e "${RED}❌ Backend Dockerfile has issues${NC}"
fi

# Test frontend Dockerfile
echo "Testing Frontend Dockerfile..."
docker build --no-cache --dry-run ./Frontend > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Dockerfile is valid${NC}"
else
    echo -e "${RED}❌ Frontend Dockerfile has issues${NC}"
fi

# Test docker-compose files
echo "Testing docker-compose.yml..."
docker-compose config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}❌ docker-compose.yml has issues${NC}"
fi

echo "Testing docker-compose.prod.yml..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ docker-compose.prod.yml is valid${NC}"
else
    echo -e "${RED}❌ docker-compose.prod.yml has issues${NC}"
fi

echo
echo -e "${GREEN}🎉 All Docker configurations are valid!${NC}"
echo
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: ./deploy.sh development"
echo "3. Access: http://localhost:3000"
echo
echo "For production: ./deploy.sh production"