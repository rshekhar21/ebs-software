// online
// import 'https://code.jquery.com/jquery-3.6.1.min.js';
// import 'https://code.jquery.com/ui/1.12.1/jquery-ui.js';
// import 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
// import 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
// import 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

// offline
import '/js/_lib/jquery-3.6.1.js';
import '/js/_lib/jquery-ui.js';
import '/js/_lib/axios.min.js';
import '/js/_lib/chart.umd.min.js';

import sqlfields from './sqlfields.js';
import IndexedDB from './indexdb.modified.js';
import temp from './temps.js';

const help = {};
export default help;
export const log = console.log;
export const doc = document;
export const jq = jQuery;
export const axios = window.axios;
export const moment = window.moment;
export const xdb = IndexedDB;
export const currency = localStorage.getItem('currency') || 'en-IN';
export const path = window.location.pathname;
export const trade_name = getCookie('app_name');
export const user_id = getCookie('user_id');
export const cuid = getCookie('userid');
export const cuser = getCookie('username');
export const store_id = getCookie('store_id'); //log(store_id)
export const app_id = getCookie('app_id'); //log(app_id)
export const back = () => { window.history.back() }
export const roundOff = num => Math.round((num + Number.EPSILON) * 100) / 100;
export const qs = (selector) => { return document.querySelector(selector) };
export const qsa = (selector) => { return document.querySelectorAll(selector) };

function isFirefox() { return navigator.userAgent.toLowerCase().indexOf('mozilla') > -1 }

function validateNumberInput(event) {
    if (isFirefox()) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) { event.preventDefault(); }
    }
}

// Attach the event listener to all number input fields
const numberInputs = document.querySelectorAll('input[type="number"]');
// numberInputs.forEach(input => { input.addEventListener('keypress', validateNumberInput) });

help.roundOff = num => Math.round((num + Number.EPSILON) * 100) / 100;
help.back = back;
help.user_id = user_id;
// doc.title = 'EBS';
help.myIndexDBName = myIndexDBName;

doc.qs = function (selector) { return this.querySelector(selector) };
Element.prototype.ael = function (event, callback) { this.addEventListener(event, callback) };

// Function to encrypt the query parameter
export function encrypt(text, secretKey) { return CryptoJS.AES.encrypt(text, secretKey).toString() }
export function myIndexDBName(dbname) { return `${storeId}_${dbname}` }

export function getSettings() { return Storage.get(storeId) || {} }

export function updateSettings(newSettigns) {
    try {
        // const store_id = Cookie.get('store_id');
        const storedSettings = Storage.get(store_id);
        const updateSettings = {
            ...storedSettings,
            ...newSettigns,
            customSizes: newSettigns?.customSizes !== undefined ? newSettigns.customSizes.length === 0 ? [] : [...storedSettings.customSizes, ...newSettigns.customSizes] : storedSettings.customSizes,
            discounts: newSettigns?.discounts !== undefined ? newSettigns.discounts.length === 0 ? [] : [...storedSettings.discounts, ...newSettigns.discounts] : storedSettings.discounts,
        }
        Storage.set(store_id, updateSettings);
    } catch (error) {
        log(error);
    }
}

export async function setAppID() {
    let entity = await getActiveEntity();
    updateSettings({ entity });
}

export const Storage = {
    set: (key, value) => { localStorage.setItem(key, JSON.stringify(value)) },
    get: (key) => {
        let obj = localStorage.getItem(key) || null;
        return obj !== "undefined" ? JSON.parse(obj) : null;
    },
    delete: (key) => { localStorage.removeItem(key) },
}
help.Storage = Storage;

export const LStore = {
    set: (key, value) => { localStorage.setItem(key, JSON.stringify(value)) },
    get: (key) => {
        let obj = localStorage.getItem(key) || null;
        // if(!obj) return null;
        // if (obj) return JSON.parse(obj);
        return obj ? JSON.parse(obj) : null;
    },
    delete: (key) => { localStorage.removeItem(key) },
}
help.LStore = LStore;

