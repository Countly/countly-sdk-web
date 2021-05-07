import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App-WithEffect';
import * as serviceWorker from './serviceWorker';
import Countly from 'countly-sdk-web';

//Exposing Countly to the DOM as a global variable
//Usecase - Heatmaps
window.Countly = Countly;
Countly.init({
    app_key: 'YOUR_APP_KEY',
    url: 'YOUR_SERVER_URL',
    session_update: 10,
    use_session_cookie: true,
    debug: false,
    require_consent: true,
    namespace: "react-demo",
    inactivity_time: 1,
    offline_mode: false,
    // device_id: "cly-device-demo-id" //Set only if you want dont want to use countly generated device_id
});

//Since Countly is loaded and available, you can use synchronus or asynchronus calls, does not matter
Countly.q.push(['group_features', {
    activity: ["sessions", "events", "views", "location"],
    interaction: ["scrolls", "clicks", "crashes"],
    whereabouts: ["users"]
}]);

if (typeof(localStorage) !== "undefined") {
    var consents = localStorage.getItem("consents");

    if(consents){
        Countly.q.push(['add_consent', JSON.parse(consents)]);
    }
    else{
        var consent = window.confirm("We are going to track you. Do you give your consent ?");
        consents = ["activity", "interaction", "whereabouts"];
        if(consent) {
            Countly.q.push(['add_consent', consents]);
            localStorage.setItem("consents", JSON.stringify(consents));
        }
        else {
            Countly.q.push(['remove_consent', consents]);
            localStorage.removeItem("consents");
        }
    }
}

Countly.q.push(['enable_feedback', {'widgets': ['widget-id-1','widget-id-2']}]);
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
