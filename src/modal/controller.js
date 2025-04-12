const modal = require('./modal');
const log = console.log;


async function action(req, res, modal) {
    try {
        let rs = await modal(req);
        res.json(rs)
    } catch (error) {
        res.json(error)
    }
}


function listApps(req, res) { action(req, res, modal.listApps) }
function appUsersList(req, res) { action(req, res, modal.appUsersList) }
function advanceQuery(req, res) { action(req, res, modal.advanceQuery) }
function localQuery(req, res) { action(req, res, modal.localQuery) }
function createRecord(req, res) { action(req, res, modal.createRecord) }
function updateRecord(req, res) { action(req, res, modal.updateRecord) }
function ulAWS(req, res) { action(req, res, modal.ulAWS) }
function dlAWS(req, res) { action(req, res, modal.dlAWS) }
function sendActivation(req, res) { action(req, res, modal.sendActivation) }
function activateEmail(req, res) { action(req, res, modal.activateEmail) }
function changePassword(req, res) { action(req, res, modal.changePassword) }
function register(req, res) { action(req, res, modal.register) }
function getActiveEmail(req, res) { action(req, res, modal.getActiveEmail) }
function sendAuthCode(req, res) { action(req, res, modal.sendAuthCode) }
function sendPasswordResetCode(req, res) { action(req, res, modal.sendPasswordResetCode) }
function resetUserPassword(req, res) { action(req, res, modal.resetUserPassword) }
function createOrder(req, res) { action(req, res, modal.createOrder) }
function encrypt(req, res) { action(req, res, modal.encrypt) }
function setClassicSKU(req, res) { action(req, res, modal.setClassicSKU) }
function setDynamicSKU(req, res) { action(req, res, modal.setDynamicSKU) }
function bulkEdit(req, res) { action(req, res, modal.bulkEdit) }
function resetSchema(req, res) { action(req, res, modal.resetSchema) }
function restLocalAppAdminPwd(req, res) { action(req, res, modal.restLocalAppAdminPwd) }
function userResctictions(req, res) { action(req, res, modal.userResctictions) }
function emailOrder(req, res) { action(req, res, modal.emailOrder) }
function importPartys(req, res) { action(req, res, modal.importPartys) }
function searchStock(req, res) { action(req, res, modal.searchStock) }
function getVersion(req, res) { action(req, res, modal.getVersion) }
function shortUrl(req, res) { action(req, res, modal.shortUrl) }
function holdOrder(req, res) { action(req, res, modal.holdOrder) }

module.exports = {
    listApps,
    advanceQuery,
    localQuery,
    createRecord,
    updateRecord,
    dlAWS,
    ulAWS,
    sendActivation,
    activateEmail,
    changePassword,
    register,
    getActiveEmail,
    sendPasswordResetCode,
    resetUserPassword,
    createOrder,
    encrypt,
    setClassicSKU,
    setDynamicSKU,
    bulkEdit,
    resetSchema,
    appUsersList,
    sendAuthCode,
    restLocalAppAdminPwd,
    userResctictions,
    emailOrder,
    importPartys,
    searchStock,
    getVersion,
    shortUrl,
    holdOrder,
};