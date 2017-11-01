"use strict";
let sql = require("../../db/sql/sql.js");
const moment = require("moment");
const request = require("request");
const config = require("../../config");

module.exports = {
    processStockData(db) {
        db.serialize(function() {
            db.run(sql.createStockTable);
        });
        
    },

    findAllForRange(db, start, end, cb) {
        db.serialize(function() {
            db.all(sql.findAllInRange, [start, end], cb);
        });
    },

    updateStock(db, apiKey, stockCode) {
        let path = config.apiUrl + "symbol=" + stockCode + "&apikey=" + apiKey;
        console.log("Calling: " + path);
        request.get(path, function(err, res) {
            res.body = JSON.parse(res.body);
            console.log(res.body["Meta Data"]);
            let allInserts = [];

            db.serialize(function() {
                db.all(sql.findExistingStockDates, [stockCode], function(err, existingTimestamps) {
                    existingTimestamps = existingTimestamps.map((timestamp) => timestamp.timestamp);
                    Object.keys(res.body["Time Series (Daily)"]).forEach(function(key) {
                        let timestamp = new moment(key, 'YYYY-MM-DD');
                        let timestampUnix = timestamp.unix();
                        if(existingTimestamps.indexOf(timestampUnix) === -1) {
                            //Date not stored for stock symbol, need to insert
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

    }
};