export const Cookie = {
    get: function (name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
};

export const storeId = Cookie.get('store_id');

// Example starter JavaScript for disabling form submissions if there are invalid fields
// (() => {
//     'use strict'

//     // Fetch all the forms we want to apply custom Bootstrap validation styles to
//     const forms = document.querySelectorAll('.needs-validation')

//     // Loop over them and prevent submission
//     Array.from(forms).forEach(form => {
//       form.addEventListener('submit', event => {
//         if (!form.checkValidity()) {
//           event.preventDefault()
//           event.stopPropagation()
//         }

//         form.classList.add('was-validated')
//       }, false)
//     })
//   })()

export function getCookie(cookieName) {
    const cookies = document.cookie.split('; ')
        .map(cookie => cookie.split('='))
        .reduce((accumulatedCookies, [name, value]) => ({
            ...accumulatedCookies,
            [name]: decodeURIComponent(value)
        }), {});
    return cookies[cookieName] || null;
}
help.getCookie = getCookie;

export const homePage = () => { window.location.href = '/apps/app' }
help.homePage = homePage;

Date.prototype.sqlDate = function () {
    let y = this.getFullYear();
    let m = this.getMonth();
    let d = this.getDate();
    m = (m + 1)
    return String(`${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`);
}

export function realDate(dateString) {
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const newDateString = `${day}-${month}-${year}`;
    return newDateString;
}
help.realDate = realDate;

let localecodes = {
    INR: 'en-IN',
    GBP: 'en-GB',
    USD: 'en-US',
    CAD: 'en-CA',
    AUD: 'en-AU',
    EUR: 'en-GB',
    JPY: 'ja-JP',
    RUB: 'ru-RU',
}

export const Months = [
    { month: 1, short: 'Jan', full: 'Janurary' },
    { month: 2, short: 'Feb', full: 'February' },
    { month: 3, short: 'Mar', full: 'March' },
    { month: 4, short: 'Apr', full: 'April' },
    { month: 5, short: 'May', full: 'May' },
    { month: 6, short: 'Jun', full: 'June' },
    { month: 7, short: 'Jul', full: 'July' },
    { month: 8, short: 'Aug', full: 'August' },
    { month: 9, short: 'Sep', full: 'September' },
    { month: 10, short: 'Oct', full: 'October' },
    { month: 11, short: 'Nov', full: 'November' },
    { month: 12, short: 'Dec', full: 'December' },
];
help.Months = Months;

export function confirmMsg(msg = 'Message') { return window.confirm(msg) }
help.confirmMsg = confirmMsg;

export function create(el) { if (el) { return doc.createElement(el) } }
help.create = create;

export function createEL(element) { if (element) return document.createElement(element); }
help.createEL = createEL;

export function pageHead({ title, viewSearch = true, ph = 'Search', spinner = true, viewTrade = true }) {
    try {
        let str = `
        <div class="container-md bg-light px-2 py-3 mb-2 rounded position-relative">
            <div class="d-flex jcb aic gap-2">
                <h6 class="mb-0">${title.toUpperCase()}</h6>
                <span class="custom-text"></span>
                <div class="spinner-border text-primary spinner-border-sm process ${spinner ? '' : 'd-none'}" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="d-none d-md-flex jce aic gap-2 ms-auto  me-5 quick-btns d-print-none"></div>
                <a href="/apps/app" class="nav-link text-uppercase text-primary fw-bold small ${viewTrade ? '' : 'd-none'}">${trade_name}</a>
            </div>
            <div class="search mt-2 d-print-none ${viewSearch ? '' : 'd-none'}">
                <input type="search" class="form-control" id="search" placeholder="${ph}">
            </div>
        </div>`;

        jq('body').prepend(str);

    } catch (error) {
        log(error);
    }
}
help.pageHead = pageHead;

export function formDataToJson({ formId, form }) {
    if (formId === null || form === null) return;
    const formEl = form ? form : document.getElementById(formId);
    const fd = new FormData(formEl);
    let object = {};
    for (let key of fd.keys()) {
        object[key] = fd.get(key);
    }
    return object
}
help.formDataToJson = formDataToJson;

export function fd2obj({ formId, form }) {
    if (formId === null || form === null) return;
    const formElement = form ? form : document.getElementById(formId);
    const inputs = formElement.querySelectorAll('input, textarea, select');
    const output = {};
    inputs.forEach(input => {
        const value = input.value.trim();
        output[input.name] = value;
    });
    return output;
}
help.fd2obj = fd2obj;

export function fd2json({ formId, form }) {
    if (formId === null || form === null) return;
    const formEl = form ? form : document.getElementById(formId);
    const fd = new FormData(formEl);
    const object = {};
    for (let key of fd.keys()) { object[key] = fd.get(key) }
    return object;
}
help.fd2json = fd2json;

export async function postData({ url, data }) {
    try {
        if (!url) throw 'Invalid/Missign URL';
        if (!data) throw 'Invalid/Missing Data';
        let res = await axios.post(url, data);
        return res;
    } catch (error) {
        log(error);
    }
}
help.postData = postData;

export async function getData(url) {
    try {
        if (!url) throw 'Invalid/Missign URL';
        let res = await axios.get(url);
        return res;
    } catch (error) {
        log(error);
        return [];
    }
}
help.getData = getData;

export async function quickData(url) {
    try {
        if (!url) throw 'Missing URL';
        let res = await axios.get(url);
        return res?.data || [];
    } catch (error) {
        log(error);
        return [];
    }
}
help.quickData = quickData;


export async function advanceQuery(obj) {
    try {
        if (!obj) throw ('invalid request');
        let res = await axios.post('/api/advancequery', { data: obj });
        return res;
    } catch (error) {
        log(error);
        return [];
    }
}
help.advanceQuery = advanceQuery;

export async function queryData(obj) {
    try {
        if (!obj) throw ('invalid request');
        let res = await axios.post('/api/advancequery', { data: obj });
        return res?.data || [];
    } catch (error) {
        log(error);
        return [];
    }
}
help.queryData = queryData;
window.queryData = queryData;

export async function localQuery(obj) {
    try {
        if (!obj) throw ('invalid request');
        let res = await axios.post('/api/localquery', { data: obj });
        return res;
    } catch (error) {
        return error;
    }
}
help.localQuery = localQuery;

export async function fetchTable(obj = {}, serial = true, fixhead = true, data = null) {
    if (!data) {
        let res = await queryData(obj);
        if (!res.length) return null;
        data = res;
    }
    jq('div.process').addClass('d-none');
    let tbl = createTable(data, serial, fixhead);
    return tbl
}
help.fetchTable = fetchTable;

export function createTable(data, serial = true, fixhead = true) {
    if (!data || !data.length) return false;
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    if (serial) {
        th.textContent = '#';
        th.dataset.key = 'serial';
        th.className = 'serial_no';
        tr.append(th)
    }
    for (let key in data[0]) {
        th = document.createElement('th');
        th.dataset.key = key
        th.innerHTML = key;
        th.className = 'text-uppercase';
        tr.append(th);
    }
    thead.append(tr);
    table.append(thead);
    // table.style.fontSize = '0.8rem';
    // table.id='dataTable';
    let tbody = document.createElement('tbody');
    for (let r in data) {
        tr = document.createElement('tr')
        if (serial) {
            let td = document.createElement('td');
            td.dataset.key = 'serial';
            td.className = 'serial_no'
            tr.append(td);
        }
        for (let k in data[r]) {
            let td = document.createElement('td');
            td.innerHTML = data[r][k];
            td.dataset.key = k
            tr.append(td);
        }
        tbody.append(tr);
    }
    table.append(tbody);
    jq(table).addClass('table table-sm css-serial table-hover tbl-custom');
    if (!serial) jq(table).removeClass('css-serial');
    if (fixhead) jq(thead).addClass('tbl-fixedhead');
    return { table, thead, tbody, data, tbl: { table, thead, tbody } };
}
help.createTable = createTable;

export function addTableColumnsTotal({ table, thead, tbody }, arr, showtotal = true, alignRight = false, parsetype = parseLocal) {
    let tf = doc.createElement('tfoot');
    let tr = doc.createElement('tr');
    jq(thead).find('th').each(function () {
        let th = doc.createElement('th');
        let v = this.textContent; //column name
        if (showtotal && v == '#') jq(th).text('TOTAL');
        th.dataset.key = v;
        if (arr.includes(v)) {
            let total = 0
            jq(tbody).find(`[data-key=${v}]`).each(function () {
                let val = parseNumber(this.textContent);
                if (val) {
                    total += val;
                    jq(th).text(parsetype(total));
                }
                jq(this).text(parsetype(this.textContent));
            })
        }
        tr.append(th);
    })
    jq(tf).addClass('').css({ 'border-top': '2px solid grey', 'border-bottom': '2px solid grey', 'line-height': '2' }).html(tr);
    jq(table).append(tf);

    if (alignRight) {
        arr.forEach(k => {
            jq(table).find(`[data-key=${k}]`).addClass('text-end');
        })
    }
    return tf;
}
help.addTableColumnsTotal = addTableColumnsTotal;

export function getCYear(date = new Date) { return new Date(date).getFullYear() }
help.getCYear = getCYear;

export function getFinYear(date = new Date) {
    date = date ? new Date(date) : new Date;
    let year = date.getFullYear();
    let mnth = date.getMonth() + 1;
    return mnth > 3 ? year + 1 : year;
}
help.getFinYear = getFinYear;

export function getMonth(date = new Date()) { return new Date(date).getMonth() + 1 }
help.getMonth = getMonth;

export function getYear(date = new Date()) { return new Date(date).getFullYear() }
help.getYear = getYear;

export function getSqlDate(date = new Date()) {
    if (date) date = new Date(date);
    return date.sqlDate();
}
help.getSqlDate = getSqlDate;

export function getSqlDateAdvance(days, date = new Date()) {
    // Clone the date to avoid mutating the original date
    const newDate = new Date(date);

    // Add the specified number of days
    newDate.setDate(newDate.getDate() + days);

    // Return the new date
    return newDate.sqlDate();
}
help.getSqlDateAdvance = getSqlDateAdvance;

export function isEmail(email) {
    var reg = /^([A-Za-z0-9._-])+\@([A-Za-z0-9._-])+\.([A-Za-z]{2,4})$/;
    return reg.test(email);
}
help.isEmail = isEmail;

export function uuid() {
    let id = crypto.randomUUID();
    return id;// id.replace(/-/g, '');
}
help.uuid = uuid;

export function isUpperCase(str) {
    return str === str.toUpperCase();
}
help.isUpperCase = isUpperCase;

export function formatDate(date) {
    if (!date) {
        return moment(new Date).format('DD/MM/YYYY');
    } else {
        return moment(date).format('DD/MM/YYYY');
    }
}
help.formatDate = formatDate;

export function parseNumber(number) {
    if (number === null) return 0;
    if (!number) return number;
    const num = typeof number === 'string' ? number.replace(/\,/g, '') : number;
    if (isNaN(num)) return 0
    let int = parseFloat(num);
    if (int % 1 === 0) {
        return parseInt(num)
    } else {
        return parseFloat(num);
    }
}
help.parseNumber = parseNumber;

export function parseCurrency(number) {
    if (isNaN(number)) {
        return 0; // Or handle the error appropriately
    }
    let num = parseNumber(number);
    const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    return indianCurrencyFormatter.format(num);
}
help.parseCurrency = parseCurrency;

export function convertToDecimal(number, decimalplaces = 2) {
    if (isNaN(number)) {
        return 0; // Or handle the error appropriately
    }
    return number.toFixed(decimalplaces);
}
help.convertToDecimal = convertToDecimal;

export function parseLocal(number) {
    let num = parseNumber(number);
    if (!num) return '';
    return num.toLocaleString(currency)
}
help.parseLocal = parseLocal;

export function parseDecimal(number) {
    if (!number) number = 0;
    let num = parseNumber(number);
    const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    let digit = indianCurrencyFormatter.format(num);
    let val = digit == '0.00' ? '0.00' : digit;
    // return val;
    return parseNumber(val);
}
help.parseDecimal = parseDecimal;

export function parseLocals(number) {
    let num = parseNumber(number);
    if (!num) return 0;
    return num.toLocaleString(localecodes[currency])
}
help.parseLocals = parseLocals;

export function parseDisc(e) { if (e?.endsWith("%")) { let r = e.slice(0, -1); return parseLocal(r) + "%" } return '#' }
help.parseDisc = parseDisc;

const modal1 = `
<div class="modal fade modal-dialog-scrollable" id="ebsModal" tabindex="-1" aria-labelledby="ebsModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="ebsModalLabel"></h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <div class="cbox d-flex me-auto gap-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="ebsModalCheckbox" />
            <label class="form-check-label" for="ebsModalCheckbox">Confirm?</label>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-light reset me-5 d-none">Reset</button>
        <button type="button" class="btn btn-sm btn-light close" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-primary disabled apply" value="1" >Apply</button>
      </div>
    </div>
  </div>
</div>`;

const modal2 = `
<div class="modal fade" id="ebsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="ebsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header gradient-custom-1 text-white position-relative">
        <h1 class="modal-title mb-0 fs-5" id="ebsModalLabel"></h1>
        <div class="me-auto ms-5 role-btn d-none" id="print-modal"><i class="bi bi-printer"></i></div>
        <button type="button" class="btn-close btn-close-white close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <div class="cbox d-flex me-auto gap-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="ebsModalCheckbox" />
            <label class="form-check-label" for="ebsModalCheckbox">Confirm?</label>
          </div>
        </div>
        <div class="spinner-border text-primary p-status d-none" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <span class="fail fs-3 text-danger d-none"><i class="bi bi-exclamation-diamond-fill"></i></span>
        <span class="success fs-3 text-success d-none"><i class="bi bi-check2-circle"></i></span>
        <button type="button" class="btn btn-sm btn-light reset me-5 d-none">Reset</button>
        <button type="button" class="btn btn-sm btn-light close" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-primary disabled apply" value="1">Apply</button>
      </div>
      <div class="error-msg d-flex jcc aic text-danger small mb-2 d-none"></div>
    </div>
  </div>
</div>`;

export function showModal({ title = 'Title', applyButtonText = 'Apply', modalSize = 'modal-lg', fulscreen = false, showFooter = true, resetBtn = false, staticModal = true, showPrint = false, callback = null }) {
    try {
        const modal = staticModal ? modal2 : modal1;
        jq('body').append(modal);
        const mb = jq('#ebsModal')[0];
        jq('#ebsModalLabel').text(title)
        jq(mb).find('button.apply').text(applyButtonText);
        jq(mb).find('div.modal-dialog').addClass(modalSize);

        if (fulscreen) {
            jq(mb).find('div.modal-dialog').removeClass(modalSize).addClass('modal-fullscreen');
        }

        if (showPrint) {
            jq(mb).find('#print-modal').removeClass('d-none');
        }

        if (showFooter) {
            jq(mb).find('#ebsModalCheckbox').click(function (e) {
                let confirm = jq(mb).find('#ebsModalCheckbox').is(':checked');
                if (confirm) {
                    jq(mb).find('button.apply').removeClass('disabled');
                } else {
                    jq(mb).find('button.apply').addClass('disabled');
                }
            })

            // reset button
            if (resetBtn) {
                jq(mb).find('button.reset').removeClass('d-none').click(function () {
                    jq(mb).find('form')[0].reset();
                    jq(mb).find('span.success,span.fail').addClass('d-none');
                    jq(mb).find('button.apply').addClass('disabled');
                    jq(mb).find('#ebsModalCheckbox').prop('checked', false);
                })
            }

        } else {
            jq(mb).find('div.modal-footer').addClass('d-none');
        }

        jq(mb).find('button.close').click(function () { jq(mb).remove() })

        jq(mb).find('#print-modal').click(function () {
            let tempDiv = createEL('div');
            jq(tempDiv).addClass('container');
            let modalBody = document.getElementById('ebsModal').querySelector('.modal-body');
            tempDiv.appendChild(modalBody.cloneNode(true));
            let printWindow = window.open('', '_blank');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Print</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <div class="container-fluid my-3">
                        
                        ${modalBody.innerHTML}
                        
                    </div>  
                </body>
                </html>
            `);
            jq(mb).modal('hide').remove();
        })

        if (!modal) return;

        const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';

        mb.addEventListener('shown.bs.modal', () => {
            const focusableElements = mb.querySelectorAll(focusableElementsString);
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

            function trapFocus(event) {
                if (event.key === 'Tab') {
                    if (event.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstFocusableElement) {
                            event.preventDefault();
                            lastFocusableElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastFocusableElement) {
                            event.preventDefault();
                            firstFocusableElement.focus();
                        }
                    }
                }
            }

            mb.addEventListener('keydown', trapFocus);

            // Remove the event listener when the modal is hidden
            mb.addEventListener('hidden.bs.modal', () => {
                mb.removeEventListener('keydown', trapFocus);
            });
        });

        mb.addEventListener('hidden.bs.modal', () => { if (callback) callback() })

        return { modal: mb }

    } catch (error) {
        log(error);
    }
}
help.showModal = showModal;

let actionList = `<div class="list-group list-group-flush rounded action-list position-absolute bg-white border border-primary border-1 ms-3 p-1 d-none" style="width:180px; inset: 0px auto auto 0px; z-index:1100"></div>`;

export function popListInline_({ el, li }) {
    if (jq('div.action-list').length > 0) { jq('div.action-list').remove(); return; }

    jq('body').append(actionList);
    let list = jq('body').find('div.action-list');
    li.forEach(item => {
        let li = document.createElement('li');
        jq(li).addClass('list-group-item list-group-item-action role-btn py-1').text(item.key);
        li.id = item.id;
        li.title = item?.title || '';
        item?.class && jq(li).addClass(item.class);
        jq(list).append(li);
        jq(li).click(function () { jq('div.action-list').remove() });
    })

    let boxWidth = jq(el).width();
    let nudge = 5;
    let rect = el.getBoundingClientRect();
    let brect = document.querySelector('body').getBoundingClientRect();

    let x = rect.left + 25;
    let y = rect.bottom + nudge - brect.y;
    let DFR = 0;
    let DFL = 0;

    let clcRedge = boxWidth - DFR + nudge;
    let clcLedge = boxWidth - DFL + nudge;
    if (DFR < boxWidth) { x = x - clcRedge };
    if (DFL < boxWidth) { x = x + clcLedge }
    jq('div.action-list').css({ 'transform': `translate(${x}px, ${y}px)` }).removeClass('d-none');

    jq(doc).ready(function () {
        let { bottom: boxBottom } = document.querySelector('div.action-list').getBoundingClientRect();
        let pageBottom = window.innerHeight;
        if (boxBottom > pageBottom) {
            let diff = boxBottom - pageBottom + 10;
            y = y - diff;
            jq('div.action-list').css({ 'transform': `translate(${x}px, ${y}px)` });
        }
    })

    jq(window).resize(function () {
        let rect = el.getBoundingClientRect();
        let brect = document.querySelector('body').getBoundingClientRect();
        let x = rect.left + 25; //-boxWidth+rect.width/2; //left
        let y = rect.bottom + nudge - brect.y;
        let DFR = 0//brect.right-rect.right+rect.width/2; //calculate x
        let DFL = 0//rect.left+rect.width/2-brect.left;
        let clcRedge = boxWidth - DFR + nudge; //calculate popup right edge from right
        let clcLedge = boxWidth - DFL + nudge; //calculate popup left edge from left
        if (DFR < boxWidth) { x = x - clcRedge }
        if (DFL < boxWidth) { x = x + clcLedge }
        jq('div.action-list').removeClass('d-none').css({ 'transform': 'translate(' + x + 'px, ' + y + 'px)' });
    })
    return list[0];
}

export function popListInline({ el, li }) {
    const existingList = jq('div.action-list');
    if (existingList.length > 0) {
        existingList.remove();
        // Remove the global click listener if it exists
        jq(document).off('click.closeActionList');
        return;
    }

    jq('body').append(actionList);
    const list = jq('body').find('div.action-list');

    li.forEach(item => {
        const listItem = document.createElement('li');
        jq(listItem).addClass('list-group-item list-group-item-action role-btn py-1').text(item.key);
        listItem.id = item.id;
        listItem.title = item?.title || '';
        item?.class && jq(listItem).addClass(item.class);
        jq(list).append(listItem);
        jq(listItem).click(function () {
            jq('div.action-list').remove();
            // Remove the global click listener after an item is clicked
            jq(document).off('click.closeActionList');
        });
    });

    const boxWidth = jq(el).width();
    const nudge = 5;
    const rect = el.getBoundingClientRect();
    const brect = document.querySelector('body').getBoundingClientRect();

    let x = rect.left + 25;
    let y = rect.bottom + nudge - brect.y;
    let DFR = 0;
    let DFL = 0;

    const clcRedge = boxWidth - DFR + nudge;
    const clcLedge = boxWidth - DFL + nudge;
    if (DFR < boxWidth) {
        x = x - clcRedge;
    }
    if (DFL < boxWidth) {
        x = x + clcLedge;
    }
    jq('div.action-list').css({ 'transform': `translate(${x}px, ${y}px)` }).removeClass('d-none');

    jq(document).ready(function () {
        const actionListElement = document.querySelector('div.action-list');
        if (actionListElement) {
            let { bottom: boxBottom } = actionListElement.getBoundingClientRect();
            const pageBottom = window.innerHeight;
            if (boxBottom > pageBottom) {
                const diff = boxBottom - pageBottom + 10;
                y = y - diff;
                jq('div.action-list').css({ 'transform': `translate(${x}px, ${y}px)` });
            }
        }
    });

    jq(window).resize(function () {
        const rect = el.getBoundingClientRect();
        const brect = document.querySelector('body').getBoundingClientRect();
        let x = rect.left + 25;
        let y = rect.bottom + nudge - brect.y;
        const DFR = 0;
        const DFL = 0;
        const clcRedge = boxWidth - DFR + nudge;
        const clcLedge = boxWidth - DFL + nudge;
        if (DFR < boxWidth) {
            x = x - clcRedge;
        }
        if (DFL < boxWidth) {
            x = x + clcLedge;
        }
        jq('div.action-list').removeClass('d-none').css({ 'transform': `translate(${x}px, ${y}px)` });
    });

    // Add a global click listener to close the list when clicking outside
    jq(document).on('click.closeActionList', function (event) {
        if (!jq(event.target).closest('div.action-list').length && !jq(event.target).is(el)) {
            jq('div.action-list').remove();
            // Remove the global click listener once the list is closed
            jq(document).off('click.closeActionList');
        }
    });

    return list[0];
}
help.popListInline = popListInline;

export async function createForm(arr = []) {
    try {
        if (!arr.length) return;
        let obj = arr[0]; log(obj);
        var size = Object.keys(obj).length;
        // for(const key in obj){
        //     log(key, obj[key]);
        //     let inp = jq('<input>').attr({type:'text', name:key, value:obj[key]}).addClass('form-control');
        //     let label = jq('<label></label').text(key).addClass('form-label');
        //     let div = jq('<div></div').addClass('form-floating').append(inp).append(label);
        // }


    } catch (error) {
        log(error);
    }
}

export async function getForm({ table = null, data = null, type = 'create', qryobj = null, id = true, idName = null, hideFields = [], formWidth = null }) {
    try {
        if (!table) return {};
        let res = null, input = null, textarea = null, obj = {};
        if (qryobj) {
            res = await advanceQuery(qryobj);
            if (res.data.length) {
                data = res.data[0];
                type = 'update';
                res = res;
                data = data
            } else {
                res = null
                return {};
            }
        }
        let i = 0

        const formObj = { ...sqlfields[table] };
        if (hideFields.length) { hideFields.forEach(field => delete formObj[field]) };
        const fields = Object.entries(formObj);
        let hCnt = 0; //hidden counter
        for (let [k, v] of fields) { if (v.type === 'hidden') { hCnt++ } }
        let fCnt = fields.length; fCnt = fCnt - hCnt; fCnt % 2 ? fCnt : fCnt + 1
        const form = createEL('form');
        form.noValidate = true;
        const rowDiv = createEL('div');
        const colDiv1 = createEL('div');
        const colDiv2 = createEL('div');
        let requireMsg = false;

        for (const [key, value] of fields) {
            ++i;
            let textCase = value.case || null;
            let inputDiv = createEL('div');
            let div = createEL('div');
            // let divClass= value.type=='select'?'formfloating':'form-floating'; log(divClass);
            // div.classList.add(divClass);
            div.classList.add('form-floating');
            let label = createEL('label');

            if (value.type !== 'hidden') {
                label.htmlFor = key;
                label.classList.add('form-label')
                label.textContent = value.required ? value.label + ' *' : value.label || value;
            }
            let inputValue = data ? data[key] : value.default ? value.default : '';

            if (value?.hidden) { jq(inputDiv).addClass('d-none'); }

            if (value.type === 'textarea') {
                input = createEL('textarea');
                input.rows = 4;
                input.value = inputValue || '';
                input.style.whiteSpace = 'pre-wrap'
                input.classList.add('form-control');
                if (value.height) input.style.height = value.height;
            } else if (value.type === 'select') {
                input = createEL('select');
                input.classList.add('form-select');

                // let defaultOption = new Option(value.label, '');
                // jq(input).html(defaultOption);

                value.select && value.select.forEach(item => {
                    const option = new Option(item, item);
                    input.add(option)
                })

                value.selectObj && value.selectObj.forEach(item => {
                    const option = new Option(item?.value, item?.id);
                    input.add(option)
                });

                if (value?.localobj) {
                    try {
                        let lobj = value.localobj;
                        let settigns = LStore.get(storeId);
                        let selectObj = settigns[lobj];
                        if (selectObj?.length) {
                            const blank_option = new Option('');
                            input.add(blank_option);
                            selectObj.forEach(item => {
                                const option = new Option(item?.value, item?.id);
                                input.add(option);
                            })
                        }
                    } catch (error) {
                        log(error);
                    }
                }

                if (value?.key) {
                    try {
                        let rsp = await advanceQuery({ key: value.key });
                        let arr = rsp?.data.length ? rsp.data : [];
                        if (arr.length) {
                            arr.forEach(item => {
                                const option = new Option(item?.value, item?.id);
                                input.add(option);
                            })
                        }
                    } catch (error) {
                        log(error);
                    }
                }
                input.value = inputValue || '';

            } else if (value.type === 'searchparty') {
                input = createEL('input');
                input.classList.add('form-control');
                input.type = 'search';
                inputDiv.classList.add('position-relative');
                const srchdiv = createEL('div');
                srchdiv.className = 'position-absolute top-0 left-0 w-100 bg-white shadow rounded z-3 p-2 d-none';
                srchdiv.style.maxHeight = '250px';
                srchdiv.style.marginTop = '64px';
                inputDiv.append(srchdiv);
                jq(input).on('search', function () { jq('#party').val(''); jq(srchdiv).addClass('d-none').html('') })
                jq(input).keyup(async function () {
                    try {
                        let srchtrm = this.value;
                        if (!srchtrm) { jq(srchdiv).addClass('d-none').html(''); return };
                        let key = value?.supplier ? 'srchSupplier' : 'srchParty';
                        let res = await advanceQuery({ key, type: 'search', searchfor: srchtrm });
                        if (!res.data.length) { jq(srchdiv).addClass('d-none').html(''); return };
                        let tbl = createTable(res.data, false);
                        parseData({ tableObj: tbl, colsToRight: ['contact'] });
                        jq(srchdiv).removeClass('d-none').html(tbl.table);
                        jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, e) {
                            jq(e).on('click keypress', function (e) {
                                if (e.type == 'click' || e.key == 'Enter') {
                                    let id = jq(this).find(`[data-key="id"]`).text();
                                    let party = jq(this).find(`[data-key="party"]`).text();
                                    jq('#ebsModal #party, #ebsModal #supid').val(id);
                                    jq('#ebsModal #srchparty').val(party);
                                    jq(srchdiv).addClass('d-none');
                                    jq('#srchparty').focus();
                                }
                            })
                        })
                    } catch (error) {
                        log(error);
                    }
                })
            } else if (value.type === 'checkbox') {
                input = createEL('input');
                input.type = 'checkbox';
                input.value = inputValue || '';
                if (inputValue) input.checked = true;
                input.classList.add('form-check-input');
                if (value?.checked) input.checked = true;
                jq(div).removeClass('form-floating').addClass('form-check');

            } else {
                input = createEL('input');
                input.classList.add('form-control');
                input.type = value.type || 'text';
                if (value.decimal) {
                    let step = value?.step || '0.00';
                    input.step = step;
                }
                // if (value.type === 'search') {
                //     div.classList.add('position-relative');
                // }
                if (value.type === 'date') {
                    input.value = null;
                    let date = moment().format('YYYY-MM-DD');
                    if (data) {
                        if (data[key]) {
                            date = moment(data[key]).format('YYYY-MM-DD');
                            input.value = date;
                        }
                    }
                    if (value?.default === 'current') {
                        input.value = date;
                    }
                } else {
                    input.value = inputValue || '';
                }

                if (value.type !== 'hidden') {
                    value.disabled ? input.classList.add('disabled') : '';
                    if (value.lowercase) {
                        input.classList.add('text-lowercase');
                    }
                    if (value.uppercase) {
                        input.classList.add('text-uppercase');
                    }
                    if (value.titlecase) {
                        input.classList.add('text-capitalize')
                    }
                    div.classList.add('form-floating')
                } else {
                    hCnt++
                    jq(inputDiv).addClass('d-none');
                    if (value?.default === 'current') {
                        let date = moment().format('YYYY-MM-DD');
                        input.value = date;
                    }
                }
            }

            input.id = key;
            input.name = key;
            input.spellcheck = false;
            input.autocomplete = 'off';
            input.disabled = value.disabled ? true : false;
            input.readOnly = value.readonly ? true : false;
            input.required = value.required ? true : false;
            input.placeholder = value.placeholder || '';
            // input.tabIndex = "1";
            // if(value.readonly) jq(input).addClass('bg-light')
            if (value.required) requireMsg = true;
            if (textCase == 'lower') input.classList.add('text-lowercase');
            if (textCase == 'upper') input.classList.add('text-uppercase');
            if (value?.title) div.title = value.title;
            // if(value.type=='select') input.style.height = '58px';

            jq(div).append(input, label);
            let msgdiv = jq('<div></div>').addClass('form-text').text(value?.msg);
            jq(div).append(msgdiv);
            let errormsg = jq('<div></div>').addClass('invalid-feedback').text(value?.errormsg);
            jq(div).append(errormsg);

            // if(value.type !='select') div.append(label);
            let invalid = createEL('div');
            jq(invalid).addClass('invalid d-none text-danger');
            div.append(invalid);
            inputDiv.classList.add(key);
            if (value?.hidden) inputDiv.classList.add('d-none');
            inputDiv.append(div);

            if (fCnt > 6) {
                if (i <= fCnt / 2) {
                    inputDiv.classList.add('odd')
                    colDiv1.append(inputDiv)
                } else {
                    inputDiv.classList.add('even')
                    colDiv2.append(inputDiv)
                }
            } else {
                colDiv1.append(inputDiv)
            }
        }

        if (fCnt > 6) {
            colDiv1.className = 'col-lg-6 d-flex flex-column gap-3 mb-3 mb-lg-0'
            colDiv2.className = 'col-lg-6 d-flex flex-column gap-3'
            rowDiv.append(colDiv1, colDiv2);
        } else {
            // colDiv1.classList.add('col');
            colDiv1.className = 'd-flex flex-column gap-3';
            rowDiv.append(colDiv1)
        }

        rowDiv.classList.add('row');
        // rowDiv.className = 'row d-flex flex-column gap-3 d-lg-block'

        if (id) { if (idName) { form.id = idName } else { form.id = data ? 'update-form' : 'create-form'; } }

        form.classList.add('needs-validation', 'mb-0');
        if (formWidth) form.style.maxWidth = formWidth;
        form.append(rowDiv);
        if (requireMsg) {
            const notesdiv = document.createElement('div');
            notesdiv.className = "d-flex jcb aic gap-2 p-2 note-div";
            const msg = document.createElement('p');
            msg.className = "small mb-0 required mb-0";
            msg.textContent = '(*) Are Required Fields / Cannot be left Empty!';
            notesdiv.append(msg);
            form.append(notesdiv);
        }
        obj.form = form;
        obj.res = res;
        return obj;

    } catch (error) {
        log(error);
    }
}
help.getForm = getForm;

export async function loadOptions({ defaultOption = '', defaultValue = '', selectId = '', qryObj = null, data = null, createNew = false }) {
    try {
        if (qryObj) {
            let res = await help.advanceQuery(qryObj);
            data = res.data;
        }
        if (!data) return false;
        const select = doc.getElementById(selectId);
        select.innerHTML = '';
        const option = new Option(defaultOption, '');
        select.add(option);
        let options = null;
        data.forEach(item => {
            options = new Option(item.value, item.id);
            select.add(options);
        })
        if (createNew) {
            const option = new Option('CREATE NEW', 'create');
            select.add(option);
        }
        if (defaultValue) select.value = defaultValue.toString();
    } catch (error) {
        log(error);
    }
}
help.loadOptions = loadOptions;

// export async function createStuff({ title = 'Title', modalSize = 'modal-lg', applyButtonText = 'Apply', table, url, cb = null, defaultInputValues = [{ inputId: '', value: null }] }) {
//     try {
//         const mb = help.showModal({ title, modalSize, applyButtonText }).modal;
//         const { form } = await help.getForm({ table });
//         jq(mb).find('div.modal-body').html(form);
//         if (defaultInputValues.length) {
//             defaultInputValues.forEach(input => {
//                 jq(input.inputId).val(input.value)
//             })
//         }
//         jq(mb).find('button.apply').click(async function () {
//             try {
//                 jq(this).addClass('disabled');
//                 jq('div.p-status').removeClass('d-none');
//                 jq('div.error-msg').addClass('d-none').text('');
//                 const data = help.fd2json({ form });
//                 const res = await help.postData({ url, data: { data } });
//                 if (res.data?.insertId) {
//                     jq('span.success').removeClass('d-none');
//                     jq('span.fail, div.p-status').addClass('d-none');
//                     jq(this).removeClass('disabled');
//                 } else {
//                     throw res?.data;
//                 }
//             } catch (error) {
//                 jq('span.success, div.p-status').addClass('d-none');
//                 jq('span.fail').removeClass('d-none');
//                 jq('div.error-msg').removeClass('d-none').text(error);
//                 log(error);
//             }
//         })
//         new bootstrap.Modal(mb).show();
//         mb.addEventListener('hidden.bs.modal', function () { cb && cb() })
//     } catch (error) {
//         log(error);
//     }
// }
// help.createStuff = createStuff;

function updateValues(obj, arr) {
    return arr.map(item => {
        if (typeof item === 'string' && item.startsWith('_')) {
            const key = item.slice(1); // Get the key name after the underscore
            return obj[key] !== undefined ? obj[key] : item; // Replace with the object value if it exists, otherwise keep the item
        }
        return item; // Return the item as is if it doesn't start with an underscore
    });
}

export async function createStuff({ title = 'Title', modalSize = 'modal-lg', buttonApply = true, applyButtonText = 'Apply', table, qryObj = null, advQry = null, url = null, defaultInputValues = [], hideFields = [], addonData = null, focus = null, applyCallback = null, applyCBPrams = null, cb = null, cbPrams = null, resetBtn = false }) {
    try {
        // defaultInputValues = [{ inputId: '', value: null }]
        const rsp = {}
        const mb = showModal({ title, modalSize, applyButtonText, resetBtn }).modal;
        const obj = await getForm({ table, qryobj: qryObj, hideFields });
        jq(mb).find('div.modal-body').html(obj.form);
        // defaultInputValues.length ? defaultInputValues.forEach(input => { jq(input.inputId).val(input.value) }) : null
        defaultInputValues.length ? defaultInputValues.forEach(input => { doc.getElementById(input.inputId).value = input.value }) : null

        jq(obj.form).find('input:not([type="hidden"]), textarea:not([type="hidden"])').change(function () {
            if (this.hasAttribute('required')) {
                jq(this).toggleClass('is-valid', !!this.value).toggleClass('is-invalid', !this.value);
            }
        });

        if (buttonApply) {
            jq(mb).find('button.apply').click(async function () {
                try {
                    if (this.value == "2") return;
                    let proceed = true;
                    jq(obj.form).find('input:not([type="hidden"]), textarea:not([type="hidden"])').each(function () {
                        if (this.hasAttribute('required')) {
                            if (this.value == '' || this.value == '0') {
                                jq(this).addClass('is-invalid');
                                proceed = false;
                            }
                        }
                    })
                    if (!proceed) return;

                    jq(this).addClass('disabled');
                    jq('div.error-msg').addClass('d-none').text('');
                    let data = fd2json({ form: obj.form });
                    if (addonData) data = { ...data, ...addonData };
                    if (advQry) {
                        // this will append all values matching input id with '_', example if you have input id as 'host' and you want to put the value of host in the values array then jsut puth '_host' in the values array. like advQuery({ key: 'sqlkey', values: ['_host', '_etc'] });
                        advQry.values = updateValues(data, advQry.values);

                        // if you want to add all form data values as advQuery values just write 'fd' in values like advanceQuery({ key: 'qyerkey', values: ['fd'] })
                        if (advQry.values.includes('fd')) { for (let k in data) { advQry.values.push(data[k]) } }
                    }
                    rsp.fd = data;
                    const res = advQry ? await advanceQuery(advQry) : url ? await postData({ url, data: { data: data } }) : null;
                    if (res) {
                        jq('div.p-status').removeClass('d-none');
                        jq('#ebsModalCheckbox').click();
                        rsp.res = res?.data;
                        rsp.insertId = res.data?.insertId || null;
                        rsp.affectedRows = res.data?.affectedRows || null;
                        if (res.data?.insertId || res.data?.affectedRows) {
                            jq('span.success').removeClass('d-none');
                            jq('span.fail, div.p-status').addClass('d-none');
                        } else {
                            throw res?.data;
                        }
                    }
                    applyCallback ? applyCallback(applyCBPrams) : null;
                } catch (error) {
                    jq('span.success, div.p-status').addClass('d-none');
                    jq('span.fail').removeClass('d-none');
                    jq('div.error-msg').removeClass('d-none').text(error);
                    log(error);
                }
            })
        }

        jq(mb).keydown(function (e) {
            if (e.altKey && e.key.toLowerCase() == 'a') {
                let [apply] = jq(mb).find('button.apply');
                let disabled = jq(apply).hasClass('disabled');
                if (!disabled) jq(apply).click();
            }

            if (e.altKey && e.key.toLowerCase() == 'c') { jq('#ebsModalCheckbox').click() }

            if (e.altKey && e.key.toLowerCase() == 'x') { jq(mb).modal('hide').remove() }

        })

        if (resetBtn) {
            jq(mb).find('button.reset').click(function () {
                jq(obj.form)[0].reset();
                if (focus) jq(focus).focus()
            });

            jq(mb).keydown(function (e) {
                if (e.altKey && e.key.toLowerCase() == 'r') {
                    let [apply] = jq(mb).find('button.reset');
                    jq(apply).click();
                }
            })
        }

        new bootstrap.Modal(mb).show();
        mb.addEventListener('shown.bs.modal', () => { if (focus) { jq(focus).focus() } });
        mb.addEventListener('hidden.bs.modal', () => { cb && cb(cbPrams); });
        rsp.mb = mb;
        rsp.form = obj.form;
        rsp.obj = obj;
        return rsp;
    } catch (error) {
        log(error); //8291182911 sbi merchant whats app number
    }
}
help.createStuff = createStuff;

export function controlBtn({ home = true, buttons = [] }) {
    if (buttons.length) {
        let div = createEL('div');
        div.className = 'position-fixed bottom-0 end-0 me-3 mb-3 d-flex jcc aic text-white control role-btn h3 bg-primary position-relative d-print-none';
        div.style.cssText = 'width: 3.5rem; height: 3.5rem; border-radius: 100%; z-index: 2;';
        div.innerHTML = '<div class="ctrl-btn"><i class="bi bi-ui-checks-grid"></i></div>';
        let ctrlDiv = createEL('div');
        ctrlDiv.className = 'ctrl-menu position-absolute d-flex jce flex-column gap-2 d-none';
        ctrlDiv.style.cssText = 'top: -300px; bottom: 65px; left: 0; height: -400px;';

        if (home) {
            let homeBtn = createEL('div');
            homeBtn.className = 'd-flex jcc aic text-white control role-btn h3 bg-primary mb-0'
            homeBtn.style.cssText = 'width: 3.5rem; height: 3.5rem; border-radius: 100%; z-index: 2;';
            homeBtn.innerHTML = '<i class="bi bi-house"></i>';
            homeBtn.title = 'Home Page';
            homeBtn.addEventListener('click', () => { window.location.href = '/apps/app' });
            ctrlDiv.append(homeBtn);
        }

        buttons.forEach(btn => {
            let button = createEL('div');
            button.className = 'd-flex jcc aic text-white control role-btn h3 bg-primary mb-0';
            button.style.cssText = 'width: 3.5rem; height: 3.5rem; border-radius: 100%; z-index: 2;';
            btn?.key ? button.classList.add(btn.key) : '';
            btn?.id ? button.id : '';
            btn?.title ? button.title = btn.title : '';
            btn?.hidden ? button.classList.add('d-none') : '';
            button.innerHTML = btn.icon || '<i class="bi bi-plus-lg"></i>';
            button.addEventListener('click', () => { btn.cb() });
            ctrlDiv.append(button);
        })
        div.append(ctrlDiv);
        jq(div).find('div.ctrl-btn').click(function () { jq(ctrlDiv).toggleClass('d-none') });
        jq('body').append(div);
    } else {
        let div = createEL('div');
        div.className = 'position-fixed bottom-0 end-0 me-3 mb-3 d-flex jcc aic text-white home role-btn h3 bg-primary d-print-none';
        div.style.cssText = 'width: 3.5rem; height: 3.5rem; border-radius: 100%; z-index: 2;';
        div.innerHTML = '<i class="bi bi-house"></i>';
        div.addEventListener('click', function () { homePage() });
        jq('body').append(div)
    }
    const [logo] = jq('<span></span>').addClass('fs-6').text('EBS');
    const [version] = jq('<span></span>').addClass('small fs-6 app-version text-secondary').text('Professional');
    const [seal] = jq('<div></div>').addClass('app-logo text-secondary d-flex jcs aic gap-2 position-fixed start-0 bottom-0 ms-3 mb-4');
    jq(seal).append(logo).append(version);
    seal.title = 'Easy Billing System';
    jq('body').append(seal);
}
help.controlBtn = controlBtn;

export function clickModal({ modal, form, url, data = null }) {
    jq(modal).find('button.apply').click(async function () {
        try {
            jq(this).addClass('disabled');
            jq(modal).find('div.p-status').removeClass('d-none');
            jq(modal).find('div.error-msg').addClass('d-none').text('');
            if (!data) data = help.fd2json({ form });
            let res = await help.postData({ url, data: { data } });
            if (res.data?.affectedRows) {
                jq(this).removeClass('disabled');
                jq(modal).find('span.success').removeClass('d-none');
                jq(modal).find('span.fail, div.p-status').addClass('d-none');
            } else {
                throw res.data;
            }
        } catch (error) {
            jq(modal).find('span.success, div.p-status').addClass('d-none');
            jq(modal).find('span.fail').removeClass('d-none');
            jq(modal).find('div.error-msg').removeClass('d-none').text(error);
            log(error);
            return error;
        }
    })
}
help.clickModal = clickModal;

export function parseColumn({ table, tbody, cols = [], parsetype = parseLocal, alignRight = false }) {
    try {
        if (!cols.length || !tbody) return;
        cols.forEach(col => {
            jq(tbody).find(`[data-key=${col}]`).each(function (i, e) {
                jq(this).text(parsetype(this.textContent));
            })
            if (alignRight) jq(table).find(`[data-key=${col}]`).addClass('text-end');
        })
    } catch (error) {
        log(error);
    }
}
help.parseColumn = parseColumn;

export function appendScript(js) {
    try {
        let script = createEL('script');
        script.type = 'module';
        script.src = `/js/${js}`;
        jq('body').append(script);
    } catch (error) {
        log(error);
    }
}

export function displayDatatable(table, container_size = 'container-lg') {
    let container = createEL('div');
    jq(container).addClass(container_size)
    try {
        jq('div.process').addClass('d-none');
        if (!table) throw 'No Data/Records Found';
        let div = createEL('div');
        jq(div).addClass('table-responsive max-vh-80 overflow-auto').html(table);
        jq(container).html(div);
        jq('#root').removeClass('text-center').html(container);
        return div;
    } catch (error) {
        log(error);
        jq('#root').addClass('text-center').html(error);
        return false;
    }
}
help.displayDatatable = displayDatatable;

const calendermodal = `<div class="modal fade" id="calendarModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="modalTitle">Month Year</h5>
      <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="d-flex justify-content-center mb-3">
        <select class="form-select me-2" id="monthSelect"></select>
        <select class="form-select" id="yearSelect"></select>
      </div>
      <div class="calendar-container"></div>
    </div>
  </div>
</div>
</div>`;

export function showCalender() {
    try {
        // Append modal to the body if not already present
        if (!jq('#calendarModal').length) {
            jq('body').append(calendermodal);
        }

        const mb = jq('#calendarModal')[0];

        // Generate the initial calendar on modal show
        jq('#calendarModal').on('show.bs.modal', function () {
            const currentDate = new Date();
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

            // Trigger calendarUpdated to attach initial click handlers
            jq('#calendarModal').trigger('calendarUpdated');
        });

        // Handle month and year dropdown changes
        jq('#monthSelect, #yearSelect').off('change').on('change', function () {
            const year = parseInt(jq('#yearSelect').val());
            const month = parseInt(jq('#monthSelect').val());
            generateCalendar(year, month);

            // Trigger calendarUpdated to attach new click handlers
            jq('#calendarModal').trigger('calendarUpdated');
        });

        // Handle modal close button click
        jq(mb).find('button.close').off('click').on('click', function () {
            jq(mb).remove();
        });

        return { modal: mb };
    } catch (error) {
        log(error);
    }
}
help.showCalender = showCalender;

function generateCalendar(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Update modal title
    jq('#modalTitle').text(`${months[month]} ${year}`);

    // Populate month and year dropdowns
    const monthSelect = jq('#monthSelect');
    if (!monthSelect.children().length) {
        for (let i = 0; i < months.length; i++) {
            monthSelect.append(jq('<option></option>').attr('value', i).text(months[i]));
        }
    }
    monthSelect.val(month);

    const yearSelect = jq('#yearSelect');
    if (!yearSelect.children().length) {
        const currentYear = today.getFullYear();
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            yearSelect.append(jq('<option></option>').attr('value', i).text(i));
        }
    }
    yearSelect.val(year);

    // Build the calendar table
    let html = '<table class="table text-center">';
    html += '<tr>';
    for (let day of daysOfWeek) {
        html += `<th>${day}</th>`;
    }
    html += '</tr><tr>';

    // Add empty cells for the first row
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += '<td></td>';
    }

    let day = 1;
    for (let i = firstDayOfMonth; i < 7; i++) {
        html += generateDayCell(year, month, day++, today);
    }
    html += '</tr>';

    // Add remaining days
    while (day <= daysInMonth) {
        html += '<tr>';
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            html += generateDayCell(year, month, day++, today);
        }
        html += '</tr>';
    }

    html += '</table>';
    jq('.calendar-container').html(html);

    // Trigger custom event to re-attach click handlers
    jq('#calendarModal').trigger('calendarUpdated');
}

function generateDayCell(year, month, day, today) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
    const date = `${year}-${month + 1}-${day}`;
    const className = isToday ? 'calendar-day current-date' : 'calendar-day';
    return `<td class="${className}" data-date="${date}" role="button">${day}</td>`;
}

function generateCalendar__(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date(); // Get current date for highlighting

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Abbreviated day names

    // Update modal title with current month and year
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    jq('#modalTitle').text(months[month] + ' ' + year);

    // Populate month dropdown and year dropdown
    const monthSelect = jq('#monthSelect');
    monthSelect.empty();
    for (let i = 0; i < months.length; i++) {
        monthSelect.append(jq('<option></option>').attr('value', i).text(months[i]));
    }
    monthSelect.val(month);

    const yearSelect = jq('#yearSelect');
    yearSelect.empty();
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        yearSelect.append(jq('<option></option>').attr('value', i).text(i));
    }
    yearSelect.val(year);

    let html = '<table class="table text-center">';
    html += '<tr>';
    for (let day of daysOfWeek) {
        html += '<th>' + day + '</th>';
    }
    html += '</tr><tr>';

    // Add empty cells for the first row
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += '<td></td>';
    }

    let day = 1;
    for (let i = firstDayOfMonth; i < 7; i++) {
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            html += '<td class="calendar-day current-date" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
        } else {
            html += '<td class="calendar-day" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
        }
        day++;
    }
    html += '</tr>';

    // Add remaining days
    while (day <= daysInMonth) {
        html += '<tr>';
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                html += '<td class="calendar-day current-date" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
            } else {
                html += '<td class="calendar-day" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
            }
            day++;
        }
        html += '</tr>';
    }

    html += '</table>';

    jq('.calendar-container').html(html);

    // Trigger a custom event to notify calendar updates
    jq('#calendarModal').trigger('calendarUpdated');
}

function generateCalendarNew(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay() - 1; // Start from Monday (0=Sun, 1=Mon, ..., 6=Sat)
    const today = new Date(); // Get current date for highlighting

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Abbreviated day names starting from Monday

    // Update modal title with current month and year
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $('#modalTitle').text(months[month] + ' ' + year);

    // Populate month dropdown and year dropdown
    const monthSelect = $('#monthSelect');
    monthSelect.empty();
    for (let i = 0; i < months.length; i++) {
        monthSelect.append($('<option></option>').attr('value', i).text(months[i]));
    }
    monthSelect.val(month);

    const yearSelect = $('#yearSelect');
    yearSelect.empty();
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        yearSelect.append($('<option></option>').attr('value', i).text(i));
    }
    yearSelect.val(year);

    let html = '<table class="table text-center">';
    html += '<tr>';
    for (let day of daysOfWeek) {
        html += '<th>' + day + '</th>';
    }
    html += '</tr><tr>';

    // Add empty cells for the first row
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += '<td></td>';
    }

    let day = 1;
    for (let i = firstDayOfMonth; i < 7; i++) {
        if (i >= 5) { // Saturday (5) and Sunday (6)
            html += '<td class="calendar-day weekend" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
        } else {
            html += '<td class="calendar-day" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
        }
        day++;
    }
    html += '</tr>';

    // Add remaining days
    while (day <= daysInMonth) {
        html += '<tr>';
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            if (i >= 5) { // Saturday (5) and Sunday (6)
                html += '<td class="calendar-day weekend" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
            } else {
                if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                    html += '<td class="calendar-day current-date" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
                } else {
                    html += '<td class="calendar-day" data-date="' + year + '-' + (month + 1) + '-' + day + '" role="button">' + day + '</td>';
                }
            }
            day++;
        }
        html += '</tr>';
    }

    html += '</table>';

    jq('div.calendar-container').html(html);
}

export function searchData({ key, showData, loadData, values = [], serial = false }) {
    try {
        jq('#search').keyup(async function () {
            let searchfor = this.value;
            if (searchfor) {
                let res = await fetchTable({ key, type: 'search', searchfor, values }, serial);
                showData(res);
            } else {
                loadData();
            }
        }).on('search', loadData)
    } catch (error) {
        log(error);
    }
}
help.searchData = searchData;

export function sumArray(array) {
    if (!array) return;
    return array.reduce((acc, item) => acc + parseNumber(item), 0);
}
help.sumArray = sumArray;

export async function showTable({ query, title, modalSize = 'modal-lg', colsToTotal = [], colsToParse = [], colsToShow = [], colsToHide = [], hideBlanks = [], showTotal = false, alignRight = false, serial = true, fixhead = true, data = null, colsToRename = [], colsToRight = [], colsToCenter = [] }) {
    try {
        const mb = help.showModal({ title, showFooter: false, modalSize }).modal;
        jq('div.process').removeClass('d-none');
        let rsp = await fetchTable(query, serial, fixhead, data);
        jq('div.process').addClass('d-none');
        if (!rsp) { return null };
        let { table, tbody, thead, data: rs } = rsp;
        if (!table) { return null };
        parseData({
            tableObj: { table, tbody, thead },
            colsToParse, colsToTotal, colsToShow, colsToHide, hideBlanks, showTotal, alignRight, serial, fixhead, colsToRename, colsToRight, colsToCenter
        })
        jq(mb).find('div.modal-body').html(table);
        new bootstrap.Modal(mb).show();
        return { mb, table, tbody, thead, rs };
    } catch (error) {
        log(error);
    }
}
help.showTable = showTable;

export async function setTable({ qryObj, data = null, colsToParse = [], colsToTotal = [], colsToHide = [], hideBlanks = [], colsToShow = [], colsToCenter = [], colsToRename = [], colsToRight = [], showTotal = false, alignRight = false, serial = true, fixhead = false, showProcess = false }) {
    try {
        if (showProcess) jq('div.process').removeClass('d-none');
        if (!data) data = await queryData(qryObj);
        let tbl = createTable(data || data, serial, fixhead);
        parseData({ tableObj: tbl, colsToParse, colsToRight, colsToTotal, colsToHide, hideBlanks, colsToShow, colsToCenter, colsToRename, showTotal, alignRight })
        if (showProcess) jq('div.process').addClass('d-none');
        let { table, thead, tbody } = tbl;
        return { table, thead, tbody, data };
    } catch (error) {
        log(error);
        return false;
    }
}
help.setTable = setTable;

export function parseData({ tableObj, colsToParse = [], colsToTotal = [], hideBlanks = [], colsToHide = [], colsToCenter = [], colsToRight = [], colsToRename = [], colsToShow = [], colsTitle = [], showTotal = false, alignRight = false, parsetype = parseLocal }) {
    try {
        let { table, tbody, thead } = tableObj
        if (colsToParse.length) { parseColumn({ table, tbody, cols: colsToParse, parsetype, alignRight }) }
        if (colsToTotal.length) { addTableColumnsTotal({ table, thead, tbody }, colsToTotal, showTotal, alignRight, parsetype) }
        if (colsToRight.length) { colsToRight.forEach(col => { jq(table).find(`[data-key=${col}]`).addClass('text-end') }) }
        if (colsToCenter.length) { colsToCenter.forEach(col => { jq(table).find(`[data-key=${col}]`).addClass('text-center') }) }
        if (colsToRename.length) { colsToRename.forEach(col => { jq(thead).find(`[data-key=${col.old}]`).text(col.new); }) }
        if (colsTitle.length) { colsTitle.forEach(col => { jq(thead).find(`[data-key=${col.col}]`).prop('title', col.title) }) }
        if (colsToShow.length) {
            jq(table).find('tr td, tr th').each(function () { jq(this).addClass('d-none'); })
            colsToShow.forEach(col => {
                jq(table).find(`[data-key=${col}]`).removeClass('d-none')
            })
        }
        if (colsToHide.length) { colsToHide.forEach(col => { jq(table).find(`[data-key=${col}]`).addClass('d-none') }) }
        if (hideBlanks.length) {
            hideBlanks.forEach(col => {
                const cells = jq(tbody).find(`[data-key=${col}]`).text();
                if (!cells) jq(table).find(`[data-key=${col}]`).addClass('d-none');
                jq(table).find(`[data-key="serial"]`).removeClass('d-none');
                // const cells = jq(tbody).find(`[data-key=${col}]`);
                // const blank = !cells.filter((i, e) => e.textContent.trim()).length; log(blank)
                // if (blank) jq(table).find(`[data-key=${col}]`).addClass('d-none');

            })
        }
    } catch (error) {
        log(error);
    }
}
help.parseData = parseData;

export function getUrlParams() {
    const url = new URL(location.href);
    const searchParams = url.searchParams;
    let params = searchParams.entries();
    return Object.fromEntries(params);
}
help.getUrlParams = getUrlParams;

export async function getActiveEntity() {
    let res = await advanceQuery({ key: 'getActiveEntity' });
    return res.data[0];
}
help.getActiveEntity = getActiveEntity;

export function titleCase(str) {
    try {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        })
    } catch (error) {
        return str;
    }
}
help.titleCase = titleCase;

export function newLineToBr(str) {
    if (!str) return
    return str.replace(/\r?\n/g, '<br />');
}
help.newLineToBr = newLineToBr;

export function number2words(number) {
    if (!number) return;
    number = parseNumber(number);
    number = number * 1;

    function number2text(value) {
        var fraction = Math.round(frac(value) * 100);
        var f_text = "";

        if (fraction > 0) {
            f_text = "AND " + convert_number(fraction) + " PAISE";
        }

        return convert_number(value) + " RUPEE " + f_text + " ONLY";
    }

    function frac(f) {
        return f % 1;
    }

    function convert_number(number) {
        if ((number < 0) || (number > 999999999)) {
            return "NUMBER OUT OF RANGE!";
        }
        // var Zn=Math.floor(number/100000000);  /* Arab */
        // number-=Zn*100000000;
        var Gn = Math.floor(number / 10000000);  /* Crore */
        number -= Gn * 10000000;
        var kn = Math.floor(number / 100000);     /* lakhs */
        number -= kn * 100000;
        var Hn = Math.floor(number / 1000);      /* thousand */
        number -= Hn * 1000;
        var Dn = Math.floor(number / 100);       /* Tens (deca) */
        number = number % 100;               /* Ones */
        var tn = Math.floor(number / 10);
        var one = Math.floor(number % 10);
        var res = "";

        // if (Zn>0) {
        //   res+=(convert_number(Zn)+" ARAB");
        // }
        if (Gn > 0) {
            res += (convert_number(Gn) + " CRORE");
            // res+=(((res=="")? "":" ")+
            //   convert_number(kn)+" CRORE");
        }
        if (kn > 0) {
            res += (((res == "") ? "" : " ") +
                convert_number(kn) + " LAKH");
        }
        if (Hn > 0) {
            res += (((res == "") ? "" : " ") +
                convert_number(Hn) + " THOUSAND");
        }

        if (Dn) {
            res += (((res == "") ? "" : " ") +
                convert_number(Dn) + " HUNDRED");
        }


        var ones = Array("", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN");
        var tens = Array("", "", "TWENTY", "THIRTY", "FOURTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY");

        if (tn > 0 || one > 0) {
            if (!(res == "")) {
                res += " AND ";
            }
            if (tn < 2) {
                res += ones[tn * 10 + one];
            }
            else {

                res += tens[tn];
                if (one > 0) {
                    res += ("-" + ones[one]);
                }
            }
        }

        if (res == "") {
            res = "zero";
        }
        return res;
    }

    return number2text(number);
}
help.number2words = number2words;

const popupstr = `
<svg fill="#c2c2c2" class="arrow position-absolute" aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
    <path d="M1 12h16L9 4l-8 8Z"></path>
</svg>
<div class="d-flex flex-column gap-2">
    <p class="pop-msg mb-2"></p>
    <div class="d-flex jce aic gap-2">
        <button class="button btn btn-sm btn-light pop-cancel">Cancel</button>
        <button class="button btn btn-sm btn-primary pop-apply">Yes</button>
    </div>
</div>
`;

export function updatePopupPosition({ el = null, msg = 'Are you sure?', cb = null }) {
    if (!el) return;
    if (jq('#dialogbox').length > 0) { return; }
    jq('#popup').removeClass('d-none');
    const dialog = createEL('div');
    dialog.id = 'dialogbox';
    dialog.className = 'position-absolute bg-white shadow border rounded small p-2 z-3';
    dialog.style.minWidth = '200px';
    dialog.innerHTML = popupstr;
    jq('body').append(dialog);

    const arrow = dialog.querySelector('.arrow');
    const rect = el.getBoundingClientRect();
    const popupWidth = dialog.offsetWidth;
    const popupHeight = dialog.offsetHeight;
    let top = rect.bottom + 8; // Add a little space for the arrow
    let left = rect.left + (rect.width / 2) - (popupWidth / 2);

    // Adjust if popup is going off-screen on the right
    if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 10;
    }

    // Adjust if popup is going off-screen on the left
    if (left < 0) { left = 10 }

    // Adjust if the element is near the bottom of the window
    if (rect.bottom + 28 + popupHeight > window.innerHeight) { // Include arrow height in calculation
        top = rect.top - 28 - popupHeight; // Place the popup above the element and account for the arrow
        dialog.classList.add('arrow-bottom');
        arrow.style.bottom = `-12px`;
        arrow.style.transform = `rotate(180deg)`;
    } else {
        dialog.classList.remove('arrow-bottom');
        arrow.style.top = `-12px`;
    }

    dialog.style.top = `${top}px`;
    dialog.style.left = `${left}px`;

    // Center the arrow relative to the button
    const arrowLeft = rect.left + (rect.width / 2) - left - 10; // Adjust for half the arrow width
    arrow.style.left = `${arrowLeft}px`;

    jq('p.pop-msg').text(msg);
    jq('button.pop-cancel').click(function () { jq(dialog).remove() })
    jq('button.pop-apply').click(function () { jq(dialog).remove(); if (cb) cb(); })
}
window.addEventListener('resize', function () { updatePopupPosition({}) });


export function popInput({ el = null, type = 'text', name = 'text-input', ph = '', cb = null, value = '', maxValue = false }) {
    try {
        if (!el) return;
        let rect = el.getBoundingClientRect();
        let center = rect.width / 2;
        let width = 250;
        let height = 90;
        let [div] = jq('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded bg-white z-3 border position-fixed p-2 shadow');
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;

        let dify = window.innerHeight - rect.top;
        let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
        div.style.top = `${top}px`;

        let difx = window.innerWidth - rect.right;
        let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
        div.style.left = `${left}px`;

        // let pointer = jq('<span></span>').addClass('position-fixed').css({ 'left': ((rect.left - 12) + rect.width / 2) + 'px', 'top': (rect.bottom - 8) + 'px' }).html('<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="m280-400 200-200 200 200H280Z"/></svg>')
        // jq(div).append(pointer);

        jq('#inputbox').html(div);
        let input = doc.createElement('input');
        input.type = type;
        input.placeholder = ph;
        input.name = name
        input.className = 'form-control form-control-sm';
        input.step = '0.001';
        input.value = value;
        let btndiv = doc.createElement('div');
        let cancel = doc.createElement('button');
        let submit = doc.createElement('button');

        jq(input).on('keyup', function () {
            if (type == 'number' && maxValue) {
                if (this.value > maxValue) {
                    jq(input).addClass('is-invalid');
                    jq(submit).addClass('disabled');
                } else {
                    jq(input).removeClass('is-invalid');
                    jq(submit).removeClass('disabled');
                };
            }
        })

        submit.type = 'submit';
        cancel.type = 'button';

        jq(submit).addClass('btn btn-sm btn-primary').text('Apply');
        jq(cancel).addClass('btn btn-sm btn-light').text('Cancel').click(function () { jq(div).remove(); });
        jq(btndiv).addClass('d-flex jce aic gap-2').append(cancel, submit);

        let form = jq('<form></form>').addClass('mb-0 d-flex flex-column gap-2').append(input, btndiv);
        jq(form).submit(function (e) { e.preventDefault(); cb(input.value); jq(div).remove(); })
        jq(div).append(form);
        jq(input).focus().select();

        $('#purchase-order').scroll(function () {
            let rect = el.getBoundingClientRect();
            let dify = window.innerHeight - rect.top;
            let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
            div.style.top = `${top}px`;
            let difx = window.innerWidth - rect.right;
            let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
            div.style.left = `${left}px`;
        })

        $(window).resize(function () {
            let rect = el.getBoundingClientRect();
            let dify = window.innerHeight - rect.top;
            let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
            div.style.top = `${top}px`;
            let diff = window.innerWidth - rect.right;
            let left = diff > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
            div.style.left = `${left}px`;
        });
    } catch (error) {
        log(error);
    }
}
help.popInput = popInput;

export function popTextarea({ el = null, name = 'text-input', ph = '', cb = null, value = '' }) {
    try {
        if (!el) return;
        let rect = el.getBoundingClientRect();
        let center = rect.width / 2;
        let width = 350;
        let height = 150;
        let [div] = jq('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded bg-white z-3 border position-fixed p-2 shadow');
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;

        let dify = window.innerHeight - rect.top;
        let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
        div.style.top = `${top}px`;

        let difx = window.innerWidth - rect.right;
        let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
        div.style.left = `${left}px`;

        jq('#inputbox').html(div);

        let ta = doc.createElement('textarea');
        ta.placeholder = ph;
        ta.name = name
        ta.value = value;
        ta.className = 'form-control';
        ta.style.height = '90px';

        let btndiv = doc.createElement('div');
        let cancel = doc.createElement('button');
        let submit = doc.createElement('button');
        submit.type = 'submit';
        cancel.type = 'button';

        jq(submit).addClass('btn btn-sm btn-primary').text('Apply');
        jq(cancel).addClass('btn btn-sm btn-light').text('Cancel').click(function () { jq(div).remove(); });
        jq(btndiv).addClass('d-flex jce aic gap-2').append(cancel, submit);

        let form = jq('<form></form>').addClass('mb-0 d-flex flex-column gap-2').append(ta, btndiv);
        jq(form).submit(function (e) { e.preventDefault(); cb(ta.value); jq(div).remove(); })
        jq(div).append(form);
        jq(ta).focus().select();

        $(window).resize(function () {
            let rect = el.getBoundingClientRect();
            let dify = window.innerHeight - rect.top;
            let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
            div.style.top = `${top}px`;
            let diff = window.innerWidth - rect.right;
            let left = diff > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
            div.style.left = `${left}px`;
        });
    } catch (error) {
        log(error);
    }
}
help.popTextarea = popTextarea;

export function popConfirm({ el = null, msg = 'Message', cb = null }) {
    try {
        if (!el) return;
        let rect = el.getBoundingClientRect();
        let center = rect.width / 2;
        let width = 250;
        let height = 90;
        let [div] = jq('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded bg-white z-3 border position-fixed p-2 shadow');
        div.style.width = `${width}px`;
        div.style.minHeight = `${height}px`;

        let dify = window.innerHeight - rect.top;
        let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
        div.style.top = `${top}px`;

        let difx = window.innerWidth - rect.right;
        let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
        div.style.left = `${left}px`;

        let pointer = jq('<span></span>').addClass('position-fixed').css({ 'left': ((rect.left - 12) + rect.width / 2) + 'px', 'top': (rect.bottom - 8) + 'px' }).html('<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="m280-400 200-200 200 200H280Z"/></svg>')
        jq(div).append(pointer);

        jq('#popupbox').html(div);

        let message = createEL('div');
        jq(message).addClass('fw-500').html(msg);
        let btndiv = createEL('div');
        jq(btndiv).addClass('d-flex jce aic gap-2 mt-auto');
        let btnclose = createEL('button');
        jq(btnclose).addClass('btn btn-sm py-1 px-3 btn-light').text('No').click(function () { jq(div).remove(); })

        let actionbtn = createEL('button');
        jq(actionbtn).addClass('btn btn-sm py-1 px-3 btn-primary').text('Yes').click(() => {
            if (cb) cb();
            jq(div).remove();
        })

        jq(btndiv).append(btnclose, actionbtn);
        jq(div).append(message, btndiv);

        $('#purchase-order').scroll(function () {
            let rect = el.getBoundingClientRect();
            let dify = window.innerHeight - rect.top;
            let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
            div.style.top = `${top}px`;
            let difx = window.innerWidth - rect.right;
            let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
            div.style.left = `${left}px`;
        })

        $(window).resize(function () {
            let rect = el.getBoundingClientRect();
            let dify = window.innerHeight - rect.top;
            let top = dify > 115 ? (rect.bottom + 5) : ((rect.bottom - rect.height - 5) - height);
            div.style.top = `${top}px`;
            let difx = window.innerWidth - rect.right;
            let left = difx > 100 ? (rect.left - ((width / 2) - center)) : (rect.right - width);
            div.style.left = `${left}px`;
        });
    } catch (error) {
        log(error);
    }
}
help.popConfirm = popConfirm;

export function confirmDialog({ msg = "Message", callback = null }) {
    try {
        let h4 = jq('<h4></h4>').addClass('mb-2').text(msg);
        let details = jq('<div></div>').addClass('fw-400 cnf-details');
        let btn_no = jq('<button></button>').addClass('w-50 btn btn-lg btn-secondary rounded-top-0 cancel').text('No').click(function () {
            jq(cnf_div).html('').remove();
        })
        let btn_yes = jq('<button></button>').addClass('w-50 btn btn-lg btn-primary rounded-top-0 confirm').text('Yes').click(function () {
            callback();
            jq(cnf_div).html('').remove();
        })
        let btn_group = jq('<div></div>').addClass('btn-group mt-auto').append(btn_no, btn_yes);
        let inner_div = jq('<div></div>').addClass('d-flex flex-column bg-light rounded-2 p-2').css({ 'height': '180px', 'width': '400px' }).append(h4, details, btn_group);
        let cnf_div = jq('<div></div>').addClass('d-none d-md-flex jcc aic h-100 w-100 position-fixed top-0 left-0 z-5 bg-confirm').html(inner_div);
        jq('body').append(cnf_div);
    } catch (error) {
        log(error);
    }
}

export function calculateTaxAndPrice(mrp, taxRate, taxType = null) {
    try {
        let netPrice, taxAmount;
        netPrice = mrp;
        taxAmount = netPrice * (taxRate / 100);

        if (taxType == 'inc') {
            // Calculate the net price (excluding tax)
            netPrice = mrp / (1 + (taxRate / 100));
            // Calculate the tax amount
            taxAmount = mrp - netPrice;
        }

        // if (taxType === 'exc' || taxType == null) {
        //     // Calculate the net price (including tax)
        //     netPrice = mrp;
        //     // Calculate the tax amount
        //     taxAmount = netPrice * (taxRate / 100);
        // } else if (taxType === 'inc') {
        //     // Calculate the net price (excluding tax)
        //     netPrice = mrp / (1 + (taxRate / 100));
        //     // Calculate the tax amount
        //     taxAmount = mrp - netPrice;
        // } else {
        //     throw new Error("Invalid tax type. Please use 'exclusive' or 'inclusive'.");
        // }

        // Return the results as an object
        return {
            netPrice: netPrice.toFixed(2),  // Rounded to 2 decimal places
            taxAmount: taxAmount.toFixed(2), // Rounded to 2 decimal places
            net: parseDecimal(netPrice),
            tax: parseDecimal(taxAmount),
            // net: netPrice, //parseDecimal(netPrice),
            // tax: taxAmount, //parseDecimal(taxAmount),
        };
    } catch (error) {
        log(error);
    }
}
help.calculateTaxAndPrice = calculateTaxAndPrice;

export function infoMsg_({ heading = 'Caution', msg = '' }) {
    try {
        let span = $('<span></span>').addClass('text-start').html(msg);
        let heading_span = $('<span></span>').addClass('fw-500').text(heading)
        let btn = $('<button></button>').addClass('btn btn-close ms-auto').attr('type', 'button').click(function () { $(div).addClass('d-none').html('').remove() })
        let head_div = $('<div></div>').addClass('d-flex jcb aic').append(heading_span, btn);
        let div = $('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded-2 border-primary bg-primary-subtle shadow position-fixed bottom-0 end-0 me-2 mb-2 p-2 z-4').css({ 'min-height': '100px', 'width': '320px' }).append(head_div, span);
        $('body').append(div)
    } catch (error) {
        log(error);
    }
}

export function infoMsg({ heading = 'Caution', msg = '', duration = 15 }) {
    try {
        let span = $('<span></span>').addClass('text-start').html(msg);
        let heading_span = $('<span></span>').addClass('fw-500').text(heading);

        // Countdown timer element
        let countdown = $('<span></span>').addClass('ms-auto text-light small').text(`${duration}s`).prop('title', 'Seconds remaning to Auto Close');

        let btn = $('<button></button>').addClass('btn btn-close').attr('type', 'button').click(function () {
            $(div).addClass('d-none').html('').remove();
            clearInterval(timerInterval); // Clear the interval when the button is clicked
        });

        let head_div = $('<div></div>').addClass('d-flex jcb aic gap-2').append(heading_span, countdown, btn);
        let div = $('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded-2 border-primary bg-primary-subtle shadow position-fixed bottom-0 end-0 me-2 mb-2 p-2 z-4').css({ 'min-height': '100px', 'width': '320px' }).append(head_div, span);

        $('body').append(div);

        // Show the message box
        div.removeClass('d-none');

        // Countdown timer logic
        let remainingSeconds = duration;
        const timerInterval = setInterval(() => {
            remainingSeconds--;
            countdown.text(`${remainingSeconds}s`);

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                div.addClass('d-none').html('').remove();
            }
        }, 1000);

        // Auto-close the message box after 15 seconds
        setTimeout(() => {
            div.addClass('d-none').html('').remove();
        }, duration * 1000);
    } catch (error) {
        log(error);
    }
}

export function infoMsg_dragable_({ heading = 'Caution', msg = '', duration = 25 }) {
    try {
        let span = $('<span></span>').addClass('text-start').html(msg);
        let heading_span = $('<span></span>').addClass('fw-500').text(heading);

        // Countdown timer element
        let countdown = $('<span></span>').addClass('ms-2').text(`${duration}s`);

        let btn = $('<button></button>').addClass('btn btn-close ms-auto').attr('type', 'button').click(function () {
            $(div).addClass('d-none').html('').remove();
            clearInterval(timerInterval); // Clear the interval when the button is clicked
        });

        let head_div = $('<div></div>').addClass('d-flex jcb aic').append(heading_span, countdown, btn);
        // let div = $('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded-2 border-primary bg-primary-subtle shadow position-absolute bottom-0 end-0 me-2 mb-2 p-2 z-4 role-btn').css({ 'min-height': '100px', 'width': '320px' }).append(head_div, span);
        let div = $('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded-2 border-primary bg-primary-subtle shadow position-absolute p-2 z-4').css({
            'min-height': '100px',
            'width': '320px',
            'bottom': '10px',
            'right': '10px'
        }).append(head_div, span);

        $('body').append(div);

        // Make the message box draggable
        div.draggable();

        // Show the message box
        div.removeClass('d-none');

        // Countdown timer logic
        let remainingSeconds = duration;
        const timerInterval = setInterval(() => {
            remainingSeconds--;
            countdown.text(`${remainingSeconds}s`);

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                div.addClass('d-none').html('').remove();
            }
        }, 1000);

        // Auto-close the message box after the specified duration
        setTimeout(() => {
            div.addClass('d-none').html('').remove();
        }, duration * 1000);
    } catch (error) {
        console.error(error);
    }
}

export function infoMsg_dragable({ heading = 'Caution', msg = '', duration = 25 }) {
    try {
        let span = $('<span></span>').addClass('text-start').html(msg);
        let heading_span = $('<span></span>').addClass('fw-500').text(heading);

        // Countdown timer element
        let countdown = $('<span></span>').addClass('ms-2 text-secondary').text(`${duration}s`);
        let dragBtn = jq('<span></span>').addClass('role-btn ms-auto').html('<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999"><path d="M360-190.77q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Zm240 0q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Zm-240-240q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Zm240 0q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Zm-240-240q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Zm240 0q-20.31 0-34.77-14.46-14.46-14.46-14.46-34.77 0-20.31 14.46-34.77 14.46-14.46 34.77-14.46 20.31 0 34.77 14.46 14.46 14.46 14.46 34.77 0 20.31-14.46 34.77-14.46 14.46-34.77 14.46Z"/></svg>').prop('title', 'Stop timer & You can drag this box to anywhere on the screen!');

        let btn = $('<button></button>').addClass('btn btn-close').attr('type', 'button').click(function () {
            $(div).addClass('d-none').html('').remove();
            clearInterval(timerInterval); // Clear the interval when the button is clicked
        });


        let head_div = $('<div></div>').addClass('d-flex jcb aic').append(heading_span, countdown, dragBtn, btn);
        let div = $('<div></div>').addClass('d-none d-md-flex flex-column gap-2 rounded-2 border-primary bg-primary-subtle shadow position-absolute h-auto p-2 z-4 role-btn').css({
            'width': '315px',
            'bottom': '10px',
            'right': '10px'
        }).append(head_div, span);

        $('body').append(div);

        // Make the message box draggable
        div.draggable({
            containment: 'window', // Ensure the div stays within the window bounds
            start: function (event, ui) {
                // Change the position to ensure it starts with absolute positioning
                div.css({
                    'bottom': 'auto',
                    'right': 'auto',
                    'top': ui.position.top,
                    'left': ui.position.left
                });
            },
            stop: function (event, ui) {
                // Ensure the position remains absolute after dragging
                div.css({
                    'top': ui.position.top,
                    'left': ui.position.left
                });
            }
        });

        // Show the message box
        div.removeClass('d-none');

        // Countdown timer logic
        let remainingSeconds = duration;
        const timerInterval = setInterval(() => {
            remainingSeconds--;
            countdown.text(`${remainingSeconds}s`);

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                div.addClass('d-none').html('').remove();
            }
        }, 1000);

        // Auto-close the message box after the specified duration
        const autoCloseTimeout = setTimeout(() => {
            div.addClass('d-none').html('').remove();
        }, duration * 1000);

        // If the drag button is clicked, clear the auto-close timeout
        dragBtn.click(function () {
            clearInterval(timerInterval);
            clearTimeout(autoCloseTimeout);
        });
    } catch (error) {
        console.error(error);
    }
}

export function showErrors(message, timeout = 5000) {
    if (typeof message !== 'string' || typeof timeout !== 'number' || timeout <= 0) {
        console.error("Invalid arguments provided to showErrors.");
        return;
    }

    const $span = jq('<span></span>').addClass('fs-6').text(message);
    const $errorIcon = jq('<span></span>').addClass('fs-6').html('<i class="bi bi-exclamation-triangle-fill"></i>');
    const $errorDiv = jq('<div></div>').addClass('z-5 position-fixed position-relative top-0 start-50 translate-middle-x mt-3 me-3 bg-danger-subtle text-dark d-flex jcc aic gap-3 rounded-top').append($errorIcon, $span).css({ 'min-width': '300px', 'min-height': '60px' });
    const $progressBarDiv = jq('<div></div>').addClass('progress position-absolute start-0 bottom-0 w-100 mb-0').attr({ role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' }).css('height', '2px');
    const $progressBar = jq('<div></div>').addClass('progress-bar progress-bar-striped bg-danger').css('width', '100%'); // Start at 100%

    $progressBarDiv.append($progressBar);
    $errorDiv.append($progressBarDiv);
    jq('body').append($errorDiv);

    const startTime = Date.now();
    const endTime = startTime + timeout;

    function updateProgressBar() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        if (currentTime >= endTime) {
            $progressBar.css('width', '0%');
            setTimeout(() => $errorDiv.remove(), 0);
            return;
        }

        const remainingTime = endTime - currentTime;
        const percentage = (remainingTime / timeout) * 100; //log(percentage)
        $progressBar.css('width', percentage + '%');
        requestAnimationFrame(updateProgressBar);
    }

    updateProgressBar();
}

// forward progress bar
export function showErrors2(msg, timeout = 5000) {
    let [span] = jq('<span></span>').addClass('fs-6').text(msg);
    let [err] = jq('<span></span>').addClass('fs-6').html('<i class="bi bi-exclamation-triangle-fill"></i>');
    let [div] = jq('<div></div>').addClass('z-5 position-fixed position-relative top-0 start-50 translate-middle-x mt-3 me-3 bg-danger-subtle text-dark d-flex jcc aic gap-3 rounded-top').append(err, span).css({ 'min-width': '300px', 'min-height': '60px' });
    let [pbdiv] = jq('<div></div>').addClass('progress position-absolute start-0 bottom-0 w-100 mb-0');
    pbdiv.role = 'progressbar';
    pbdiv.ariaValueMin = 0;
    pbdiv.ariaValueMax = 100;
    pbdiv.style.height = '2px';
    let [pb] = jq('<div></div>').addClass('progress-bar');
    pb.style.width = '0%'; // Start with 0%

    jq(pbdiv).append(pb);
    jq(div).append(pbdiv);
    jq('body').append(div);

    let startTime = Date.now();
    let endTime = startTime + timeout;

    let updateProgressBar = function () {
        let currentTime = Date.now();
        let elapsedTime = currentTime - startTime;

        if (currentTime >= endTime) {
            pb.style.width = '100%';
            setTimeout(() => {
                jq(div).remove();
            }, 0); //remove after the progress bar reaches 100%
            return;
        }

        let percentage = (elapsedTime / timeout) * 100;
        pb.style.width = percentage + '%';
        requestAnimationFrame(updateProgressBar); // Smooth animation
    };

    updateProgressBar(); // Start the animation loop.
}


export function showErrors1(msg, timeout = 5000) {
    let [span] = jq('<span></span>').addClass('fs-6').text(msg);
    // let [btn] = jq('<button></button>').addClass('btn btn-sm btn-close ms-5').prop('type', 'button').click(function (e) { jq(div).remove() });
    let [err] = jq('<span></span>').addClass('fs-6').html('<i class="bi bi-exclamation-triangle-fill"></i>')
    let [div] = jq('<div></div>').addClass('z-5 position-fixed position-relative top-0 start-50 translate-middle-x mt-3 me-3 bg-danger-subtle text-dark d-flex jcc aic gap-3 rounded-top').append(err, span).css({ 'min-width': '300px', 'min-height': '60px' });
    let [pbdiv] = jq('<div></div>').addClass('progress position-absolute start-0 bottom-0 w-100 mb-0');
    pbdiv.role = 'progressbar';
    pbdiv.ariaValueMin = 0;
    pbdiv.ariaValueMax = 100;
    pbdiv.style.height = '2px';
    let [pb] = jq('<div></div>').addClass('progress-bar');
    pb.style.width = '25%'
    jq(pbdiv).append(pb);
    jq(div).append(pbdiv);
    jq('body').append(div);
    setTimeout(() => {
        jq(div).remove();
    }, timeout);
}
// .attr('data-bs-theme', 'dark')

// showErrors('this is an error', 3000)

export function showSuccess(msg, timeout = 6000) {
    let [span] = jq('<span></span>').addClass('me-auto').html(msg);
    let [btn] = jq('<button></button>').addClass('btn btn-sm btn-close ms-4').prop('type', 'button').click(function (e) { jq(div).remove() });
    let [success] = jq('<span></span>').addClass('fs-3 me-4').html(`<i class="bi bi-check2-all"></i>`);
    let [div] = jq('<div></div>').addClass('z-4 position-fixed top-0 start-50 translate-middle-x mt-3 me-3 rounded bg-success-subtle text-success p-2 d-flex jcb aic gap-2 mw-30').append(success, span, btn);
    jq('body').append(div);
    setTimeout(() => {
        jq(div).remove();
    }, timeout);
}
// '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#0f8036"><path d="M361.74-110.77 294.97-224.2l-129.18-26.72 12.93-130.93L93.85-480l84.87-98-12.93-130.41 129.18-27.23 66.77-113.59L480-797.8l118.26-51.43 67.43 113.59 129.03 27.23L781.28-578l84.87 98-84.87 98.15 13.44 130.93-129.03 26.72-67.43 113.43L480-162.2l-118.26 51.43Zm76.11-257.85 198.46-197.64-25.08-23.59-173.38 173.08-88.93-90.41-25.23 25.08 114.16 113.48Z"/></svg>'

export function calculateTotalTaxByGst(data) {
    const groupedData = data.reduce((acc, curr) => {
        const { cost_gst: gst } = curr;
        if (!acc[gst]) {
            acc[gst] = { gst, totalTax: 0 };
        }
        acc[gst].totalTax += curr.tax;
        return acc;
    }, {});
    return Object.values(groupedData);
}

export function calculateTotalTaxGstwise(data) {
    const groupedData = data.reduce((acc, curr) => {
        const { gst } = curr;
        if (!acc[gst]) {
            acc[gst] = { gst, totalTax: 0 };
        }
        acc[gst].totalTax += curr.tax;
        return acc;
    }, {});
    return Object.values(groupedData);
}

export function showError(error) {
    // let str = `
    //             <div class="d-flex flex-column gap-2 position-fixed top-0 start-50 translate-middle-x mt-2 me-2 p-2 rounded bg-danger-subtle fw-300 text-center" style="width: 300px; color: darkred;">
    //                 <div class="d-flex jcb aic">
    //                     <span class="fw-bold small">Error</span>
    //                     <button type="button" class="btn btn-close" onclick="this.parentNode.parentNode.remove()"></button>
    //                 </div>
    //                 <div class="text-center">${error}</div>
    //             </div>
    //         `;
    // jq('body').append(str);

    jq('#statusMsg').removeClass('bg-success-900 d-none').addClass('bg-danger');
    jq('#statusMsg>div').text(error);
    jq('#statusMsg>button').click(function () { jq('#statusMsg').addClass('d-none') });
}

export function generateUniqueAlphaCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const result = new Set();

    while (result.size < length) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result.add(characters[randomIndex]);
    }

    return Array.from(result).join('');
}

export function removeDecimal(number) {
    const decimalPart = number - Math.ceil(number);
    const integerPart = Math.ceil(number);
    return {
        decimal: decimalPart,
        integer: integerPart,
    };
}

export function separateDecimal(num) {
    const [integerPart, decimalPart] = num.toString().split(".");
    return {
        integer: parseInt(integerPart),
        decimal: decimalPart ? `.${decimalPart}` : 0,
    };
}

export function createNewPage(content) {
    let blankPage = `
    <html>
        <head>
            <meta charset="utf-8">
            <link type="image/png" sizes="32x32" rel="icon" href="/img/favicon.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
            <title>EBS Mobile</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <link rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">            
    
            <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
            <!-- <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script> -->
        </head>
    
        <body>
            <div id="root">${content}</div>        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                crossorigin="anonymous"></script>
        </body>
    </html>
    `;
    return blankPage;
}

export const loading = `<div class="loading"><span></span><span></span><span></span><span></span><span></span></div>`;
export const ebscard = `<div class="ebs-card"><div class="card-content"></div></div>`;

export function errorMsg(msg) {
    let btn = jq('<span></span>').addClass('role-btn ms-5').html('<i class="bi bi-x-lg"></i>').click(function () { jq('.restricted-access').remove() }).prop('title', 'Close');
    let txt = jq('<span></span').addClass('text-red').text(msg);
    let div = jq('<div></div').addClass('position-fixed top-0 start-50 translate-middle-x m-2 p-3 d-flex jcb aic gap-2 bg-danger-subtle rounded restricted-access z-5').append(txt, btn);
    jq('body').append(div);
}

export async function isAdmin() {
    try {
        let res = await getData('/apps/is-admin');
        return res.data;
    } catch (error) {
        log(error);
    }
}

export function getClientType() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad|ipod|windows phone/.test(userAgent)) {
        if (/ipad/.test(userAgent) && !window.MSStream) {
            return 'tablet'; // Specifically iPad
        } else if (/android/.test(userAgent) && /mobile/.test(userAgent)) {
            return 'mobile'; // Android Phone
        } else if (/android/.test(userAgent)) {
            return 'tablet'; // Android Tablet
        } else if (/iphone|ipod|windows phone/.test(userAgent)) {
            return 'mobile'; // iPhone, iPod, Windows Phone
        }
        return 'mobile'; // Generic mobile
    } else if (/tablet|ipad/.test(userAgent)) {
        return 'tablet'; // General tablet detection
    } else {
        return 'desktop'; // Default to desktop
    }
}
help.getClientType = getClientType;

