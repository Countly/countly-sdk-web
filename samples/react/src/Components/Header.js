import React from 'react';
import {
    Link,
    useHistory
} from "react-router-dom";

import Users from './Users';
import Countly from 'countly-sdk-web';
import './styles.css';

const Header = (props) => {
    let loginState = props.loginState;
    let history = useHistory();

    const onSignIn = () => {
        let login = window.confirm("Do you want to login ?");
        if(login) {
            let userIndex = getRandomUserIndex();
            let user = Users[userIndex];
            localStorage.setItem("clydemo-user", userIndex);
            localStorage.setItem("clydemo-login-state", true);

            //Change user's device on login - He is now an identified user
            Countly.q.push(['change_id', user.device_id]);
            props.setLoginState(true);
            setUserData(user);
            history.push("/");
        }
    }

    const onSignOut = () => {
        localStorage.removeItem("clydemo-login-state");
        localStorage.removeItem("clydemo-user");

        //Change user's device on logout - He is now an anonymous user
        Countly.q.push(['change_id', "cly-device-demo-id"]);
        props.setLoginState(false);
        history.push("/");
    }

    const getRandomUserIndex = () => {
        return getRandomNumber(0, Users.length - 1);
    }

    const setUserData = (user) => {
        Countly.q.push(['user_details', {
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "organization": user.organization,
            "phone": user.phone,
            "gender": user.gender,
            "byear": user.byear
        }]);
    }

    const getRandomNumber = (min, max) => {
        return parseInt(Math.random() * (max - min) + min);
    }

    return (
        <div className="header">
            <div>
                <Link className="link" to="/">Home</Link>
            </div>
            <div>
                <h1 style={{textTransform: 'uppercase'}}>Countly React Demo</h1>
            </div>
            <div style={{display:'flex', padding: '10px'}}>
                <p>
                    <Link className="link" to="/contact">Contact</Link>
                </p>
                {
                    !loginState && <p onClick={onSignIn} style={{cursor:'pointer'}}>
                        Sign in
                    </p>
                }
                {
                    loginState && <p onClick={onSignOut} style={{cursor:'pointer'}}>
                        Sign out
                </p>
                }
                
            </div>
        </div>
    );
}

export default Header;