
import { uglify } from "rollup-plugin-uglify";
import progress from "rollup-plugin-progress";

// const production = !process.env.ROLLUP_WATCH;
const production = false;

const output = {
    file: production
        ? "./dist/dillx.min.js"
        : "./dist/dillx.js",
    format: "esm",
    sourcemap: !production
};

export default {
    input: "./src/main.js",
    output,
    plugins: [
        progress(),
        production && uglify()
    ],
    watch: {
        exclude: "node_modules/**"
    }
};
