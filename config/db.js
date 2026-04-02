import "dotenv/config";

import { Sequelize } from "sequelize";


const env = process.env.NODE_ENV || "development";
let databaseUrl;
if (env === "production") {
    databaseUrl = process.env.DATABASE_URL;
} else {
    databaseUrl = process.env.DEV_DATABASE_URL;
}

const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
});

export default sequelize;