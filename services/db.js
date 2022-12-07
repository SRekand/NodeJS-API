const mysql = require("mysql2/promise");
const config = require("../config");

async function query(sql, params) {
  const connection = await mysql.createConnection(config.db);
  return connection.execute(sql, params);
}

module.exports = {
  query,
};
