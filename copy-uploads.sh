#!/bin/bash

#######################################################
# Script pour copier les fichiers uploads existants
# dans le volume Docker du backend
#######################################################

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier si le dossier uploads existe
if [ ! -d "Backend/uploads" ]; then
    print_warning "Le dossier Backend/uploads n'existe pas. Rien à copier."
    exit 0
fi

# Vérifier si le conteneur backend est en cours d'exécution
if ! docker compose ps backend | grep -q "Up"; then
    print_warning "Le conteneur backend n'est pas en cours d'exécution."
    print_info "Démarrez d'abord les conteneurs avec: ./start-docker.sh"
    exit 1
fi

print_info "Copie des fichiers uploads dans le conteneur..."

# Copier les fichiers du dossier local vers le conteneur
docker compose cp Backend/uploads/. backend:/app/uploads/

print_success "Fichiers uploads copiés avec succès !"

# Vérifier les permissions
print_info "Vérification des permissions..."
docker compose exec backend chmod -R 755 /app/uploads

print_success "Permissions mises à jour"

# Afficher le contenu
print_info "Contenu du dossier uploads dans le conteneur :"
docker compose exec backend ls -lah /app/uploads

print_success "Opération terminée !"
