const http = require('http');
const app = require('./app');
const config = require('./utils/config');

const server = http.createServer(app);
const { initializeApp } = require('./initapp');

console.log("Initializing PAM NodeJS app..");

initializeApp().then(() => {
  server.listen(config.PORT,()=>{
    console.log(`Agent is running on port ${config.PORT}`)
  });
});

