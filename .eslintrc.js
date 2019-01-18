module.exports = {
    "env": {
        "browser": true,
        "amd": true,
        "commonjs": true
    },
    "globals": {
        "Countly": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 5
    },
    "rules": {
        "curly": [
            "error",
            "all"
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-useless-escape": "off",
        "quotes": "off",
        "semi": [
            "error",
            "always"
        ]
    },
    "overrides": [
        {
            "files": [
                "test/**/*.js",
                "webpack.config.js"
            ],
            "env": {
                "es6": true,
                "node": true
            },
            "globals": {
                "casper": true
            }
        }
    ]
};