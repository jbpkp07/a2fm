import { resolve } from "path";
import { env } from "process";

import CopyWebpackPlugin from "copy-webpack-plugin";
import ESLintWebpackPlugin from "eslint-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { DefinePlugin, Configuration as WebpackConfig } from "webpack";

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
    ignoreWarnings: [/('fsevents')/],
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
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false
                    }
                }
            })
        ]
    },
    output: {
        filename: "index.js",
        library: {
            name: env.npm_package_name || "index",
            type: "commonjs-module"
        },
        path: outputPath
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: resolve(__dirname, "../src/config.json"), to: outputPath, info: { minimized: true } },
                { from: resolve(__dirname, "../src/daemon.js"), to: outputPath, info: { minimized: true } }
            ]
        }),
        new DefinePlugin({
            "process.env.npm_package_name": JSON.stringify(env.npm_package_name),
            "process.env.npm_package_description": JSON.stringify(env.npm_package_description),
            "process.env.npm_package_version": JSON.stringify(env.npm_package_version)
        }),
        new ESLintWebpackPlugin({
            extensions,
            failOnError: true,
            failOnWarning: true
        })
    ],
    resolve: {
        extensions,
        modules: [nodeModulesPath]
    },
    target: "node"
};

export default config;
