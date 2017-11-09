"use strict";
module.exports = {
    createStockTable: `CREATE TABLE IF NOT EXISTS 
        stock_history (

            stock       TEXT,
            timestamp   INTEGER,
            open        NUMBER,
            close       NUMBER,
            volume      INTEGER

        )
    `,

    createAccountTable: ` CREATE TABLE IF NOT EXISTS
        account(

            id      INTEGER PRIMARY KEY,
            name    TEXT

        )
    `,

    createPortfolioTable: `CREATE TABLE IF NOT EXISTS
        portfolio(

            id          INTEGER PRIMARY KEY,
            account_id  INTEGER,
            type        TEXT,

            FOREIGN KEY(account_id) REFERENCES account(id)
        )
    `,

    createPortfolioStockTable: `CREATE TABLE IF NOT EXISTS
        portfolio_stock(

            portfolio_id            INTEGER,
            stock                   TEXT,
            purchase_timestamp      INTEGER,
            purchase_qty            INTEGER,
            purchase_price          NUMBER,

            FOREIGN KEY(portfolio_id) REFERENCES portfolio(id)
        )
    `,

    createStockSplitTable: `CREATE TABLE IF NOT EXISTS
        stock_split(
            stock           TEXT,
            factor          NUMBER,
            timestamp       INTEGER
        )
    `,
    

    findAllStocksIn: "SELECT * FROM stock_history WHERE stock IN ",

    stocksWithinRange: " AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC",

    findStockBySymbol: "SELECT * FROM stock_history WHERE stock=?",

    insertStock: "INSERT INTO stock_history(stock,timestamp,open,close,volume) VALUES ",

    getStockDatesByCode: "SELECT timestamp FROM stock_history WHERE stock=?",

    getAllStockCodes: "SELECT DISTINCT stock FROM stock_history"
};