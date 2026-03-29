export class KeyStorageError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'KeyStorageError';
    this.code = code;
    this.details = details;
  }
}

export class KeyValidationError extends KeyStorageError {
  constructor(field, message) {
    super(`Key validation failed: ${field} - ${message}`, 'VALIDATION_ERROR', { field });
    this.field = field;
  }
}

export class KeyLoadError extends KeyStorageError {
  constructor(provider, originalError) {
    super(`Failed to load ${provider} key`, 'LOAD_ERROR', { provider });
    this.provider = provider;
    this.originalError = originalError;
  }
}

export class KeySaveError extends KeyStorageError {
  constructor(provider, originalError) {
    const detail = originalError?.message ? `: ${originalError.message}` : '';
    super(`Failed to save ${provider} key${detail}`, 'SAVE_ERROR', { provider });
    this.provider = provider;
    this.originalError = originalError;
  }
}
