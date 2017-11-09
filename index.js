"use strict";

const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config");
const stockService = require("./lib/service/stockService");
const cron = require("node-cron");

const express = require("express");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });


const db = new sqlite3.Database('./db/stocks.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the stats database.');
});


stockService.processStockData(db);

let app = express();

// Run every day at 8pm
cron.schedule("0 0 20 * * *", function() {
    // Update all existing stocks
    
    stockService.getAllStocksInDb(db, function(stocks) {
        if(stocks && stocks.length > 0) {
            stocks.forEach(function(stock) {
                // This part may get too intensive if tracking lots of stocks.
                // Please be respectful of Alphavantage's suggestion of max requests per minute
                console.log("Updating " + stock.stock);
                stockService.updateStock(db, stock.stock);
            });
        } else {
            console.log("No stocks to update");
        }
    });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(urlencodedParser); //Use to process POST params

app.get("/stocks", function(req, res) {
    if(req.query.stockCodes) {
        let requestedStocks = req.query.stockCodes.split(",").map((stock) => stock.trim());
        let startDate = req.query.start;
        let endDate = req.query.end;

        let stockData = [];
        stockService.findAllForRange(db, requestedStocks, startDate, endDate, function(data) {
            res.status(200).send(data);
        });
        
    } else {
        res.status(400).send("Please specify stockCodes separated by ','. Ex: stockCodes=MSFT,GOOG,AAPL");
    }
    
});

app.post("/stocks", function(req, res) {
    if(req.body.stockCode) {
        console.log("Updating " + req.body.stockCode);
        stockService.updateStock(db, req.body.stockCode);
        res.status(200).send();
    } else {
        res.status(400).send("Please specify stockCode");
    }
    
});

var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    
    console.log("Stock tracker listening at http://localhost:%s", port);
});