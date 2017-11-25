"use strict";

const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config");
const stockService = require("./lib/service/stockService");
const cron = require("node-cron");

const express = require("express");
var bodyParser = require('body-parser');

stockService.initDB();

let app = express();

// Schedule the stock updates
cron.schedule(config.cronSchedule, function() {
    // Update all existing stocks
    
    stockService.getAllStocksInDb(function(stocks) {
        if(stocks && stocks.length > 0) {
            let counter = 0;
            const WAIT_BETWEEN_CALLS = 1000; // 1 second
            stocks.forEach(function(stock) {
                // This part may get too intensive if tracking lots of stocks.
                // Please be respectful of Alphavantage's suggestion of max requests per minute
                setTimeout(function() {
                    console.log("Updating " + stock.symbol);
                    stockService.updateStock(stock.symbol);
                }, counter * WAIT_BETWEEN_CALLS);
                counter++;
            });
        } else {
            console.log("No stocks to update");
        }
    });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    next();
});

app.use(bodyParser.urlencoded({ extended: true })); //Use to process POST params
app.use(bodyParser.json()); //Use to process POST params

app.get("/stocks", function(req, res) {
    if(req.query.stockCodes) {
        let requestedStocks = req.query.stockCodes.split(",").map((stock) => stock.trim());
        let startDate = req.query.start;
        let endDate = req.query.end;

        let stockData = [];
        stockService.findAllForRange(requestedStocks, startDate, endDate, function(data) {
            res.status(200).send(data);
        });
        
    } else {
        res.status(400).send("Please specify stockCodes separated by ','. Ex: stockCodes=MSFT,GOOG,AAPL");
    }
    
});

app.post("/stocks", function(req, res) {
    if(req.body.stockCode) {
        console.log("Updating " + req.body.stockCode);
        stockService.updateStock(req.body.stockCode);
        res.status(200).send();
    } else {
        res.status(400).send("Please specify stockCode");
    }
    
});

app.get("/accounts", function(req, res) {
    stockService.getAccountsWithPortfolios(function(accounts) {
        //Also get their portfolios
        res.status(200).send(accounts);
    });
});

app.post("/accounts", function(req, res) {
    console.log(req.body);
    if(req.body.accountName) {
        stockService.addAccount(req.body.accountName, function(account) {
            res.status(200).send({success:true});
        });
        
    } else {
        res.status(400).send({error:"No name specified"});
    }
    
});

app.delete("/accounts", function(req, res) {
    if(req.query.accountId) {
        console.log("Deleting account: " + req.query.accountId);
        stockService.deleteAccount(req.query.accountId);
        res.status(200).send({});
    } else {
        res.status(400).send("Please specify an accountName");
    }
});

app.get("/portfolios", function(req, res) {
    if(req.query.portfolioId) {

        stockService.getPortfolio(req.query.portfolioId, function(portfolio) {
            res.status(200).send(portfolio);
        });
    } else {
        res.status(400).send({error:"No portfolioId specified"});
    }
});

app.post("/portfolios", function(req, res) {
    console.log(req.body);
    if(req.body.accountId && req.body.portfolioName) {
        stockService.addPortfolio(req.body.portfolioName, req.body.accountId, function(account) {
            res.status(200).send({success:true});
        });
        
    } else {
        res.status(400).send({error:"No name or accountId specified"});
    }
    
});

app.put("/portfolios", function(req, res) {
    console.log(req.body);
    if(req.body.portfolio) {
        stockService.updatePortfolio(req.body.portfolio, function(account) {
            res.status(200).send({success:true});
        });
    } else {
        res.status(400).send({error:"No portfolio to update"});
    }
});

app.delete("/portfolios", function(req, res) {

    if(req.query.portfolioId) {
        console.log("Deleting portfolio: " + req.query.portfolioId);
        stockService.deletePortfolio(req.query.portfolioId);
        res.status(200).send({});
    } else {
        res.status(400).send("Please specify a portfolioId");
    }
});



var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    
    console.log("Stock tracker listening at http://localhost:%s", port);
});