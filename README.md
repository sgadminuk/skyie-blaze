# Skyie Blaze

Skyie Blaze is a brand-governed autonomous marketing operating system.

## Repository Structure

| Folder | Description |
|--------|-------------|
| `frontend/` | Web application including components, features, and UI state management |
| `backend/` | Backend services, shared schemas, API definitions, workers, and tests |
| `reports/` | Compliance reports, analytics outputs, and export artifacts |
| `documents/` | RFCs, specifications, UX documentation, and architectural decisions |
| `infrastructure/` | Terraform, Kubernetes, Docker, and CI/CD configurations |
| `scripts/` | Utility scripts for seeding, migrations, testing, and deployment |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Verify health
./scripts/deploy/health-check.sh local
```

### Validate Schemas & Run Tests

```bash
# Validate JSON schemas
npm run validate:schemas

# Validate OpenAPI spec
npm run validate:openapi

# Run golden tests
npm run test:golden

# Run all tests
npm test
```

## CI/CD Pipeline

### Environments

| Environment | Trigger | Approval |
|------------|---------|----------|
| Local | Manual | None |
| Staging | Push to main | Automatic |
| Production | Release tag (vX.Y.Z) | Manual |

### GitHub Secrets Required

Configure these secrets in your GitHub repository:

**Staging:**
- `STAGING_SSH_PRIVATE_KEY` - SSH key for staging VPS
- `STAGING_SSH_KNOWN_HOSTS` - SSH known hosts entry
- `STAGING_SSH_USER` - SSH username
- `STAGING_SSH_HOST` - Staging server hostname

**Production:**
- `PRODUCTION_SSH_PRIVATE_KEY` - SSH key for production VPS
- `PRODUCTION_SSH_KNOWN_HOSTS` - SSH known hosts entry
- `PRODUCTION_SSH_USER` - SSH username
- `PRODUCTION_SSH_HOST` - Production server hostname

### Manual Deployment (if CI unavailable)

```bash
# Deploy to staging
./scripts/deploy/manual-deploy.sh staging

# Deploy to production (requires confirmation)
./scripts/deploy/manual-deploy.sh production v1.0.0

# Rollback
./scripts/deploy/rollback.sh staging
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| brand-service | 3001 | Brand Genome management |
| campaign-service | 3002 | Campaign Blueprint management |
| enforcement-engine | 3003 | Content validation and enforcement |
| postgres | 5432 | Primary database |
| redis | 6379 | Caching and queues |

## License

Proprietary — Skyie Global Technologies Ltd
