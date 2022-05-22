const { execSync } = require('child_process');
require('dotenv').config();

execSync("cd ..");
if(process.env.COPY_SERVER != "TRUE"){
    execSync("tsc -p ./src/client/ && tsc -p ./src/server/");
}else{
    execSync("tsc -p ./src/client/");
}