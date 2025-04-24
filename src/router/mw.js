const jwt = require('jsonwebtoken');
const secretKey = 'ILoveIndia';// 'ILoveIndia';
const modal = require('../modal/modal');
const config = require('../modal/config');
const { registerConnection } = require('../modal/conn');
const log = console.log;
const maxAge = 1000 * 60 * 60 * 24 * 1 //milliseconds * seconds * minutes * hours * days * weeks * months
const verifiedUsers = new Map(); // Store verified users temporarily


const createToken = (user) => {
    if (user) {
        return jwt.sign(user, secretKey, { expiresIn: maxAge }); // '365d'
    } else return null;
}

const verifyToken = (token) => {
    let decodedToken = null;
    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                decodedToken = null
            } else {
                decodedToken = decoded
            }
        })
    }
    return decodedToken;
}

async function authorizeUser(req, res) {
    try {
        let rsp = await modal.loginUser(req);
        if (rsp.length > 0) {
            let user = rsp[0]; //log('user', user);
            const accessToken = createToken(user)
            if (accessToken) {
                res.clearCookie('EBSToken');
                res.cookie('EBSToken', accessToken, { httpOnly: true, maxAge, sameSite: 'Strict' });
                return res.json(true)
            } else {
                throw error
            }
        } else {
            res.json({ 'status': 'error', 'message': 'invalid credentials' })
        }
    } catch (error) {
        res.json(error)
    }
}

async function remoteAuthorizeUser(req, res) {
    try {
        let token = req.query.token;
        if (!token) throw "Unauthorized Access";
        let rsp = await modal.remoteLogin(token);
        if (rsp.length > 0) {
            let user = rsp[0];
            const accessToken = createToken(user);
            if (accessToken) {
                res.clearCookie('EBSToken');
                res.cookie('EBSToken', accessToken, { httpOnly: true, maxAge, sameSite: 'Strict' });
                return res.redirect('/apps')
            } else {
                throw error
            }
        } else {
            res.json('Unauthorized Access')
        }
    } catch (error) {
        res.json(error)
    }
}

async function authorizeAppUser(req, res) {
    try {
        let rsp = await modal.userLogin(req);
        if (!rsp) return res.json({ status: false, msg: 'Invalid/Missing Details!' });
        let { username, userid } = rsp;
        const encryptedToken = await modal.createEncryptedJWT(rsp);        
        // const decryptedPayload = await modal.decryptEncryptedJWT(encryptedToken); log(decryptedPayload);
        res.cookie('username', username, { maxAge, sameSite: 'Strict' });
        res.cookie('userid', userid, { maxAge, sameSite: 'Strict' });
        res.cookie('userrole', encryptedToken, {
            httpOnly: true, // Prevent client-side access
            // secure: true,   // Ensure transmission over HTTPS
            sameSite: 'Strict', // Prevent CSRF
            maxAge
        });
        return res.json({ status: true, msg: '' })
    } catch (error) {
        log(error);
        res.json(error);
    }
}

async function isAdmin(req, res, next) {
    try {
        if (!req.user) return res.redirect('/');
        const userrole = req.cookies.userrole;
        if (!userrole) return res.redirect('/login');
        const decryptedPayload = await modal.decryptEncryptedJWT(userrole);
        return res.json(decryptedPayload.userrole === 'admin');
    } catch (error) {
        log(error);
    }
}

async function setapp(req, res, next) {
    const url = req.path;
    if (!req.user) return res.redirect('/');
    if (!url == '/setapp') return next();
    let { app_id, trade } = req.body; //log(req.body);
    if (!app_id) return res.json(false);
    let ver = await modal.getVersion(req); //log(ver, ver?.version);
    let version = await modal.encyptVersion(ver); //log(encVer);
    let store_id = app_id.substring(0, 8);
    let encypToken = await modal.connectEncypSession(app_id); //log(encypToken);
    if (!encypToken) return res.json(false);
    // modal.registerConnection(encypToken);
    registerConnection(encypToken);
    res.cookie('version', version, { httpOnly: true, maxAge, sameSite: 'Strict' });
    res.cookie('ecnstr', encypToken, { httpOnly: true, maxAge, sameSite: 'Strict' });
    res.cookie('app_id', app_id, { maxAge, sameSite: 'Strict' });
    res.cookie('app_name', trade, { maxAge, sameSite: 'Strict' });
    res.cookie('store_id', store_id, { maxAge, sameSite: 'Strict' });
    // let cnstrToken = await modal.connectSession(app_id);
    // res.cookie('app_id', app_id, { httpOnly: true, maxAge, sameSite: 'Strict' });
    res.json(true);
    next();
}

