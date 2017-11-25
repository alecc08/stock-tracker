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
        accounts(

            id      INTEGER PRIMARY KEY,
            name    TEXT

        )
    `,

    createPortfolioTable: `CREATE TABLE IF NOT EXISTS
        portfolios(

            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id  INTEGER,
            type        TEXT,

            FOREIGN KEY(account_id) REFERENCES account(id)
        )
    `,

    createPortfolioStockTable: `CREATE TABLE IF NOT EXISTS
        portfolio_stocks(
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            portfolio_id            INTEGER,
            stock                   TEXT,
            purchase_timestamp      INTEGER,
            purchase_qty            INTEGER,
            purchase_price          NUMBER,

            FOREIGN KEY(portfolio_id) REFERENCES portfolio(id)
        )
    `,

    createStockSplitTable: `CREATE TABLE IF NOT EXISTS
        stock_splits(
            stock           TEXT,
            factor          NUMBER,
            timestamp       INTEGER
        )
    `,

    createExchangeRateTable: `CREATE TABLE IF NOT EXISTS
        exchange_rates(
            currencyFrom          TEXT,
            currencyTo            TEXT,
            ratio                 NUMBER,
            timestamp             INTEGER
        )
    `,

    createEarningsTable: `CREATE TABLE IF NOT EXISTS
        earnings(
            amount          NUMBER,
            timestamp       INTEGER,
            from_stock      TEXT,
            from_portfolio  INTEGER,
            from_account    INTEGER
        )
    `,
    

    findAllStocksIn: "SELECT * FROM stock_history WHERE stock IN ",
    stocksWithinRange: " AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC",
    findStockBySymbol: "SELECT * FROM stock_history WHERE stock=?",
    insertStock: "INSERT INTO stock_history(stock,timestamp,open,close,volume) VALUES ",
    getStockDatesByCode: "SELECT timestamp FROM stock_history WHERE stock=?",
    getAllStockCodes: "SELECT DISTINCT stock FROM stock_history",


    insertAccount: "INSERT INTO accounts(name) VALUES (?)",
    getAccounts: "SELECT * from accounts",
    getAccountsWithPortfolios: "SELECT a.id, a.name, p.type, p.id as portfolioId FROM accounts a LEFT JOIN portfolios p ON a.id = p.account_id;",
    deleteAccountById: "DELETE FROM accounts WHERE id=?",

    getPortfolioWithStocks: "SELECT p.type, p.id, s.stock, s.purchase_timestamp, s.purchase_qty, s.purchase_price, s.id as stock_id FROM portfolios p LEFT JOIN portfolio_stocks s ON s.portfolio_id = p.id WHERE p.id = ?",
    insertPortfolio: "INSERT INTO portfolios(type, account_id) VALUES(?,?)",
    deletePortfolioById: "DELETE FROM portfolios WHERE id=?",

    insertPortfolioStock: "INSERT INTO portfolio_stocks(portfolio_id, stock, purchase_qty, purchase_price, purchase_timestamp) VALUES(?,?,?,?,?)",
    updatePortfolioStock: "UPDATE portfolio_stocks SET purchase_qty = ?, purchase_price = ?, purchase_timestamp = ? WHERE id = ?",
    deletePortfolioStock: "DELETE FROM portfolio_stocks WHERE id = ?"
};