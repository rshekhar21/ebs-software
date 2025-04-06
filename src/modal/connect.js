// const mysql = require('mysql2');

// class Connect {
//   constructor(cs) {
//     if (!cs) throw new Error('invalid connection string');
//     this.cs = cs;
//   }


//   async execute(sql, values = []) {
//     try {
//       return new Promise((resolve, reject) => {
//         if (!sql) return reject('invalid request');
//         const con = mysql.createConnection(this.cs);
//         con.execute(sql, values, (err, result, fields) => {
//           if (err) reject(err);
//           con.end(); // Close the connection after the query is executed
//           resolve(result, fields);
//         });
//       });
//     } catch (error) {
//       log(error);
//       return 'invalid request';
//     }
//   }

//   async query(sql, values = []) {
//     try {
//       return new Promise((resolve, reject) => {
//         if (!sql) return reject('invalid request');
//         const con = mysql.createConnection(this.cs);
//         con.query(sql, values, (err, result, fields) => {
//           if (err) reject(err);
//           con.end(); // Close the connection after the query is executed
//           resolve(result, fields);
//         });
//       });
//     } catch (error) {
//       log(error);
//       return 'invalid request';
//     }
//   }
// }

// module.exports = Connect;

const mysql = require('mysql2/promise'); // Use the promise-based API for cleaner async/await

class Connect {
    constructor(cs) {
        if (!cs) throw new Error('invalid connection string');
        this.pool = mysql.createPool(cs); // Create a connection pool
    }

    async execute(sql, values = []) {
        let connection;
        try {
            if (!sql) throw new Error('invalid request');
            connection = await this.pool.getConnection(); // Get a connection from the pool
            const [result] = await connection.execute(sql, values);
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            return 'invalid request';
        } finally {
            if (connection) connection.release(); // Release the connection back to the pool
        }
    }

    async query(sql, values = []) {
        let connection;
        try {
            if (!sql) throw new Error('invalid request');
            connection = await this.pool.getConnection(); // Get a connection from the pool
            const [result] = await connection.query(sql, values);
            return result;
        } catch (error) {
            console.error('Error running query:', error);
            return 'invalid request';
        } finally {
            if (connection) connection.release(); // Release the connection back to the pool
        }
    }

    // Optional: Method to gracefully close the connection pool when your application exits
    async endPool() {
        if (this.pool) {
            await this.pool.end();
            console.log('MySQL connection pool closed.');
        }
    }
}

module.exports = Connect;