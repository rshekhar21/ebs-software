import { updateIndexDB } from "./_localdb.js";
import h, { advanceQuery, displayDatatable, doc, isAdmin, jq, log, pageHead, parseData, popListInline, queryData, quickData, searchData, showError, showErrors, showTable, storeId, viewOrder, xdb } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'sold' });
    loadData();
    h.controlBtn({
        buttons: [
            {
                title: 'Hard Reset',
                icon: '<i class="bi bi-arrow-clockwise"></i>',
                cb: async () => {
                    try {
                        jq('div.process').removeClass('d-none');
                        let res = await queryData({ key: 'sold', limit: 500 }); //log(res); //return;
                        // if (!res.length) return;
                        let db = new xdb(storeId, 'sold');
                        await db.clear();
                        await db.add(res);
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                }
            }
        ]
    });
    searchData({ key: 'srchsold', showData, loadData });

    // jq('#search').keyup(async function(){
    //     try {
    //         let db = new xdb(storeId, 'sold');
    //         let data = await db.getColumns({
    //             key: this.value,
    //             indexes: ['sku', 'hsn', 'category', 'pcode', 'product'],
    //             columns: ['id', 'dated', 'order_id', 'party_name', 'sku', 'hsn', 'category', 'pcode', 'product', 'size', 'unit', 'qty', 'price', 'disc', 'gst', 'tax', 'net', 'gross', 'emp_id', 'emp_name'],
    //             hidecols: ['emp_id'],
    //             sortby: 'id', sortOrder: 'desc',
    //             limit: 250,
    //         });
    //         showData(data);
    //     } catch (error) {
    //         log(error);
    //     }
    // })


})

let db = new xdb(storeId, 'sold');
async function loadData() {
    try {
        let data = await db.getColumns({
            columns: ['id', 'dated', 'order_id', 'party_name', 'sku', 'hsn', 'category', 'pcode', 'product', 'size', 'unit', 'qty', 'price', 'disc', 'gst', 'tax', 'net', 'gross', 'emp_id', 'emp_name', 'orderid'],
            hidecols: ['emp_id'],
            sortby: 'order_id', sortOrder: 'desc',
            limit: 500,
        });
        jq('div.process').addClass('d-none');
        let res = await h.fetchTable({ key: 'sold', limit: 500 }, true, true, data);
        showData(res);
    } catch (error) {
        log(error);
    }
}

function handleRowClick(mb, tbody, rs, id) {
    jq(tbody).find('tr').addClass('role-btn').each(function (i, e) {
        jq(e).click(async function () {
            jq(mb).modal('hide').remove();
            let empid = rs[i].id;
            let res = await queryData({ key: 'addEmpForSale', values: [empid, id] });
            if (res?.affectedRows) {
                let rsp = await queryData({ key: 'getSoldByID', values: [id] });
                await db.put(rsp);
                loadData();
            }
        });
    });
}

async function handleEmployeeClick(id) {
    let res = await showTable({
        title: 'Add Employee',
        query: { key: 'selectEmpForSale' },
        modalSize: 'modal-md',
        serial: false
    }); //log(res); //return;
    if(!res) {
        showErrors('No Employees Found!');
        return;
    };
    let { mb, tbody, rs } = res;
    handleRowClick(mb, tbody, rs, id);
}

async function showData(prams) {
    try {
        parseData({
            tableObj: prams,
            colsToParse: ['qty', 'price', 'disc', 'gst', 'tax', 'net', 'gross'],
            alignRight: true,
            colsToRight: ['emp_name'],
            hideBlanks: ['hsn', 'size', 'emp_id'],
            colsToHide: ['orderid'],
        })
        let admin = await isAdmin(); //log(admin)

        jq(prams.tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
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
                let order_id = prams.data[i].orderid; //log(prams);

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

        if (!admin) {
            jq(prams.table).find(`[data-key="emp_name"]`).addClass('d-none');
        } else {
            jq(prams.tbody).find(`[data-key="emp_name"]`).each(function (i, e) {
                try {
                    let id = prams.data[i].id; //log(id);
                    if (!prams.data[i].emp_name) {
                        let span = jq('<span></span>')
                            .addClass('role-btn italic text-secondary small text-end')
                            .click(() => handleEmployeeClick(id))
                            .text('Add Emp');
                        jq(e).html(span);
                    } else {
                        jq(e).addClass('role-btn').click(() => handleEmployeeClick(id));
                    }
                } catch (error) {
                    log(error);
                }
            });
        }

        displayDatatable(prams.table, 'container-fluid');
    } catch (error) {
        log(error);
    }
}