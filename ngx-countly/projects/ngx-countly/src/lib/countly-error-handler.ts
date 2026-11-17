import { ErrorHandler, inject, Injectable } from '@angular/core';
import { CountlyService } from './countly.service';

/**
 * Angular's ErrorHandler, also reporting every uncaught error to Countly as a
 * crash. Angular catches errors in templates, change detection and zone tasks
 * before they reach `window.onerror`, so the SDK's own `track_errors()` never
 * sees them: this is where they surface. Install it with `withErrorHandler()`.
 */
@Injectable()
export class CountlyErrorHandler extends ErrorHandler {
  private readonly countly = inject(CountlyService);

  override handleError(error: unknown): void {
    this.countly.error(unwrap(error), { fatal: true });
    super.handleError(error);
  }
}

/** Angular wraps errors from promises (`Uncaught (in promise)`): report the original. */
function unwrap(error: unknown): unknown {
  return error && typeof error === 'object' && 'rejection' in error ? (error as { rejection: unknown }).rejection : error;
}
