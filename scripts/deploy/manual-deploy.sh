#!/bin/bash
# =============================================================================
# Skyie Blaze - Manual Deployment Script
# =============================================================================
# Use this script when CI/CD is unavailable
#
# Usage:
#   ./scripts/deploy/manual-deploy.sh staging
#   ./scripts/deploy/manual-deploy.sh production v1.0.0
#
# Prerequisites:
#   - Docker installed locally
#   - SSH access to target server
#   - .env file configured for target environment
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
IMAGE_PREFIX="sgadminuk/skyie-blaze"
SERVICES=("brand-service" "campaign-service" "enforcement-engine")

# Usage
usage() {
    echo "Usage: $0 <environment> [version]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment: staging or production"
    echo "  version        Optional: Git tag or commit SHA (default: latest)"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production v1.0.0"
    echo "  $0 staging abc123f"
    exit 1
}

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate arguments
if [ -z "$1" ]; then
    usage
fi

ENVIRONMENT="$1"
VERSION="${2:-latest}"

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    usage
fi

log_info "Starting manual deployment to $ENVIRONMENT (version: $VERSION)"

# Production confirmation
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${RED}"
    echo "=========================================="
    echo "  PRODUCTION DEPLOYMENT WARNING"
    echo "=========================================="
    echo -e "${NC}"
    read -p "Type 'DEPLOY' to confirm production deployment: " CONFIRM
    if [ "$CONFIRM" != "DEPLOY" ]; then
        log_error "Deployment cancelled"
        exit 1
    fi
fi

# Load environment config
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file not found: $ENV_FILE"
    echo "Please create $ENV_FILE from .env.${ENVIRONMENT}.example"
    exit 1
fi

source "$ENV_FILE"

# Get SSH config from environment or prompt
SSH_USER="${SSH_USER:-deploy}"
if [ -z "$SSH_HOST" ]; then
    read -p "Enter SSH host for $ENVIRONMENT: " SSH_HOST
fi

REMOTE_PATH="${REMOTE_PATH:-/opt/skyie-blaze}"

log_info "Target: $SSH_USER@$SSH_HOST:$REMOTE_PATH"

# Step 1: Build Docker images locally (if needed)
build_images() {
    log_info "Building Docker images..."

    for service in "${SERVICES[@]}"; do
        log_info "Building $service..."
        docker build \
            --build-arg SERVICE="$service" \
            -t "${REGISTRY}/${IMAGE_PREFIX}/${service}:${VERSION}" \
            -t "${REGISTRY}/${IMAGE_PREFIX}/${service}:manual-deploy" \
            .

        log_success "Built $service"
    done
}

# Step 2: Push images to registry
push_images() {
    log_info "Pushing images to registry..."

    # Login to registry (will prompt for token)
    echo "Enter GitHub Personal Access Token for registry:"
    docker login "$REGISTRY"

    for service in "${SERVICES[@]}"; do
        log_info "Pushing $service..."
        docker push "${REGISTRY}/${IMAGE_PREFIX}/${service}:${VERSION}"
        log_success "Pushed $service"
    done
}

# Step 3: Deploy to server
deploy_to_server() {
    log_info "Deploying to $ENVIRONMENT server..."

    # Create deployment package
    DEPLOY_DIR=$(mktemp -d)
    cp docker-compose.yml "$DEPLOY_DIR/"
    cp "docker-compose.${ENVIRONMENT}.yml" "$DEPLOY_DIR/"

    # Copy to server
    log_info "Copying files to server..."
    scp -r "$DEPLOY_DIR/"* "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"

    # Deploy on server
    log_info "Running deployment on server..."
    ssh "$SSH_USER@$SSH_HOST" << EOF
        set -e
        cd $REMOTE_PATH

        # Backup current state
        cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

        # Set version
        export APP_VERSION="${VERSION}"
        export RELEASE_TAG="${VERSION}"

        # Login to registry
        docker login $REGISTRY

        # Pull and deploy
        docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml pull
        docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d --remove-orphans

        # Wait and verify
        sleep 10

        # Health checks
        for port in 3001 3002 3003; do
            echo "Checking health on port \$port..."
            for i in {1..30}; do
                if curl -sf http://localhost:\$port/health > /dev/null 2>&1; then
                    echo "Service on port \$port is healthy"
                    break
                fi
                if [ \$i -eq 30 ]; then
                    echo "Health check failed for port \$port"
                    exit 1
                fi
                sleep 2
            done
        done

        echo "Deployment complete!"
EOF

    rm -rf "$DEPLOY_DIR"
    log_success "Deployment to $ENVIRONMENT complete!"
}

# Step 4: Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    ssh "$SSH_USER@$SSH_HOST" << EOF
        cd $REMOTE_PATH
        docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml ps
        echo ""
        docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml logs --tail=20
EOF

    log_success "Verification complete"
}

# Main execution
echo ""
echo "=========================================="
echo "  Manual Deployment - $ENVIRONMENT"
echo "=========================================="
echo ""

# Prompt for steps
echo "Select deployment steps:"
echo "  1) Build images locally"
echo "  2) Push images to registry"
echo "  3) Deploy to server"
echo "  4) All of the above"
echo "  5) Deploy only (images already in registry)"
echo ""
read -p "Select option [4]: " OPTION
OPTION="${OPTION:-4}"

case $OPTION in
    1)
        build_images
        ;;
    2)
        push_images
        ;;
    3)
        deploy_to_server
        verify_deployment
        ;;
    4)
        build_images
        push_images
        deploy_to_server
        verify_deployment
        ;;
    5)
        deploy_to_server
        verify_deployment
        ;;
    *)
        log_error "Invalid option"
        exit 1
        ;;
esac

echo ""
log_success "Manual deployment completed successfully!"
echo ""
