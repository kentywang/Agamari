const Sequelize = require('sequelize');

const name = (process.env.DATABASE_NAME || "blobworld");

const url = process.env.DATABASE_URL || `postgres://localhost:5432/${name}`;

const db = new Sequelize(url, { logging: false });
module.exports = db;
