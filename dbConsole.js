"use strict";

const sqlite3 = require("sqlite3").verbose();
const config = require("./config");



const db = new sqlite3.Database('./db/stocks.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the stats database.');
});

db.on('trace', function(msg) {
    console.log(msg);
});
var stdin = process.openStdin();
let fullInput = "";
stdin.addListener("data", function(input) {
    fullInput += input.toString() + " ";
    if(input.toString().indexOf(";") !== -1) {
        db.all(fullInput, function(err, res) {
            console.log(err);
            console.log("results:" + JSON.stringify(res));
        });
        fullInput = "";
    }
});