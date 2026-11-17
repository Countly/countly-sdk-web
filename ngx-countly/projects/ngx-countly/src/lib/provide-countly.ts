import {
  DestroyRef, ENVIRONMENT_INITIALIZER, EnvironmentProviders, ErrorHandler, inject, makeEnvironmentProviders, Provider,
} from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CountlyErrorHandler } from './countly-error-handler';
import { COUNTLY_CONFIG, CountlyConfig } from './countly.config';
import { CountlyService } from './countly.service';

/** An optional piece of Countly integration, for `provideCountly(config, ...features)`. */
export interface CountlyFeature<Kind extends string = string> {
  readonly kind: Kind;
  readonly providers: Provider[];
}

/**
 * Sets up Countly for the app: starts the SDK in the browser (never on the
 * server) without holding up bootstrap.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideRouter(routes),
 *     provideCountly({ appKey: '…', url: 'https://your.server.ly' }, withRouterTracking(), withErrorHandler()),
 *   ],
 * });
 * ```
 */
export function provideCountly(config: CountlyConfig, ...features: CountlyFeature[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: COUNTLY_CONFIG, useValue: config },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => void inject(CountlyService).start(inject(COUNTLY_CONFIG)),
    },
    ...features.flatMap((feature) => feature.providers),
  ]);
}

export interface RouterTrackingOptions {
  /**
   * The view name for a navigation. Default: the URL path without query or
   * fragment, so `/products/42?ref=x` is the view `/products/42`. Return a
   * route's `data` or title to group views (`/products/:id` as "Product").
   */
  viewName?: (url: string, route: ActivatedRouteSnapshot) => string;
  /** View segments sent with each view. */
  segments?: (url: string, route: ActivatedRouteSnapshot) => Record<string, unknown> | undefined;
}

/**
 * Records a view on every completed navigation (the first one included), so
 * an Angular app's routes show up like the pages of a classic site.
 */
export function withRouterTracking(options: RouterTrackingOptions = {}): CountlyFeature<'RouterTracking'> {
  return {
    kind: 'RouterTracking',
    providers: [{
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const router = inject(Router);
        const countly = inject(CountlyService);
        const subscription = router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
          const url = e.urlAfterRedirects;
          const route = deepest(router.routerState.snapshot.root);
          countly.view(options.viewName?.(url, route) ?? path(url), options.segments?.(url, route));
        });
        inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
      },
    }],
  };
}

/** Reports every error Angular catches to Countly as a crash; see `CountlyErrorHandler`. */
export function withErrorHandler(): CountlyFeature<'ErrorHandler'> {
  return {
    kind: 'ErrorHandler',
    providers: [{ provide: ErrorHandler, useClass: CountlyErrorHandler }],
  };
}

/** The route that rendered the page: the deepest activated child. */
function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  while (route.firstChild) {
    route = route.firstChild;
  }
  return route;
}

function path(url: string): string {
  return url.split(/[?#]/)[0] || '/';
}
