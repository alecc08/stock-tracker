"use strict";

const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config");
const moment = require("moment");
const stockService = require("./lib/service/stockService");

const express = require("express");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

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

app.use(urlencodedParser); //Use to process POST params

app.get("/stocks", function(req, res) {
    let requestedStocks = req.params.stocks.split(",");
    console.log(JSON.stringify(requestedStocks));
    console.log("# of stocks requested:" + requestedStocks.length);
});

app.post("/stocks", function(req, res) {
    console.log("Updating " + req.body.stockCode);
    stockService.addStock(db, apiKey, req.body.stockCode);
    res.status(200).send();
});

var server = app.listen(process.env.PORT || 8080, function() {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Stock tracker listening at http://%s:%s", host, port);
});