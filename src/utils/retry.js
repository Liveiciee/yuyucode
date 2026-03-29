// src/utils/retry.js
import { CONFIG } from '../api/config.js';

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getBackoffDelay = (attempt, withJitter = true) => {
  const delay = CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt);
  const cappedDelay = Math.min(delay, CONFIG.RETRY.MAX_DELAY_MS);
  if (!withJitter) return cappedDelay;
  const jitter = Math.random() * CONFIG.RETRY.JITTER_MAX_MS;
  return cappedDelay + jitter;
};

export const isRetryableError = (error) => {
  if (error?.code && CONFIG.RETRY.RETRYABLE_CODES.includes(error.code)) {
    return true;
  }
  if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
    return true;
  }
  return false;
};

export const isRetryableStatus = (statusCode) => {
  return CONFIG.RETRY.RETRYABLE_STATUSES.includes(statusCode);
};
