import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Home from './Components/Home';
import Contact from './Components/Contact';
import Header from './Components/Header';
import Countly from 'countly-sdk-web';

import Location from './Location-WithRouter';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginState: localStorage.getItem("clydemo-login-state") ? true: false
    }
  }

  setLoginState(state) {
    this.setState({
      loginState: state
    })
  }

  componentDidMount() {
    //Exposing Countly to the DOM as a global variable
    //Usecase - Heatmaps
    window.Countly = Countly;
    Countly.init({
      app_key: '499456c1e9ce464e30e29904b2c760c8d09ec814',
      url: 'https://prikshit.count.ly',
      session_update: 10,
      use_session_cookie: false,
      debug: false,
      require_consent: true,
      namespace: "react-demo",
      inactivity_time: 1,
      offline_mode: false,
      // device_id: "pts-demo-id", //Set only if you want dont want to use countly generated device_id
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

    Countly.q.push(['track_sessions']);
    Countly.q.push(['track_pageview']);
    Countly.q.push(['track_scrolls']);
    Countly.q.push(['track_clicks']);
    Countly.q.push(['track_links']);
  }

  render () {
    return (
      <Router>
        <Location>
          <Header loginState={this.state.loginState} setLoginState={(state) => this.setLoginState(state)}/>
          <Switch>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Location>
      </Router>
    );
  }
}

export default App;
