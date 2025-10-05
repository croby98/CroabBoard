#!/bin/bash

# CroabBoard - Copy Existing Uploads to Docker Volume
# This script copies existing upload files to the Docker volume

set -e

echo "🚀 CroabBoard - Copying Existing Uploads to Docker Volume"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if uploads directory exists
if [ ! -d "./Backend/uploads" ]; then
    echo -e "${RED}❌ Error: Backend/uploads directory not found${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Volume name
VOLUME_NAME="croabboard_file_uploads"

echo -e "\n${YELLOW}📦 Checking Docker volume...${NC}"

# Check if volume exists, create if not
if ! docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating volume: $VOLUME_NAME${NC}"
    docker volume create "$VOLUME_NAME"
else
    echo -e "${GREEN}✓ Volume exists: $VOLUME_NAME${NC}"
fi

echo -e "\n${YELLOW}📂 Copying upload files to Docker volume...${NC}"

# Create a temporary container to copy files
docker run --rm \
    -v "$VOLUME_NAME:/uploads" \
    -v "$(pwd)/Backend/uploads:/source:ro" \
    alpine sh -c "
        echo 'Creating directory structure...'
        mkdir -p /uploads/audio /uploads/avatars /uploads/images

        echo 'Copying audio files...'
        cp -r /source/audio/* /uploads/audio/ 2>/dev/null || echo 'No audio files to copy'

        echo 'Copying avatar files...'
        cp -r /source/avatars/* /uploads/avatars/ 2>/dev/null || echo 'No avatar files to copy'

        echo 'Copying image files...'
        cp -r /source/images/* /uploads/images/ 2>/dev/null || echo 'No image files to copy'

        echo 'Setting permissions...'
        chmod -R 755 /uploads

        echo 'Listing copied files...'
        echo 'Audio files:' && ls -lh /uploads/audio | wc -l
        echo 'Avatar files:' && ls -lh /uploads/avatars | wc -l
        echo 'Image files:' && ls -lh /uploads/images | wc -l
    "

echo -e "\n${GREEN}✅ Upload files copied successfully!${NC}"
echo -e "\n${YELLOW}📊 Volume information:${NC}"
docker volume inspect "$VOLUME_NAME"

echo -e "\n${GREEN}✅ Done! Your upload files are now in the Docker volume.${NC}"
echo -e "${YELLOW}💡 The volume will be automatically mounted when you start the containers with docker-compose.${NC}"