function authGetRoutes(req, res, next) {
    const token = req.cookies.EBSToken;
    if (!token) {
        if (req.method === 'GET' && req.originalUrl !== '/signout') {
            res.cookie('lastPage', req.originalUrl, { httpOnly: true });
        }
        return next();
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) { return next(); }
        next();
    });
}

function authenticateToken(req, res, next) {
    const token = req.cookies.EBSToken;
    if (!token) { return next(); }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) { return next(); }
        req.user = decoded;
        req.cnstr = req.cookies.cnstr;
        req.body.client_id = decoded.client_id;
        res.cookie('user_id', req.user.id, { maxAge, sameSite: 'lax' });
        let app_id = req.cookies.app_id;
        let app_name = req.cookies.app_name;
        if (app_id) req.body.ssid = app_id;
        if (app_name) req.body.app_name = app_name;
        next();
    });
}

function isLoggedIn(req, res, next) {
    if (!req.user) return res.redirect('/');
    next();
}

function authenticate(req, res, next) {
    try {
        if (req.user) {
            let { ssid, app_name } = req.body; //log(ssid);
            if (!ssid) { return res.redirect('/apps') };
            if (!req.cookies.username) { return res.redirect('/login') }
            if (app_name) res.locals.trade = app_name;
            next();
        } else return res.redirect('/');
    } catch (error) {
        log(error);
    }
}

async function restrictVersion(req, res, next) {
    try {
        let token = req.cookies.version;
        let { version } = await modal.decryptVersion(token);
        const pages = ['dues', 'purch', 'supplier', 'bnkpymts', 'gr', 'notes', 'emp', 'users'];
        const path = req.path.toLowerCase(); //log(path);
        if (pages.some(page => path.includes(`/apps/app/${page}`)) && version === 'basic') {
            return res.status(403).json({ error: 'Upgrade to Pro to access this page' });
        }
        next();
    } catch (error) {
        log(error);
    }
}

function authorize(req, res, next) {
    try {
        if (req.user) {
            let { ssid, app_name, username } = req.body; //log(ssid);
            if (!ssid) { return res.redirect('/apps') };
            if (!username) { return res.redirect('/login') }
            if (app_name) res.locals.trade = app_name;
            next();
        } else return res.redirect('/');
    } catch (error) {
        log(error);
    }
}

function listApps(req, res, next) {
    try {
        let url = req.path;
        if (!req.user) { return res.json(false); }
        next();
    } catch (error) {
        log(error);
        next();
    }
}

function logout(req, res) {
    res.clearCookie('username');
    res.clearCookie('userrole');
    res.clearCookie('version');
    res.redirect('/login');
}

function signout(req, res) {
    res.clearCookie('EBSToken');
    res.clearCookie('client_id');
    res.clearCookie('app_id');
    res.clearCookie('app_name');
    res.clearCookie('user_id');
    res.clearCookie('version');
    res.clearCookie('ecnstr');
    res.clearCookie('store_id');
    res.clearCookie('userid');
    res.clearCookie('username');
    res.clearCookie('userrole');
    res.redirect('/start');
}

function toTitleCaseIfLowerCase(str) {
    if (str === str.toLowerCase()) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
}

