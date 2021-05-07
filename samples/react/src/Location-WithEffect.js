import React from 'react';
import {
  useLocation
} from "react-router-dom";

import Countly from 'countly-sdk-web';

const Location = (props) => {
  const location = useLocation();

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
