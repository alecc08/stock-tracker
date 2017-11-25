"use strict";
const Sequelize = require("sequelize");

module.exports = function(sequelize) {
    const ExchangeRates = sequelize.define('exchangeRates', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        currencyFrom: {
            type: Sequelize.STRING
        },
        currencyTo: {
            type: Sequelize.STRING
        },
        ratio: {
            type: Sequelize.DECIMAL
        },
        timestamp: {
            allowNull: false,
            type: Sequelize.DATE,
        }
    });
    return ExchangeRates;
};
