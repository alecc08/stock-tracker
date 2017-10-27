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
    findAllInRange: 'SELECT * FROM stock'
};