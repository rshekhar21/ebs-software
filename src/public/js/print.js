import 'https://code.jquery.com/jquery-3.6.1.min.js';
import 'https://unpkg.com/axios/dist/axios.min.js';

const log = console.log;
const jq = jQuery;
const axios = window.axios;
const currency = localStorage.getItem('currency') || 'en-IN';

document.addEventListener('DOMContentLoaded', function () {
    // let prams = getUrlParams().key;
    // let arr = prams.split('-');
    const pathname = this.location.pathname;
    const parts = pathname.split('/');
    const lastPart = parts.pop();
    orderData(lastPart)
    // laodOrder(arr);
})

function getUrlParams() {
    const url = new URL(location.href);
    const searchParams = url.searchParams;
    let params = searchParams.entries();
    return Object.fromEntries(params);
}

async function orderData(id) {
    let res = await axios.get(`/order/v/` + id); //log(res.data); log(res);
    if (!res.data) {
        jq('body').html('<span>Invalid Details</span>')
        return
    };
    laodOrder(res);
}

async function laodOrder(res) {
    try {
        // if (!prams.length) { return false; }
        // let [folder, fileName] = prams;
        // let res = await axios.post(`${window.location.origin}/aws/download`, { folder, fileName });
        // if (!res.data) return

        // jq('div.status, div.view-order').toggleClass('d-none');

        if (!res?.data) return
        let { orderData: [od], itemsData: items, gsData: [gs], grData: [gr], entityData: [entity] } = res.data;
        jq('#entity .entity-name').text(entity.entity_name);
        let ent = `
            <span class="mb-1 fst-italic">${entity.tag_line || ''}</span>
            <span class="${entity.address ? '' : 'd-none'}">${entity.address}</span>
            <div class="d-flex justify-content-center align-items-center gap-2">
                <span class="${entity.city ? '' : 'd-none'}">${entity.city}</span>
                <span class="${entity.state ? '' : 'd-none'}">${entity.state}</span>
                <span class="${entity.pincode ? '' : 'd-none'}">${entity.pincode}</span>
            </div>
            <div class="d-flex justify-content-center align-items-center gap-2 mt-2 font-monospace ${entity.gst_num ? '' : 'd-none'}"  style="font-size: 1rem; letter-spacing: 1px;">
                <span class="fw-500">GST Number:</span>
                <span class="fw-bold">${entity.gst_num}</span>
            </div>`;
        jq('#entity-details').html(ent);
        jq('span.for-entity').html(`For <span class="fw-500">${entity.entity_name}</span>`);
        jq('span.comments').text(od.notes)

        // party
        jq('.bill-number').text(od.inv_number);
        jq('.bill-date').text(od.bill_date);
        jq('.party-name').text(od.party_name);

        let title = od.title || (od.gst_number ? 'M/s' : '');

        let billing = `
            <span class="small fw-500 mb-1">BILLED TO</span>
            <div class="d-flex jcs aic">
                <span class="title ${title ? 'me-2' : ''}">${title}</span>
                <span class="party-name fw-500">${od.party_name || ''}</span>             
            </div>
            <span class="address">${od.address || ''}</span>
            <span class="city">${od.city || ''}</span>
            <div class="d-flex justify-content-start align-items-center gap-2 mb-1">
                <span class="state">${od.state || ''}</span>
                <span class="pincode">${od.pincode || ''}</span>
            </div>
            <div class="d-flex jsc align-items-center gap-2 ${od.gst_number ? '' : 'd-none'}">
                <span class="fw-500">GST Number:</span>
                <span class="gst-number fw-500" style="letter-spacing: 1px;">${od.gst_number}</span>
            </div>`;
        jq('#billing').html(billing);

        let shipping = `
            <span class="small fw-500 mb-1">SHIPED TO</span>            
            <div class="d-flex jcs aic">
                <span class="title ${title ? 'me-2' : ''}">${title}</span>
                <span class="party-name fw-500">${od.party_name || ''}</span>           
            </div>
            <span class="address">${od.address || od.ship_address || ''}</span>
            <span class="city">${od.city || ''}</span>
            <div class="d-flex justify-content-start align-items-center gap-2">
                <span class="state">${od.state || ''}</span>
                <span class="pincode">${od.pincode || ''}</span>
            </div>`;
        jq('#shipping').html(shipping);

        // items
        let tbl = createTable(items, true, false);
        parseData({
            tableObj: tbl,
            colsToParse: ['price', 'disc', 'gst', 'tax', 'net', 'total', 'qty'],
            colsToRight: ['price', 'disc', 'gst', 'tax', 'net', 'total'],
            hideBlanks: ['sku', 'pcode', 'hsn', 'size', 'unit', 'disc', 'gst', 'tax'],
            colsToCenter: ['qty'],
        })

        jq('.quantity').text(parseDecimal(gs.gs));

        // show bank
        let bank = `
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1 fw-500">
                    BANK DETAILS                    
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1">
                    BANK
                    <span class=""></span>
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1">
                    BRANCH
                    <span class=""></span>
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1">
                   ACCOUNT
                    <span class=""></span>
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1">
                    IFSC Code
                    <span class=""></span>
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 pb-1">
                    UPI ID
                    <span class=""></span>
                </div>`;

        jq('#bank-details').addClass('d-none').html(bank);

        let str = ` 
            <div class="d-flex flex-column gap-0 h-100">
                <div class="d-flex justify-content-end align-items-center gap-2 pb-1 fw-500">
                    SUBTOTAL
                    <span class="text-end" style="min-width: 75px;">${parseDecimal(od.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od?.discount ? '' : 'd-none'}">
                    DISCOUNT
                    <span class="text-end" style="min-width: 75px;">${parseDecimal(od.discount)}</span>
                </div>
                <div class="d-flex flex-column gap-0 ${od?.totaltax ? '' : 'd-none'}">
                    <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od.gst_type == 'igst' ? 'd-none' : ''}">
                        CGST
                        <span class="text-end" style="min-width: 75px;">${parseDecimal(parseNumber(od.totaltax) / 2)}</span>
                    </div>
                    <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od.gst_type == 'igst' ? 'd-none' : ''}">
                        SGST
                        <span class="text-end" style="min-width: 75px;">${parseDecimal(parseNumber(od.totaltax) / 2)}</span>
                    </div>
                    <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od.gst_type == 'igst' ? '' : 'd-none'}">
                        IGST
                        <span class="text-end" style="min-width: 75px;">${parseDecimal(parseNumber(od.totaltax))}</span>
                    </div>
                </div>
                <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od?.freight ? '' : 'd-none'}">
                    FREIGHT
                    <span class="text-end" style="min-width: 75px;">${parseDecimal(od.freight)}</span>
                </div>
                <div class="d-flex justify-content-end align-items-center gap-2 pb-1 ${od?.round_off ? '' : 'd-none'}">
                    ROUND OFF
                    <span class="text-end" style="min-width: 75px;">${parseDecimal(od.round_off)}</span>
                </div>
                <div class="d-flex justify-content-end align-items-center gap-2 pb-1 fw-bold mt-auto">
                    TOTAL
                    <span class="text-end" style="min-width: 75px;">${parseCurrency(od.alltotal)}</span>
                </div>
            </div>`;

        jq('#totals').html(str);

        jq(tbl.tbody).find(`[data-key="gst"]`).each(function (i, e) {
            let gst = this.textContent;
            jq(this).html(gst + '%')
        })

        jq(tbl.table).css('--custom-tbl-size', '0.8rem')

        jq('#order-items').html(tbl.table);
        jq('div.view-order, div.status').toggleClass('d-none');

    } catch (error) {
        log(error);
    }
}

