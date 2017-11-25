"use strict";
const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    const Earnings = sequelize.define('earnings', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fromStock: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.DECIMAL
        },
        timestamp: {
            allowNull: false,
            type: Sequelize.DATE,
        }
    });
    return Earnings;
};
