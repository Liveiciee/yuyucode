import { logger } from '../utils.js';
import { CONFIG } from './config.js';
import { CircuitBreakerOpenError } from './errors.js';

export class CircuitBreaker {
  constructor(provider, config = CONFIG.CIRCUIT_BREAKER) {
    this.provider = provider;
    this.config = config;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        logger.info?.(`Circuit breaker for ${this.provider} is now HALF_OPEN`);
      } else {
        throw new CircuitBreakerOpenError(this.provider);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info?.(`Circuit breaker for ${this.provider} is now CLOSED`);
    }
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  onFailure(_error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.config.timeoutMs;
      logger.warn?.(`Circuit breaker for ${this.provider} is now OPEN for ${this.config.timeoutMs}ms`);
    } else if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.config.timeoutMs;
      logger.warn?.(`Circuit breaker for ${this.provider} failed in HALF_OPEN, returning to OPEN`);
    }
  }

  getStatus() {
    return {
      provider: this.provider,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

const circuitBreakers = new Map();

export function getCircuitBreaker(provider) {
  if (!circuitBreakers.has(provider)) {
    circuitBreakers.set(provider, new CircuitBreaker(provider));
  }
  return circuitBreakers.get(provider);
}

export function getCircuitBreakerStatus() {
  const status = {};
  for (const [provider, breaker] of circuitBreakers) {
    status[provider] = breaker.getStatus();
  }
  return status;
}