function createTable(data, serial = true, fixhead = true) {
    if (!data || !data.length) return false;
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    if (serial) {
        th.textContent = '#';
        th.className = 'serial_no'
        tr.append(th)
    }
    for (let key in data[0]) {
        th = document.createElement('th');
        th.innerHTML = key;
        th.className = 'text-uppercase';
        th.dataset.key = key
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
    // jq(thead).find('tr').addClass('py-5');
    if (!serial) jq(table).removeClass('css-serial');
    if (fixhead) jq(thead).addClass('tbl-fixedhead');
    return { table, thead, tbody, data, tbl: { table, thead, tbody } };
}

function parseData({ tableObj, colsToParse = [], colsToTotal = [], hideBlanks = [], colsToHide = [], colsToCenter = [], colsToRight = [], colsToRename = [], colsToShow = [], colsTitle = [], showTotal = false, alignRight = false, parsetype = parseLocal }) {
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
            })
        }
    } catch (error) {
        log(error);
    }
}

function parseColumn({ table, tbody, cols = [], parsetype = parseLocal, alignRight = false }) {
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

function addTableColumnsTotal({ table, thead, tbody }, arr, showtotal = true, alignRight = false, parsetype = parseLocal) {
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

function parseLocal(number) {
    let num = parseNumber(number);
    if (!num) return '';
    return num.toLocaleString(currency)
}

function parseNumber(number) {
    if (number === null) return 0;
    if (!number) return number;
    const num = typeof number === 'string' ? number.replace(/\,/g, '') : number;
    if (isNaN(num)) return 0
    let int = parseFloat(num); //log(int % 1)
    if (int % 1 === 0) {
        return parseInt(num)
    } else {
        return parseFloat(num);
    }
}

function parseDecimal(number) {
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

function parseCurrency(number) {
    if (isNaN(number)) {
        return 0; // Or handle the error appropriately
    }
    let num = parseNumber(number);
    const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    return indianCurrencyFormatter.format(num);
}

function parseDisc(e) { if (e?.endsWith("%")) { let r = e.slice(0, -1); return parseLocal(r) + "%" } return parseLocal(e) }