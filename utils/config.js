require('dotenv').config();

let PORT = process.env.PORT;
let APP_DIR = process.env.APP_DIR;

module.exports = {
    PORT,
    APP_DIR
};
