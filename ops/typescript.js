const { execSync } = require('child_process');
require('dotenv').config();

execSync("cd ..");
if(process.env.COPY_SERVER != "TRUE"){
    execSync("tsc -p ./src/client/ && tsc -p ./src/server/");
}else{
    try{
        const buffer = execSync("tsc -p ./src/client/");
    }catch(e){
        console.log(e.stdout.toString("utf-8"));
    }
}