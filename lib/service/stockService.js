"use strict";
const sql = require("../../db/sql/sql.js");
const Moment = require("moment");
const request = require("request");
const config = require("../../config");
const fs = require("fs");
const apiKey = fs.readFileSync(config.apiKeyPath).toString();
console.log("Using API Key: " + apiKey);

module.exports = {
    createTables(db) {
        db.serialize(function() {
            db.run(sql.createStockTable);
            db.run(sql.createAccountTable);
            db.run(sql.createPortfolioTable);
            db.run(sql.createPortfolioStockTable);
            db.run(sql.createExchangeRateTable);
            db.run(sql.createEarningsTable);
        });
        
    },


    /* ========================== STOCK SECTION =========================== */
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





    /* ========================== ACCOUNT SECTION =========================== */
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
    getAccountsWithPortfolios(db, callback) {
        db.all(sql.getAccountsWithPortfolios, function(err, accounts) {
            if(err) {
                console.log(err);
                callback(null);
            } else {
                let groupedAccounts = {};
                accounts.forEach((account)=> {
                    if(!groupedAccounts[account.id]) {
                        groupedAccounts[account.id] = account;
                        account.portfolios = [];
                    }
                    if(account.portfolioId) {
                        groupedAccounts[account.id].portfolios.push({name: account.type, id: account.portfolioId});    
                    }
                    
                    delete groupedAccounts[account.id].portfolioId;
                    delete groupedAccounts[account.id].type;
                });
                // Convert back to array
                let groupedAccountArray = [];
                Object.keys(groupedAccounts).forEach((key) => {
                    groupedAccountArray.push(groupedAccounts[key]);
                });
                callback(groupedAccountArray);
            }
        });
    },
    addAccount(db, accountName, callback) {
        db.all(sql.insertAccount, [accountName], callback);
    },
    deleteAccount(db, accountId, callback) {
        db.all(sql.deleteAccountById, [accountId], callback);
    },




    /* ========================== PORTFOLIO SECTION =========================== */
    getPortfolio(db, id, callback) {
        db.all(sql.getPortfolioWithStocks, [id], function(err, portfolioStocks) {
            let portfolio = {};
            if(err || portfolioStocks.length === 0) {
                callback(err);
                return;
            }
            console.log(JSON.stringify(portfolioStocks));
            portfolio.type = portfolioStocks[0].type;
            portfolio.id = id;
            portfolio.stocks = [];
            portfolioStocks.forEach(function(stock) {
                if(stock.stock) {
                    portfolio.stocks.push({
                        id: stock.id,
                        stock: stock.stock,
                        purchasePrice: stock.purchase_price,
                        purchaseQuantity: stock.purchase_qty,
                        purchaseTime: stock.purchase_timestamp
                    });
                }
            });
            callback(err, portfolio);
        });
    },
    addPortfolio(db, type, accountId, callback) {
        db.all(sql.insertPortfolio, [type,accountId], callback);
    },

    updatePortfolio(db, portfolio, callback) {
        //Update portfolio is just updating its stocks, not the portfolio table itself
        console.log("Updating portfolio:" + JSON.stringify(portfolio));
        db.serialize(() => {
            portfolio.stocks.forEach((stock) => {
                if(!stock.id) {
                    // Insert stock
                    db.all(sql.insertPortfolioStock, [portfolio.id, stock.symbol, stock.purchaseQuantity, stock.purchasePrice, stock.purchaseTime]);
                } else {
                    // Update it
                    db.all(sql.updatePortfolioStock, [stock.purchaseQuantity, stock.purchasePrice, stock.purchaseTime, stock.id]);
                }
            });
        });
        callback(null, "Success");
    },

    deletePortfolio(db, portfolioId, callback) {
        db.all(sql.deletePortfolioById, [portfolioId], callback);
    }
};