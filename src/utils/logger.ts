/* Logger adapter using react-native-logs. This file centralizes logging across the app. */
import { logger as rnLogger, consoleTransport } from 'react-native-logs';

const defaultConfig = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  // Show console logs only in development; disable console transport in production by default
  transport: __DEV__ ? consoleTransport : null,
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
};

// Create logger instance
const log = rnLogger.createLogger(defaultConfig);

// App-wide logger facade
export const logger = {
  debug: (message: string, data?: object) => log.debug(message, data),
  info: (message: string, data?: object) => log.info(message, data),
  warn: (message: string, data?: object) => log.warn(message, data),
  error: (message: string, error?: Error, data?: object) => {
    log.error(message, { error: error?.message, stack: error?.stack, ...data });
  },
};
