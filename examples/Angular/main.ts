import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Countly from 'countly-sdk-web';

window.Countly = Countly;

const COUNTLY_SERVER_KEY = "https://your.server.ly";
const COUNTLY_APP_KEY = "YOUR_APP_KEY";

if(COUNTLY_APP_KEY === "YOUR_APP_KEY" || COUNTLY_SERVER_KEY === "https://your.server.ly"){
    throw new Error("Please do not use default set of app key and server url")
}
// initializing countly with params
Countly.init({
  app_key: COUNTLY_APP_KEY,
  url: COUNTLY_SERVER_KEY, //your server goes here
  debug: true
});
Countly.track_sessions();

if (environment.production) {
  enableProdMode();

}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
