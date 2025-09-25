/**
 * Environment Configuration
 * Centralized configuration for API endpoints and environment-specific settings
 */

const ENV = process.env.NODE_ENV || 'development';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  // Optional: authentication from env
  USERNAME: process.env.API_USERNAME,
  PASSWORD: process.env.API_PASSWORD,
};

// Security Configuration
const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: true,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: true,
  },
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Payment Configuration
const PAYMENT_CONFIG = {
  SUPPORTED_METHODS: ['card', 'paypal', 'bank_transfer'],
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'AED'],
  MIN_AMOUNT: 1.0,
  MAX_AMOUNT: 10000.0,
  REQUIRE_3DS: true,
  FRAUD_CHECK_ENABLED: true,
};

// Feature Flags
const FEATURES = {
  DEBUG_MODE: ENV === 'development',
  LOGGING_ENABLED: ENV === 'development',
  ANALYTICS_ENABLED: ENV === 'production',
  ERROR_TRACKING: ENV === 'production',
  PERFORMANCE_MONITORING: ENV === 'production',
  PAYMENT_PROCESSING: true,
  WALLET_FEATURE: false,
  SOCIAL_LOGIN: false,
  REVIEWS_SYSTEM: true,
};

// Performance Configuration
const PERFORMANCE_CONFIG = {
  IMAGE_QUALITY: 80,
  IMAGE_FORMATS: ['webp', 'avif', 'jpeg'],
  STATIC_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000,
  API_CACHE_DURATION: 5 * 60 * 1000,
  LAZY_LOAD_THRESHOLD: 0.1,
  CODE_SPLITTING: true,
  TREE_SHAKING: true,
};

// Validation Rules
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  NAME_REGEX: /^[a-zA-Z\s'-]{2,50}$/,
  CARD_REGEX: /^[0-9]{13,19}$/,
  CVV_REGEX: /^[0-9]{3,4}$/,
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds. Please use a different payment method.',
  CARD_DECLINED: 'Card was declined. Please check your card details.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_NAME: 'Please enter a valid name (2-50 characters).',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

// Logging Configuration
const LOGGING_CONFIG = {
  LEVEL: ENV === 'production' ? 'error' : 'debug',
  ENABLE_CONSOLE: ENV === 'development',
  ENABLE_REMOTE: ENV === 'production',
  REMOTE_ENDPOINT: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
  MASK_FIELDS: ['password', 'token', 'card_number', 'cvv', 'ssn'],
};

// Image domains (Next.js)
const IMAGE_DOMAINS = process.env.NEXT_PUBLIC_IMAGE_DOMAINS
  ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',')
  : ['localhost'];

module.exports = {
  ENV,
  API_CONFIG,
  SECURITY_CONFIG,
  PAYMENT_CONFIG,
  FEATURES,
  PERFORMANCE_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  LOGGING_CONFIG,
  IMAGE_DOMAINS,
};
