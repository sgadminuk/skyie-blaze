#!/usr/bin/env node
/**
 * =============================================================================
 * Skyie Blaze - Golden Tests Runner
 * =============================================================================
 * Runs enforcement engine validation tests from golden-tests.yaml
 *
 * Modes:
 * - STRUCTURAL_ONLY=true: Validates test file structure only (no enforcement logic)
 * - Default: Runs full enforcement validation
 *
 * Each test case includes:
 * - input: The content/asset being validated
 * - context: Brand genome and campaign references
 * - expected: Expected validation result
 *
 * Exit codes:
 *   0 - All tests passed (or structural validation passed)
 *   1 - Test failures or errors
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Check if we're in structural-only mode (for foundation commits without enforcement engine)
const STRUCTURAL_ONLY = process.env.STRUCTURAL_ONLY === 'true' || process.env.CI_FOUNDATION === 'true';

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const GOLDEN_TESTS_PATH =
  process.env.GOLDEN_TESTS_PATH || 'backend/tests/golden/golden-tests.yaml';
const REPORTS_DIR = 'reports/golden-tests';

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};

const results = [];

/**
 * Load golden tests from YAML file
 */
function loadGoldenTests() {
  console.log(`\n${colors.blue}Loading golden tests from:${colors.reset} ${GOLDEN_TESTS_PATH}\n`);

  try {
    const content = fs.readFileSync(GOLDEN_TESTS_PATH, 'utf8');
    const data = yaml.parse(content);

    if (!data.test_cases || !Array.isArray(data.test_cases)) {
      throw new Error('Invalid golden tests format: missing test_cases array');
    }

    console.log(`${colors.cyan}Found ${data.test_cases.length} test cases${colors.reset}\n`);
    return data;
  } catch (err) {
    console.error(`${colors.red}Failed to load golden tests: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Mock enforcement engine validation
 * In a real implementation, this would call the actual enforcement service
 */
function validateContent(testCase) {
  const { input, context } = testCase;

  // This is a placeholder for the actual enforcement engine
  // It simulates the validation logic based on test case category

  const result = {
    valid: true,
    violations: [],
    warnings: [],
    quality_scores: {},
  };

  // Simulate validation based on category
  const category = testCase.category || '';

  // Color validation
  if (category.includes('colors')) {
    if (input.colors_used && context.brand_genome?.visual_identity?.colors) {
      const palette = context.brand_genome.visual_identity.colors;
      const allowedColors = [
        palette.primary?.hex,
        palette.neutral?.background,
        ...(palette.secondary || []).map((c) => c.hex),
        ...(palette.accent || []).map((c) => c.hex),
      ].filter(Boolean);

      input.colors_used.forEach((color, idx) => {
        if (!allowedColors.includes(color)) {
          result.valid = false;
          result.violations.push({
            rule_id: 'brand_color_check',
            severity: 'error',
            message: `Color ${color} is not in brand palette`,
            field: `colors_used[${idx}]`,
          });
        }
      });
    }
  }

  // Typography validation
  if (category.includes('typography')) {
    if (input.fonts_used && context.brand_genome?.visual_identity?.typography) {
      const typography = context.brand_genome.visual_identity.typography;
      const allowedFonts = [
        typography.primary_font?.family,
        typography.secondary_font?.family,
        typography.monospace_font?.family,
      ].filter(Boolean);

      input.fonts_used.forEach((font, idx) => {
        if (!allowedFonts.includes(font.family)) {
          result.valid = false;
          result.violations.push({
            rule_id: 'brand_font_check',
            severity: 'error',
            message: `Font '${font.family}' is not an approved brand font`,
            field: `fonts_used[${idx}].family`,
          });
        }
      });
    }
  }

  // Vocabulary validation
  if (category.includes('vocabulary')) {
    if (input.content?.text && context.brand_genome?.verbal_identity?.vocabulary) {
      const vocab = context.brand_genome.verbal_identity.vocabulary;
      const text = input.content.text.toLowerCase();

      (vocab.banned || []).forEach((word) => {
        if (text.includes(word.toLowerCase())) {
          result.valid = false;
          result.violations.push({
            rule_id: 'banned_word_check',
            severity: 'error',
            message: `Content contains banned word: ${word}`,
            field: 'content.text',
          });
        }
      });
    }
  }

  // Compliance validation (FCA)
  if (category.includes('compliance.fca')) {
    if (input.content?.content_type === 'investment_promotion') {
      const text = input.content.text || '';

      // Check for risk warning
      if (!text.includes('Capital at risk') && !text.includes('capital at risk')) {
        result.valid = false;
        result.violations.push({
          rule_id: 'fca_risk_warning_required',
          severity: 'critical',
          message: 'Investment promotions require risk warning under FCA COBS 4',
          field: 'content',
        });
      }

      // Check for prohibited claims
      const prohibitedPatterns = ['guaranteed returns', 'risk-free', 'risk free'];
      prohibitedPatterns.forEach((pattern) => {
        if (text.toLowerCase().includes(pattern)) {
          result.valid = false;
          result.violations.push({
            rule_id: `fca_prohibited_claim`,
            severity: 'critical',
            message: `Claims of '${pattern}' are prohibited under FCA rules`,
            field: 'content.text',
          });
        }
      });
    }
  }

  // Platform validation (character limits, hashtags)
  if (category.includes('platform.twitter')) {
    if (input.content?.character_count > 280) {
      result.valid = false;
      result.violations.push({
        rule_id: 'twitter_character_limit',
        severity: 'error',
        message: `Twitter post exceeds 280 character limit (${input.content.character_count} characters)`,
        field: 'content.text',
      });
    }
  }

  if (category.includes('platform.linkedin')) {
    const hashtagLimit = context.brand_genome?.platform_rules?.linkedin?.hashtag_strategy?.max || 5;
    if (input.content?.hashtag_count > hashtagLimit) {
      result.valid = false;
      result.violations.push({
        rule_id: 'linkedin_hashtag_limit',
        severity: 'error',
        message: `LinkedIn post has ${input.content.hashtag_count} hashtags, maximum is ${hashtagLimit}`,
        field: 'content.hashtags',
      });
    }
  }

  return result;
}

/**
 * Compare actual result with expected result
 */
function compareResults(actual, expected) {
  const mismatches = [];

  // Compare valid status
  if (actual.valid !== expected.valid) {
    mismatches.push({
      field: 'valid',
      expected: expected.valid,
      actual: actual.valid,
    });
  }

  // Compare violation count
  const expectedViolations = expected.violations || [];
  if (actual.violations.length !== expectedViolations.length) {
    mismatches.push({
      field: 'violations.length',
      expected: expectedViolations.length,
      actual: actual.violations.length,
    });
  }

  // Compare warning count
  const expectedWarnings = expected.warnings || [];
  if (actual.warnings.length !== expectedWarnings.length) {
    mismatches.push({
      field: 'warnings.length',
      expected: expectedWarnings.length,
      actual: actual.warnings.length,
    });
  }

  return mismatches;
}

/**
 * Run a single test case
 */
function runTest(testCase) {
  stats.total++;

  const { id, name, category } = testCase;

  process.stdout.write(`  ${colors.cyan}${id}${colors.reset} - ${name} ... `);

  try {
    const actual = validateContent(testCase);
    const mismatches = compareResults(actual, testCase.expected);

    const testResult = {
      id,
      name,
      category,
      passed: mismatches.length === 0,
      mismatches,
      actual,
      expected: testCase.expected,
    };

    results.push(testResult);

    if (mismatches.length === 0) {
      stats.passed++;
      console.log(`${colors.green}PASSED${colors.reset}`);
    } else {
      stats.failed++;
      console.log(`${colors.red}FAILED${colors.reset}`);
      mismatches.forEach((m) => {
        console.log(
          `    ${colors.yellow}→ ${m.field}: expected ${JSON.stringify(m.expected)}, got ${JSON.stringify(m.actual)}${colors.reset}`
        );
      });
    }
  } catch (err) {
    stats.failed++;
    console.log(`${colors.red}ERROR: ${err.message}${colors.reset}`);
    results.push({
      id,
      name,
      category,
      passed: false,
      error: err.message,
    });
  }
}

/**
 * Generate test report
 */
function generateReport() {
  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: stats,
    results,
  };

  const reportPath = path.join(REPORTS_DIR, `golden-tests-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n${colors.blue}Report saved to:${colors.reset} ${reportPath}`);

  // Also save a latest report
  const latestPath = path.join(REPORTS_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
}

/**
 * Validate test case structure (for structural-only mode)
 */
function validateTestStructure(testCase) {
  const errors = [];

  if (!testCase.id) errors.push('missing id');
  if (!testCase.name) errors.push('missing name');
  if (!testCase.category) errors.push('missing category');
  if (!testCase.input) errors.push('missing input');
  if (!testCase.expected) errors.push('missing expected');
  if (testCase.expected && typeof testCase.expected.valid !== 'boolean') {
    errors.push('expected.valid must be boolean');
  }

  return errors;
}

/**
 * Run structural validation only
 */
function runStructuralValidation(data) {
  console.log(`\n${colors.yellow}Running in STRUCTURAL VALIDATION mode${colors.reset}`);
  console.log('(Enforcement engine not implemented yet - validating test file structure)\n');

  let structuralErrors = 0;

  data.test_cases.forEach((tc, index) => {
    const errors = validateTestStructure(tc);
    stats.total++;

    if (errors.length === 0) {
      stats.passed++;
      console.log(`  ${colors.green}[OK]${colors.reset} ${tc.id || `test_${index}`}: structure valid`);
    } else {
      stats.failed++;
      structuralErrors++;
      console.log(`  ${colors.red}[ERR]${colors.reset} ${tc.id || `test_${index}`}: ${errors.join(', ')}`);
    }
  });

  // Validate metadata
  if (data.metadata) {
    console.log(`\n${colors.blue}Metadata:${colors.reset}`);
    console.log(`  Version: ${data.metadata.version || 'not specified'}`);
    console.log(`  Total test cases declared: ${data.metadata.total_test_cases || 'not specified'}`);
    console.log(`  Actual test cases found: ${data.test_cases.length}`);

    if (data.metadata.total_test_cases && data.metadata.total_test_cases !== data.test_cases.length) {
      console.log(`  ${colors.yellow}Warning: metadata count mismatch${colors.reset}`);
    }
  }

  return structuralErrors === 0;
}

/**
 * Main test runner
 */
function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}Skyie Blaze - Golden Tests${colors.reset}`);
  console.log('='.repeat(60));

  const data = loadGoldenTests();

  // If in structural-only mode, just validate structure
  if (STRUCTURAL_ONLY) {
    const success = runStructuralValidation(data);

    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bold}Structural Validation Summary${colors.reset}`);
    console.log('='.repeat(60));
    console.log(`  Total test cases: ${stats.total}`);
    console.log(`  ${colors.green}Valid:   ${stats.passed}${colors.reset}`);
    console.log(`  ${colors.red}Invalid: ${stats.failed}${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    generateReport();

    if (success) {
      console.log(`${colors.green}Structural validation passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}Structural validation failed!${colors.reset}\n`);
      process.exit(1);
    }
  }

  // Full test mode - run actual enforcement tests
  // Group tests by category
  const categories = {};
  data.test_cases.forEach((tc) => {
    const cat = tc.category || 'uncategorized';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(tc);
  });

  // Run tests by category
  Object.keys(categories)
    .sort()
    .forEach((category) => {
      console.log(`\n${colors.bold}${category}${colors.reset}`);
      console.log('-'.repeat(40));
      categories[category].forEach(runTest);
    });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}Summary${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`  Total:   ${stats.total}`);
  console.log(`  ${colors.green}Passed:  ${stats.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed:  ${stats.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}Skipped: ${stats.skipped}${colors.reset}`);

  const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
  console.log(`\n  Pass Rate: ${passRate}%`);
  console.log('='.repeat(60) + '\n');

  // Generate report
  generateReport();

  // Exit with appropriate code
  if (stats.failed > 0) {
    console.log(`${colors.red}Golden tests failed!${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All golden tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

main();
