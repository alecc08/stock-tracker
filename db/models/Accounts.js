"use strict";
const Sequelize = require("sequelize");

module.exports = function(sequelize) {
    const Accounts = sequelize.define('accounts', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            unique: true
        }
    });
    return Accounts;
};
