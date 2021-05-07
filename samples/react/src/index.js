import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App-WithEffect';
import * as serviceWorker from './serviceWorker';

let Countly = window.Countly;

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
    activity: ["sessions", "events", "views", "location", "apm"],
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
Countly.q.push([
    "track_performance",
    {
        RT: {
            enabled: true
        },
        instrument_xhr: true,
        AutoXHR: {
            enabled: true,
            alwaysSendXhr: true,
            monitorFetch: true,
            captureXhrRequestResponse: true
        },
        Continuity: {
            enabled: true,
            monitorLongTasks: true,
            monitorPageBusy: true,
            monitorFrameRate: true,
            monitorInteractions: true,
            afterOnload: true
        },
        NavigationTiming: {
            enabled: true
        },
        ResourceTiming: {
            enabled: true,
            clearOnBeacon: true,
            urlLimit: 2000,
            splitAtPath: true
        }
    }
]);

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
