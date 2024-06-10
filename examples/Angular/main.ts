import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import Countly from 'countly-sdk-web';

window.Countly = Countly;

const COUNTLY_SERVER_KEY = "https://your.server.ly";
const COUNTLY_APP_KEY = "YOUR_APP_KEY";

if (COUNTLY_APP_KEY === "YOUR_APP_KEY" || COUNTLY_SERVER_KEY === "https://your.server.ly") {
  console.warn("Please do not use default set of app key and server url")
}
// initializing countly with params
Countly.init({
  app_key: COUNTLY_APP_KEY,
  url: COUNTLY_SERVER_KEY,
  debug: true
});

// Automatic tracking
Countly.track_sessions();
Countly.track_clicks();
Countly.track_links();
Countly.track_forms();
Countly.track_errors();
Countly.track_scrolls();
Countly.track_pageview();

// Showing a feedback widget
Countly.get_available_feedback_widgets(function (widgets, err) {
  console.log('Available feedback widgets:', widgets);
  if (widgets && widgets.length) {
    console.log('Presenting feedback widget:', widgets[0]);
    Countly.present_feedback_widget(widgets[0]); // Show the first widget
  }
});

// Reporting a feedback widget's result manually
Countly.get_available_feedback_widgets(function (widgets, err) {
  console.log('Available feedback widgets:', widgets);
  if (widgets && widgets.length) {
    console.log('Reporting feedback widget:', widgets[0]);
    Countly.getFeedbackWidgetData(widgets[0], function (data, err) {
      console.log('Feedback widget data:', data);
      Countly.reportFeedbackWidgetManually(widgets[0], data, null); // Report the first widget's data as null
    });
  }
});

// add a custom event
Countly.add_event({
  key: "test",
  count: 1,
  dur: 50,
  sum: 0.99,
  segmentation: {
    "Country": "Germany",
    "Age": "28"
  }
});

// send some user properties
Countly.user_details({
  name: "John Doe",
  username: "johndoe",
  organization: "Countly",
  phone: "1234567890",
  picture: "https://path.to/picture",
});

// set custom user property
Countly.userData.set("key", "value");
Countly.userData.save();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
