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

    addStock(db, apiKey, stockCode) {
        let options = {

        };
        let path = config.apiUrl + "symbol=" + stockCode + "&apikey=" + apiKey;
        console.log("Calling: " + path);
        request.get(path, function(err, res) {
            console.log(res.body);
        });

    }
};