export async function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // Clipboard API not available. Fallback to textarea.
        fallbackCopyToClipboard(text);
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        // console.log('Text copied to clipboard successfully!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        fallbackCopyToClipboard(text); // Fallback if clipboard fails.
    }
}
help.copyToClipboard = copyToClipboard;

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        // console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        // console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

export async function isRestricted(rc) {
    let admin = await isAdmin();
    if (admin) {
        return false;
    } else {
        let res = await postData({ url: '/apps/user-restriction', data: { user: cuser, rc } });
        if (!res?.data) {
            errorMsg('Resctricted Access');
            return true
        } else {
            return false;
        }
    }
}

export const spinner = `
<div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
`;

// Call the function
//   extractHTMLWithStyles();




// "mysql2": "^3.9.7",

const strLoader = `
<div data-v-471427f8="" class="play-alert-container">
    <div data-v-1691a5a1="" data-v-471427f8="" class="loading-spinner-container">
        <div data-v-1691a5a1="" class="loading"></div>
    </div>
    <div data-v-471427f8="" class="play-alert hidden">
        <div data-v-604824d5="" data-v-471427f8="" class="svg-container play-alert-icon"><svg width="1.00em"
                height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="svg">
                <path
                    d="M14.5709 9.14251L7.51454 4.9087C6.84802 4.50879 6.00005 4.9889 6.00005 5.76619V14.2338C6.00005 15.0111 6.84802 15.4912 7.51454 15.0913L14.5709 10.8575C15.2182 10.4691 15.2182 9.53091 14.5709 9.14251Z">
                </path>
            </svg>
        </div>
    </div>
</div>
`;

