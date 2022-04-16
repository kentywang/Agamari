const Sequelize = require('sequelize');

const name = (process.env.DATABASE_NAME || 'agamari');

const url = process.env.DATABASE_URL || `postgres://localhost:5432/${name}`;

const db = process.env.PORT ? (
  new Sequelize(url, {
      logging: false,
      define: { underscored: true },
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false
        }
      }
  })
) : (
  new Sequelize(url, {
    logging: false,
    define: { underscored: true },
  })
)

module.exports = db;
