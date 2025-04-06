import { advanceQuery, controlBtn, displayDatatable, doc, fetchTable, jq, log, pageHead, parseData, popListInline, queryData, searchData, setTable, storeId, xdb } from "./help.js";
import { createEditParty, createEditSupplier } from "./module.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'suppliers', spinner: false })
    searchData({ key: 'srchsup', showData, loadData });
    loadData();
    controlBtn({
        buttons: [
            {
                title: 'Add Party',
                cb: () => createEditSupplier({ callback: loadData, focus: '#supplier_name', hideFields: ['gender', 'opening_bal'] }),
            },
            {
                title: 'Hard Reset Data',
                icon: '<i class="bi bi-arrow-clockwise"></i>',
                cb: async () => {
                    let data = await queryData({ key: 'supplier' });
                    let db = new xdb(storeId, 'supplier');
                    db.clear();
                    await db.add(data);
                    loadData();
                }
            }
        ]
    })

})

async function loadData() {
    try {
        let db = new xdb(storeId, 'supplier');
        let data = await db.getColumns({
            columns: [`id`, `title`, `supplier`, `sup_id`, `contact`, `email`, `opening`, `orders`, `billing`, `payments`, `balance`],
            rename: {
                'payments': 'pymts'
            },
            sortby: 'id',
            sortOrder: 'desc',
        });
        if (!data.length) {
            let rs = await advanceQuery({ key: 'supplier' });
            let data = rs.data;
            if (data.length) await db.put(data);
            loadData();
            return;
        }
        // let res = await setTable({ qryObj: { key: 'supplier' }, showProcess: true, colsToParse: ['opening', 'purchase', 'dues'], alignRight: ['opening', 'purchase', 'dues'] }); //log(res);
        let res = await fetchTable({ key: 'supplier' }, true, true, data);
        showData(res)
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data;
        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                let id = this.textContent;
                popListInline({
                    el: e, li: [
                        { key: 'Edit', id: 'editSupplier' },
                        { key: 'Delete', id: 'delSupplier' },
                        { key: 'Cancel' }
                    ]
                });
                jq('#editSupplier').click(async function () {
                    // createEditParty({ update_id: id, callback: loadData, supplier: true })
                    createEditSupplier({ update_id: id, callback: loadData })
                })
                jq('#delSupplier').click(async function () {
                    try {
                        let cnf = confirm('Are you sure want to delete this Supplier ?');
                        if (!cnf) return;
                        await advanceQuery({ key: 'deleteParty', values: [id] });
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })
            })
        })
        parseData({
            tableObj: data,
            colsToParse: ['opening', 'billing', 'balance', 'pymts', 'orders'],
            alignRight: true,
        });
        displayDatatable(table)
    } catch (error) {
        log(error);
    }
}