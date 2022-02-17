module.exports = {
    "plugins": [
        "cypress"
    ],
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "cypress/no-assigning-return-values": "error",
        "cypress/no-unnecessary-waiting": "off",
        "cypress/assertion-before-screenshot": "warn",
        "cypress/no-force": "warn",
        "cypress/no-async-tests": "error",
        "cypress/no-pause": "error"
    },
    "env": {
        "cypress/globals": true
    },
    "extends": [
        "plugin:cypress/recommended"
    ]
};