import React from "react";
import Countly from "countly-sdk-web";

// Error boundaries only apply to errors that happen during rendering.
// So errors originating anywhere else will not trigger this mechanism.
// This includes errors in event handlers, and errors in async calls (e.g. setTimeout(...) and similar).

// Production and development builds of React slightly differ in the way componentDidCatch() handles errors.

// On development, the errors will bubble up to window, this means that any window.onerror or
// window.addEventListener('error', callback) will intercept the errors that have been caught by componentDidCatch().

// On production, instead, the errors will not bubble up, which means any ancestor error handler will
// only receive errors not explicitly caught by componentDidCatch().

class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        //You can provide your own segments here too.
        let segments = {};
        Countly.q.push(["log_error", error, segments]);
    }

    render() {
        return this.props.children;
    }
}

export default ErrorBoundary;
