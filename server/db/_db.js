const Sequelize = require('sequelize');

const name = (process.env.DATABASE_NAME || 'agamari');

const url = process.env.DATABASE_URL || `postgres://localhost:5432/${name}`;

const db = new Sequelize(url, {
  logging: false,
  define: { underscored: true },
  dialectOptions: {
    ...(  // only add this  when on heroku, since local doesn't support SSL cxns
      process.env.PORT ? {
        ssl: {
          rejectUnauthorized: false
        }
      } : {}
    )
  }
});
module.exports = db;
