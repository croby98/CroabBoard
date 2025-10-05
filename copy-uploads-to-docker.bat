@echo off
REM CroabBoard - Copy Existing Uploads to Docker Volume (Windows)
REM This script copies existing upload files to the Docker volume

setlocal enabledelayedexpansion

echo.
echo ========================================================
echo CroabBoard - Copying Existing Uploads to Docker Volume
echo ========================================================
echo.

REM Check if uploads directory exists
if not exist "Backend\uploads" (
    echo [ERROR] Backend\uploads directory not found
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    exit /b 1
)

REM Volume name
set VOLUME_NAME=croabboard_file_uploads

echo [INFO] Checking Docker volume...

REM Check if volume exists, create if not
docker volume inspect %VOLUME_NAME% >nul 2>&1
if errorlevel 1 (
    echo [INFO] Creating volume: %VOLUME_NAME%
    docker volume create %VOLUME_NAME%
) else (
    echo [OK] Volume exists: %VOLUME_NAME%
)

echo.
echo [INFO] Copying upload files to Docker volume...
echo.

REM Get absolute path of current directory
set CURRENT_DIR=%cd%

REM Create a temporary container to copy files
docker run --rm ^
    -v %VOLUME_NAME%:/uploads ^
    -v "%CURRENT_DIR%\Backend\uploads:/source:ro" ^
    alpine sh -c "echo 'Creating directory structure...' && mkdir -p /uploads/audio /uploads/avatars /uploads/images && echo 'Copying audio files...' && cp -r /source/audio/* /uploads/audio/ 2>/dev/null || echo 'No audio files to copy' && echo 'Copying avatar files...' && cp -r /source/avatars/* /uploads/avatars/ 2>/dev/null || echo 'No avatar files to copy' && echo 'Copying image files...' && cp -r /source/images/* /uploads/images/ 2>/dev/null || echo 'No image files to copy' && echo 'Setting permissions...' && chmod -R 755 /uploads && echo 'Listing copied files...' && echo 'Audio files:' && ls -lh /uploads/audio | wc -l && echo 'Avatar files:' && ls -lh /uploads/avatars | wc -l && echo 'Image files:' && ls -lh /uploads/images | wc -l"

echo.
echo [OK] Upload files copied successfully!
echo.
echo [INFO] Volume information:
docker volume inspect %VOLUME_NAME%

echo.
echo [OK] Done! Your upload files are now in the Docker volume.
echo [INFO] The volume will be automatically mounted when you start the containers with docker-compose.
echo.

pause
