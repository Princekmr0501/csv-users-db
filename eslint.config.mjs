export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script"
        },
        rules: {
            indent: ["error", 4],
            semi: ["error", "never"],

            "no-case-declarations": "error",
            "no-shadow": "error",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "default-case": "warn",
            "no-fallthrough": "error",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
            "switch-colon-spacing": ["error", { "after": true, "before": false }],

            "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
            "keyword-spacing": ["error", { "before": true, "after": true }],
            "space-before-blocks": "error",
            "space-infix-ops": "error",
            "comma-spacing": ["error", { "before": false, "after": true }],
            "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "spaced-comment": ["error", "always", { "markers": ["="] }],
            "eol-last": ["error", "always"],
            "no-trailing-spaces": "error",
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }]
        }
    }
]
