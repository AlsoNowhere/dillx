
import resolve from "@rollup/plugin-node-resolve";

export default {
    input: "./src/main.js",
    output: {
        name: "dillx",
        file: "./dist/dillx.js",
        format: "esm"
    },
    plugins: [
        resolve()
    ],
    watch: {
        exclude: "node_modules/**"
    }
};
