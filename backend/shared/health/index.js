/**
 * =============================================================================
 * Skyie Blaze - Health Check Module
 * =============================================================================
 * Provides standardized health check functionality for all services.
 *
 * Each service MUST expose:
 * - GET /health - Returns 200 only if ready to serve traffic
 * - GET /health/live - Liveness probe (is the process running?)
 * - GET /health/ready - Readiness probe (can it handle requests?)
 *
 * Health check responses must be JSON with consistent structure.
 * =============================================================================
 */

// Health status enum
const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
};

/**
 * Get current service version from package.json or environment
 */
function getVersion() {
  return process.env.APP_VERSION || process.env.npm_package_version || 'unknown';
}

/**
 * Get service uptime in seconds
 */
function getUptime() {
  return Math.floor(process.uptime());
}

/**
 * Get memory usage stats
 */
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    heapTotal: Math.round(used.heapTotal / 1024 / 1024),
    external: Math.round(used.external / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
  };
}

/**
 * HealthChecker class for managing service health
 */
class HealthChecker {
  constructor(serviceName) {
    this.serviceName = serviceName || process.env.SERVICE_NAME || 'unknown';
    this.dependencies = new Map();
    this.startTime = Date.now();
  }

  /**
   * Register a dependency health check
   * @param {string} name - Dependency name (e.g., 'postgres', 'redis')
   * @param {Function} checkFn - Async function that returns true if healthy
   */
  registerDependency(name, checkFn) {
    this.dependencies.set(name, checkFn);
  }

  /**
   * Check all dependencies
   * @returns {Promise<Object>} - Map of dependency statuses
   */
  async checkDependencies() {
    const results = {};

    for (const [name, checkFn] of this.dependencies) {
      const startTime = Date.now();
      try {
        const healthy = await Promise.race([
          checkFn(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
        ]);
        results[name] = {
          status: healthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          latencyMs: Date.now() - startTime,
        };
      } catch (error) {
        results[name] = {
          status: HealthStatus.UNHEALTHY,
          error: error.message,
          latencyMs: Date.now() - startTime,
        };
      }
    }

    return results;
  }

  /**
   * Get overall health status
   * @returns {Promise<Object>} - Complete health response
   */
  async getHealth() {
    const dependencies = await this.checkDependencies();
    const allHealthy = Object.values(dependencies).every((d) => d.status === HealthStatus.HEALTHY);
    const anyUnhealthy = Object.values(dependencies).some(
      (d) => d.status === HealthStatus.UNHEALTHY
    );

    let status;
    if (allHealthy) {
      status = HealthStatus.HEALTHY;
    } else if (anyUnhealthy) {
      status = HealthStatus.UNHEALTHY;
    } else {
      status = HealthStatus.DEGRADED;
    }

    return {
      status,
      service: this.serviceName,
      version: getVersion(),
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      memory: getMemoryUsage(),
      dependencies,
    };
  }

  /**
   * Simple liveness check - is the process running?
   */
  getLiveness() {
    return {
      status: HealthStatus.HEALTHY,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check - can the service handle requests?
   * @returns {Promise<Object>}
   */
  async getReadiness() {
    const dependencies = await this.checkDependencies();
    const isReady = Object.values(dependencies).every((d) => d.status === HealthStatus.HEALTHY);

    return {
      status: isReady ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      ready: isReady,
      dependencies,
    };
  }

  /**
   * Express middleware for health endpoints
   * @returns {Function} Express router
   */
  getRouter() {
    // Return a simple function that can be used as middleware
    // Works with Express, Fastify, or any HTTP framework
    return async (req, res) => {
      const path = req.path || req.url || '/health';

      try {
        let response;
        let statusCode = 200;

        if (path === '/health/live' || path === '/health/liveness') {
          response = this.getLiveness();
        } else if (path === '/health/ready' || path === '/health/readiness') {
          response = await this.getReadiness();
          statusCode = response.status === HealthStatus.HEALTHY ? 200 : 503;
        } else {
          // Default /health endpoint
          response = await this.getHealth();
          statusCode = response.status === HealthStatus.HEALTHY ? 200 : 503;
        }

        res.status(statusCode).json(response);
      } catch (error) {
        res.status(500).json({
          status: HealthStatus.UNHEALTHY,
          service: this.serviceName,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }
}

/**
 * Common dependency checkers
 */
const DependencyCheckers = {
  /**
   * PostgreSQL health check
   * @param {Object} pool - pg Pool instance
   */
  postgres: (pool) => async () => {
    const result = await pool.query('SELECT 1');
    return result.rows.length === 1;
  },

  /**
   * Redis health check
   * @param {Object} client - Redis client instance
   */
  redis: (client) => async () => {
    const pong = await client.ping();
    return pong === 'PONG';
  },

  /**
   * HTTP service health check
   * @param {string} url - Health endpoint URL
   */
  http: (url) => async () => {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  },
};

module.exports = {
  HealthChecker,
  HealthStatus,
  DependencyCheckers,
  getVersion,
  getUptime,
  getMemoryUsage,
};