const updteAvavilable = `
<div class="position-fixed top-0 start-0 py-1 px-2 w-100 d-flex justify-content-between align-items-center gap-5 new-version d-none" style="background-color: azure">
    <span class="small me-auto">New version available</span>
    <div class="progress w-25 d-none" role="progressbar" aria-label="Download progress" aria-valuenow="0"
        aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar progress-bar-striped progress-bar-animated" id="progressBar" style="width: 0%">0%</div>
    </div>
    <span class="small me-4 download" role="button" title="Download New Version"><i class="bi bi-download"></i></span>
</div>
`;

export function updateApplication() {
    try {
        const newVersionDiv = document.querySelector('.new-version');
        const downloadButton = document.querySelector('.download');
        const downloadProgress = document.querySelector('.progress');

        // Show the update available notification
        window?.app?.onUpdateAvailable(() => {
            newVersionDiv.classList.remove('d-none');
        });

        // Handle download button click
        downloadButton.addEventListener('click', () => {
            window?.app?.requestDownload();
            downloadProgress.classList.remove('d-none')
            // newVersionDiv.innerHTML = '<span>Downloading Update: <progress id="progressBar" max="100" value="0"></progress> <span id="progressText">0%</span></span>';
        });

        // Update progress bar
        window?.app?.onDownloadProgress((percent) => {
            document.getElementById('progressBar').style.width = `${Math.round(percent)}%`;
            document.getElementById('progressBar').textContent = `${Math.round(percent)}%`;
        });

        // Prompt user to install after download
        window?.app?.onUpdateDownloaded(() => {
            window?.app?.requestInstall();
        });
    } catch (error) {
        console.log(error);
    }
}

