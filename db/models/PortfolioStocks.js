"use strict";
const Portfolios = require("./Portfolios");
const Sequelize = require("sequelize");

module.exports = function(sequelize) {
    const PortfolioStocks = sequelize.define('portfolioStocks', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        symbol: {
            type: Sequelize.STRING
        },
        purchaseTime: {
            type: Sequelize.INTEGER
        },
        quantity: {
            type: Sequelize.INTEGER
        },
        purchasePrice: {
            type: Sequelize.FLOAT
        },
        portfolioId: {
            type: Sequelize.INTEGER
        }
    });
    return PortfolioStocks;
};
