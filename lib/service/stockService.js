"use strict";
const sql = require("../../db/sql/sql.js");
const Moment = require("moment");
const request = require("request");
const config = require("../../config");
const fs = require("fs");
const apiKey = fs.readFileSync(config.apiKeyPath).toString();
const Sequelize = require('sequelize');
const _ = require('lodash');

const Op = Sequelize.Op;
const sequelize = new Sequelize('database', '', '', {
    dialect: 'sqlite',
    operatorsAliases: Op,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    storage: 'db/stocks.db'
});

console.log("Using API Key: " + apiKey);

const db = {};

module.exports = {
    
    initDB() {
        let files = fs.readdirSync('./db/models');
        files.forEach((file) => {
            db[file.split('.')[0]] = require('../../db/models/'+ file)(sequelize);
            db[file.split('.')[0]].sync();
        });

        db.Accounts.hasMany(db.Portfolios);
        db.Portfolios.belongsTo(db.Accounts);
        db.Portfolios.hasMany(db.PortfolioStocks, {as:'stocks'});
        db.PortfolioStocks.belongsTo(db.Portfolios);
        console.log(JSON.stringify(files));
    },


    /* ========================== STOCK SECTION =========================== */
    findAllForRange(stocks, start, end, cb) {
        let startDate = new Moment(start, "YYYY-MM-DD");
        let endDate = new Moment(end, "YYYY-MM-DD");
        db.StockHistory.findAll({where: {symbol: {[Op.in]:stocks}, timestamp: {
            [Op.lt]: Moment(end, 'YYYY-MM-DD').unix(),
            [Op.gt]: Moment(start, 'YYYY-MM-DD').unix()
        }}, order: [['timestamp','ASC']]
        }).then(results => {
            let grouped = {};
            results.forEach(function(row) {
                if(!grouped[row.symbol]) {
                    grouped[row.symbol] = [];
                }
                grouped[row.symbol].push(row);
            });
            cb(grouped);
        });

    },
    updateStock(stockCode) {
        let path = config.apiUrl + "symbol=" + stockCode + "&apikey=" + apiKey;
        console.log("Calling: " + path);
        request.get(path, function(err, res) {
            try {
                res.body = JSON.parse(res.body);
            } catch(e) {
                console.log("\n\n\n\nERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n Failed to update stocks\n\n\n\n\n\n");
                return;
            }
            
            if(!res.body["Meta Data"]) {
                console.log("Failed to find " + stockCode);
                return;
            }
            console.log(res.body["Meta Data"]);
            let allInserts = [];
            db.StockHistory.findAll({ where: { symbol: stockCode }, raw: true }).then((stockHistory) => {
                let existingTimestamps = [];
                stockHistory.forEach(stockHistory => {
                    existingTimestamps.push(stockHistory.timestamp);
                });
                Object.keys(res.body["Time Series (Daily)"]).forEach(function(key) {
                    let timestampUnix = Moment(key, 'YYYY-MM-DD').unix();
                    if(existingTimestamps.indexOf(timestampUnix) === -1) {
                        let stockDate = res.body["Time Series (Daily)"][key];
                        db.StockHistory.create({symbol: stockCode, timestamp: timestampUnix, open: stockDate["1. open"], close: stockDate["4. close"], volume: stockDate["5. volume"]});
                    }
                    
                });
            });
        });
    },
    getAllStocksInDb(callback) {
        db.StockHistory.findAll({}).then((stockHistories) => {
            callback(stockHistories);
        });
    },





    /* ========================== ACCOUNT SECTION =========================== */
    getAccounts(callback) {
        db.Accounts.findAll({}).then(callback);
       
    },
    getAccountsWithPortfolios(callback) {
        db.Accounts.findAll({include: [{
            model: db.Portfolios, include: {model:db.PortfolioStocks, as: 'stocks'}
        }]}).then(callback);
    },
    addAccount(accountName, callback) {
        db.Accounts.create({name: accountName}).then(callback);
    },
    deleteAccount(accountId, callback) {
        //db.Accounts(sql.deleteAccountById, [accountId], callback);
    },




    /* ========================== PORTFOLIO SECTION =========================== */
    getPortfolio(id, callback) {
        db.Portfolios.findAll({
            where: {id:id},
            include: {
                model: db.PortfolioStocks,
                as: 'stocks'
            }
        }).then((portfolios) => {
            callback(portfolios[0]);
        });
    },
    addPortfolio(type, accountId, callback) {
        db.Portfolios.create({type: type, accountId: accountId}).then(callback);
    },

    updatePortfolio(portfolio, callback) {
        //Update portfolio is just updating its stocks, not the portfolio table itself
        console.log("Updating portfolio:" + JSON.stringify(portfolio));
        portfolio.stocks.forEach((stock) => {
            if(!stock.id) {
                this.updateStock(stock.symbol);
                db.PortfolioStocks.create({symbol:stock.symbol, purchaseTime: stock.purchaseTime, quantity: stock.purchaseQuantity, purchasePrice: stock.purchasePrice, portfolioId: portfolio.id}).then(()=> {
                    console.log("Saved new stock");
                });
            }
        });
        
        callback(null, "Success");
    },

    deletePortfolio(db, portfolioId, callback) {
        db.all(sql.deletePortfolioById, [portfolioId], callback);
    }
};