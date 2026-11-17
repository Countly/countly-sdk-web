import { InjectionToken } from '@angular/core';

/** What `provideCountly()` takes. */
export interface CountlyConfig {
  /** The app key from your Countly server (Management › Applications). */
  appKey: string;
  /** Your Countly server URL, e.g. `https://your.server.ly`. */
  url: string;
  /** Print the SDK's logs to the console. */
  debug?: boolean;
  /** Track sessions as soon as the SDK starts. Default `true`. */
  trackSessions?: boolean;
  /**
   * Any other `Countly.init` option, passed as is (`require_consent`,
   * `device_id`, `offline_mode`, `session_update`, push options...). See
   * https://support.countly.com/hc/en-us/articles/360037441932
   */
  sdk?: Record<string, unknown>;
}

export const COUNTLY_CONFIG = new InjectionToken<CountlyConfig>('COUNTLY_CONFIG');

/**
 * How the SDK module is loaded: `import('countly-sdk-web')` by default.
 * Replace it to test without the real SDK, or to load a build of your own.
 */
export const COUNTLY_LOADER = new InjectionToken<() => Promise<unknown>>('COUNTLY_LOADER', {
  providedIn: 'root',
  factory: () => () => import('countly-sdk-web'),
});
