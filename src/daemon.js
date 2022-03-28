/* eslint-disable no-constant-condition */
const { execSync } = require("child_process");
const { join } = require("path");

const APP_PATH = join(__dirname, "index.js");
const TEN_MINUTES = 10 * 1000;

const wait = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const execAppSync = () => {
    try {
        execSync(`node --enable-source-maps ${APP_PATH}`, { stdio: "inherit" });
    } catch (error) {
        console.log(`\n  ERROR: Process exited with status code = ${error.status ?? 0}`);
        console.log(`         ${error.message}`);
    }
};

const startDaemon = async () => {
    while (true) {
        console.clear();

        execAppSync();

        console.log("\n  Process exited: Restarting in 10 minutes...");

        await wait(TEN_MINUTES);
    }
};

startDaemon();
