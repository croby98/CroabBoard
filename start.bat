@echo off
REM CroabBoard - Script de Demarrage Simplifie (Windows)
REM Ce script vous aide a demarrer CroabBoard facilement

setlocal enabledelayedexpansion

echo.
echo ===============================================================
echo          CroabBoard - Demarrage Rapide
echo ===============================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Docker n'est pas en cours d'execution
    echo Veuillez demarrer Docker Desktop et reessayer.
    pause
    exit /b 1
)

echo [OK] Docker est en cours d'execution
echo.

REM Check if .env exists
if not exist ".env" (
    echo [INFO] Fichier .env non trouve
    echo Creation du fichier .env depuis .env.example...
    copy .env.example .env >nul
    echo [OK] Fichier .env cree
    echo [ATTENTION] IMPORTANT: Modifiez le fichier .env pour changer les mots de passe !
    echo.
)

REM Ask user which deployment mode
echo Choisissez votre mode de deploiement:
echo.
echo 1) Developpement (ports directs: 3000, 5000, 3306)
echo 2) Production Simple - Host Mode (acces via IP:3000)
echo 3) Production avec Proxy - Recommande (acces via IP ou domaine)
echo.
set /p choice="Votre choix (1-3): "

if "%choice%"=="1" (
    echo [INFO] Mode Developpement selectionne
    set COMPOSE_FILE=docker-compose.yml
    set ACCESS_URL=http://localhost:3000
) else if "%choice%"=="2" (
    echo [INFO] Mode Production Simple (Host^) selectionne
    set COMPOSE_FILE=docker-compose.simple.yml
    set ACCESS_URL=http://localhost:3000
) else if "%choice%"=="3" (
    echo [INFO] Mode Production avec Proxy selectionne
    set COMPOSE_FILE=docker-compose.proxy.yml
    set ACCESS_URL=http://localhost
) else (
    echo [ERREUR] Choix invalide
    pause
    exit /b 1
)

echo.

REM Ask if user wants to copy existing uploads
if exist "Backend\uploads" (
    echo [INFO] Fichiers detectes dans Backend\uploads\
    set /p copy_uploads="Voulez-vous copier ces fichiers dans le volume Docker ? (O/N): "

    if /i "!copy_uploads!"=="O" (
        echo [INFO] Copie des fichiers d'upload...
        call copy-uploads-to-docker.bat
    )
)

echo.
echo [INFO] Demarrage de CroabBoard...
echo [INFO] Configuration: %COMPOSE_FILE%
echo.

REM Start services
docker-compose -f "%COMPOSE_FILE%" up -d

echo.
echo [OK] CroabBoard a demarre avec succes !
echo.
echo ===============================================================
echo Acces a l'application:
echo    %ACCESS_URL%
echo.
echo Commandes utiles:
echo    Voir les logs:      docker-compose -f %COMPOSE_FILE% logs -f
echo    Arreter:            docker-compose -f %COMPOSE_FILE% down
echo    Redemarrer:         docker-compose -f %COMPOSE_FILE% restart
echo    Status:             docker-compose -f %COMPOSE_FILE% ps
echo.
echo Documentation:
echo    Guide complet:      DEPLOYMENT.md
echo    Docker:             DOCKER.md
echo    Uploads:            UPLOADS.md
echo ===============================================================
echo.
echo [INFO] Attendez environ 30 secondes que tous les services demarrent...
echo.

REM Wait a bit
timeout /t 5 /nobreak >nul

echo [INFO] Verification des services...
docker-compose -f "%COMPOSE_FILE%" ps

echo.
echo [OK] Pret a l'emploi ! Ouvrez %ACCESS_URL% dans votre navigateur
echo.

pause
