import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCountly, withErrorHandler, withRouterTracking } from 'ngx-countly';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideCountly(
      // Your app key and server. The demo points at a placeholder: watch the requests in the network tab.
      { appKey: 'YOUR_APP_KEY', url: 'https://your.server.ly', debug: true },
      withRouterTracking({ viewName: (url, route) => route.title ?? url }),
      withErrorHandler(),
    ),
  ],
};
