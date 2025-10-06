#!/bin/bash

#######################################################
# Script de démarrage Docker pour CroabBoard
# Pour serveur d'entreprise avec proxy sans DNS
#######################################################

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_info() {
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

print_header() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

# Vérifier si Docker est installé
check_docker() {
    print_info "Vérification de Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi
    print_success "Docker est installé (version: $(docker --version))"
}

# Vérifier si Docker Compose est installé
check_docker_compose() {
    print_info "Vérification de Docker Compose..."
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
    print_success "Docker Compose est installé"
}

# Vérifier si le fichier .env existe
check_env_file() {
    print_info "Vérification du fichier .env..."
    if [ ! -f .env ]; then
        print_warning "Le fichier .env n'existe pas. Création depuis .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Fichier .env créé. Veuillez le configurer avec vos paramètres."
            print_warning "IMPORTANT: Éditez le fichier .env avant de continuer !"
            read -p "Appuyez sur Entrée après avoir configuré le fichier .env..."
        else
            print_error "Le fichier .env.example n'existe pas."
            exit 1
        fi
    else
        print_success "Fichier .env trouvé"
    fi
}

# Vérifier si le fichier SQL d'initialisation existe
check_sql_file() {
    print_info "Vérification du fichier SQL d'initialisation..."
    if [ ! -f 01-crobboard-schema-and-data.sql ]; then
        print_error "Le fichier 01-crobboard-schema-and-data.sql n'existe pas."
        print_error "Ce fichier est nécessaire pour initialiser la base de données."
        exit 1
    fi
    print_success "Fichier SQL d'initialisation trouvé"
}

# Arrêter les conteneurs existants
stop_containers() {
    print_info "Arrêt des conteneurs existants..."
    docker compose down -v 2>/dev/null || true
    print_success "Conteneurs arrêtés"
}

# Construire les images Docker
build_images() {
    print_info "Construction des images Docker..."
    print_warning "Cette étape peut prendre plusieurs minutes..."

    docker compose build --no-cache

    print_success "Images Docker construites avec succès"
}

# Démarrer les conteneurs
start_containers() {
    print_info "Démarrage des conteneurs..."

    docker compose up -d

    print_success "Conteneurs démarrés"
}

# Attendre que la base de données soit prête
wait_for_database() {
    print_info "Attente de la base de données..."
    sleep 5

    MAX_ATTEMPTS=30
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker exec croabboard-db mysqladmin ping -h localhost -u root -p"$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)" --silent 2>/dev/null; then
            print_success "Base de données prête"
            return 0
        fi

        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done

    print_error "La base de données n'a pas démarré dans le délai imparti"
    return 1
}

# Attendre que le backend soit prêt
wait_for_backend() {
    print_info "Attente du backend..."
    sleep 5

    MAX_ATTEMPTS=20
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "Backend prêt"
            return 0
        fi

        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done

    print_warning "Le backend n'a pas répondu dans le délai imparti"
    return 0
}

# Afficher les informations de connexion
show_info() {
    print_header "CroabBoard est maintenant en cours d'exécution"

    echo -e "${GREEN}Frontend:${NC} http://localhost"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001"
    echo -e "${GREEN}Base de données:${NC} localhost:3306"
    echo ""
    echo -e "${YELLOW}Commandes utiles:${NC}"
    echo "  - Voir les logs: docker compose logs -f"
    echo "  - Arrêter: docker compose down"
    echo "  - Redémarrer: docker compose restart"
    echo "  - Voir le statut: docker compose ps"
    echo ""
}

# Afficher les logs
show_logs() {
    print_info "Affichage des logs (Ctrl+C pour quitter)..."
    docker compose logs -f
}

# Configuration pour proxy d'entreprise
configure_proxy() {
    if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ]; then
        print_info "Configuration du proxy détectée"
        print_info "HTTP_PROXY: ${HTTP_PROXY:-non défini}"
        print_info "HTTPS_PROXY: ${HTTPS_PROXY:-non défini}"
        print_info "NO_PROXY: ${NO_PROXY:-non défini}"

        # Créer un fichier de configuration Docker avec le proxy
        mkdir -p ~/.docker
        cat > ~/.docker/config.json <<EOF
{
  "proxies": {
    "default": {
      "httpProxy": "${HTTP_PROXY}",
      "httpsProxy": "${HTTPS_PROXY}",
      "noProxy": "${NO_PROXY}"
    }
  }
}
EOF
        print_success "Configuration du proxy appliquée"
    fi
}

# Fonction principale
main() {
    print_header "Démarrage de CroabBoard avec Docker"

    # Vérifications préliminaires
    check_docker
    check_docker_compose
    configure_proxy
    check_env_file
    check_sql_file

    # Arrêt des conteneurs existants
    stop_containers

    # Construction et démarrage
    build_images
    start_containers

    # Attente des services
    wait_for_database
    wait_for_backend

    # Informations
    show_info

    # Option pour afficher les logs
    read -p "Voulez-vous voir les logs ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        show_logs
    fi
}

# Gestion des arguments
case "${1:-}" in
    start)
        main
        ;;
    stop)
        print_info "Arrêt de CroabBoard..."
        docker compose down
        print_success "CroabBoard arrêté"
        ;;
    restart)
        print_info "Redémarrage de CroabBoard..."
        docker compose restart
        print_success "CroabBoard redémarré"
        ;;
    logs)
        show_logs
        ;;
    status)
        docker compose ps
        ;;
    clean)
        print_warning "Cela va supprimer tous les conteneurs, volumes et données !"
        read -p "Êtes-vous sûr ? (o/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[OoYy]$ ]]; then
            docker compose down -v --remove-orphans
            print_success "Nettoyage terminé"
        fi
        ;;
    *)
        main
        ;;
esac
