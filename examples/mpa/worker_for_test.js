importScripts("../../lib/countly.js");

Countly.init({
    app_key: "YOUR_APP_KEY",
    url: "https://your.domain.countly",
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