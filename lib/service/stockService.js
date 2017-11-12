"use strict";
const sql = require("../../db/sql/sql.js");
const Moment = require("moment");
const request = require("request");
const config = require("../../config");
const fs = require("fs");
const apiKey = fs.readFileSync(config.apiKeyPath).toString();
console.log("Using API Key: " + apiKey);

module.exports = {
    processStockData(db) {
        db.serialize(function() {
            db.run(sql.createStockTable);
            db.run(sql.createAccountTable);
            db.run(sql.createPortfolioTable);
            db.run(sql.createPortfolioStockTable);
        });
        
    },

    findAllForRange(db, stocks, start, end, cb) {
        let startDate = new Moment(start, "YYYY-MM-DD");
        let endDate = new Moment(end, "YYYY-MM-DD");
        db.serialize(function() {
            let ps = sql.findAllStocksIn + "(" + stocks.map((stock) => "?").join(",") + ") ";
            db.all(ps + sql.stocksWithinRange, [...stocks, startDate.unix(), endDate.unix()], function(err, results) {
                if(err) {
                    console.log("ERROR! " + err);
                    cb(null);
                } else {
                    let grouped = {};
                    results.map((row) => {
                        let formatted = new Moment.unix(row.timestamp);
                        row.timestamp = formatted.format("YYYY-MM-DD");
                    });
                    results.forEach(function(row) {
                        if(!grouped[row.stock]) {
                            grouped[row.stock] = [];
                        }
                        grouped[row.stock].push(row);
                    });
                    cb(grouped);
                }
            });
        });
    },

    updateStock(db, stockCode) {
        let path = config.apiUrl + "symbol=" + stockCode + "&apikey=" + apiKey;
        console.log("Calling: " + path);
        request.get(path, function(err, res) {
            res.body = JSON.parse(res.body);
            if(!res.body["Meta Data"]) {
                console.log("Failed to find " + stockCode);
                return;
            }
            console.log(res.body["Meta Data"]);
            let allInserts = [];

            db.serialize(function() {
                db.all(sql.getStockDatesByCode, [stockCode], function(err, existingTimestamps) {
                    existingTimestamps = existingTimestamps.map((timestamp) => timestamp.timestamp);
                    Object.keys(res.body["Time Series (Daily)"]).forEach(function(key) {
                        let timestamp = new Moment(key, 'YYYY-MM-DD');
                        let timestampUnix = timestamp.unix();
                        if(existingTimestamps.indexOf(timestampUnix) === -1) {
                            let stockDate = res.body["Time Series (Daily)"][key];
                            let insert = "(\"" + stockCode + "\"," + timestampUnix + "," +stockDate["1. open"]+ "," +stockDate["4. close"]+ "," +stockDate["5. volume"]+ ")";
                            allInserts.push(insert);
                        }
                        
                    });
                    if(allInserts.length > 0) {
                        db.run(sql.insertStock + allInserts.join(","));
                    }
                });
                
            });
            
        });

    },

    getAllStocksInDb(db, callback) {
        db.all(sql.getAllStockCodes, function(err, stocks) {
            if(err) {
                console.log(err);
                callback(null);
            } else {
                callback(stocks);
            }
        });
    },

    getAccounts(db, callback) {
        db.all(sql.getAccounts, function(err, accounts) {
            if(err) {
                console.log(err);
                callback(null);
            } else {
                callback(accounts);
            }
        });
    },

    addAccount(db, accountName, callback) {
        db.all(sql.addAccount, [accountName], callback);
    }
};