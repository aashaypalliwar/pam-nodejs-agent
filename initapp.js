const config = require('./utils/config');
const pm2 = require('pm2');
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const { execSync } = require("child_process");
const AppError = require('./utils/appError');

const initializeApp = async () => {
  try {
    const githubUrl = config.GITHUB_URL;
    const entryPoint = config.ENTRY_FILE;
    const projectId = config.PROJECT_ID;
  
    await git.clone({ fs, http, dir: config.APP_DIR, url: githubUrl}).then(() => console.log("Successful cloning"));
  
    console.log(execSync("cd " + config.APP_DIR + "; npm install").toString());
    console.log("Installed dependencies");
  
    pm2.connect( (err) => {
      if (err) {
        console.error(err)
        throw new AppError("Error while connecting to PM2 daemon", 500);
      }
  
      pm2.start({
        script: config.APP_DIR + "/" + entryPoint,
        name: projectId,
        out_file: config.OUT_LOG,
        error_file: config.OUT_LOG
      }, (err, apps) => {
        pm2.disconnect();
        if (err) {
          console.error(err);
          throw new AppError("Error while starting process", 500);
        } else {
          console.log("App started successfully");
        }
      })
    })
    
  } catch(ex){
    console.log(ex);
    exit(2);
  }
}

module.exports = {initializeApp};