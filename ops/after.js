//play sound on compile
//if you are under wsl look at https://research.wmz.ninja/articles/2017/11/setting-up-wsl-with-graphics-and-audio.html#:~:text=WSL%20does%20not%20natively%20support%20audio%20devices.,for%20your%20music%2Fvideo%20needs.
//if you use linux do "sudo apt-get install sox" & "sudo apt-get install sox libsox-fmt-all"
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
var copy = require('recursive-copy');

copy(path.resolve(__dirname, "./../dist/server/entities/ressources/index.js"), path.resolve(__dirname, "./../dist/client/ui/index.js"), function (error, results) { });

switch (process.platform) {
    case "win32":
        exec("powershell -c (New-Object Media.SoundPlayer '" + path.resolve(__dirname, "./so-proud-notification.wav") + "').PlaySync();")
        break;
    case "linux":
        exec("play " + path.resolve(__dirname, "./so-proud-notification.mp3"));
        break;

    default:
        break;
}