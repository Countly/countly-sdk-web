importScripts("../../lib/countly.js");

const COUNTLY_SERVER_KEY = "https://your.server.ly";
const COUNTLY_APP_KEY = "YOUR_APP_KEY";

if(COUNTLY_APP_KEY === "YOUR_APP_KEY" || COUNTLY_SERVER_KEY === "https://your.server.ly"){
    console.warn("Please do not use default set of app key and server url")
}
// initializing countly with params
Countly.init({
    app_key: COUNTLY_APP_KEY,
    url: COUNTLY_SERVER_KEY, //your server goes here
    debug: true,
    test_mode: true
});

onmessage = function(e) {
    console.log(`Worker: Message received from main script:[${JSON.stringify(e.data)}]`);
    const data = e.data.data; const type = e.data.type;
    if (type === "event") {
        Countly.add_event(data);
    } else if (type === "view") {
        Countly.track_pageview(data);
    } else if (type === "session") {
        if (data === "begin_session") {
            Countly.begin_session();
            return;
        }
        Countly.end_session(null, true);
    } else if (type === "get") {
        const queues = Countly._internals.getLocalQueues();
        postMessage(queues);
    }
};