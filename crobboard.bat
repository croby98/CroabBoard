@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "COMMAND=%~1"
set "PROFILE=win-bridge"
set "NO_BUILD=false"
set "REMOVE_VOLUMES=false"
set "FOLLOW=false"
set "USE_PROXY=false"
set "PROXY_URL="

:parse_args
shift
if "%~1"=="" goto dispatch
if /I "%~1"=="--no-build"   ( set "NO_BUILD=true" & goto parse_args )
if /I "%~1"=="--volumes"    ( set "REMOVE_VOLUMES=true" & goto parse_args )
if /I "%~1"=="--follow"     ( set "FOLLOW=true" & goto parse_args )
if /I "%~1"=="--no-proxy"   ( set "USE_PROXY=false" & goto parse_args )
if /I "%~1"=="--proxy"      ( set "USE_PROXY=true" & set "PROXY_URL=%~2" & shift & goto parse_args )
if /I "%~1"=="--profile"    ( set "PROFILE=%~2" & shift & goto parse_args )
goto parse_args

:dispatch
if "%COMMAND%"=="" goto help
if /I "%COMMAND%"=="help"    goto help
if /I "%COMMAND%"=="start"   goto start
if /I "%COMMAND%"=="stop"    goto stop
if /I "%COMMAND%"=="restart" goto restart
if /I "%COMMAND%"=="logs"    goto logs
if /I "%COMMAND%"=="status"  goto status
if /I "%COMMAND%"=="build"   goto build
if /I "%COMMAND%"=="clean"   goto clean
goto help

:check_prereq
docker --version >nul 2>&1 || ( echo Docker non installe & goto end )
docker compose version >nul 2>&1 || ( echo Docker Compose indisponible & goto end )
goto :eof

:create_env
if not exist ".env" (
  (
    echo HTTP_PROXY=
    echo HTTPS_PROXY=
    echo NO_PROXY=localhost,127.0.0.1,.local
    echo MYSQL_ROOT_PASSWORD=rootpass
    echo MYSQL_DATABASE=croabboard
    echo MYSQL_USER=croabboard
    echo MYSQL_PASSWORD=croabboard
    echo SESSION_SECRET=super-secret
    echo FRONTEND_URL=http://localhost:3000
    echo VITE_API_BASE_URL=http://localhost:5000/api
  ) > .env
)
goto :eof

:set_proxy_env
if /I "%USE_PROXY%"=="true" (
  if not "%PROXY_URL%"=="" (
    set "HTTP_PROXY=%PROXY_URL%"
    set "HTTPS_PROXY=%PROXY_URL%"
  )
) else (
  set "HTTP_PROXY="
  set "HTTPS_PROXY="
  set "http_proxy="
  set "https_proxy="
)
goto :eof

:help
echo Usage: %~nx0 COMMAND [--profile linux-host^|win-bridge] [--no-build] [--volumes] [--follow] [--no-proxy] [--proxy URL]
echo Commands: start ^| stop ^| restart ^| logs ^| status ^| build ^| clean ^| help
goto end

:start
call :check_prereq
call :create_env
call :set_proxy_env
if /I "%NO_BUILD%"=="false" docker compose --profile "%PROFILE%" build
docker compose --profile "%PROFILE%" up -d
timeout /t 5 /nobreak >nul
goto status

:stop
if /I "%REMOVE_VOLUMES%"=="true" (
  docker compose --profile "%PROFILE%" down -v || docker compose down -v
  docker volume prune -f
) else (
  docker compose --profile "%PROFILE%" down || docker compose down
)
goto end

:restart
call :stop
call :start
goto end

:logs
if /I "%FOLLOW%"=="true" (
  docker compose --profile "%PROFILE%" logs -f
) else (
  docker compose --profile "%PROFILE%" logs --tail=100
)
goto end

:status
docker compose --profile "%PROFILE%" ps
goto end

:build
call :check_prereq
docker compose --profile "%PROFILE%" build
goto end

:clean
docker compose --profile "%PROFILE%" down -v || docker compose down -v
docker image prune -f
goto end

:end
if /I "%COMMAND%"=="start" exit /b 0