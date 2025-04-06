const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dbPath = path.resolve(__dirname, 'mydb.sqlite');
const queries = require('./schema');
const views = require('./views'); 
const bcrypt = require('bcrypt');
const log = console.log;
let db; //sqlite db instance

function runSql(query, values = [], type = 'read') {
    return new Promise((resolve, reject) => {
        if (type === 'read') {
            db.all(query, values, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.run(query, values, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        }
    });
}

function runSqlite(query, values = []) {
    return new Promise((resolve, reject) => {
        db.run(query, values, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

function readSql(query, values = []) {
    return new Promise((resolve, reject) => {
        db.all(query, values, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function initializeDatabase() {
    const dbExists = fs.existsSync(dbPath);

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
        } else {
            console.log('Connected to the SQLite database.');

            if (!dbExists) {
                console.log('Creating tables...');
                createTables();
            }
        }
    });
}

async function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log('Close the database connection.');
            resolve();
        });
    });
}
// create sqlite tables
async function createTables() {
    try {
        for (const query of queries) {
            await runSqlite(query.sql);
            console.log(`Table '${query.name}' created or already exists.`);
        }
        console.log('All tables created successfully.');

        for (const view of views){
            await runSqlite(view.sql);
            console.log(`View '${view.name}' created.`)
        }
        console.log('All views created successfully.');

        await createAndInsertUsers();

        // let sql = "INSERT INTO `users` (`name`, `username`, `password`, `user_role`) SELECT 'Administrator', 'admin', '123456', 'admin' UNION ALL SELECT  'Local User', 'user', 'user', 'user' WHERE NOT EXISTS (SELECT 1 FROM `users`);"
        // await runSqlite(sql);

        console.log('Users Created Successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

async function createAndInsertUsers() {
    try {
        // Check if the table is empty
        const countResult = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        if (countResult === 0) {
            // Hash passwords
            const adminPasswordHash = await bcrypt.hash('123456', 10);
            const userPasswordHash = await bcrypt.hash('user', 10);

            // Prepared statement insert
            const insertSql = `
          INSERT INTO users (name, username, password, user_role)
          VALUES (?, ?, ?, ?), (?, ?, ?, ?)
        `;

            const params = [
                'Administrator', 'admin', adminPasswordHash, 'admin',
                'Local User', 'user', userPasswordHash, 'user',
            ];

            await runSqlite(insertSql, params); // Use your runSqlite function

            console.log('Initial users inserted.');
        } else {
            console.log('Table not empty, skipping user insertion.');
        }
    } catch (err) {
        console.error('Error inserting users:', err);
        throw err; // Rethrow to handle it in the calling function
    }
}

function getDb() {
    return db;
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    getDb,
    runSqlite,
    readSql,
    runSql,
};