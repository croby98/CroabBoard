#!/bin/bash

# CroabBoard Deployment Script
# Usage: ./deploy.sh [development|production|stop|logs]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log "Docker is running ✓"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        warn ".env file not found. Creating from .env.example"
        if [ -f .env.example ]; then
            cp .env.example .env
            warn "Please edit .env file with your configuration before continuing."
            read -p "Press Enter to continue after editing .env file..."
        else
            error ".env.example not found. Please create .env manually."
            exit 1
        fi
    fi
    log ".env file found ✓"
}

# Development deployment
deploy_dev() {
    log "Starting CroabBoard in development mode..."

    check_docker
    check_env

    info "Stopping any existing containers..."
    docker-compose down --remove-orphans || true

    info "Building and starting containers..."
    docker-compose up --build -d

    info "Waiting for database initialization and services to be healthy..."
    info "Note: First run may take longer due to database initialization from SQL dump"
    sleep 30

    # Check health
    if docker-compose ps | grep -q "Up (healthy)"; then
        log "✅ CroabBoard is running successfully!"
        info "Frontend: http://localhost:3000"
        info "Backend API: http://localhost:5000"
        info "Database: localhost:3306"
        echo
        info "To view logs: ./deploy.sh logs"
        info "To stop: ./deploy.sh stop"
    else
        error "❌ Some services failed to start properly"
        docker-compose ps
        echo
        info "Check logs with: ./deploy.sh logs"
        exit 1
    fi
}

# Production deployment
deploy_prod() {
    log "Starting CroabBoard in production mode..."

    check_docker
    check_env

    # Verify required environment variables
    if [ -z "$SESSION_SECRET" ] || [ "$SESSION_SECRET" = "your-super-secure-session-secret-change-this-in-production" ]; then
        error "Please set a secure SESSION_SECRET in .env for production"
        exit 1
    fi

    info "Stopping any existing containers..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans || true

    info "Building and starting production containers..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

    info "Waiting for database initialization and services to be healthy..."
    info "Note: First run may take longer due to database initialization from SQL dump"
    sleep 45

    # Check health
    if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
        log "✅ CroabBoard is running in production mode!"
        info "Frontend: http://localhost:3000"
        info "Reverse Proxy: http://localhost:80"
        echo
        warn "Remember to:"
        warn "- Configure SSL certificates for HTTPS"
        warn "- Set up domain DNS records"
        warn "- Configure firewall rules"
        warn "- Set up backup procedures"
    else
        error "❌ Some services failed to start properly"
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
        echo
        info "Check logs with: ./deploy.sh logs"
        exit 1
    fi
}

# Stop all services
stop_services() {
    log "Stopping CroabBoard services..."

    info "Stopping development containers..."
    docker-compose down --remove-orphans || true

    info "Stopping production containers..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans || true

    log "✅ All services stopped"
}

# Show logs
show_logs() {
    if docker-compose ps | grep -q "Up"; then
        log "Showing development logs (Ctrl+C to exit):"
        docker-compose logs -f
    elif docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "Showing production logs (Ctrl+C to exit):"
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
    else
        warn "No running containers found"
        info "Start services first: ./deploy.sh development"
    fi
}

# Backup database
backup_db() {
    log "Creating database backup..."

    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR

    BACKUP_FILE="$BACKUP_DIR/croabboard_backup_$(date +%Y%m%d_%H%M%S).sql"

    if docker-compose ps croabboard-db | grep -q "Up"; then
        docker-compose exec -T croabboard-db mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE
        log "✅ Database backup created: $BACKUP_FILE"
    else
        error "Database container is not running"
        exit 1
    fi
}

# Clean up Docker resources
cleanup() {
    log "Cleaning up Docker resources..."

    warn "This will remove all CroabBoard containers, images, and volumes"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans

        # Remove images
        docker images | grep croabboard | awk '{print $3}' | xargs docker rmi -f || true

        log "✅ Cleanup completed"
    else
        info "Cleanup cancelled"
    fi
}

# Show help
show_help() {
    echo "CroabBoard Deployment Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  development    Start in development mode (default)"
    echo "  production     Start in production mode"
    echo "  stop           Stop all services"
    echo "  logs           Show container logs"
    echo "  backup         Create database backup"
    echo "  cleanup        Remove all containers and images"
    echo "  health         Check service health"
    echo "  help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 development     # Start development environment"
    echo "  $0 production      # Start production environment"
    echo "  $0 logs            # View real-time logs"
    echo "  $0 stop            # Stop all services"
}

# Check service health
check_health() {
    log "Checking service health..."

    services=("croabboard-db" "croabboard-backend" "croabboard-frontend")

    for service in "${services[@]}"; do
        if docker-compose ps $service | grep -q "Up (healthy)"; then
            log "✅ $service is healthy"
        elif docker-compose ps $service | grep -q "Up"; then
            warn "⚠️  $service is running but not healthy"
        else
            error "❌ $service is not running"
        fi
    done
}

# Main script logic
case "${1:-development}" in
    "development"|"dev")
        deploy_dev
        ;;
    "production"|"prod")
        deploy_prod
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        show_logs
        ;;
    "backup")
        backup_db
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        check_health
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac