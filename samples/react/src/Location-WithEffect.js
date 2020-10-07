import React from 'react';
import {
  useLocation
} from "react-router-dom";

import Countly from 'countly-sdk-web';

const Location = (props) => {
  const location = useLocation();

  React.useEffect(() => {
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
        interaction: ["scrolls", "clicks"],
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
  }, []);

  React.useEffect(() => {
    //You can also check for page redirect logic or going back/forward from the browser logic here
    //Check if pathname is not changing dont track the view
    //So that you dont end up tracking the same view again and again
    Countly.q.push(['track_pageview', location.pathname]);
    // Initialize feedback popup by current page/pathname
    Countly.q.push(['initialize_feedback_popups']);
  }, [location]);

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
}

export default Location;
