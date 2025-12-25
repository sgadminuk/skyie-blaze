#!/bin/bash
# =============================================================================
# Skyie Blaze - Health Check Script
# =============================================================================
# Checks health of all services in an environment
#
# Usage:
#   ./scripts/deploy/health-check.sh staging
#   ./scripts/deploy/health-check.sh production
#   ./scripts/deploy/health-check.sh local
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="${1:-local}"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[HEALTHY]${NC} $1"
}

log_error() {
    echo -e "${RED}[UNHEALTHY]${NC} $1"
}

# Service ports
SERVICES=(
    "brand-service:3001"
    "campaign-service:3002"
    "enforcement-engine:3003"
)

# Determine host
case $ENVIRONMENT in
    local)
        HOST="localhost"
        ;;
    staging)
        HOST="${STAGING_HOST:-staging.skyie.io}"
        ;;
    production)
        HOST="${PRODUCTION_HOST:-api.skyie.io}"
        ;;
    *)
        HOST="$ENVIRONMENT"
        ;;
esac

echo ""
echo "=========================================="
echo "  Health Check - $ENVIRONMENT"
echo "=========================================="
echo "  Host: $HOST"
echo "=========================================="
echo ""

FAILED=0

for service_port in "${SERVICES[@]}"; do
    SERVICE="${service_port%%:*}"
    PORT="${service_port##*:}"

    if [ "$ENVIRONMENT" == "local" ]; then
        URL="http://${HOST}:${PORT}/health"
    else
        # For staging/production, go through nginx
        URL="https://${HOST}/health"
    fi

    echo -n "Checking $SERVICE... "

    if response=$(curl -sf --max-time 5 "$URL" 2>/dev/null); then
        status=$(echo "$response" | jq -r '.status' 2>/dev/null || echo "unknown")
        if [ "$status" == "healthy" ]; then
            log_success "$SERVICE"
            echo "  Response: $response" | jq -c '.' 2>/dev/null || echo "  Response: $response"
        else
            log_error "$SERVICE (status: $status)"
            FAILED=$((FAILED + 1))
        fi
    else
        log_error "$SERVICE (unreachable)"
        FAILED=$((FAILED + 1))
    fi
    echo ""
done

echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All services healthy!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED service(s) unhealthy${NC}"
    exit 1
fi
