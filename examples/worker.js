importScripts("../lib/countly.js");

Countly.init({
    app_key: "YOUR_APP_KEY",
    url: "https://try.count.ly",
    debug: true,
    getViewUrl : function () {
        return "https://my.url.ly";
    }
});

onmessage = function (e) {
    console.log('Worker: Message received from main script:' + e.data[0] + ' ' + e.data[1]);
    const event = e.data[0]; const type = e.data[1];
    if (type === "event") {
        Countly.add_event(event);
    } else if (type === "view") {
        Countly.track_pageview(event);
    } else if (type === "begin_session") {
        Countly.begin_session();
    } else if (type === "end_session") {
        Countly.end_session(null, true);
    }
}