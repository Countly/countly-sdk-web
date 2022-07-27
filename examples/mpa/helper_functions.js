"use strict";

/* eslint-disable require-jsdoc */
// TODO: fix disabled linting issues

// random number generator for picking a random user
// eslint-disable-next-line no-unused-vars
function getRandomUserIndex() {
    // eslint-disable-next-line no-undef
    return getRandomNumber(0, users.length - 1);
}

// random number generator
function getRandomNumber(min, max) {
    return parseInt(Math.random() * (max - min) + min, 10);
}

// function for adding user data
// eslint-disable-next-line no-unused-vars
function setUserData(user) {
    // eslint-disable-next-line no-undef
    Countly.q.push(["user_details", {
        name: user.name,
        username: user.username,
        email: user.email,
        organization: user.organization,
        phone: user.phone,
        gender: user.gender,
        byear: user.byear,
        custom: {
            emailLogin: ["false"],
            accountType: "premium"
        }
    }]);
}

// widget info manager
function evaluateFeedbackWidgetProperties(widget) {
    var tags = widget.tg;
    var name = widget.name;
    var policy = widget.showPolicy;
    var id = widget._id;
    if (tags !== undefined && tags !== null && Array.isArray(tags)) {
        if (tags.length === 0) {
            document.getElementById("widget-tag").value = "[No tags returned for this widget]";
        }
        else {
            document.getElementById("widget-tag").value = tags.join(" ");
        }
        document.getElementById("widget-tag").style.backgroundColor = "#93BD2C";
    }
    else {
        document.getElementById("widget-tag").value = "Tags are not returned for this widget";
        document.getElementById("widget-tag").style.backgroundColor = "#DE1903";
    }
    if (!id) {
        document.getElementById("widget-id").value = "No ID returned returned for this widget";
        document.getElementById("widget-id").style.backgroundColor = "#DE1903";
    }
    else {
        document.getElementById("widget-id").value = id;
        document.getElementById("widget-id").style.backgroundColor = "#93BD2C";
    }
    if (!name) {
        document.getElementById("widget-name").value = "No name returned returned for this widget";
        document.getElementById("widget-name").style.backgroundColor = "#DE1903";
    }
    else {
        document.getElementById("widget-name").value = name;
        document.getElementById("widget-name").style.backgroundColor = "#93BD2C";
    }
    if (!policy) {
        document.getElementById("widget-show-policy").value = "No showPolicy returned returned for this widget";
        document.getElementById("widget-show-policy").style.backgroundColor = "#DE1903";
    }
    else {
        document.getElementById("widget-show-policy").value = policy;
        document.getElementById("widget-show-policy").style.backgroundColor = "#93BD2C";
    }
}

// eslint-disable-next-line no-unused-vars
function deleteOldFeedbackWidget(widget, type) {
    try {
        var anchor = document.getElementById("csbg");
        var wrapper = document.getElementsByClassName("countly-ratings-wrapper")[0];
        var overlay = document.getElementsByClassName("countly-ratings-overlay")[0];
        var iframeR = document.getElementById("countly-ratings-iframe");
        var iframeS = document.getElementById("countly-surveys-iframe");
        if (anchor && wrapper) {
            iframeR.remove();
            overlay.remove();
            wrapper.nextSibling.remove();
            wrapper.remove();
            anchor.remove();
        }
        else if (anchor) {
            anchor.style.zIndex = 5;
            iframeS.remove();
            anchor.nextSibling.remove();
            anchor.remove();
        }
    }
    catch (error) {
        // eslint-disable-next-line no-undef
        Countly._internals.log("ERROR", "Error while deleting old feedback widget:" + error);
    }
}

// callback to choose an nps widget from the fetched widget list, widget is the index of the desired widget in the widget list
// eslint-disable-next-line no-unused-vars
function allWidgetsCallbackNPS(feedbacks, err) {
    if (err) {
        // eslint-disable-next-line no-undef
        return Countly._internals.log("ERROR", "Error while allWidgetsCallbackNPS:" + err);
    }
    // first nps widget to fetch
    var i = 0;
    while (i < feedbacks.length) {
        if (feedbacks[i].type === "nps") {
            deleteOldFeedbackWidget(feedbacks[i], "nps");
            // eslint-disable-next-line no-loop-func
            setTimeout(function() {
                // eslint-disable-next-line no-undef
                Countly.present_feedback_widget(feedbacks[i], "", "");
                evaluateFeedbackWidgetProperties(feedbacks[i]);
            }, 250);
            break;
        }
        i++;
    }
}

// callback to choose a survey widget from the fetched widget list, widget is the index of the desired widget in the widget list
// eslint-disable-next-line no-unused-vars
function allWidgetsCallbackSurvey(feedbacks, err) {
    if (err) {
        // eslint-disable-next-line no-undef
        return Countly._internals.log("ERROR", "Error while allWidgetsCallbackSurvey:" + error);
    }
    // first survey widget to fetch
    var i = 0;
    while (i < feedbacks.length) {
        if (feedbacks[i].type === "survey") {
            deleteOldFeedbackWidget(feedbacks[i], "survey");
            // eslint-disable-next-line no-loop-func
            setTimeout(function() {
                // eslint-disable-next-line no-undef
                Countly.present_feedback_widget(feedbacks[i], "", "");
                evaluateFeedbackWidgetProperties(feedbacks[i]);
            }, 250);
            break;
        }
        i++;
    }
}

// callback to choose rating widget from the fetched widget list, widget is the index of the desired widget in the widget list
// eslint-disable-next-line no-unused-vars
function allWidgetsCallbackRating(feedbacks, err) {
    if (err) {
        // eslint-disable-next-line no-undef
        return Countly._internals.log("ERROR", "Error while allWidgetsCallbackRating:" + err);
    }
    // eslint-disable-next-line no-undef
    Countly._internals.log("INFO", "Returned feedbacks:[" + feedbacks + "]");
    // first rating widget to fetch
    var i = 0;
    while (i < feedbacks.length) {
        if (feedbacks[i].type === "rating") {
            deleteOldFeedbackWidget(feedbacks[i], "rating");
            // eslint-disable-next-line no-loop-func
            setTimeout(function() {
                // eslint-disable-next-line no-undef
                Countly.present_feedback_widget(feedbacks[i], "", "");
                evaluateFeedbackWidgetProperties(feedbacks[i]);
            }, 250);
            break;
        }
        i++;
    }
}
