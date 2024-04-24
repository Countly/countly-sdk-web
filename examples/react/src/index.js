import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App-WithEffect';
import * as serviceWorker from './serviceWorker';
import Countly from 'countly-sdk-web';

//Exposing Countly to the DOM as a global variable
//Usecase - Heatmaps
window.Countly = Countly;

const COUNTLY_SERVER_KEY = "https://your.server.ly";
const COUNTLY_APP_KEY = "YOUR_APP_KEY";

if (COUNTLY_APP_KEY === "YOUR_APP_KEY" || COUNTLY_SERVER_KEY === "https://your.server.ly") {
  console.warn("Please do not use default set of app key and server url")
}
// initializing countly with params
Countly.init({
  app_key: COUNTLY_APP_KEY,
  url: COUNTLY_SERVER_KEY, //your server goes here
  debug: true
});

Countly.q.push(['track_sessions']);
Countly.q.push(['track_scrolls']);
Countly.q.push(['track_clicks']);
Countly.q.push(['track_links']);
Countly.q.push(["track_errors"]);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
