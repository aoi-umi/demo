module.exports = {
    // "extends": "eslint:recommended",
    parser: "typescript-eslint-parser",
    plugins: [
        "typescript",
        // 'plugin:prettier/recommended'
    ],
    parserOptions: {
        ecmaVersion: 7,
        sourceType: "module",
    },
    rules: {
        // "consistent-return": 2,
        indent: [1, 4],
        // "no-else-return": 1,
        semi: [1, "always"],
        "space-unary-ops": 2,
        "react/no-array-index-key": 0,
    },
};
