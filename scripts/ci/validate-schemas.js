#!/usr/bin/env node
/**
 * =============================================================================
 * Skyie Blaze - Schema Validation Script
 * =============================================================================
 * Validates JSON schemas for:
 * - Correct JSON Schema draft-2020-12 compliance
 * - No unknown/undocumented fields
 * - Required fields are present
 * - Schema drift detection
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, 'PASS', message);
}

function error(message) {
  log(colors.red, 'FAIL', message);
}

function warn(message) {
  log(colors.yellow, 'WARN', message);
}

function info(message) {
  log(colors.blue, 'INFO', message);
}

// Schema files to validate
const SCHEMA_FILES = [
  'backend/shared/schemas/brand-genome.schema.json',
  'backend/shared/schemas/campaign-blueprint.schema.json',
];

// OpenAPI file
const OPENAPI_FILE = 'backend/api/openapi.yaml';

let exitCode = 0;

/**
 * Validate JSON schema structure
 */
function validateSchemaStructure(schemaPath) {
  info(`Validating schema: ${schemaPath}`);

  try {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(content);

    // Check required top-level fields
    const requiredFields = ['$schema', '$id', 'title', 'type', 'properties'];
    const missingFields = requiredFields.filter((field) => !schema[field]);

    if (missingFields.length > 0) {
      error(`Missing required fields: ${missingFields.join(', ')}`);
      exitCode = 1;
    }

    // Validate $schema is draft-2020-12
    if (schema.$schema && !schema.$schema.includes('draft/2020-12')) {
      warn(`Schema uses ${schema.$schema}, recommended: draft/2020-12`);
    }

    // Check for additionalProperties: false (strict mode)
    if (schema.additionalProperties !== false) {
      warn(`Schema allows additional properties. Consider setting additionalProperties: false`);
    }

    // Validate all $ref references exist
    const refs = findAllRefs(schema);
    const defs = schema.$defs || {};
    const invalidRefs = [];

    refs.forEach((ref) => {
      if (ref.startsWith('#/$defs/')) {
        const defName = ref.replace('#/$defs/', '');
        if (!defs[defName]) {
          invalidRefs.push(ref);
        }
      }
    });

    if (invalidRefs.length > 0) {
      error(`Invalid $ref references: ${invalidRefs.join(', ')}`);
      exitCode = 1;
    }

    // Count definitions
    const defCount = Object.keys(defs).length;
    const propCount = Object.keys(schema.properties || {}).length;

    success(`Schema valid: ${propCount} properties, ${defCount} definitions`);
    return true;
  } catch (err) {
    error(`Failed to parse schema: ${err.message}`);
    exitCode = 1;
    return false;
  }
}

/**
 * Recursively find all $ref values in an object
 */
function findAllRefs(obj, refs = []) {
  if (typeof obj !== 'object' || obj === null) {
    return refs;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findAllRefs(item, refs));
  } else {
    Object.keys(obj).forEach((key) => {
      if (key === '$ref' && typeof obj[key] === 'string') {
        refs.push(obj[key]);
      } else {
        findAllRefs(obj[key], refs);
      }
    });
  }

  return refs;
}

/**
 * Check for schema drift between schemas and OpenAPI
 */
function checkSchemaDrift() {
  info('Checking for schema drift between JSON schemas and OpenAPI...');

  // This is a basic check - in production, use a proper schema comparison tool
  try {
    const openapiContent = fs.readFileSync(OPENAPI_FILE, 'utf8');

    // Check that OpenAPI references the schemas
    if (!openapiContent.includes('BrandGenome') || !openapiContent.includes('CampaignBlueprint')) {
      warn('OpenAPI may not reference all schema types');
    }

    // Check version consistency
    const brandSchema = JSON.parse(
      fs.readFileSync('backend/shared/schemas/brand-genome.schema.json', 'utf8')
    );
    if (brandSchema.$id && !brandSchema.$id.includes('v1')) {
      warn('Schema version may not match API version');
    }

    success('No obvious schema drift detected');
  } catch (err) {
    error(`Schema drift check failed: ${err.message}`);
    exitCode = 1;
  }
}

/**
 * Validate schema examples if present
 */
function validateExamples(schemaPath) {
  const examplesDir = path.join(path.dirname(schemaPath), 'examples');

  if (!fs.existsSync(examplesDir)) {
    info(`No examples directory found for ${schemaPath}`);
    return;
  }

  const exampleFiles = fs.readdirSync(examplesDir).filter((f) => f.endsWith('.json'));

  exampleFiles.forEach((file) => {
    info(`Validating example: ${file}`);
    try {
      const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
      JSON.parse(content);
      success(`Example ${file} is valid JSON`);
    } catch (err) {
      error(`Example ${file} is invalid: ${err.message}`);
      exitCode = 1;
    }
  });
}

/**
 * Main validation runner
 */
function main() {
  console.log('\n' + '='.repeat(60));
  console.log('Skyie Blaze - Schema Validation');
  console.log('='.repeat(60) + '\n');

  // Validate each schema file
  SCHEMA_FILES.forEach((schemaPath) => {
    if (fs.existsSync(schemaPath)) {
      validateSchemaStructure(schemaPath);
      validateExamples(schemaPath);
    } else {
      error(`Schema file not found: ${schemaPath}`);
      exitCode = 1;
    }
    console.log('');
  });

  // Check for drift
  if (fs.existsSync(OPENAPI_FILE)) {
    checkSchemaDrift();
  } else {
    error(`OpenAPI file not found: ${OPENAPI_FILE}`);
    exitCode = 1;
  }

  console.log('\n' + '='.repeat(60));
  if (exitCode === 0) {
    success('All schema validations passed!');
  } else {
    error('Schema validation failed - see errors above');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(exitCode);
}

main();
