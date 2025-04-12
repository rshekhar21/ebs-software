import { setupIndexDB, updateIndexDB, verifyIndex } from "./_localdb.js";
import h, { addTableColumnsTotal, advanceQuery, createTable, displayDatatable, doc, jq, log, pageHead, parseData, queryData, storeId, xdb } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'sales', viewSearch: false, spinner: false });
    const fyear = h.getFinYear(); //log(fyear);
    const cyear = h.getCYear(); //log(fyear);
    const month = h.getMonth(); //log(month);
    loadData(cyear, month);

    let pMonth = month;
    let year = cyear;

    h.controlBtn({
        buttons: [
            { title: 'Next Month', key: 'next-month', icon: '<i class="bi bi-caret-right-fill"></i>', cb: () => nextMonth(), hidden: true },
            { title: 'Previous Month', key: 'prev-month', icon: '<i class="bi bi-caret-left-fill"></i>', cb: () => { prevMonth() } },
            {
                title: 'Hard Refresh',
                icon: '<i class="bi bi-arrow-clockwise"></i>',
                cb: async () => {
                    let data = await queryData({ key: 'allsales' }); //log(data);
                    if (!data.length) return;
                    let db = new xdb(storeId, 'sales');
                    db.clear();
                    await db.add(data);
                    loadData(cyear, month);
                }
            }
        ]
    })


    function prevMonth() {
        pMonth--;
        if (pMonth === 0) { pMonth = 12; year-- }
        // if (pMonth === 3) { year-- }
        jq('div.process').removeClass('d-none');
        loadData(year, pMonth);
        jq('div.next-month').removeClass('d-none');
    }

    function nextMonth() {
        pMonth++
        if (pMonth === 13) { pMonth = 1, year++ }
        // if (pMonth === 4) { year++ }
        log(pMonth, year);
        jq('div.process').removeClass('d-none');
        loadData(year, pMonth);
        if (month === pMonth && year === fyear) jq('div.next-month').addClass('d-none');
    }

})

async function loadData(year, month) {
    try {
        let db = new xdb(storeId, 'sales');
        let arr = await db.getColumns({
            hidecols: ['id', 'month', 'fyear', 'year'],
            where: { month, year }
        }); //log(arr);

        if (arr.length) {
            let tbl = createTable(arr);
            showData(tbl);
        } else {
            let data = await queryData({ key: 'allsales' });
            if (!data.length) return;
            let db = new xdb(storeId, 'sales');
            db.clear();
            await db.add(data);
            loadData(year, month);
        }

    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data;
        parseData({
            tableObj: data,
            colsToTotal: ['orders', 'sale', 'net', 'gross', 'returns', 'ws', 'event', 'discount', 'tax', 'freight', 'qty', 'gr', 'pymt', 'cash', 'bank'],
            alignRight: true,
            // colsToRename: [{ old: 'discount', new: 'disc'}],
            hideBlanks: ['ws', 'event', 'freight', 'returns', 'discount', 'gr']
        });
        let div = displayDatatable(table);
        if (!div) jq('#root').html(jq('<div></div>').addClass('d-flex jcc aic vh-50 text-danger fs-4').text('No Records Found!'));

    } catch (error) {
        log(error);
    }
}



