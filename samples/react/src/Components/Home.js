import React from 'react';

import Users from './Users';
import countlyImage from './countly.jpg';

let Countly = window.Countly;

function Home() {
    let userIndex = localStorage.getItem("clydemo-user");
    let user = {};

    if (userIndex !== undefined && userIndex !== null) {
        user = Users[userIndex] || {};
    }

    let stz = +new Date();
    for (let i = 0; i < 1000; i++) {}
    let etz = +new Date();

    Countly.q.push([
        "report_trace",
        {
            type: "device", //device or network
            name: "for loop", //use name to identify trace and group them by
            stz: stz, //start timestamp in miliseconds
            etz: etz, //end timestamp in miliseconds
            apm_metrics: {
                duration: etz - stz
            }
        }
    ]);

    return (
        <div>
            <center>
                <img src={countlyImage} alt="Home"></img>
                <h1>Welcome {user.name}</h1>
            </center>
        </div>
    );
}

export default Home;