// conn.js
// npm packages
// npm install tedious-connection-pool tedious

const { ConnectionPool } = require('tedious-connection-pool');
const { Request } = require('tedious');

// ----------------------
// DATABASE CONFIGURATION
// ----------------------
const config = {
  server: 'your_server_name',           // Replace with your SQL Server instance name or IP address
  authentication: {
    type: 'default',
    options: {
      userName: 'your_username',        // Replace with your SQL Server username
      password: 'your_password',        // Replace with your SQL Server password
    },
  },
  database: 'your_database_name',       // Replace with the name of your database
  options: {
    encrypt: true,                      // Set to true if using Azure SQL or if your server requires encryption
    trustServerCertificate: false,      // Set to true for local development if you don't have a proper SSL certificate (NOT recommended for production)
  },
  pool: {
    min: 2,                             // Minimum number of connections in the pool
    max: 10,                            // Maximum number of connections in the pool
    idleTimeout: 30000,                 // Time in milliseconds before an idle connection is closed (30 seconds)
  },
};

// ----------------------
// CONNECTION POOL INSTANCE
// ----------------------
const pool = new ConnectionPool(config);

pool.on('error', function (err) {
  console.error('Connection pool error:', err);
});

// ----------------------
// RUN SQL QUERY FUNCTION
// ----------------------
async function querymssql(sql, values = []) {
  return new Promise((resolve, reject) => {
    pool.acquire(function (err, connection) {
      if (err) {
        reject(err.message);
        return;
      }

      let parameterizedSql = sql;
      const params = {};

      for (let i = 0; i < values.length; i++) {
        const paramName = `@param${i + 1}`;
        parameterizedSql = parameterizedSql.replace('?', paramName);
        params[paramName] = values[i];
      }

      const request = new Request(parameterizedSql, (err, rowCount, rows) => {
        connection.release(); // Release the connection back to the pool

        if (err) {
          reject(err.message);
        } else {
          const results = rows.map(row => {
            const result = {};
            row.forEach(column => {
              result[column.metadata.colName] = column.value;
            });
            return result;
          });
          resolve(results);
        }
      });

      for (const paramName in params) {
        request.addParameter(paramName, null, params[paramName]);
      }

      connection.execSql(request);
    });
  });
}

// ----------------------
// EXPORT THE RUNSQL FUNCTION
// ----------------------
module.exports = querymssql;