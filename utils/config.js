require('dotenv').config();

let PORT = process.env.PORT;
let APP_DIR = process.env.APP_DIR;
let OUT_LOG = process.env.OUT_LOG;

module.exports = {
    PORT,
    APP_DIR,
    OUT_LOG
};
