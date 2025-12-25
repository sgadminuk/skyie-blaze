-- =============================================================================
-- Skyie Blaze - PostgreSQL Initialization Script
-- =============================================================================
-- This script runs on first database initialization only
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for service isolation
CREATE SCHEMA IF NOT EXISTS brand;
CREATE SCHEMA IF NOT EXISTS campaign;
CREATE SCHEMA IF NOT EXISTS enforcement;
CREATE SCHEMA IF NOT EXISTS audit;

-- =============================================================================
-- BRAND SERVICE TABLES
-- =============================================================================

-- Brands table
CREATE TABLE IF NOT EXISTS brand.brands (
    brand_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, name)
);

-- Brand versions table
CREATE TABLE IF NOT EXISTS brand.brand_versions (
    brand_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brand.brands(brand_id) ON DELETE CASCADE,
    version_major INTEGER NOT NULL DEFAULT 1,
    version_minor INTEGER NOT NULL DEFAULT 0,
    version_patch INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'archived')),
    genome_json JSONB NOT NULL,
    genome_hash VARCHAR(71) NOT NULL,  -- sha256:64chars
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    parent_version_id UUID REFERENCES brand.brand_versions(brand_version_id),
    change_summary TEXT,
    UNIQUE(brand_id, version_major, version_minor, version_patch)
);

-- Ensure only one active version per brand
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_versions_active
    ON brand.brand_versions(brand_id)
    WHERE status = 'active';

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_brand_versions_brand_id
    ON brand.brand_versions(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_versions_status
    ON brand.brand_versions(status);

-- =============================================================================
-- AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit.brand_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL,
    brand_version_id UUID,
    action VARCHAR(50) NOT NULL
        CHECK (action IN ('create', 'update', 'activate', 'archive', 'delete')),
    actor VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB NOT NULL DEFAULT '{}',
    before_hash VARCHAR(71),
    after_hash VARCHAR(71)
);

CREATE INDEX IF NOT EXISTS idx_audit_brand_id
    ON audit.brand_audit_log(brand_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp
    ON audit.brand_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action
    ON audit.brand_audit_log(action);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to brands table
DROP TRIGGER IF EXISTS update_brands_updated_at ON brand.brands;
CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON brand.brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE brand.brands IS 'Master brand records';
COMMENT ON TABLE brand.brand_versions IS 'Versioned brand genome snapshots';
COMMENT ON TABLE audit.brand_audit_log IS 'Immutable audit trail for brand operations';
COMMENT ON COLUMN brand.brand_versions.genome_hash IS 'SHA-256 hash of canonical genome JSON';
COMMENT ON COLUMN brand.brand_versions.status IS 'Only one version per brand can be active';

-- =============================================================================
-- GRANT PERMISSIONS (adjust user as needed)
-- =============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA brand TO skyie;
GRANT USAGE ON SCHEMA campaign TO skyie;
GRANT USAGE ON SCHEMA enforcement TO skyie;
GRANT USAGE ON SCHEMA audit TO skyie;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA brand TO skyie;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA campaign TO skyie;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA enforcement TO skyie;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO skyie;  -- No update/delete on audit

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA brand TO skyie;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA campaign TO skyie;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA enforcement TO skyie;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO skyie;

-- =============================================================================
-- INITIAL DATA (if any)
-- =============================================================================

-- None required - tables start empty
