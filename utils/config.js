require('dotenv').config();

let PORT = process.env.PORT;
let APP_DIR = process.env.APP_DIR;
let OUT_LOG = process.env.OUT_LOG;
let GITHUB_URL = process.env.GITHUB_URL;
let PROJECT_ID = process.env.PROJECT_ID;
let ENTRY_FILE = process.env.ENTRY_FILE;

module.exports = {
    PORT,
    APP_DIR,
    OUT_LOG,
    GITHUB_URL,
    PROJECT_ID,
    ENTRY_FILE
};
