/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
const limits = {
    key: 8,
    value: 8,
    segment: 3,
    breadcrumb: 2,
    line_thread: 3,
    line_length: 10
};
const error = {
    stack: "Lorem ipsum dolor sit amet,\n consectetur adipiscing elit, sed do eiusmod tempor\n incididunt ut labore et dolore magna\n aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n Duis aute irure dolor in reprehenderit in voluptate\n velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia\n deserunt mollit anim id\n est laborum.",
};
const bread = {
    one: 'log1',
    two: 'log2',
    three: 'log3',
    four: 'log4',
    five: 'log5 too many',
    six: 'log6',
    seven: 'log7',
};

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1,
        tests: true,
        debug: true,
        max_key_length: limits.key, // set maximum key length here
        max_value_size: limits.value, // set maximum value length here
        max_segmentation_values: limits.segment, // set maximum segmentation number here
        max_breadcrumb_count: limits.breadcrumb, // set maximum number of logs that will be stored before erasing old ones
        max_stack_trace_lines_per_thread: limits.line_thread, // set maximum number of lines for stack trace
        max_stack_trace_line_length: limits.line_length, // set maximum length of a line for stack 
    });
}
const customEvent = {
    key: "Enter your key here",
    count: 1,
    segmentation: {
        "key of 1st seg": "Value of 1st seg",
        "key of 2nd seg": "Value of 2nd seg",
        "key of 3rd seg": "Value of 3rd seg",
        "key of 4th seg": "Value of 4th seg",
        "key of 5th seg": "Value of 5th seg",
    },
};
const viewName = "a very long page name";

const userDetail = {
    name: "Gottlob Frege",
    username: "Grundgesetze",
    email: "test@isatest.com",
    organization: "Bialloblotzsky",
    phone: "+4555999423",
    // Web URL pointing to user picture
    picture:
    "https://ih0.redbubble.net/image.276305970.7419/flat,550x550,075,f.u3.jpg",
    gender: "M",
    byear: 1848, // birth year
    custom: {
        "SEGkey 1st one": "SEGVal 1st one",
        "SEGkey 2st one": "SEGVal 2st one",
        "SEGkey 3st one": "SEGVal 3st one",
        "SEGkey 4st one": "SEGVal 4st one",
        "SEGkey 5st one": "SEGVal 5st one",
    },
};

describe('Internal limit tests ', () => {
    it('Checks if custom event limits works', () => {
        if (Countly.device_id !== undefined) {
            Countly.halt();
        }
        initMain();
        cy.wait(100).then(()=>{
            Countly.add_event(customEvent);
            cy.check_custom_event_limit(customEvent, limits);
        });
    });
    it('Checks if view event limits works', () => {
        Countly.halt();
        cy.wait(2000).then(()=>{
            initMain();
            Countly.track_pageview(viewName);
            cy.check_view_event_limit(viewName, limits);
        });
    });
    it('Checks if view event limits works', () => {
        Countly.halt();
        initMain();
        Countly.add_log(bread.one);
        Countly.add_log(bread.two);
        Countly.add_log(bread.three);
        Countly.add_log(bread.four);
        Countly.add_log(bread.five);
        Countly.add_log(bread.six);
        Countly.add_log(bread.seven);
        Countly.log_error(error);
        cy.check_error_limit(limits);
    });
    it('Checks if user detail limits works', () => {
        Countly.halt();
        initMain();
        Countly.user_details(userDetail);
        cy.check_user_details(userDetail, limits);
    });
    it('Checks if custom property limits works', () => {
        Countly.halt();
        initMain();
        Countly.userData.set("name of a character", "Bertrand Arthur William Russell"); // set custom property
        Countly.userData.set_once("A galaxy far far away", "Called B48FF"); // set custom property only if property does not exist
        Countly.userData.increment_by("byear", 123456789012345); // increment value in key by provided value
        Countly.userData.multiply("byear", 2345678901234567); // multiply value in key by provided value
        Countly.userData.max("byear", 3456789012345678); // save max value between current and provided
        Countly.userData.min("byear", 4567890123456789); // save min value between current and provided
        Countly.userData.push("gender", "II Fernando Valdez"); // add value to key as array element
        Countly.userData.push_unique("gender", "III Fernando Valdez"); // add value to key as array element, but only store unique values in array
        Countly.userData.pull("gender", "III Fernando Valdez"); // remove value from array under property with key as name
        Countly.userData.save();
        cy.check_user_details(userDetail, limits);
    });
});

