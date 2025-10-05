#!/bin/bash

# CroabBoard - Script de Démarrage Simplifié
# Ce script vous aide à démarrer CroabBoard facilement

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🎵 CroabBoard - Démarrage Rapide 🎵              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: Docker n'est pas en cours d'exécution${NC}"
    echo "Veuillez démarrer Docker Desktop et réessayer."
    exit 1
fi

echo -e "${GREEN}✓ Docker est en cours d'exécution${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo "Création du fichier .env depuis .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Modifiez le fichier .env pour changer les mots de passe !${NC}"
    echo ""
fi

# Ask user which deployment mode
echo -e "${BLUE}Choisissez votre mode de déploiement:${NC}"
echo ""
echo "1) Développement (ports directs: 3000, 5000, 3306)"
echo "2) Production Simple - Host Mode (accès via IP:3000)"
echo "3) Production avec Proxy - Recommandé (accès via IP ou domaine)"
echo ""
read -p "Votre choix (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}🔧 Mode Développement sélectionné${NC}"
        COMPOSE_FILE="docker-compose.yml"
        ACCESS_URL="http://localhost:3000"
        ;;
    2)
        echo -e "${BLUE}📦 Mode Production Simple (Host) sélectionné${NC}"
        COMPOSE_FILE="docker-compose.simple.yml"

        # Get server IP
        SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        ACCESS_URL="http://${SERVER_IP}:3000"
        ;;
    3)
        echo -e "${BLUE}🌐 Mode Production avec Proxy sélectionné${NC}"
        COMPOSE_FILE="docker-compose.proxy.yml"

        # Get server IP
        SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        ACCESS_URL="http://${SERVER_IP}"
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

echo ""

# Ask if user wants to copy existing uploads
if [ -d "Backend/uploads" ] && [ "$(ls -A Backend/uploads 2>/dev/null)" ]; then
    echo -e "${YELLOW}📁 Fichiers détectés dans Backend/uploads/${NC}"
    read -p "Voulez-vous copier ces fichiers dans le volume Docker ? (o/N): " copy_uploads

    if [[ $copy_uploads =~ ^[Oo]$ ]]; then
        echo -e "${BLUE}📂 Copie des fichiers d'upload...${NC}"
        chmod +x copy-uploads-to-docker.sh
        ./copy-uploads-to-docker.sh
    fi
fi

echo ""
echo -e "${BLUE}🚀 Démarrage de CroabBoard...${NC}"
echo -e "${YELLOW}Configuration: ${COMPOSE_FILE}${NC}"
echo ""

# Start services
docker-compose -f "$COMPOSE_FILE" up -d

echo ""
echo -e "${GREEN}✅ CroabBoard a démarré avec succès !${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📍 Accès à l'application:${NC}"
echo -e "   ${GREEN}${ACCESS_URL}${NC}"
echo ""
echo -e "${BLUE}📊 Commandes utiles:${NC}"
echo "   Voir les logs:      docker-compose -f $COMPOSE_FILE logs -f"
echo "   Arrêter:            docker-compose -f $COMPOSE_FILE down"
echo "   Redémarrer:         docker-compose -f $COMPOSE_FILE restart"
echo "   Status:             docker-compose -f $COMPOSE_FILE ps"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "   Guide complet:      DEPLOYMENT.md"
echo "   Docker:             DOCKER.md"
echo "   Uploads:            UPLOADS.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⏳ Attendez environ 30 secondes que tous les services démarrent...${NC}"
echo ""

# Wait and check health
sleep 5

echo -e "${BLUE}🔍 Vérification des services...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo -e "${GREEN}✨ Prêt à l'emploi ! Ouvrez ${ACCESS_URL} dans votre navigateur${NC}"
echo ""
