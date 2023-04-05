"use strict";

module.exports = {
    /**
     * By default, ESLint expects ECMAScript 5 syntax. You can override that setting to enable support
     * for other ECMAScript versions as well as JSX by using parser options. However for IE9 compatibility
     * updating it to ECMAScript 6 or above is currently not permitted. -D
     * */
    env: {
        browser: true,
        amd: true,
        commonjs: true
    },
    extends: "airbnb/legacy",
    rules: {
        "prefer-arrow-callback": "off",
        "prefer-destructuring": "off",
        "comma-dangle": "off",
        "no-restricted-globals": "off",
        "no-restricted-properties": "off",
        strict: "off",
        //
        "no-unused-vars": "warn",
        "no-var": "off",
        "func-names": "off",
        "consistent-return": "off",
        "prefer-rest-params": "off",
        radix: "off",
        "prefer-spread": "off",
        "no-plusplus": "off",
        camelcase: "off",
        "no-use-before-define": "off",
        "no-lonely-if": "off",
        "no-restricted-syntax": "off",
        "vars-on-top": "off",
        "no-param-reassign": "off",
        "max-len": "off",
        "guard-for-in": "off",
        "no-underscore-dangle": "off",
        "no-bitwise": "off",
        "no-mixed-operators": "off",
        "object-shorthand": "off",
        "block-spacing": [
            "error",
            "always"
        ],
        "brace-style": [
            "error",
            "stroustrup"
        ],
        "comma-spacing": [
            "error",
            {
                before: false,
                after: true
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "computed-property-spacing": [
            "error",
            "never"
        ],
        curly: [
            "error",
            "all"
        ],
        "eol-last": "off",
        "func-call-spacing": [
            "error",
            "never"
        ],
        indent: [
            "error",
            4
        ],
        "key-spacing": [
            "error",
            {
                beforeColon: false,
                afterColon: true
            }
        ],
        "keyword-spacing": [
            "error",
            {
                before: true,
                after: true
            }
        ],
        "lines-between-class-members": [
            "error",
            "always"
        ],
        "no-multi-spaces": [
            "error"
        ],
        "no-trailing-spaces": [
            "error",
            {
                ignoreComments: true
            }
        ],
        "no-whitespace-before-property": [
            "error"
        ],
        "object-curly-newline": [
            "error",
            {
                multiline: true,
                consistent: true
            }
        ],
        "object-property-newline": [
            "error",
            {
                allowAllPropertiesOnSameLine: true
            }
        ],
        semi: [
            "error",
            "always"
        ],
        "semi-style": [
            "error",
            "last"
        ],
        "space-before-blocks": [
            "error",
            "always"
        ],
        "space-before-function-paren": [
            "error",
            "never"
        ],
        "space-in-parens": [
            "error",
            "never"
        ],
        "space-infix-ops": [
            "error"
        ],
        "space-unary-ops": [
            "error",
            {
                words: true,
                nonwords: false
            }
        ],
        "switch-colon-spacing": [
            "error"
        ],
        "unicode-bom": [
            "error",
            "never"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-useless-escape": "off",
        quotes: ["error",
            "double"
        ],
        "valid-jsdoc": [
            "error",
            {
                requireReturn: false
            }
        ],
        "require-jsdoc": [
            "error",
            {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true,
                    ArrowFunctionExpression: true,
                    FunctionExpression: false
                }
            }
        ],
        "no-console": [
            "error"
        ],
        "dot-notation": [
            "error"
        ],
        eqeqeq: [
            "error",
            "always"
        ],
        "no-alert": [
            "error"
        ],
        "no-caller": [
            "error"
        ],
        "no-eval": [
            "error"
        ],
        "no-extend-native": [
            "error"
        ],
        "no-iterator": [
            "error"
        ],
        "no-loop-func": [
            "error"
        ],
        "no-shadow": [
            "error"
        ]
    }

};
