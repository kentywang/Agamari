const Sequelize = require('sequelize');

const dbhost = process.env.DB_HOST || 'localhost';
const dbuser = process.env.DB_USER || 'postgres';
const dbpass = process.env.DB_PASSWORD || 'password';
const dbname = process.env.DB_NAME || 'postgres';

const url =  `postgres://${dbuser}:${dbpass}@${dbhost}:5432/${dbname}`;

const db = new Sequelize(url, {
    logging: false,
    define: { underscored: true },
})

module.exports = db;
