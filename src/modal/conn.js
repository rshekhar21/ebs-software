const log = console.log;
const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron'); //log(app); // Import electron's app module
const mysql = require('mysql2');
const { decryptEncryptedJWT } = require('./utils');


let epool;   // User-specific pool

// Function to get the base data path (userData in Electron, local-data otherwise)
function getBaseDataPath() {
    return app ? app.getPath('userData') : path.join(__dirname);
}

// Function to get the path to conn.json in userData/myebs
function getConnFilePath() {
    return path.join(getBaseDataPath(), 'myebs', 'conn.json');
}

// Function to ensure the 'myebs' directory exists
async function ensureMyebsDirExists() {
    const myebsPath = path.join(getBaseDataPath(), 'myebs');
    try {
        await fs.ensureDir(myebsPath);
        console.log('myebs directory created or already exists:', myebsPath);
    } catch (error) {
        console.error('Error ensuring myebs directory exists:', error);
    }
}

// Function to save the user-specific connection object to conn.json
async function saveConnectionObject(connectionObject) {
    await ensureMyebsDirExists();
    const filePath = getConnFilePath();
    try {
        await fs.writeJson(filePath, connectionObject, { spaces: 4 });
        console.log('User connection object saved to:', filePath);
        // Re-initialize the user-specific pool after saving
        await initializeUserPool();
        return true;
    } catch (error) {
        console.error('Error saving user connection object:', error);
        return false;
    }
}

// Function to load the user-specific connection configuration and create the epool
async function initializeUserPool() {
    const filePath = getConnFilePath(); //log(50, filePath);
    try {
        const conn = await fs.readJson(filePath); //log(conn);
        if (conn?.host) {
            epool = mysql.createPool(conn);
            console.log('User-specific MySQL pool initialized.');
        } else {
            console.warn('User connection configuration in conn.json is invalid or missing.');
            epool = null;
        }
    } catch (error) {
        console.warn('Error reading user conn.json or invalid JSON:', error.message);
        epool = null;
    }
}

async function registerConnection(ecnstr) {
    try {
        let cnstr = await decryptEncryptedJWT(ecnstr);
        cnstr.waitForConnections = true;
        cnstr.connectionLimit = 10;
        cnstr.queueLimit = 0;
        cnstr.charset = 'utf8mb4';
        
        await saveConnectionObject(cnstr); // Save to userData
    } catch (error) {
        console.error('Error registering connection:', error);
        // Handle the error appropriately (e.g., log, send error to client)
    }
}

async function queryUserDb(sql, values = []) {
    if (!epool) {
        console.warn('User-specific MySQL pool is not initialized.');
        return Promise.reject('User-specific MySQL pool is not initialized.');
    }
    return new Promise((resolve, reject) => {
        epool.query(sql, values, (err, rows, fields) => {
            if (err) return reject(err.message);
            resolve(rows, fields);
        });
    });
}

// Initialize the user pool on backend start
initializeUserPool();

module.exports = {
    queryUserDb,
    registerConnection,
    getConnectionConfig: async () => {
        await ensureMyebsDirExists();
        const filePath = getConnFilePath(); //log(filePath);
        try {
            return await fs.readJson(filePath);
        } catch (error) {
            console.warn('Error reading user conn.json:', error.message);
            return null;
        }
    },
};