export async function orderUri(order_id, thermal) {
    let { entity } = getSettings();
    let res = await postData({ url: '/api/url', data: { entity: entity.entity_id, order_id } });
    let uid = res.data;
    let host = thermal ? 'https://myebs.in/o/' : 'https://myebs.in/o/s/';
    let url = host + uid;
    return url;
}

export async function shareOrder(order_id, thermal = true) {
    try {
        let url = await orderUri(order_id, thermal);
        let message = `View-order\n${url}`;
        let encodedMessage = encodeURIComponent(message);
        let client = getClientType(); //log(client);
        if (client == 'desktop') {
            copyToClipboard(url);
            showSuccess('Share-link Copied <br/>' + url);
        } else {
            let location = `https://api.whatsapp.com/send/?text=${encodedMessage}`;
            window.open(location);
        }
    } catch (error) {
        log(error);
    }
}

let myWin = null

export function viewOrder(orderid) {
    let url = `${window.location.origin}/apps/order/thermal/?orderid=${orderid}`;
    if (window?.app?.node()) {
        window?.app?.showThermal(url);
        return;
    }
    if (myWin && !myWin.closed) {
        myWin.focus();
        return;
    }
    let height = window.innerHeight;
    let width = window.innerWidth;
    myWin = window.open(url, "_blank", "top=0, width=500, height=100");
    myWin.resizeTo(450, height);
    myWin.moveTo(width / 2 - 250, 0);
}