async function sanatizeData(req, res, next) {
    try {
        const url = req.path; //log(url);
        if (url === '/api/crud/create/stock') {
            if (!req.body.data.product) throw 'Column product cannot be blank'
            // let sku = await modal.newSKU(req);
            let sku = modal.newDynamicSKU(req.body.ssid); //log(sku);
            // let rsp = await modal.getClassicSku();
            // let sku = rsp?.sku || modal.newDynamicSKU(req.body.ssid);
            if (!sku) { return res.end('Invalid SKU') }
            if (req.body.data.pcode) req.body.data.pcode = req.body.data.pcode.toUpperCase();
            if (req.body.data.size) req.body.data.size = req.body.data.size.toUpperCase();
            if (req.body.data.unit) req.body.data.unit = req.body.data.unit.toUpperCase();
            if (req.body.data.upc) req.body.data.upc = req.body.data.upc.toUpperCase();
            if (req.body.data.color) req.body.data.color = req.body.data.color.toUpperCase();
            req.body.data.sku = sku;
        };

        if (url === '/api/crud/update/stock') {
            if (!req.body.data.product) throw 'Column product cannot be blank'
            if (req.body.data.upc) req.body.data.upc = req.body.data.upc.toUpperCase();
            if (req.body.data.size) req.body.data.size = req.body.data.size.toUpperCase();
            if (req.body.data.unit) req.body.data.unit = req.body.data.unit.toUpperCase();
            if (req.body.data.color) req.body.data.color = req.body.data.color.toUpperCase();
            if (req.body.data.pcode) req.body.data.pcode = req.body.data.pcode.toUpperCase();
        };

        if (url === '/api/crud/create/party') {
            if (!req.body.data.party_name) throw 'Party Name cannot be blank !';
            let party_id = await modal.newPartyID(req);
            if (!party_id) { return res.end('Invalid Details') }
            if (!req.body.data.reg_date) req.body.data.reg_date = config.sqlDate();
            let party_name = toTitleCaseIfLowerCase(req.body.data.party_name);
            if (req.body.data.email) req.body.data.email = req.body.data.email.toLowerCase();
            req.body.data.party_name = party_name;
            req.body.data.party_id = party_id;
        }

        if (url === '/api/crud/update/party') {
            if (!req.body.data.party_name) throw 'Party Name cannot be blank !';
            if (!req.body.data.reg_date) req.body.data.reg_date = config.sqlDate();
            let party_name = toTitleCaseIfLowerCase(req.body.data.party_name);
            if (req.body.data.email) req.body.data.email = req.body.data.email.toLowerCase();
            req.body.data.party_name = party_name;
        }

        if (url === '/api/crud/create/supplier') {
            if (!req.body.data.supplier_name) throw 'Supplier Name cannot be blank !';
            let sup_id = await modal.newSupplierID(req); //log(sup_id);
            if (!sup_id) { return res.end('Invalid Details') }
            if (req.body.data.email) req.body.data.email = req.body.data.email.toLowerCase();
            if (req.body.data.gst_number) req.body.data.gst_number = req.body.data.gst_number.toUpperCase();
            req.body.data.supplier_name = req.body.data.supplier_name.toUpperCase();
            req.body.data.sup_id = sup_id;
        }

        if (url === '/api/crud/update/supplier') {
            if (!req.body.data.supplier_name) throw 'Supplier Name cannot be blank !';
            if (!req.body.data.reg_date) req.body.data.reg_date = config.sqlDate();
            if (req.body.data.email) req.body.data.email = req.body.data.email.toLowerCase();
            if (req.body.data.gst_number) req.body.data.gst_number = req.body.data.gst_number.toUpperCase();
            req.body.data.supplier_name = req.body.data.supplier_name.toUpperCase();
        }

        if (url === '/api/crud/create/payments') {
            // if(!req.body.data.party) throw 'party is Required to Add Payment';
            if (!req.body.data.amount) throw 'Payment Amount Cannot be Empyt';
            if (!req.body.data.pymt_date) req.body.data.pymt_date = config.sqlDate();
        }

        next();
    } catch (error) {
        log(error);
        res.end(error);
    }
}

const isPasswordVerified = (req, res, next) => {
    const userId = req.user.id;
    const expiration = verifiedUsers.get(userId);
    if (expiration && Date.now() < expiration) {
        return next();
    }
    // Remove expired verification
    verifiedUsers.delete(userId);
    res.redirect('/apps');
};

async function vefifyPassword(req, res, next) {
    const { password } = req.body;
    let match = await modal.verifyPassword(req);
    let userId = req.user.id;
    if (match) {
        verifiedUsers.set(userId, Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        // return res.redirect('/settings');
        res.json(true);
    }
    next();
}


module.exports = {
    authorizeUser, authorizeAppUser, setapp, logout, signout, authenticate, authenticateToken, sanatizeData, listApps, isLoggedIn, authorize, vefifyPassword, isPasswordVerified, isAdmin, authGetRoutes, remoteAuthorizeUser, restrictVersion
}