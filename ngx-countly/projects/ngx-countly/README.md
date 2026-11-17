<h1 align="center">ngx-countly</h1>

<p align="center">
  <strong><a href="https://countly.com">Countly</a> analytics and crash reporting for Angular 17+</strong><br>
  Standalone or NgModule · SSR-safe · zero initial-bundle cost
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ngx-countly"><img src="https://img.shields.io/npm/v/ngx-countly.svg" alt="npm version"></a>
  <a href="https://github.com/Countly/countly-sdk-web/actions/workflows/ngx-countly.yml"><img src="https://github.com/Countly/countly-sdk-web/actions/workflows/ngx-countly.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/angular-17%20%E2%80%93%2022-dd0031.svg" alt="Angular 17 – 22">
  <a href="#license"><img src="https://img.shields.io/npm/l/ngx-countly.svg" alt="MIT license"></a>
</p>

---

An idiomatic Angular layer over the official [`countly-sdk-web`](https://www.npmjs.com/package/countly-sdk-web):

- **One provider** — `provideCountly()` or `CountlyModule.forRoot()` starts the SDK.
- **Lazy by design** — the SDK loads in its own chunk after bootstrap; nothing added to your initial bundle, nothing blocking first render.
- **Router view tracking** — every completed navigation is recorded as a view, with names and segments you control.
- **Real crash reporting** — errors Angular catches (templates, change detection, zone tasks, promise rejections) are reported, which the SDK's `track_errors()` alone never sees.
- **Typed service and a template directive** for events, timed events, views, errors, user profiles, device ids and consent.
- **SSR-safe** — on the server every call is a no-op; components need no platform checks.
- **Call it any time** — calls made before the SDK has loaded are queued and replayed.

## Contents

- [Installation](#installation)
- [Setup](#setup) — [standalone](#standalone-apps) · [NgModule](#ngmodule-apps) · [options](#options)
- [Features](#features) — [router tracking](#router-tracking) · [error handler](#error-handler)
- [Usage](#usage) — [service](#countlyservice) · [directive](#countlyevent-directive)
- [Consent and deferred start](#consent-and-deferred-start)
- [Server-side rendering](#server-side-rendering)
- [Testing](#testing)
- [API reference](#api-reference)
- [Compatibility](#compatibility)
- [License](#license)

## Installation

```sh
npm install ngx-countly
```

`countly-sdk-web` comes along as a dependency. It is CommonJS, so the Angular CLI warns about it; add it to `allowedCommonJsDependencies` in `angular.json` to silence the warning:

```jsonc
"build": {
  "options": {
    "allowedCommonJsDependencies": ["countly-sdk-web"]
  }
}
```

## Setup

### Standalone apps

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideCountly, withErrorHandler, withRouterTracking } from 'ngx-countly';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideCountly(
      { appKey: 'YOUR_APP_KEY', url: 'https://your.server.ly' },
      withRouterTracking(),
      withErrorHandler(),
    ),
  ],
});
```

### NgModule apps

```ts
import { RouterModule } from '@angular/router';
import { CountlyModule } from 'ngx-countly';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    CountlyModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      url: 'https://your.server.ly',
      routerTracking: true, // or the options of withRouterTracking()
      errorHandler: true,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

`forRoot()` takes the same options as `provideCountly()`, with the features as flags. Feature modules whose components use the `countlyEvent` directive import plain `CountlyModule`.

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `appKey` | `string` | — | The app key from *Management › Applications*. |
| `url` | `string` | — | Your Countly server URL. |
| `debug` | `boolean` | `false` | Print the SDK's logs to the console. |
| `trackSessions` | `boolean` | `true` | Start session tracking as soon as the SDK starts. |
| `sdk` | `Record<string, unknown>` | — | Any other [`Countly.init` option](https://support.countly.com/hc/en-us/articles/360037441932), passed as is: `require_consent`, `device_id`, `offline_mode`, `session_update`, push options… |

`CountlyModule.forRoot()` adds:

| Option | Type | Description |
|---|---|---|
| `routerTracking` | `boolean \| RouterTrackingOptions` | Same as `withRouterTracking()`. Needs `RouterModule.forRoot`. |
| `errorHandler` | `boolean` | Same as `withErrorHandler()`. |

## Features

### Router tracking

`withRouterTracking(options?)` records a view on every completed navigation, the initial one included. By default a view is named after its URL path without query or fragment: `/products/42?ref=mail#reviews` becomes `/products/42`.

Name views by route instead, so `/products/:id` is a single view, and attach segments:

```ts
withRouterTracking({
  viewName: (url, route) => route.title ?? url,
  segments: (url, route) => ({ productId: route.params['id'] }),
});
```

`route` is the deepest activated `ActivatedRouteSnapshot`, i.e. the route that rendered the page.

### Error handler

`withErrorHandler()` installs `CountlyErrorHandler` as Angular's `ErrorHandler`. Every error Angular catches is reported as a fatal crash and still logged to the console as usual. Promise rejections are unwrapped, so the original error is reported rather than Angular's wrapper.

Angular intercepts these errors before they reach `window.onerror`, which is why the SDK's own `track_errors()` would miss them.

## Usage

### `CountlyService`

```ts
import { inject } from '@angular/core';
import { CountlyService } from 'ngx-countly';

export class CheckoutComponent {
  private readonly countly = inject(CountlyService);

  pay(total: number) {
    this.countly.event('purchase', { sum: total, segmentation: { currency: 'EUR' } });
  }
}
```

| Method | Description |
|---|---|
| `event(key, { count, sum, dur, segmentation })` | Record a custom event. |
| `startEvent(key)` / `endEvent(key, { count, sum, segmentation })` | Record a timed event. |
| `view(name?, segments?)` | Record a view (defaults to the current path). |
| `error(error, { fatal, segments })` | Record a handled error, or a crash with `fatal: true`. |
| `user({ name, email, … })` | Set the user's profile fields. |
| `changeId(id, merge = true)` | Switch device id, e.g. after login; merges the old id's data unless `merge` is `false`. |
| `addConsent(features)` / `removeConsent(features)` | Give or withdraw consent (with `sdk: { require_consent: true }`). |
| `start(config)` | Start the SDK yourself; see [deferred start](#consent-and-deferred-start). |
| `run(sdk => …)` | Run a callback against the SDK once it has started. |
| `sdk()` | A promise of the SDK itself, for everything not wrapped here (`userData`, feedback widgets, remote config, content…). |

Every method is safe to call at any time: before the SDK has loaded, the call waits for it; on the server it does nothing.

### `countlyEvent` directive

Record clicks straight from a template:

```html
<button countlyEvent="signup" [countlySegmentation]="{ plan: 'pro' }">Sign up</button>
```

Import `CountlyEventDirective` in the standalone component that uses it, or `CountlyModule` in an NgModule.

## Consent and deferred start

To start Countly only once you may — e.g. after the user accepts tracking — leave `provideCountly()` out and start it yourself:

```ts
inject(CountlyService).start({ appKey: 'YOUR_APP_KEY', url: 'https://your.server.ly' });
```

Calls made before `start()` are queued, not lost. For per-feature consent, use the SDK's consent mode instead:

```ts
provideCountly({ appKey: 'YOUR_APP_KEY', url: 'https://your.server.ly', sdk: { require_consent: true } });

// later, from your consent banner
countly.addConsent(['sessions', 'views', 'events', 'crashes']);
```

## Server-side rendering

On the server (SSR, prerendering) the SDK is never loaded: `sdk()` and `run()` resolve with `undefined` and every other method is a no-op. Use the same components and services on both platforms without `isPlatformBrowser` checks.

## Testing

The SDK is loaded through the `COUNTLY_LOADER` injection token. Replace it to test without the real SDK:

```ts
const sdk = jasmine.createSpyObj('Countly', ['init', 'track_sessions', 'add_event']);

TestBed.configureTestingModule({
  providers: [
    provideCountly({ appKey: 'test', url: 'https://countly.test' }),
    { provide: COUNTLY_LOADER, useValue: () => Promise.resolve(sdk) },
  ],
});
```

The same token lets you load a custom build of the SDK in production.

## API reference

| Export | Kind | |
|---|---|---|
| `provideCountly(config, ...features)` | function | Environment providers that start Countly. |
| `withRouterTracking(options?)` | function | Feature: a view per navigation. |
| `withErrorHandler()` | function | Feature: crashes from Angular's `ErrorHandler`. |
| `CountlyModule` | NgModule | `forRoot(config)` for NgModule apps; plain import for the directive. |
| `CountlyService` | service | Events, views, errors, users, consent, and the SDK itself. |
| `CountlyEventDirective` | directive | `[countlyEvent]`: an event per click. |
| `CountlyErrorHandler` | class | The `ErrorHandler` behind `withErrorHandler()`, for extending. |
| `COUNTLY_CONFIG` | token | The config passed to `provideCountly()`. |
| `COUNTLY_LOADER` | token | How the SDK module is loaded. |
| `CountlyConfig`, `CountlyModuleConfig`, `RouterTrackingOptions`, `CountlyEventOptions`, `CountlyUserDetails`, `CountlyFeature`, `Countly` | types | |

## Compatibility

| ngx-countly | Angular | countly-sdk-web | RxJS |
|---|---|---|---|
| 0.x | 17 – 22 | ^26.8 | ^7.4 |

The library is compiled against Angular 17 with partial compilation, so a single build is linked by your app's own Angular at any version in that range. CI builds it into fresh standalone and NgModule apps on the latest Angular release on every change.

## License

[MIT](https://github.com/Countly/countly-sdk-web/blob/master/LICENSE) © Countly
