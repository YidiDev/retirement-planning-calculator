/**
 * Sentry error tracking — silent background capture only.
 *
 * DSN is injected at build time via __SENTRY_DSN__ (set in
 * vite.config.js from SENTRY_DSN env var). If empty, Sentry
 * is not initialized and all calls are no-ops.
 */
import * as Sentry from '@sentry/browser';

const dsn = typeof __SENTRY_DSN__ !== 'undefined' ? __SENTRY_DSN__ : '';

if (dsn) {
  Sentry.init({
    dsn,
    release: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown',
    environment: window.location.hostname === 'localhost' ? 'development' : 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    autoSessionTracking: true,
    defaultIntegrations: Sentry.getDefaultIntegrations({}).filter(
      i => i.name !== 'Feedback' && i.name !== 'ReportingObserver'
    ),
  });
}

export function captureError(error, context) {
  if (dsn) {
    Sentry.captureException(error, { extra: context });
  }
}

export function setUser(id) {
  if (dsn) Sentry.setUser({ id });
}

export function addBreadcrumb(message, category, data) {
  if (dsn) {
    Sentry.addBreadcrumb({ message, category, data, level: 'info' });
  }
}
