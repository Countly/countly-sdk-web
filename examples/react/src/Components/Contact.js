import React from 'react';
import Countly from 'countly-sdk-web';
import countlyImage from './countly.jpg';

function Contact() {
    const emailUsClick = () => {
        Countly.q.push(['add_event', {
            "key": "email-us-clicked",
            "count": 1
        }]);
        alert("Email us event triggered");
    }

    return (
        <div className="contact">
            <div>
                <img src={countlyImage} alt="Home"></img>
            </div>
            <div>
                <h1>support@countly</h1>
            </div>
            <div>
                <button className="email-us" onClick={emailUsClick}>Email us</button>
            </div>
        </div>
    );
}

export default Contact;