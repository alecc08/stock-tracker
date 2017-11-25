"use strict";
const Accounts = require("./Accounts");
const Sequelize = require("sequelize");

module.exports = function(sequelize) {
    const Portfolios = sequelize.define('portfolios', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: Sequelize.STRING
        },
        accountId: {
            type: Sequelize.INTEGER
        }
    });
    return Portfolios;
};
