# =============================================================================
# Skyie Blaze - Multi-Stage Dockerfile
# =============================================================================
# Supports: brand-service, campaign-service, enforcement-engine
# Build with: docker build --build-arg SERVICE=brand-service -t skyie-brand .
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base Node.js image with common dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install common system dependencies
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S skyie && \
    adduser -S skyie -u 1001 -G skyie

# -----------------------------------------------------------------------------
# Stage 2: Dependencies installer
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 3: Builder
# -----------------------------------------------------------------------------
FROM deps AS builder

ARG SERVICE=brand-service

# Copy source code
COPY backend/ ./backend/

# Build the specific service (skip if no build script)
RUN npm run build --workspace=backend/services/${SERVICE} 2>/dev/null || \
    echo "No build script, using source directly"

# Prune dev dependencies
RUN npm prune --production || true

# -----------------------------------------------------------------------------
# Stage 4: Production runner
# -----------------------------------------------------------------------------
FROM base AS runner

ARG SERVICE=brand-service
ENV NODE_ENV=production
ENV SERVICE_NAME=${SERVICE}

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/backend/services/${SERVICE} ./backend/services/${SERVICE}
COPY --from=builder /app/backend/shared ./backend/shared
COPY --from=builder /app/backend/api ./backend/api

# Copy package.json for version info
COPY package.json ./

# Set ownership to non-root user
RUN chown -R skyie:skyie /app

USER skyie

# Expose standard port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]

# Default command - override in docker-compose per service
CMD ["node", "backend/services/${SERVICE_NAME}/src/index.js"]
