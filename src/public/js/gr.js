import h, { advanceQuery, displayDatatable, doc, isAdmin, jq, log, pageHead, parseData, popListInline, queryData, quickData, searchData, showError, showErrors, showTable, storeId, viewOrder, xdb } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'goods returned', ph: 'Search by Item' });
    loadData();
    h.controlBtn({});
    searchData({ key: 'srchsold', showData, loadData });
})

async function loadData() {
    try {
        let res = await h.fetchTable({ key: 'viewgr' });
        showData(res);
    } catch (error) {
        log(error);
    }
}

async function showData(data) {
    try {
        // parseData({ tableObj: data, colsToParse: ['qty', 'rate', 'disc', 'gst', 'tax', 'net', 'gross'], alignRight: true })
        parseData({
            tableObj: data,
            colsToParse: ['qty', 'price', 'disc', 'gst', 'tax', 'net', 'gross'],
            alignRight: true,
            colsToRight: ['emp_name'],
            hideBlanks: ['hsn', 'size', 'emp_id'],
            colsToHide: ['orderid'],
        })
        let admin = await isAdmin(); //log(admin) 

        jq(data.tbody).find(`[data-key="order_id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () { 
                popListInline({
                    el: e, li: [
                        { key: 'View Order (Slip)', id: 'viewOrder' },
                        { key: 'View Order (A4)', id: 'printOrder' },
                        { key: 'Remove Emp', id: 'delEmp' },
                        { key: 'Cancel' }
                    ]
                })

                let lastWin = null;
                let order_id = data.data[i].orderid;

                jq('#viewOrder').click(function () {
                    // if (lastWin && !lastWin.closed) {
                    //     lastWin.focus();
                    //     return;
                    // }
                    // let url = `${window.location.origin}/apps/order/thermal/?orderid=${order_id}`; //log(url);
                    // let height = window.innerHeight;
                    // let width = window.innerWidth;
                    // lastWin = window.open(url, "_blank", "top=0, width=550, height=100");
                    // lastWin.resizeTo(550, height);
                    // lastWin.moveTo(width / 2 - 250, 0)
                    viewOrder(order_id);
                })

                let myWin = null
                jq('#printOrder').click(function () {
                    if (myWin && !myWin.closed) {
                        myWin.focus();
                        return;
                    }
                    let url = `${window.location.origin}/view/order/format/b/?orderid=${order_id}`;
                    let height = window.innerHeight;
                    let width = window.innerWidth;
                    myWin = window.open(url, "_blank", "top=0, width=1024, height=700");
                    myWin.resizeTo(1024, height);
                    myWin.moveTo(width / 2 - 512, 0)
                })

                jq('#delEmp').click(async function () {
                    let cnf = confirm('Remove Employee. Are you Sure?');
                    if (!cnf) return;
                    let id = prams.data[i].id;
                    let res = await queryData({ key: 'delEmpFromSold', values: [id] });
                    if (res.affectedRows) {
                        let rsp = await queryData({ key: 'getSoldByID', values: [id] });
                        await db.put(rsp);
                        loadData();
                    }
                })
            })
        })

        displayDatatable(data.table, 'container-fluid');
    } catch (error) {
        log(error);
    }
}