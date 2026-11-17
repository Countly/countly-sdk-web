import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import type CountlySdk from 'countly-sdk-web';
import { COUNTLY_LOADER, CountlyConfig } from './countly.config';

/** The `countly-sdk-web` singleton. */
export type Countly = typeof CountlySdk;

/** A custom event's optional figures, as `Countly.add_event` takes them. */
export interface CountlyEventOptions {
  count?: number;
  sum?: number;
  /** Duration in seconds. */
  dur?: number;
  segmentation?: Record<string, unknown>;
}

/** What `Countly.user_details` takes. */
export type CountlyUserDetails = Parameters<Countly['user_details']>[0];

/**
 * Countly for Angular. Every method is safe to call at any time: before the
 * SDK has loaded the call waits for it, and on the server (SSR, prerender)
 * it does nothing, so components need no platform checks.
 *
 * For anything not wrapped here, `sdk()` resolves with the SDK itself.
 */
@Injectable({ providedIn: 'root' })
export class CountlyService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly loader = inject(COUNTLY_LOADER);
  private started?: Promise<Countly | undefined>;
  private resolveStarted!: (sdk: Countly | undefined) => void;
  private readonly startedSignal = new Promise<Countly | undefined>((resolve) => this.resolveStarted = resolve);

  /**
   * Loads `countly-sdk-web` and initialises it, once. `provideCountly()` calls
   * this; call it yourself only to start Countly late (e.g. after consent).
   */
  start(config: CountlyConfig): Promise<Countly | undefined> {
    if (!this.started) {
      this.started = this.browser ? this.load(config) : Promise.resolve(undefined);
      this.started.then(this.resolveStarted, (e) => {
        console.error('[ngx-countly] could not start Countly', e);
        this.resolveStarted(undefined);
      });
    }
    return this.started;
  }

  /** The SDK once started; `undefined` on the server or if it failed to load. */
  sdk(): Promise<Countly | undefined> {
    return this.startedSignal;
  }

  /** Record a custom event. */
  event(key: string, options: CountlyEventOptions = {}): void {
    this.run((c) => c.add_event({ key, count: 1, ...options }));
  }

  /** Start a timed event; `endEvent` with the same key records it with its duration. */
  startEvent(key: string): void {
    this.run((c) => c.start_event(key));
  }

  endEvent(key: string, options: Omit<CountlyEventOptions, 'dur'> = {}): void {
    this.run((c) => c.end_event({ key, ...options }));
  }

  /** Record a view. Without a name, the SDK uses the current URL path. */
  view(name?: string, segments?: Record<string, unknown>): void {
    this.run((c) => c.track_pageview(name, undefined, segments));
  }

  /** Record a handled (non-fatal) error, or an unhandled one with `fatal`. */
  error(error: unknown, options: { fatal?: boolean; segments?: Record<string, unknown> } = {}): void {
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    this.run((c) => c.recordError(err, !options.fatal, options.segments));
  }

  /** Set the user's profile fields. */
  user(details: CountlyUserDetails): void {
    this.run((c) => c.user_details(details));
  }

  /** Change the device id, merging the old id's data into the new one unless `merge` is false. */
  changeId(deviceId: string, merge = true): void {
    this.run((c) => c.change_id(deviceId, merge));
  }

  /** Give consent to features or feature groups (with `require_consent: true`). */
  addConsent(features: string | string[]): void {
    this.run((c) => c.add_consent(features));
  }

  removeConsent(features: string | string[]): void {
    this.run((c) => c.remove_consent(features));
  }

  /** Run `fn` with the SDK once it is started; never on the server. */
  run<T>(fn: (sdk: Countly) => T): Promise<T | undefined> {
    return this.startedSignal.then((sdk) => (sdk ? fn(sdk) : undefined));
  }

  private async load(config: CountlyConfig): Promise<Countly | undefined> {
    // Loaded on demand: keeps the SDK out of the initial bundle and off the server.
    const module = await this.loader();
    // CommonJS through the bundler's interop: the default export, or the module itself.
    const sdk = ((module as { default?: Countly }).default ?? module) as Countly;
    sdk.init({ app_key: config.appKey, url: config.url, debug: !!config.debug, ...config.sdk });
    if (config.trackSessions ?? true) {
      sdk.track_sessions();
    }
    return sdk;
  }
}
