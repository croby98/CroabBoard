@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title CroabBoard Docker Manager

REM Variables
set "COMMAND=%1"
set "NO_BUILD=false"
set "REMOVE_VOLUMES=false"
set "FOLLOW=false"

REM Parser les arguments
:parse_args
if "%~1"=="" goto :execute_command
if "%~1"=="--no-build" (
    set "NO_BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="--volumes" (
    set "REMOVE_VOLUMES=true"
    shift
    goto :parse_args
)
if "%~1"=="--follow" (
    set "FOLLOW=true"
    shift
    goto :parse_args
)
shift
goto :parse_args

:execute_command
goto :%COMMAND% 2>nul || goto :help

:help
echo 🚀 CroabBoard Docker Manager
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start     - Démarrer tous les services
echo   stop      - Arrêter tous les services
echo   restart   - Redémarrer tous les services
echo   logs      - Afficher les logs en temps réel
echo   status    - Afficher le statut des services
echo   build     - Construire les images Docker
echo   clean     - Nettoyer ^(arrêter + supprimer volumes^)
echo   help      - Afficher cette aide
echo.
echo Options:
echo   --no-build    - Ne pas construire les images ^(start/restart^)
echo   --volumes     - Supprimer les volumes ^(stop/clean^)
echo   --follow      - Suivre les logs ^(logs^)
echo.
echo Examples:
echo   %0 start
echo   %0 start --no-build
echo   %0 stop --volumes
echo   %0 logs --follow
goto :end

:check_prerequisites
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé. Veuillez installer Docker Desktop d'abord.
    goto :end
)

docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose n'est pas disponible. Veuillez vérifier votre installation Docker.
    goto :end
)
goto :eof

:create_env_file
if not exist .env (
    echo ⚠️  Fichier .env non trouvé. Création d'un fichier .env par défaut...
    (
        echo # Variables de proxy ^(optionnelles^)
        echo HTTP_PROXY=
        echo HTTPS_PROXY=
        echo NO_PROXY=localhost,127.0.0.1,.local
        echo.
        echo # Variables de base de données
        echo MYSQL_ROOT_PASSWORD=rootpass
        echo MYSQL_DATABASE=croabboard
        echo MYSQL_USER=croabboard
        echo MYSQL_PASSWORD=croabboard
        echo.
        echo # Variables d'application
        echo SESSION_SECRET=super-secret
        echo FRONTEND_URL=http://localhost:3000
        echo VITE_API_BASE_URL=http://localhost:5000/api
    ) > .env
    echo ✅ Fichier .env créé avec les valeurs par défaut.
)
goto :eof

:start
echo 🚀 Démarrage de CroabBoard...
call :check_prerequisites
if %errorlevel% neq 0 goto :end

call :create_env_file

if "%NO_BUILD%"=="false" (
    echo 🔨 Construction des images Docker...
    docker compose build
)

echo ▶️  Démarrage des services...
docker compose up -d

echo ⏳ Attente du démarrage des services...
timeout /t 10 /nobreak >nul

call :status
call :show_access_info
goto :end

:stop
echo 🛑 Arrêt de CroabBoard...

if "%REMOVE_VOLUMES%"=="true" (
    echo 🗑️  Suppression des volumes ^(données^)...
    docker compose down -v
    docker volume prune -f
) else (
    docker compose down
)

echo ✅ CroabBoard arrêté.
goto :end

:restart
echo 🔄 Redémarrage de CroabBoard...
call :stop
call :start
goto :end

:logs
echo 📋 Affichage des logs CroabBoard...

if "%FOLLOW%"=="true" (
    echo Appuyez sur Ctrl+C pour arrêter
    docker compose logs -f
) else (
    docker compose logs --tail=50
)
goto :end

:status
echo 📊 Statut des services:
docker compose ps
goto :eof

:show_access_info
echo.
echo 🎉 CroabBoard est démarré !
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000/api
echo 🗄️  Base de données: localhost:3306
echo.
echo 📋 Commandes utiles:
echo   - Voir les logs: %0 logs --follow
echo   - Arrêter: %0 stop
echo   - Redémarrer: %0 restart
echo   - Statut: %0 status
goto :eof

:build
echo 🔨 Construction des images Docker...
docker compose build
echo ✅ Images construites avec succès.
goto :end

:clean
echo 🧹 Nettoyage complet de CroabBoard...
call :stop
echo 🗑️  Suppression des images non utilisées...
docker image prune -f
echo ✅ Nettoyage terminé.
goto :end

:end
if "%COMMAND%"=="start" pause