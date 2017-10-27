"use strict";
let sql = require('../../db/sql/sql.js');
const moment = require('moment');

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
    }
};