"use strict";
module.exports = {
    createStockTable: `CREATE TABLE IF NOT EXISTS 
            stock (
                symbol TEXT,
                timestamp INTEGER,
                open NUMBER,
                close NUMBER,
                volume INTEGER
            )
    `,
    findAllInRange: "SELECT * FROM stock",
    findStockBySymbol: "SELECT * FROM stock WHERE symbol=",

    insertStock: "INSERT INTO stock(symbol,timestamp,open,close,volume) VALUES ",

    findExistingStockDates: "SELECT timestamp FROM stock WHERE symbol=?"
};