export function viewOrderA4(orderid) {
    try {
        let url = `${window.location.origin}/view/order/format/b/?orderid=${orderid}`;
        if (window?.app?.node()) {
            window?.app?.showA4(url);
            return;
        }
        if (myWin && !myWin.closed) {
            myWin.focus();
            return;
        }
        let height = window.innerHeight;
        let width = window.innerWidth;
        myWin = window.open(url, "_blank", "top=0, width=1024, height=700");
        myWin.resizeTo(1024, height);
        myWin.moveTo(width / 2 - 512, 0);
    } catch (error) {
        log(error);
    }
}

export async function downloadPdf_(entity, order_id) {
    try {
        jq('div.process').removeClass('d-none');

        const response = await fetch('http://localhost:3033/create-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entity, order_id }),
        });

        jq('div.process').addClass('d-none');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate PDF.');
        }

        // Convert response to Blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a hidden <a> element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${order_id}.pdf`; // Name of the downloaded file
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function downloadPdf(entity, order_id) {
    try {
        jq('div.process').removeClass('d-none');

        const response = await axios.post('/api/create-pdf', {
            entity,
            order_id
        }, {
            responseType: 'blob', // Ensures we get binary data
        });

        jq('div.process').addClass('d-none');

        // Create a URL and trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated.pdf';
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading PDF:', error.message);
    }
}
help.downloadPdf = downloadPdf;

export function sortArrayByProduct(arr) {
    return arr.sort((a, b) => {
        const productA = a.product.toUpperCase(); // Ignore case
        const productB = b.product.toUpperCase(); // Ignore case
        if (productA < productB) {
            return -1;
        }
        if (productA > productB) {
            return 1;
        }
        // names must be equal
        return 0;
    });
}

export function changeCase(arr, caseType) {
    return arr.map(item => {
        const newItem = { ...item }; // Create a shallow copy to avoid modifying the original object directly
        switch (caseType.toLowerCase()) {
            case 'upper':
                newItem.product = newItem.product.toUpperCase();
                break;
            case 'lower':
                newItem.product = newItem.product.toLowerCase();
                break;
            case 'title':
                newItem.product = newItem.product
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                break;
            default:
                console.warn(`Invalid case type: "${caseType}". Product case not changed.`);
                break;
        }
        return newItem;
    });
}