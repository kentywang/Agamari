const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/blobworld', {logging:false});
module.exports = db;