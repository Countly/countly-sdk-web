import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Components/Home";
import Contact from "./Components/Contact";
import Header from "./Components/Header";

import Location from "./Location-WithEffect";
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
    const [loginState, setLoginState] = useState(localStorage.getItem("clydemo-login-state") ? true : false);

    return (
        <Router basename={`${process.env.PUBLIC_URL}`}>
            <ErrorBoundary>
                <Location>
                    <Header loginState={loginState} setLoginState={setLoginState} />
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
};

export default App;
