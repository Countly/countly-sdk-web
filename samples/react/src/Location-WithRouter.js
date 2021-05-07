import React from 'react';
import {
  withRouter
} from "react-router-dom";

let Countly = window.Countly;

class Location extends React.Component {
    componentDidUpdate(prevProps) {
      if (this.props.location.pathname !== prevProps.location.pathname) {
        Countly.q.push(["track_pageview", this.props.location.pathname]);
      }
    }
  
    render () {
      return (
        <React.Fragment>
          {this.props.children}
        </React.Fragment>
      )
    }
}

export default withRouter(Location);