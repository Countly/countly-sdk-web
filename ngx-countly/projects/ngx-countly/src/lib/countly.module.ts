import { ModuleWithProviders, NgModule } from '@angular/core';
import { CountlyConfig } from './countly.config';
import { CountlyEventDirective } from './countly-event.directive';
import { CountlyFeature, provideCountly, RouterTrackingOptions, withErrorHandler, withRouterTracking } from './provide-countly';

/** `CountlyConfig`, plus the features `provideCountly()` takes as `with…()` functions. */
export interface CountlyModuleConfig extends CountlyConfig {
  /** Record a view per navigation (`true`, or the options of `withRouterTracking`). Needs `RouterModule.forRoot`. */
  routerTracking?: boolean | RouterTrackingOptions;
  /** Report errors Angular catches as crashes (`withErrorHandler`). */
  errorHandler?: boolean;
}

/**
 * Countly for NgModule apps: the same setup as `provideCountly()`, and the
 * `countlyEvent` directive for the module's components.
 *
 * ```ts
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot(routes),
 *     CountlyModule.forRoot({ appKey: '…', url: 'https://your.server.ly', routerTracking: true, errorHandler: true }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Feature modules that only need the directive import `CountlyModule` itself.
 */
@NgModule({
  imports: [CountlyEventDirective],
  exports: [CountlyEventDirective],
})
export class CountlyModule {
  static forRoot(config: CountlyModuleConfig): ModuleWithProviders<CountlyModule> {
    const { routerTracking, errorHandler, ...countly } = config;
    const features: CountlyFeature[] = [];
    if (routerTracking) {
      features.push(withRouterTracking(routerTracking === true ? {} : routerTracking));
    }
    if (errorHandler) {
      features.push(withErrorHandler());
    }
    return { ngModule: CountlyModule, providers: [provideCountly(countly, ...features)] };
  }
}
