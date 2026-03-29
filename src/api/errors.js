export class AIError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class RateLimitError extends AIError {
  constructor(retryAfter = 60, provider = 'unknown') {
    super(`Rate limit exceeded for ${provider}. Retry after ${retryAfter}s`, 'RATE_LIMIT', { retryAfter, provider });
    this.retryAfter = retryAfter;
    this.provider = provider;
  }
}

export class ServerError extends AIError {
  constructor(provider, statusCode, details = {}) {
    super(`${provider} server error: ${statusCode}`, 'SERVER_ERROR', { provider, statusCode, ...details });
    this.provider = provider;
    this.statusCode = statusCode;
    this.isRetryable = [408, 429, 500, 502, 503, 504].includes(statusCode);
  }
}

export class ValidationError extends AIError {
  constructor(field, message) {
    super(`Validation failed: ${field} - ${message}`, 'VALIDATION_ERROR', { field });
    this.field = field;
  }
}

export class CircuitBreakerOpenError extends AIError {
  constructor(provider) {
    super(`Circuit breaker is open for ${provider}`, 'CIRCUIT_OPEN', { provider });
    this.provider = provider;
  }
}

export class TimeoutError extends AIError {
  constructor(provider, timeoutMs) {
    super(`${provider} request timeout after ${timeoutMs}ms`, 'TIMEOUT', { provider, timeoutMs });
    this.provider = provider;
    this.timeoutMs = timeoutMs;
  }
}
