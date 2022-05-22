const { execSync } = require('child_process');
require('dotenv').config();

execSync("cd ..");
if(process.env.COPY_SERVER != "TRUE"){
    execSync("node ./dist/server/index.js");
}else{
    console.log("With COPY_SERVER=TRUE, we can't start the server for you. You have to launch it manually.")
}