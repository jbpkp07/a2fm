import ESLintWebpackPlugin from "eslint-webpack-plugin";
import { resolve } from "path";
import { env } from "process";
import { Configuration as WebpackConfig } from "webpack";

const toExtensionsRegExp = (exts: string[]) => {
    const groupAlternatives = exts.join("|").replace(/\./g, "\\.");
    const pattern = `(${groupAlternatives})$`;

    return new RegExp(pattern, "i");
};

const entryPath = resolve(__dirname, "../src/index.ts");
const outputPath = resolve(__dirname, "../dist");
const nodeModulesPath = resolve(__dirname, "../node_modules");

const extensions = [".js", ".ts"];

const config: WebpackConfig = {
    devtool: "source-map",
    entry: entryPath,
    externals: [],
    mode: "production",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: "ts-loader",
                test: toExtensionsRegExp(extensions)
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    optimization: {
        minimize: true
    },
    output: {
        filename: "index.js",
        library: {
            name: env.npm_package_name || "index",
            type: "commonjs-module"
        },
        path: outputPath
    },
    plugins: [new ESLintWebpackPlugin({ extensions })],
    resolve: {
        extensions,
        modules: [nodeModulesPath]
    },
    stats: {
        warningsFilter: []
    },
    target: "node"
};

export default config;
