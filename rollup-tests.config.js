
import { dillx } from "rollup-plugin-dillx";
import resolve from "@rollup/plugin-node-resolve";

const output = {
    file: "./tests/testing-file.test.js",
    format: "iife"
};

export default {
    input: "./tests/main.js",
    output,
    plugins: [
        dillx(),
        resolve()
    ],
    watch: {
        exclude: "node_modules/**"
    }
};
