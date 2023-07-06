module.exports = {
    plugins: [
        "cypress"
    ],
    parserOptions: {
        ecmaVersion: 6
    },
    rules: {
        "cypress/no-assigning-return-values": "error",
        "cypress/no-unnecessary-waiting": "off",
        "cypress/assertion-before-screenshot": "warn",
        "cypress/unsafe-to-chain-command": "off",
        "cypress/no-force": "warn",
        "cypress/no-async-tests": "error",
        "cypress/no-pause": "error",
        "comma-dangle": ["error", "never"],
        "no-multiple-empty-lines": [2, { max: 1, maxEOF: 0 }]
    },
    env: {
        "cypress/globals": true
    },
    extends: [
        "plugin:cypress/recommended",
        "plugin:chai-friendly/recommended"
    ]
};