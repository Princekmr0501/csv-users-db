export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module"
        },
        rules: {
            indent: ["error", 4],
            semi: ["error", "never"]
        }
    }
]
