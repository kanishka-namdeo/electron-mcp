import { createLogger } from './logger.js';

const logger = createLogger('ConnectionHealth');

export interface HealthCheckResult {
  isHealthy: boolean;
  latency?: number;
  lastChecked: Date;
  error?: string;
}

export interface ConnectionHealthOptions {
  checkInterval?: number;
  maxRetries?: number;
  timeout?: number;
  onHealthChange?: (isHealthy: boolean) => void;
}

export class ConnectionHealthMonitor {
  private health: Map<string, HealthCheckResult> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private options: ConnectionHealthOptions;

  constructor(options: ConnectionHealthOptions = {}) {
    this.options = {
      checkInterval: 5000,
      maxRetries: 3,
      timeout: 3000,
      ...options,
    };
  }

  async startMonitoring(
    connectionId: string,
    checkFn: () => Promise<boolean>
  ): Promise<void> {
    if (this.intervals.has(connectionId)) {
      logger.warn({ connectionId }, 'Already monitoring this connection');
      return;
    }

    logger.info({ connectionId }, 'Starting health monitoring');

    const performHealthCheck = async () => {
      try {
        const start = Date.now();
        const isHealthy = await Promise.race([
          checkFn(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), this.options.timeout)
          ),
        ]);

        const latency = Date.now() - start;
        const previousHealth = this.health.get(connectionId);
        const wasUnhealthy = previousHealth && !previousHealth.isHealthy;

        const result: HealthCheckResult = {
          isHealthy,
          latency,
          lastChecked: new Date(),
        };

        this.health.set(connectionId, result);

        if (wasUnhealthy && isHealthy && this.options.onHealthChange) {
          this.options.onHealthChange(true);
        }

        if (!isHealthy && this.options.onHealthChange) {
          this.options.onHealthChange(false);
        }

        logger.debug({ connectionId, isHealthy, latency }, 'Health check completed');
      } catch (error) {
        const previousHealth = this.health.get(connectionId);
        const wasHealthy = previousHealth && previousHealth.isHealthy;

        const result: HealthCheckResult = {
          isHealthy: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : String(error),
        };

        this.health.set(connectionId, result);

        if (wasHealthy && this.options.onHealthChange) {
          this.options.onHealthChange(false);
        }

        logger.warn({ connectionId, error }, 'Health check failed');
      }
    };

    await performHealthCheck();

    const interval = setInterval(performHealthCheck, this.options.checkInterval);
    this.intervals.set(connectionId, interval);
  }

  stopMonitoring(connectionId: string): void {
    const interval = this.intervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(connectionId);
      this.health.delete(connectionId);
      logger.info({ connectionId }, 'Stopped health monitoring');
    }
  }

  getHealth(connectionId: string): HealthCheckResult | undefined {
    return this.health.get(connectionId);
  }

  isHealthy(connectionId: string): boolean {
    const health = this.health.get(connectionId);
    return health ? health.isHealthy : false;
  }

  getLatency(connectionId: string): number | undefined {
    const health = this.health.get(connectionId);
    return health ? health.latency : undefined;
  }

  stopAll(): void {
    for (const [connectionId] of this.intervals.entries()) {
      this.stopMonitoring(connectionId);
    }
  }

  getAllHealth(): Map<string, HealthCheckResult> {
    return new Map(this.health);
  }
}

export function createConnectionHealthMonitor(
  options?: ConnectionHealthOptions
): ConnectionHealthMonitor {
  return new ConnectionHealthMonitor(options);
}
