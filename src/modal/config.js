const log = console.log;
const path = require('path');
const mysql = require('mysql2');
const fse = require('fs-extra');
const { create, update, views } = require('./fields');
// const conn = require('./myebs/conn.json'); //log(conn[0].ssid)

const cs = {
    host: 'myebs.in',
    port: '3306',
    user: 'master',
    password: '269608Raj$',
    database: 'ebs_clients',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
}

const pool = mysql.createPool(cs); //log('cs', cs)
function runSql(sql, values = []) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, values, (err, rows, fields) => {
            if (err) {
                return reject(err.message)
            }
            return resolve(rows, fields)
        })
    })
}

// let epool;
// if (conn?.host) {
//     epool = mysql.createPool(conn);
// }

// function querySql(sql, values = []) {
//     if(!conn?.host) return;
//     return new Promise(function (resolve, reject) {
//         try {
//             epool.query(sql, values, (err, rows, fields) => {
//                 if (err) {
//                     return reject(err.message);
//                 }
//                 return resolve(rows, fields); // Return an object with rows and fields
//             });
//         } catch (error) {
//             // Catch any synchronous errors that might occur
//             return reject(error.message);
//         }
//     });
// }

function readQuery(fileName, queryType = 'r') {
    try {
        if (!fileName) throw 'invalid/missing filename';
        let type = queryType === 'r' ? 'read' : 'create';
        let filePath = path.join(__dirname, 'sql', type, fileName + '.sql');
        return fse.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
    } catch (error) {
        log('config@37', error);
        return false;
    }
}

function trimValues(obj) {
    //this function trims object values and return an array named values
    try {
        const entity = 1;
        let values = [];
        if (typeof obj === 'object') {
            for (v in obj) {
                if (typeof obj[v] === 'string') {
                    obj[v] = obj[v].trim();
                }
                if (obj[v] === '') obj[v] = null;
            }
            if (!obj.entity) { obj.entity = entity; } // ensure to insert entity
            values.push(obj);
            return values
        } else return false

    } catch (error) {
        log(error);
        return false;
    }
}

function createSqlStmt(table, type = 'c') {
    if (!table) return false;
    let stmt = '';
    // insert statement
    if (type.toLowerCase() == 'c') {
        let stk = create[table];
        let sql = '', val = '';
        for (let k of stk) { sql = sql + '`' + k + '`,'; val = k == 'password' ? val + 'MD5(?),' : val + '?,' }
        sql = sql.slice(0, -1);
        val = val.slice(0, -1);
        stmt = `INSERT INTO \`${table}\`(${sql}) VALUES(${val})`;
    }

    // update statement
    if (type.toLowerCase() == 'u') {
        let stk = update[table];
        let sql = '';
        for (let k of stk) { if (k != 'id') { sql = sql + '`' + k + '`=?,' } }
        sql = sql.slice(0, -1);  //log(sql)
        stmt = `UPDATE \`${table}\` SET ${sql} WHERE id = ?`;
    }
    return stmt;
}

// createUpdateStmt(`stock`);
function createUpdateStmt(table, obj) {
    try {
        // let obj = { product: 'EBS SERVER', pcode: 'SVR', mrp: '123465', id: '150' } 
        let arr = update['stock']; //log(arr);
        let ar = [];
        for (let k of arr) {
            if (obj[k]) {
                let ox = {};
                ox.key = k;
                ox.value = obj[k];
                ar.push(ox);
            }
        }
        let str = `UPDATE \`${table}\` SET`;
        for (let k of ar) {
            if (k.key != 'id') {
                str += ` \`${k.key}\`='${k.value}',`
            } else {
                str = str.slice(0, -1); //log(str)
                str += ` WHERE \`id\` = ${k.value};`;
            }
        }
        return str;
    } catch (error) {
        log(error);
        return false
    }
}

function sqlDate() {
    let date = new Date;
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
}

