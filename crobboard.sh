#!/bin/bash

# Script unifié CroabBoard Docker Manager
# Usage: ./croabboard.sh [start|stop|restart|logs|status|build|clean]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "🚀 CroabBoard Docker Manager"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start     - Démarrer tous les services"
    echo "  stop      - Arrêter tous les services"
    echo "  restart   - Redémarrer tous les services"
    echo "  logs      - Afficher les logs en temps réel"
    echo "  status    - Afficher le statut des services"
    echo "  build     - Construire les images Docker"
    echo "  clean     - Nettoyer (arrêter + supprimer volumes)"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Options:"
    echo "  --no-build    - Ne pas construire les images (start/restart)"
    echo "  --volumes     - Supprimer les volumes (stop/clean)"
    echo "  --follow      - Suivre les logs (logs)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 start --no-build"
    echo "  $0 stop --volumes"
    echo "  $0 logs --follow"
}

# Vérifier les prérequis
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
}

# Créer le fichier .env s'il n'existe pas
create_env_file() {
    if [ ! -f .env ]; then
        print_warning "Fichier .env non trouvé. Création d'un fichier .env par défaut..."
        cat > .env << EOF
# Variables de proxy (optionnelles)
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1,.local

# Variables de base de données
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=croabboard
MYSQL_USER=croabboard
MYSQL_PASSWORD=croabboard

# Variables d'application
SESSION_SECRET=super-secret
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
EOF
        print_success "Fichier .env créé avec les valeurs par défaut."
    fi
}

# Fonction de démarrage
start_services() {
    local no_build=$1
    
    print_status "Démarrage de CroabBoard..."
    
    create_env_file
    
    if [ "$no_build" != "true" ]; then
        print_status "Construction des images Docker..."
        docker compose build
    fi
    
    print_status "Démarrage des services..."
    docker compose up -d
    
    print_status "Attente du démarrage des services..."
    sleep 10
    
    show_status
    show_access_info
}

# Fonction d'arrêt
stop_services() {
    local remove_volumes=$1
    
    print_status "Arrêt de CroabBoard..."
    
    if [ "$remove_volumes" = "true" ]; then
        print_warning "Suppression des volumes (données)..."
        docker compose down -v
        docker volume prune -f
    else
        docker compose down
    fi
    
    print_success "CroabBoard arrêté."
}

# Fonction de redémarrage
restart_services() {
    local no_build=$1
    
    print_status "Redémarrage de CroabBoard..."
    stop_services false
    start_services "$no_build"
}

# Fonction d'affichage des logs
show_logs() {
    local follow=$1
    
    print_status "Affichage des logs CroabBoard..."
    
    if [ "$follow" = "true" ]; then
        print_status "Appuyez sur Ctrl+C pour arrêter"
        docker compose logs -f
    else
        docker compose logs --tail=50
    fi
}

# Fonction d'affichage du statut
show_status() {
    print_status "Statut des services:"
    docker compose ps
}

# Fonction d'affichage des informations d'accès
show_access_info() {
    echo ""
    print_success "🎉 CroabBoard est démarré !"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000/api"
    echo "🗄️  Base de données: localhost:3306"
    echo ""
    echo "📋 Commandes utiles:"
    echo "  - Voir les logs: $0 logs --follow"
    echo "  - Arrêter: $0 stop"
    echo "  - Redémarrer: $0 restart"
    echo "  - Statut: $0 status"
}

# Fonction de construction
build_images() {
    print_status "Construction des images Docker..."
    docker compose build
    print_success "Images construites avec succès."
}

# Fonction de nettoyage
clean_all() {
    print_status "Nettoyage complet de CroabBoard..."
    stop_services true
    print_status "Suppression des images non utilisées..."
    docker image prune -f
    print_success "Nettoyage terminé."
}

# Fonction principale
main() {
    local command=$1
    local no_build=false
    local remove_volumes=false
    local follow=false
    
    # Parser les arguments
    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-build)
                no_build=true
                shift
                ;;
            --volumes)
                remove_volumes=true
                shift
                ;;
            --follow)
                follow=true
                shift
                ;;
            *)
                print_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Exécuter la commande
    case $command in
        start)
            start_services "$no_build"
            ;;
        stop)
            stop_services "$remove_volumes"
            ;;
        restart)
            restart_services "$no_build"
            ;;
        logs)
            show_logs "$follow"
            ;;
        status)
            show_status
            ;;
        build)
            build_images
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"#!/bin/bash

