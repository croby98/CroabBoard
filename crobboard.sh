#!/bin/bash

# CroabBoard Docker Manager (profils compose)
# Usage: ./crobboard.sh [start|stop|restart|logs|status|build|clean|help] [--no-build] [--volumes] [--follow] [--no-proxy] [--proxy URL] [--profile linux-host|win-bridge]

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

print_status(){ echo -e "${BLUE}[INFO]${NC} $1"; }
print_success(){ echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning(){ echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error(){ echo -e "${RED}[ERROR]${NC} $1"; }

OS="$(uname -s 2>/dev/null || echo Unknown)"
PROFILE=""           # sera fixé par défaut selon OS si non fourni
USE_PROXY=false
PROXY_URL=""

default_profile() {
  if [[ "$PROFILE" != "" ]]; then return; fi
  case "$OS" in
    Linux) PROFILE="linux-host" ;;
    *)     PROFILE="win-bridge" ;; # macOS/WSL/others -> bridge par défaut
  esac
}

show_help(){
  echo "🚀 CroabBoard Docker Manager"
  echo
  echo "Usage: $0 COMMAND [OPTIONS]"
  echo
  echo "Commands:"
  echo "  start       Démarrer les services"
  echo "  stop        Arrêter les services"
  echo "  restart     Redémarrer"
  echo "  logs        Logs en temps réel"
  echo "  status      Statut des conteneurs"
  echo "  build       Construire les images"
  echo "  clean       Arrêt + nettoyage (volumes/images)"
  echo "  help        Aide"
  echo
  echo "Options:"
  echo "  --no-build              Ne pas construire lors du start/restart"
  echo "  --volumes               Supprimer volumes lors du stop/clean"
  echo "  --follow                Suivre les logs (logs)"
  echo "  --no-proxy              Désactiver les variables proxy"
  echo "  --proxy URL             Utiliser un proxy spécifique au build"
  echo "  --profile NAME          Choisir le profil docker-compose (linux-host | win-bridge)"
  echo
  echo "Profils:"
  echo "  linux-host  (Linux seulement) utilise network_mode: host"
  echo "  win-bridge  (Windows/macOS) utilise bridge + ports"
  echo
  echo "Exemples:"
  echo "  $0 start                         (profil auto selon OS)"
  echo "  $0 start --profile linux-host    (forcer host)"
  echo "  $0 start --profile win-bridge    (forcer bridge)"
  echo "  $0 stop --volumes"
  echo "  $0 logs --follow"
}

check_prereq(){
  command -v docker >/dev/null || { print_error "Docker non installé."; exit 1; }
  docker compose version >/dev/null 2>&1 || { print_error "Docker Compose non disponible."; exit 1; }
}

create_env(){
  if [ ! -f .env ]; then
    print_warning "Fichier .env absent. Création par défaut..."
    cat > .env << EOF
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1,.local

MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=croabboard
MYSQL_USER=croabboard
MYSQL_PASSWORD=croabboard

SESSION_SECRET=super-secret
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
EOF
    print_success "Fichier .env créé."
  fi
}

compose(){
  default_profile
  docker compose --profile "$PROFILE" "$@"
}

start_services(){
  local no_build="$1"
  create_env

  if [ "$USE_PROXY" = true ] && [ -n "$PROXY_URL" ]; then
    print_status "Proxy build: $PROXY_URL"
    export HTTP_PROXY="$PROXY_URL" HTTPS_PROXY="$PROXY_URL"
  elif [ "$USE_PROXY" = false ]; then
    print_status "Proxy désactivé"
    unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
  fi

  if [ "$no_build" != "true" ]; then
    print_status "Build images (profile: $PROFILE)..."
    compose build
  fi

  print_status "Démarrage (profile: $PROFILE)..."
  compose up -d

  print_status "Attente du démarrage..."
  sleep 10

  show_status
  show_access_info
}

stop_services(){
  local remove_volumes="$1"
  print_status "Arrêt (profile: $PROFILE)..."
  if [ "$remove_volumes" = true ]; then
    compose down -v || docker compose down -v
    docker volume prune -f
  else
    compose down || docker compose down
  fi
  print_success "Arrêté."
}

restart_services(){
  local no_build="$1"
  stop_services false
  start_services "$no_build"
}

show_logs(){
  local follow="$1"
  print_status "Logs (profile: $PROFILE)..."
  if [ "$follow" = true ]; then
    compose logs -f
  else
    compose logs --tail=50
  fi
}

show_status(){
  print_status "Statut (profile: $PROFILE):"
  compose ps
}

show_access_info(){
  echo
  print_success "CroabBoard démarré (profile: $PROFILE)"
  echo "Frontend: http://localhost:3000"
  echo "API:      http://localhost:5000/api"
  echo "MySQL:    voir profil:"
  echo "  - linux-host: 127.0.0.1:3306 (ou selon votre conf)"
  echo "  - win-bridge: 127.0.0.1:3307 si exposé"
}

build_images(){
  print_status "Build images (profile: $PROFILE)..."
  compose build
  print_success "Build OK."
}

clean_all(){
  print_status "Nettoyage complet..."
  compose down -v || docker compose down -v
  docker image prune -f
  print_success "Nettoyé."
}

main(){
  local cmd="$1"; shift || true
  local no_build=false remove_volumes=false follow=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --no-build) no_build=true; shift ;;
      --volumes) remove_volumes=true; shift ;;
      --follow)  follow=true; shift ;;
      --no-proxy) USE_PROXY=false; shift ;;
      --proxy)   USE_PROXY=true; PROXY_URL="$2"; shift 2 ;;
      --profile) PROFILE="$2"; shift 2 ;;
      *) print_error "Option inconnue: $1"; show_help; exit 1 ;;
    esac
  done

  check_prereq
  default_profile

  case "$cmd" in
    start)   start_services "$no_build" ;;
    stop)    stop_services "$remove_volumes" ;;
    restart) restart_services "$no_build" ;;
    logs)    show_logs "$follow" ;;
    status)  show_status ;;
    build)   build_images ;;
    clean)   clean_all ;;
    help|""|-h|--help) show_help ;;
    *) print_error "Commande inconnue: $cmd"; show_help; exit 1 ;;
  esac
}

main "$@"