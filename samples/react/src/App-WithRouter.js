import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Components/Home";
import Contact from "./Components/Contact";
import Header from "./Components/Header";

import Location from "./Location-WithRouter";
import ErrorBoundary from "./ErrorBoundary";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginState: localStorage.getItem("clydemo-login-state") ? true : false
        };
    }

    setLoginState(state) {
        this.setState({
            loginState: state
        });
    }

    render() {
        return (
            <Router basename={`${process.env.PUBLIC_URL}`}>
                <ErrorBoundary>
                    <Location>
                        <Header loginState={this.state.loginState} setLoginState={(state) => this.setLoginState(state)} />
                        <Switch>
                            <Route path="/contact">
                                <Contact />
                            </Route>
                            <Route path="/">
                                <Home />
                            </Route>
                        </Switch>
                    </Location>
                </ErrorBoundary>
            </Router>
        );
    }
}

export default App;
