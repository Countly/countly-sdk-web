import React, {useEffect} from 'react';
import countlyImage from './countly.jpg';

let Countly = window.Countly;

function Contact() {
    const emailUsClick = () => {
        Countly.q.push(['add_event', {
            "key": "email-us-clicked",
            "count": 1
        }]);
        alert("Email us event triggered");
    }

    useEffect(() => {
        fetch("https://google.com").then((res) => {
            setTimeout(() => {
                throw new Error("Dummy error from contact");
            }, 3000);
        });
    }, []);

    return (
        <div className="contact">
            <div>
                <img src={countlyImage} alt="Home"></img>
            </div>
            <div>
                <h1>support@count.ly</h1>
            </div>
            <div>
                <button className="email-us" onClick={emailUsClick}>Email us</button>
            </div>
        </div>
    );
}

export default Contact;