"use strict";

const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const config = require('./config');
const moment = require('moment');
const stockService = require('./lib/service/stockService');
const express = require('express');
const fs = require("fs");
const apiKey = fs.readFileSync(config.apiKeyPath).toString();
const db = new sqlite3.Database('./db/stocks.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the stats database.');
});


console.log("Using API Key: " + apiKey);
stockService.processStockData(db);

let app = express();

app.listen(process.env.PORT || 8080, function() {
    console.log("Express server listening.");
});