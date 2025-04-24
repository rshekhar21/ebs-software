const express = require('express');
const router = express.Router();
const path = require('path');
const log = console.log;
const mw = require('./mw');
const ctrl = require('../modal/controller');
const upload = require('./multer');
const crypto = require('crypto');

const axios = require('axios');

const checkInternetConnection = async (req, res, next) => {
    try {
        // Attempt a simple request to a well-known internet address (e.g., Google)
        const response = await axios.get('https://www.google.com'); //log(response);

        // If the request is successful, internet connection is available
        next();
    } catch (error) {
        // If the request fails, internet connection is likely unavailable
        // console.error('No internet connection:', error);
        // res.status(500).render('No internet connection');
        res.render('offline')
    }
};

// USE
router.use('/', mw.authenticateToken);
// router.use('/', checkInternetConnection);

router.get("/crypto-test", (req, res) => {
    try {
        const cipher = crypto.createCipheriv("aes-256-gcm", crypto.randomBytes(32), crypto.randomBytes(12));
        res.send("Crypto is working fine in Node.js!");
    } catch (error) {
        res.status(500).send("Crypto Error: " + error.message);
    }
});

// RENDER
// router.get('/', (req, res) => { if (req.user) { return res.redirect('/apps') } res.render('index') });
router.get('/start', (req, res) => {
    if (req.user) {
        if(req.cookies?.ecnstr && req.cookies?.app_id) return res.redirect('/apps/app');
        return res.redirect('/apps') 
    };
    let uid = req.query?.uid || null
    res.render('index', { uid });
});
router.get('/authorizing', mw.remoteAuthorizeUser, (req, res) => res.render('auth'));
router.get('/login', mw.isLoggedIn, (req, res) => { res.render('login') });
router.get('/apps', mw.isLoggedIn, (req, res) => res.render('apps'));
router.get('/apps/*', mw.authenticate, mw.restrictVersion);
router.get('/apps/app', (req, res) => { res.render('home') });
router.get('/apps/app/orders/create/:xyx?', (req, res) => { res.render(`order`) });
router.get('/apps/app/party/ledger', (req, res) => res.render('ledger'));
router.get('/apps/app/supplier/ledger', (req, res) => res.render('history'));
router.get('/apps/app/:url', (req, res) => { res.locals.script = req.params.url, res.render(`page`) });
router.get('/apps/order/:page', (req, res) => { res.render(`view/${req.params.page}`) });
router.get('/ebs/:blank?', (req, res) => res.render('blank'));
router.get('/settings', mw.isLoggedIn, mw.isPasswordVerified, (req, res) => { res.render('settings') });
router.get('/view/order/format/:format', mw.authenticate, (req, res) => { res.render(`view/${req.params.format}`) });

// GET
router.get('/listapps', mw.listApps, ctrl.listApps);
router.get('/users-list', mw.isLoggedIn, ctrl.appUsersList);
router.get('/active-email', ctrl.getActiveEmail);
router.get('/apps/is-admin', mw.isAdmin);
router.get('/apps/user-roles');
router.get('/version', ctrl.getVersion);

router.get('/logout', mw.logout);   // uesr logout (admin/user)
router.get('/signout', mw.signout); // main signout

router.get('/test1', (req, res) => {
    const data = {
        product: "TSHIRT",
        size: null,  // Ensure null is sent as null
        unit: "PCS",
        price: "800.00",
        qty: "1.000",
        disc: null,
        tax: "40.00",
        gst: "5.00",
        amount: "840.00",
        disc_val: null,
        disc_per: null
    };
    res.json(data);  // Send data as JSON
})

router.get('/test', (req, res) => {
    log('ok');
    log(req?.query);
    res.redirect('/start')
    // res.render('index')
    // return res.json('ok');
})

router.get('/getsku', ctrl.getClassicSku);

// Catch-all route for any other GET requests
router.get('*', (req, res) => {
    res.redirect('/'); // Redirect to the home page
});


// POST
router.post('/login', mw.authorizeUser);
router.post('/remotelogin', mw.remoteAuthorizeUser);
router.post('/app-login', mw.authorizeAppUser);
router.post('/setapp', mw.setapp);
router.post('/register', ctrl.register);
router.post('/api/*', mw.authenticate);
router.post('/api/url', ctrl.shortUrl);
router.post('/api/localquery', ctrl.localQuery);
router.post('/api/advancequery', ctrl.advanceQuery);
router.post('/api/set-classic-sku', ctrl.setClassicSKU);
router.post('/api/set-dynamic-sku', ctrl.setDynamicSKU);
router.post('/api/crud/create/:table/:multi?', mw.sanatizeData, ctrl.createRecord);
router.post('/api/crud/update/:table', mw.sanatizeData, ctrl.updateRecord);
router.post('/api/create/order', ctrl.createOrder);
router.post('/api/search-stock', ctrl.searchStock);
router.post('/api/update/pwd', ctrl.changePassword);
router.post('/api/encrypt', ctrl.encrypt);
router.post('/aws/upload', ctrl.ulAWS)
router.post('/aws/download', ctrl.dlAWS)
router.post('/api/bulk-edit', ctrl.bulkEdit);
router.post('/api/reset/schema', ctrl.resetSchema);
router.post('/api/email/order', ctrl.emailOrder);
router.post('/api/hold-order', ctrl.holdOrder);
router.post('/api/edit/stock', ctrl.inlineEditStock);
router.post('/getuserpwdresetcode', ctrl.sendPasswordResetCode);
router.post('/reset-user-password', ctrl.resetUserPassword);
router.post('/verify-password', mw.isLoggedIn, mw.vefifyPassword);
router.post('/email', mw.isLoggedIn, ctrl.sendActivation);
router.post('/email/activate', mw.isLoggedIn, ctrl.activateEmail);
router.post('/email/send-authcode', mw.isLoggedIn, ctrl.sendAuthCode);
router.post('/rest-admin-pwd', mw.isLoggedIn, ctrl.restLocalAppAdminPwd);
router.post('/apps/user-restriction', ctrl.userResctictions);

// router.post('/api/upload/partys', function (req, res, next) { req.ebs = req.body, next() }, upload.single('file'), ctrl.importPartys);
router.post('/api/import/partys', ctrl.importPartys)
router.post('/api/upload/file', upload.single('file'), (req, res) => {
    if (!req.filename) { return res.json({ status: false, message: 'No file uploaded' }) }
    res.json({ status: true, filename: req.filename, message: 'File uploaded successfully' })
});


module.exports = router;