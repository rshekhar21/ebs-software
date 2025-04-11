import { setupIndexDB } from './_localdb.js';
import help, { jq, log, doc, fetchTable, pageHead, displayDatatable, searchData, parseData, createStuff, parseNumber, popListInline, advanceQuery, storeId, xdb, queryData, isRestricted, showTable } from './help.js';
import { addPurchPymt } from './module.js';
import { getOrderData, quickData, updateDetails } from './order.config.js';

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'purchase', placeholder: 'Search by supplier' });
    loadData(null, 'dated');
    help.controlBtn({
        buttons: [
            {
                title: 'New Entry',
                cb: async () => {
                    if (await isRestricted('FROKLrJs')) return;
                    window.location.href = '/apps/app/orders/create'
                }
            },
            {
                title: 'Hard Reset',
                icon: '<i class="bi bi-arrow-clockwise"></i>',
                cb: async () => {
                    let db = new xdb(storeId, 'purchase');
                    let res = await queryData({ key: 'purchases' });
                    if (!res.length) {
                        jq('div.process, div.ctrl-menu').addClass('d-none');
                        return
                    };
                    db.clear();
                    await db.add(res);
                    loadData();
                    jq('div.ctrl-menu').addClass('d-none');
                }
            }
        ]
    });
    searchData({ key: 'srchpurchase', showData, loadData });
})

async function loadData(key = null, sortby = 'id') {
    try {
        let db = new xdb(storeId, 'purchase');
        let data = await db.getColumns({
            table: 'purchase',
            key: key || null,
            indexes: ['id', 'dated', 'supplier'],
            limit: '500',
            sortby: sortby || 'id',
            sortOrder: 'desc'
        }); //log(data);
        // let rsp = await fetchTable({ key: 'purchase' }, false, true); log(rsp); return;
        // let res = data?.length ? await fetchTable({}, false, true, data) : await fetchTable({ key: 'purchase', limit: 300 }, false, true);
        if (!data.length) {
            let rsp = await queryData({ key: 'purchase', limit: 300 }); //log(rsp); return;
            if (!rsp.length) {
                jq('div.process, div.ctrl-menu').addClass('d-none');
                return
            };
            db.clear();
            await db.put(rsp);
            data = rsp;
            loadData();
        }
        let res = await fetchTable({}, true, true, data);
        showData(res);
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        parseData({
            tableObj: data.tbl,
            colsToParse: ['qty', 'subtotal', 'disc', 'tax', 'freight', 'total', 'pymt', 'balance'],
            alignRight: true,
            colsToHide: ['supid', 'order_number', 'fin_year', 'timestamp', 'bdate', 'fyear'],
            colsToRename: [{ old: 'bill_type', new: 'type' }],
            hideBlanks: ['notes'],
        });

        jq(data.tbody).find(`[data-key="id"]`).addClass('role-btn text-primary').each(function (i, e) {
            jq(e).click(function () {
                let { id, balance } = data.data[i]
                let supplier = jq(this).closest('tr').find(`[data-key="supplier"]`).text();
                popListInline({
                    el: this, li: [
                        // { key: 'View Order', id: 'viewOrder' },
                        { key: 'View Articles', id: 'viewArticles' },
                        { key: 'Edit', id: 'editOrder' },
                        { key: 'Add Suplier', id: 'addSup' },
                        { key: 'Add Payment', id: 'addPymt' },
                        { key: 'Delete', id: 'delOrder' },
                        { key: 'Cancel' },
                    ]
                })
                jq('#viewOrder').click(function () {
                    log('viewOrder')
                })

                jq('#viewArticles').click(async function () {
                    let items = await queryData({ key: 'purchArticles', values: [id] });
                    showTable({
                        data: items,
                        title: 'Purchased Stock',
                        colsToParse: ['qty', 'price', 'cost', 'purch_price', 'sold', 'avl'],
                        colsToTotal: ['qty', 'avl', 'sold'],
                        alignRight: true
                    })
                })

                jq('#editOrder').click(async function () {
                    try {
                        let [x, y, z] = await Promise.all([
                            await advanceQuery({ key: 'editPurch', values: [id] }),
                            await advanceQuery({ key: 'purchasedStock', values: [id] }),
                            await advanceQuery({ key: 'purchPymt', values: [id] }),
                        ]);
                        let items = y.data;
                        let pymts = z.data;
                        let data = x.data[0];
                        data.update = true,
                            data.items = items || [];
                        data.pymts = pymts || [];
                        data.supplier = supplier;
                        delete items.timestamp; // log(data); return;
                        updateDetails({ purchase: { ...data }, pin_purch: true }); // let od = getOrderData().purchase; log(od);
                        location.href = '/apps/app/orders/create';

                    } catch (error) {
                        log(error);
                    }
                })

                jq('#addSup').click(function () {
                    log('add sup')
                })

                jq('#addPymt').click(async function () {
                    addPurchPymt(id, balance);
                })

                jq('#delOrder').click(async function () {
                    let cnf = help.confirmMsg('Are you sure want to delete this Purchaes?'); //log(cnf);
                    if (cnf) {
                        await advanceQuery({ key: 'delPurch', values: [id] });
                        let db = new xdb(storeId, 'purchase');
                        await db.delete(id);
                        loadData()
                    }
                })
            })
        })

        jq(data.tbody).find(`[data-key="pymt"]`).each(function (i, e) {
            try {
                let pymt = jq(this).text();
                if (!pymt) {
                    let [span] = jq('<span></span>').addClass('text-primary role-btn small').text('+Pymt').click(function () {
                        let { id, balance } = data.data[i];
                        addPurchPymt(id, balance);
                    }).prop('title', 'Add Payment')
                    jq(this).append(span);
                }
            } catch (error) {
                log(error);
            }
        })


        // jq(data.tbody).find(`[data-key="pymt"]`).addClass('role-btn').each(function (i, e) {
        //     jq(e).click(async function () {
        //         let id = jq(this).closest('tr').find(`[data-key="id"]`).text(); //log(id);

        //     })
        // })


        displayDatatable(data.table);
    } catch (error) {
        log(error);
    }
}