# Script unifié CroabBoard Docker Manager
# Usage: ./croabboard.sh [start|stop|restart|logs|status|build|clean]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "🚀 CroabBoard Docker Manager"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start     - Démarrer tous les services"
    echo "  stop      - Arrêter tous les services"
    echo "  restart   - Redémarrer tous les services"
    echo "  logs      - Afficher les logs en temps réel"
    echo "  status    - Afficher le statut des services"
    echo "  build     - Construire les images Docker"
    echo "  clean     - Nettoyer (arrêter + supprimer volumes)"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Options:"
    echo "  --no-build    - Ne pas construire les images (start/restart)"
    echo "  --volumes     - Supprimer les volumes (stop/clean)"
    echo "  --follow      - Suivre les logs (logs)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 start --no-build"
    echo "  $0 stop --volumes"
    echo "  $0 logs --follow"
}

# Vérifier les prérequis
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
}

# Créer le fichier .env s'il n'existe pas
create_env_file() {
    if [ ! -f .env ]; then
        print_warning "Fichier .env non trouvé. Création d'un fichier .env par défaut..."
        cat > .env << EOF
# Variables de proxy (optionnelles)
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1,.local

# Variables de base de données
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=croabboard
MYSQL_USER=croabboard
MYSQL_PASSWORD=croabboard

# Variables d'application
SESSION_SECRET=super-secret
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
EOF
        print_success "Fichier .env créé avec les valeurs par défaut."
    fi
}

# Fonction de démarrage
start_services() {
    local no_build=$1
    
    print_status "Démarrage de CroabBoard..."
    
    create_env_file
    
    if [ "$no_build" != "true" ]; then
        print_status "Construction des images Docker..."
        docker compose build
    fi
    
    print_status "Démarrage des services..."
    docker compose up -d
    
    print_status "Attente du démarrage des services..."
    sleep 10
    
    show_status
    show_access_info
}

# Fonction d'arrêt
stop_services() {
    local remove_volumes=$1
    
    print_status "Arrêt de CroabBoard..."
    
    if [ "$remove_volumes" = "true" ]; then
        print_warning "Suppression des volumes (données)..."
        docker compose down -v
        docker volume prune -f
    else
        docker compose down
    fi
    
    print_success "CroabBoard arrêté."
}

# Fonction de redémarrage
restart_services() {
    local no_build=$1
    
    print_status "Redémarrage de CroabBoard..."
    stop_services false
    start_services "$no_build"
}

# Fonction d'affichage des logs
show_logs() {
    local follow=$1
    
    print_status "Affichage des logs CroabBoard..."
    
    if [ "$follow" = "true" ]; then
        print_status "Appuyez sur Ctrl+C pour arrêter"
        docker compose logs -f
    else
        docker compose logs --tail=50
    fi
}

# Fonction d'affichage du statut
show_status() {
    print_status "Statut des services:"
    docker compose ps
}

# Fonction d'affichage des informations d'accès
show_access_info() {
    echo ""
    print_success "🎉 CroabBoard est démarré !"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000/api"
    echo "🗄️  Base de données: localhost:3306"
    echo ""
    echo "📋 Commandes utiles:"
    echo "  - Voir les logs: $0 logs --follow"
    echo "  - Arrêter: $0 stop"
    echo "  - Redémarrer: $0 restart"
    echo "  - Statut: $0 status"
}

# Fonction de construction
build_images() {
    print_status "Construction des images Docker..."
    docker compose build
    print_success "Images construites avec succès."
}

# Fonction de nettoyage
clean_all() {
    print_status "Nettoyage complet de CroabBoard..."
    stop_services true
    print_status "Suppression des images non utilisées..."
    docker image prune -f
    print_success "Nettoyage terminé."
}

# Fonction principale
main() {
    local command=$1
    local no_build=false
    local remove_volumes=false
    local follow=false
    
    # Parser les arguments
    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-build)
                no_build=true
                shift
                ;;
            --volumes)
                remove_volumes=true
                shift
                ;;
            --follow)
                follow=true
                shift
                ;;
            *)
                print_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Exécuter la commande
    case $command in
        start)
            start_services "$no_build"
            ;;
        stop)
            stop_services "$remove_volumes"
            ;;
        restart)
            restart_services "$no_build"
            ;;
        logs)
            show_logs "$follow"
            ;;
        status)
            show_status
            ;;
        build)
            build_images
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"