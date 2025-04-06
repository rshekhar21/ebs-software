const express = require('express');
const router = express.Router();
const log = console.log;
const ctrl = require('../modal/controller');

router.get('/', (req, res)=>{ res.render('shared')});
router.get('/print', (req, res)=>{ res.render('print')});
// Catch-all route for any other GET requests
// router.get('*', (req, res) => {
//     res.redirect('/order'); // Redirect to the home page
// });

router.post('/aws/download', ctrl.dlAWS);
module.exports = router;


