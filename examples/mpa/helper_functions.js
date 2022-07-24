// random number generator for picking a random user
function getRandomUserIndex() {
    return getRandomNumber(0, users.length - 1);
}

// function for adding user data
function setUserData(user) {
    Countly.q.push(['user_details', {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "organization": user.organization,
        "phone": user.phone,
        "gender": user.gender,
        "byear": user.byear,
        "custom": {
            "emailLogin": ["false"],
            "accountType": "premium"
        }
    }]);
}