function formatDate(isoString) {
    let date;
    if (!isoString || isNaN(Date.parse(isoString))) {
        date = new Date();
    } else {
        date = new Date(isoString);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function bulkInsertParty1(req) {
    try {
        const { ssid, cnstr, filename } = req.body;
        const filePath = path.join(__dirname, '..', 'folder', filename); //log(filePath);
        const pd = require(filePath); //log('pd', pd.length);
        const connection = require('./connect');
        const remoteQry = new connection(cnstr);
        let qry = 'select max(id) id from party;';
        let [rsp] = await remoteQry.execute(qry); //log(rsp.id); //return 'ok';
        // let sql = "insert into party ( `party_id`,`reg_date`,`party_type`,`title`,`party_name`,contact,`email`,`company`,`gender`,`gst_number`,`birthday`,`aadhaar`,`address`,`city`,`pincode`,`state`, `rewards`, `enable_rewards`, `opening_bal`, `user_id` ) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );"
        let str = '';
        let i = 1;
        for (let k in pd) {
            let party_id = pd[k].party_id || rsp.id + i + 100; log(i, 'party_id', party_id, pd[k].rewards);
            let reg_date = formatDate(pd[k].reg_date); //log(reg_date);
            // let values = [party_id, reg_date, pd[k].party_type, pd[k].title || null, pd[k].party_name || 'Special', pd[k].contact || null, pd[k].email || null, pd[k].company || null, pd[k].gender, pd[k].gst_number || null, pd[k].birthday || null, '', pd[k].address || '', pd[k].city || '', pd[k].pincode || null, pd[k].state || null, pd[k].rewards, pd[k].opening_bal, 1]; //log(values);
            // // await remoteQry.execute(sql, values);

            str += `(
            '${party_id}', '${reg_date}', 
            ${pd[k].party_type ? `'${pd[k].party_type}'` : `'Customer'`}, 
            ${pd[k].title ? `'${pd[k].title}'` : null}, 
            ${pd[k].party_name ? `'${pd[k].party_name}'` : `'Special'`}, 
            ${pd[k].contact ? `'${pd[k].contact}'` : null}, 
            ${pd[k].email ? `'${pd[k].email}'` : null}, 
            ${pd[k].company ? `'${pd[k].company}'` : null}, 
            ${pd[k].gender ? `'${pd[k].gender}'` : null}, 
            ${pd[k].gst_number ? `'${pd[k].gst_number}'` : null}, 
            ${pd[k].birthday ? `'${pd[k].birthday}'` : null}, 
            ${pd[k].address ? `'${pd[k].address}'` : null}, 
            ${pd[k].city ? `'${pd[k].city}'` : null}, 
            ${pd[k].pincode ? `'${pd[k].pincode}'` : null}, 
            ${pd[k].state ? `'${pd[k].state}'` : null}, 
            ${pd[k].rewards ? `'${pd[k].rewards}'` : null}, 
            ${pd[k].enable_rewards ? `${pd[k].enable_rewards}` : 0}, 
            ${pd[k].opening_bal ? `'${pd[k].opening_bal}'` : `'0.00'`}, 
            1),`;
            i++;
        }
        let strsql = "INSERT INTO party ( `party_id`,`reg_date`,`party_type`,`title`,`party_name`,contact,`email`,`company`,`gender`,`gst_number`,`birthday`,`aadhaar`,`address`,`city`,`pincode`,`state`, `rewards`, `enable_rewards`, `opening_bal`, `user_id` ) VALUES ";
        str = strsql + str.slice(0, -1);
        await remoteQry.execute(sql);
        return true;
    } catch (error) {
        throw error;
    }
}

async function insertData(jsonData, tableName, chunkSize = 250) {
    try {
        const data = JSON.parse(jsonData);

        if (data.length <= chunkSize) {
            // Insert all data in a single query
            const values = data.map(row => Object.values(row));
            const sql = `INSERT INTO ${tableName} (a, b, c) VALUES ?`;
            await connection.execute(sql, [values]);
        } else {
            // Insert data in chunks
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                const values = chunk.map(row => Object.values(row));
                const sql = `INSERT INTO ${tableName} (a, b, c) VALUES ?`;
                await connection.execute(sql, [values]);
            }
        }

        console.log('Data inserted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await connection.end();
    }
}

async function bulkInsertParty(req) {
    try {
        const { ssid, cnstr, filename } = req.body; //log(cnstr); return true;
        const filePath = path.join(__dirname, '..', 'folder', filename); //log(filePath);
        const pd = require(filePath); log('pd', pd.length);
        const connection = require('./connect');
        const remoteQry = new connection(cnstr);

        let qry = `select max(id) id from party;`;
        let [rsp] = await remoteQry.execute(qry); //log(rsp.id); //return 'ok';


        const CHUNK_SIZE = 300; // Adjust this as needed
        let chunkCount = Math.ceil(pd.length / CHUNK_SIZE);
        const sql = `INSERT INTO party (party_id, reg_date, party_type, title, party_name, contact, email, company, gender, gst_number, birthday, address, city, pincode, state, rewards, reward_percent, enable_rewards, opening_bal, user_id) VALUES ?`;

        const conn = mysql.createConnection(cnstr);
        for (let chunk = 0; chunk < chunkCount; chunk++) {
            const chunkData = pd.slice(chunk * CHUNK_SIZE, (chunk + 1) * CHUNK_SIZE);
            const values = chunkData.map((party, i) => [
                party?.party_id || rsp.id + chunk * CHUNK_SIZE + 100 + i,
                formatDate(party.reg_date),
                party?.party_type || 'Customer',
                party?.title || null,
                party?.party_name || 'Special',
                party?.contact || null,
                party?.email || null,
                party?.company || null,
                party?.gender || null,
                party?.gst_number || null,
                party?.birthday || null,
                party?.address || null,
                party?.city || null,
                party?.pincode || null,
                party?.state || null,
                party?.rewards || null,
                party?.reward_percent || 1,
                party?.enable_rewards || 1,
                party?.opening_bal || '0.00',
                1, // Assuming user_id is always 1
            ]);
            // log(chunk);
            await remoteQry.query(sql, [values]);
        }

        return true;
    } catch (error) {
        throw error;
    }
}

// test().then(d=>log(d)).catch(e=>log(e));
async function test() {
    try {

        let cnstr = {
            host: 'myebsserver.in',
            port: '3306',
            user: 'sa_demo',
            password: '269608Raj$',
            database: 'db_demo'
        }

        const connection = require('./connect');
        const remoteQry = new connection(cnstr);

        const sql = `INSERT INTO party (party_id, reg_date, party_type, title, party_name, contact, email, company, gender, gst_number, birthday, address, city, pincode, state, rewards, enable_rewards, opening_bal, user_id) VALUES ?`;

        let values = [
            [
                '101', '2024-07-09',
                'Customer', 'Mr',
                'ABCD10', null,
                null, null,
                null, null,
                null, null,
                null, null,
                null, null,
                1, '0.00',
                1
            ],
            [
                '102', '2024-07-09',
                'Customer', 'Ms',
                'ABCD11', null,
                null, null,
                null, null,
                null, null,
                null, null,
                null, 2500,
                1, '6000.25',
                1
            ]
        ];

        const conn = mysql.createConnection(cnstr);

        // conn.query(sql, [values], function(err) {
        //     if (err) throw err;
        //     conn.end();
        // });

        // let rs = await remoteQry.execute(sql, [values]); log(rs);

    } catch (error) {
        log(error);
    }
}


module.exports = { runSql, readQuery, trimValues, createSqlStmt, create, update, views, createUpdateStmt, sqlDate, bulkInsertParty }