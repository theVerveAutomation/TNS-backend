require("dotenv").config();

const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";

let databaseUrl;


if (env === "production") {
    databaseUrl = process.env.DATABASE_URL;
}
else {
    databaseUrl = process.env.DEV_DATABASE_URL;
}

const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
});

module.exports = sequelize;