import Countly from "../../../lib/countly.js"

Countly.init({
  app_key: "YOUR_APP_KEY",
  app_version: "1.0",
  url: "https://try.count.ly",
  debug: true
});

//track sessions automatically
Countly.track_sessions();

//track pageviews automatically
Countly.track_pageview();

//track any clicks to webpages automatically
Countly.track_clicks();

//track link clicks automatically
Countly.track_links();

//track form submissions automatically
Countly.track_forms();

//track javascript errors
Countly.track_errors();

//let's cause some errors
function cause_error(){
    undefined_function();
}

window.onload = function() {
  document.getElementById("handled_error").onclick = function handled_error(){
      Countly.add_log('Pressed handled button'); 
      try {
          cause_error();
      } catch(err){
          Countly.log_error(err)
      }
  };

  document.getElementById("unhandled_error").onclick = function unhandled_error(){
      Countly.add_log('Pressed unhandled button'); 
      cause_error();
  };
}
