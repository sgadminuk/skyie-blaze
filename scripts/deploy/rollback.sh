#!/bin/bash
# =============================================================================
# Skyie Blaze - Rollback Script
# =============================================================================
# Rolls back to a previous deployment version
#
# Usage:
#   ./scripts/deploy/rollback.sh staging
#   ./scripts/deploy/rollback.sh production v1.0.0
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <environment> [version]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment: staging or production"
    echo "  version        Optional: Version to rollback to (default: previous)"
    exit 1
fi

ENVIRONMENT="$1"
TARGET_VERSION="$2"

# Load environment config
ENV_FILE=".env.${ENVIRONMENT}"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

SSH_USER="${SSH_USER:-deploy}"
if [ -z "$SSH_HOST" ]; then
    read -p "Enter SSH host for $ENVIRONMENT: " SSH_HOST
fi
REMOTE_PATH="${REMOTE_PATH:-/opt/skyie-blaze}"

# Production warning
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${RED}"
    echo "=========================================="
    echo "  PRODUCTION ROLLBACK WARNING"
    echo "=========================================="
    echo -e "${NC}"
    read -p "Type 'ROLLBACK' to confirm: " CONFIRM
    if [ "$CONFIRM" != "ROLLBACK" ]; then
        log_error "Rollback cancelled"
        exit 1
    fi
fi

log_info "Starting rollback on $ENVIRONMENT..."

# Perform rollback
ssh "$SSH_USER@$SSH_HOST" << EOF
    set -e
    cd $REMOTE_PATH

    echo "Current state:"
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml ps

    # Find backup to restore
    BACKUP=\$(ls -t .env.backup.* 2>/dev/null | head -1)

    if [ -n "\$BACKUP" ]; then
        echo "Restoring from \$BACKUP"
        cp "\$BACKUP" .env
    fi

    # If specific version provided, use it
    if [ -n "$TARGET_VERSION" ]; then
        export APP_VERSION="$TARGET_VERSION"
        export RELEASE_TAG="$TARGET_VERSION"
        docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml pull
    fi

    # Restart with previous configuration
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml down
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d

    # Wait for health
    sleep 10

    echo "New state:"
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml ps

    echo ""
    echo "Rollback complete - verify services manually!"
EOF

log_success "Rollback completed"
log_info "Please verify all services are working correctly"
