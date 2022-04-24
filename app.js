const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const middleware = require('./utils/middleware');
const { APP_DIR, OUT_LOG, GITHUB_URL, PROJECT_ID, ENTRY_FILE } = require('./utils/config');

const app = express();
const pm2 = require('pm2');
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const fsExtra = require('fs-extra')
const { execSync } = require("child_process");
const AppError = require('./utils/appError');

app.use(helmet());
app.use(
  cors({
    origin: '*'
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(middleware.requestLogger);

app.get("/status", async (req, res, next) => {
  res.send( {"status": "active"} );
});

app.post("/terminate", async (req, res, next) => {
  try {
    const projectId = req.body["projectId"];
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        throw new AppError("Error while connecting to PM2 daemon", 500);
      }
      
      pm2.delete(projectId, (err) => {
        pm2.disconnect();
        if (err) {
          console.error(err);
          throw new AppError("Error while deleting existing process", 500);
        } else {
          fsExtra.emptyDirSync(APP_DIR);
          console.log("App killed successfully");
          res.sendStatus(200);
        }
      });

    });

  } catch(ex){
    next(ex);
  }
})

app.patch("/update", async (req, res, next) => {
  try {

    const githubUrl = GITHUB_URL;
    const entryPoint = ENTRY_FILE;
    const projectId = PROJECT_ID;

    await git.pull({ fs, http, dir: APP_DIR, author: {name: "PAM", email: "palliwar.aashay@gmail.com"}, ref: "main", singleBranch: true, url: githubUrl });
    console.log("Successful pull");

    console.log(execSync("cd " + APP_DIR + "; npm install").toString());
    console.log("Installed dependencies");

    pm2.connect( (err) => {
      if (err) {
        console.error(err)
        throw new AppError("Error while connecting to PM2 daemon", 500);
      }

      pm2.delete(0, (err) => {
        if (err) {
          console.error(err);
          throw new AppError("Error while deleting existing process", 500);
        }
        console.log("Older app version shut down successfully");

        pm2.start({
          script: APP_DIR + "/" + entryPoint,
          name: projectId,
          out_file: OUT_LOG,
          error_file: OUT_LOG
        }, (err, apps) => {
          pm2.disconnect();
          if (err) {
            console.error(err);
            throw new AppError("Error while starting process", 500);
          } else {
            console.log("Updated app started successfully");
            res.sendStatus(200);
          }
        });
      });
    })
    
  } catch(ex){
    next(ex);
  }
})

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
