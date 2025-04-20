import { setupIndexDB } from "./_localdb.js";
import help, { doc, jq, log, clickModal, confirmMsg, advanceQuery, postData, queryData, createStuff, getActiveEntity, parseNumber, fetchTable, parseData, createTable, getData, getFinYear, xdb, myIndexDBName, storeId, createEL, fd2json, getSettings, showErrors, isRestricted, errorMsg, sumArray, showModal, titleCase } from "./help.js";
import { getOrderData, loadPartyDetails, refreshOrder, resetOrder, updateDetails } from "./order.config.js";

const modules = {}
export default modules;

export async function editParty(id, quick = false, apply_cb = false, cb = false) {
    try {
        const mb = help.showModal({ title: 'Edit Party', applyButtonText: 'Update' }).modal;
        const table = quick ? 'quickEditParty' : 'editParty';
        const { form, res } = await help.getForm({ table, qryobj: { key: 'editParty', values: [id] } });
        jq(mb).find('div.modal-body').html(form);
        jq(mb).find('button.apply').click(async function () {
            try {
                jq('div.p-status').removeClass('d-none');
                jq(this).addClass('disabled');
                jq('div.error-msg').addClass('d-none').text('');
                const data = help.fd2json({ form });
                let res = await help.postData({ url: '/api/crud/update/party', data: { data } });
                if (res.data?.affectedRows) {
                    jq('span.success').removeClass('d-none');
                    jq('span.fail, div.p-status').addClass('d-none');
                    jq(this).removeClass('disabled');
                } else {
                    throw res.data;
                }
                if (apply_cb) apply_cb();
            } catch (error) {
                jq('span.success, div.p-status').addClass('d-none');
                jq('span.fail').removeClass('d-none');
                jq('div.error-msg').removeClass('d-none').text(error);
                log(error);
            }
        })
        new bootstrap.Modal(mb).show();
        mb.addEventListener('hidden.bs.modal', function () { cb && cb() });
    } catch (error) {
        log(error);
    }
}
modules.editParty = editParty;

export async function createEditParty({ quick = false, update_id = null, callback = false, applyCallback = false, supplier = false, focus = null, hideFields = [], defaultInputValues = [] }) {
    try {
        let table = 'party';
        let title = 'Create Party';
        if (supplier) {
            title = update_id ? 'Edit Supplier' : 'Create Supplier';
            table = update_id ? 'editSupplier' : 'supplier';
        } else {
            title = update_id ? 'Edit Party' : 'Create Party';
            table = update_id ? quick ? 'quickEditParty' : 'editParty' : quick ? 'quickParty' : 'taxInv';
        }

        let res = await createStuff({
            title, table,
            modalSize: quick ? 'modal-md' : 'modal-lg',
            url: update_id ? `/api/crud/update/party` : `/api/crud/create/party`,
            focus,
            cb: callback,
            qryObj: update_id ? { key: 'editParty', values: [update_id] } : null,
            applyButtonText: update_id ? 'Update' : 'Apply',
            hideFields,
            defaultInputValues,
            applyCallback: applyCallback || async function () {
                let obj = update_id ? { key: 'getpartyby_id', values: [update_id] } : { key: 'getpartyby_maxid' }
                let data = await queryData(obj);
                if (!data.length) return;
                let db = new xdb(storeId, 'partys');
                await db.put(data);
                if (window.location.pathname == '/apps/app/orders/create') {
                    if (update_id) return;
                    let [rs] = await queryData({ key: 'getpartyby_maxid' });
                    updateDetails({ purchase: { sup_id: rs.party_id, supplier: rs.party_name } });
                }
            },
        });
        let form = res.obj.form;
        jq(form).find('#contact').blur(async function () {
            try {
                let contact = this.value;
                if (!contact) return;
                let res = await advanceQuery({ key: 'contactExist', values: [contact] });
                if (res.data.length) throw `Contact Number already exists for Party ${res.data[0].party_name}`;
                jq(form).find('div.contact div.invalid').addClass('d-none');
                jq(this).addClass('is-valid');
            } catch (error) {
                log(error);
                jq(this).addClass('is-invalid')
                jq(form).find('div.contact div.invalid').removeClass('d-none').text(error);
            }
        })
        return res;
    } catch (error) {
        log(error);
    }
}

export async function createEditSupplier({ update_id = null, callback = false, applyCallback = false, focus = null, hideFields = [] }) {
    try {
        let table = 'supplier';
        let title = update_id ? 'Edit Supplier' : 'Create Supplier';

        let res = await createStuff({
            title, table,
            url: update_id ? '/api/crud/update/supplier' : '/api/crud/create/supplier',
            focus, hideFields,
            cb: callback,
            qryObj: update_id ? { key: 'editSupplier', values: [update_id] } : null,
            applyButtonText: update_id ? 'Update' : 'Apply',
        }); log(res)
        let form = res.obj.form;
        if (!form) return;
        jq(form).find('#contact').blur(async function () {
            try {
                let contact = this.value;
                if (!contact) return;
                let res = await advanceQuery({ key: 'supplierExist', values: [contact] });
                if (res.data.length) throw `Contact Number already exists for Supplier ${res.data[0].supplier_name}`;
                jq(form).find('div.contact div.invalid').addClass('d-none');
                jq(this).addClass('is-valid');
            } catch (error) {
                log(error);
                jq(this).addClass('is-invalid')
                jq(form).find('div.contact div.invalid').removeClass('d-none').text(error);
            }
        })

        return res;
    } catch (error) {
        log(error);
    }
}

export async function editPayment(id, cb = false) {
    try {
        if (await isRestricted('LChUNnYK')) return;
        const mb = help.showModal({ title: 'Edit Pyament', applyButtonText: 'Update' }).modal;
        let { form, res } = await help.getForm({ table: 'editPymt', qryobj: { key: 'editPymt', values: [id] } });
        jq(mb).find('div.modal-body').html(form);
        jq(mb).find('#cash, #bank').keyup(function () {
            let pymts = jq('#cash, #bank').map(function () { return this.valueAsNumber || 0 }).get();
            let amount = help.sumArray(pymts);
            jq('#amount').val(amount);
        })
        jq(mb).find('#card, #bank').change(async function () {
            if (this.valueAsNumber) {
                let rs = await help.advanceQuery({ key: 'defaultbank' });
                let defaultBank = rs.data[0].default_bank;
                if (defaultBank) jq('#bank_id').val(defaultBank);
            } else {
                jq('#bank_id').val('');
            }
        })
        clickModal({ modal: mb, form: form, url: '/api/crud/update/payments' });
        new bootstrap.Modal(mb).show();
        mb.addEventListener('hidden.bs.modal', function () { cb() })

        // createStuff({
        //     title: 'Edit Payment',
        //     applyButtonText: 'Update',
        //     table: 'editPymt',
        //     qryObj: { key: 'editPymt', values: [id] },
        //     url: '/api/crud/update/payments',
        //     cb,
        // })
    } catch (error) {
        log(error);
    }
}
modules.editPayment = editPayment;

export async function deletePayment(id, cb = false) {
    try {
        if (await isRestricted('WKPOZyqL')) return;
        let confirm = confirmMsg('Are you sure want to delete this Payment?');
        if (!confirm) return;
        await help.advanceQuery({ key: 'deletePymt', values: [id] });
        cb();
    } catch (error) {
        log(error);
    }
}
modules.deletePayment = deletePayment;

export async function loadBanks(value = null, placeholder = '') {
    try {
        let option = new Option(placeholder, '');
        let select = doc.getElementById('bank_id');
        jq(select).empty();
        select.add(option);
        let banks = await queryData({ key: 'banksList' });
        if (banks.length) {
            banks.forEach(bank => {
                let option = new Option(bank.bank_name, bank.id);
                select.add(option);
            })
        }
        if (value) { select.value = value.toString() }
    } catch (error) {
        log(error);
    }
}

// listofBanks().then(d=>log(d)).catch(err=>log(err));
export async function listofBanks() {
    try {
        let res = await advanceQuery({ key: 'listofBanks' });
        return res.data;
    } catch (error) {
        log(error);
    }
}

export async function loadPymtMehods(value = null) {
    try {
        let option = new Option('', '');
        let select = doc.getElementById('pymt_method');
        jq(select).empty();
        select.add(option);
        let res = await advanceQuery({ key: 'listpymtmethods' }); //log(res);
        let methods = res.data; //log(methods);
        if (methods.length) {
            methods.forEach(method => {
                let option = new Option(method.method, method.id);
                select.add(option);
            })
        }
        if (value) { select.value = value.toString() }
    } catch (error) {
        log(error);
    }
}

export async function fetchOrderData({ folder, orderid }) {
    try {
        let res = await postData({ url: '/aws/download', data: { fileName: orderid, folder } }); //log(res.data); return res.data;
        if (!res.data) {
            log('uploaded to AWS')
            let rsp = await postData({ url: '/aws/upload', data: { orderid, folder } }); //log(rsp.data);
            return rsp.data;
        } else {
            log('from AWS')
            return res.data;
        }
    } catch (error) {
        log(error);
        return false
    }
}

export async function fetchBillDetails(orderid) {
    try {
        let entity = await getActiveEntity();
        if (!entity) return;
        let res = await fetchOrderData({ folder: entity.entity_id, orderid }); //log(res); //return;
        if (!res) return false;
        return res;
    } catch (error) {
        log(error);
        return false;
    }
}

export function numerifyObject(obj) {
    if (!obj) return;
    const arr = ['product', 'modified_name', 'original_name', 'pcode', 'image', 'size', 'upc', 'hsn', 'ean', 'sku', 'date', 'dated', 'inv', 'inv_num', 'category', 'section', 'season', 'colour', 'brand', 'label', 'tag', 'type', 'unit', 'bank_mode', 'disc_type', 'update', 'emp_id', 'pymt_for', 'supplier', 'bank_mode'];
    for (const [key, value] of Object.entries(obj)) {
        if (!arr.includes(key)) {
            const num = typeof value === 'string' ? value.replace(/\,/g, '') : value;
            const tmpval = parseNumber(num);
            obj[key] = tmpval ? tmpval : tmpval === 0 ? 0 : value;
        }
    }
    return obj
}

export async function purchEntry() {
    try {
        let res = await createStuff({
            title: 'Create Purchase Entry',
            table: 'purchase',
            url: '/api/crud/create/purchase',
            focus: '#quantity',
        });

        let mb = res.mb;
        let order_date = jq(mb).find('#bill_date').val() || help.getSqlDate(); //log(order_date);
        let fy = help.getFinYear(order_date); log(fy);
        jq(mb).find('#fin_year').val(fy);

        // jq(mb).find('div.srchparty').after('<div class="d-flex jcb aic gap-3 odd bill-qty w-100"></div>');
        // jq(mb).find('div.bill_number, div.quantity').appendTo(jq(mb).find('div.bill-qty'));

        // jq(mb).find('div.bill-qty').after('<div class="d-flex jcb aic gap-3 odd subtotal-disc w-100"></div>');
        // jq(mb).find('div.sub_total, div.discount').appendTo(jq(mb).find('div.subtotal-disc'));

    } catch (error) {
        log(error);
    }
}

export async function _loadSrchstock(id = null) {
    try {
        let obj = id ? { key: 'getstock_byid', values: [id] } : { key: 'getstockby_maxid' };
        let { data } = await advanceQuery(obj);
        let db = new xdb(storeId, 'stock');
        await db.put(data);
    } catch (error) {
        log(error);
    }
}

// testfun();
// function testfun(){
//     let db = new xdb(storeId, 'partys');
//     db.all().then(res=>log(res)).catch(err=>log(err));
// }

export async function _searchParty(val) {
    try {
        let db = new xdb(storeId, 'partys');
        let arr = await db.getColumns({
            key: val,
            indexes: ['party_id', 'party_name', 'contact', 'email'],
            columns: ['id', 'party_name', 'party_id', 'contact', 'email'],
            limit: 10,
            sortby: 'party_name',
        }); //log(arr);
        if (!arr.length) {
            // let res = await advanceQuery({ key: 'srchparty', type: 'search', searchfor: val });
            // arr = res.data;
        }
        return val.length > 0 ? arr : [];
    } catch (error) {
        log(error);
        return [];
    }
}

export async function _searchSupplier(val) {
    try {
        let db = new xdb(storeId, 'supplier');
        let arr = await db.getColumns({
            key: val,
            columns: ['id', 'supplier', 'sup_id', 'contact', 'email'],
            indexes: ['sup_id', 'supplier', 'contact'],
            limit: 20,
            sortby: 'supplier',
        }); //log(arr);
        if (!arr.length) {
            // let res = await advanceQuery({ key: 'supplier', type: 'search', searchfor: val });
            // arr = res.data;
        }
        return arr;
    } catch (error) {
        log(error);
        return [];
    }
}

export async function _refreshSupplier() {
    try {
        let res = await advanceQuery({ key: 'suppliers' }); //log(res.data);
        if (res.data.length) {
            let db = new xdb(storeId, 'supplier');
            db.clear();
            db.add(res.data);
        }
    } catch (error) {
        log(error);
    }
}

export async function _searchProduct(val) {
    try {
        let db = new xdb(storeId, 'stock');
        let arr = await db.getColumns({
            key: val,
            indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
            columns: [`id`, `sku`, `hsn`, `product`, `pcode`, `size`, `unit`, `mrp`, `price`, `discount`, `gst`, `available`, `brand`, `category`, `colour`, `disc_type`, `label`, `section`, `season`, `sold`, `original_name`, `cost`, `cost_gst`, `purch_price`, `ean`, `wsp`],
            rename: { 'discount': 'disc', 'available': 'avl' },
            limit: 21,
            sortby: 'product'
        });

        return arr
    } catch (error) {
        log(error);
    }
}

export async function _searchPurchProduct(val) {
    try {
        let db = new xdb(storeId, 'stock');
        let arr = await db.getColumns({
            // columns: [ `id`,`sku`,`product`,`pcode`,`mrp`,`price`,`wsp`,`gst`,`size`,`discount`,`disc_type`,`brand`,`colour`,`label`,`section`,`season`,`category`,`upc`,`hsn`,`unit`,`prchd_on`,`purch_id`,`bill_number`,`supid`,`supplier`,`ean`,`cost`,`purch_price`,`cost_gst`,`qty`,`sold`,`defect`,`returned`,`available` ],
            columns: [`id`, `sku`, `hsn`, `product`, `pcode`, `size`, `cost`, `purch_price`, `price`, `wsp`, `gst`, `mrp`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`],
            key: val,
            indexes: [`sku`, `ean`, `hsn`, `product`, `pcode`, `supplier`, `unit`, `brand`, `colour`, `upc`, `category`, `label`, `section`],
            limit: 50,
            sortby: 'product',
        });
        return arr
    } catch (error) {
        log(error);
    }
}

export async function _scanProduct(val) {
    try {
        let db = new xdb(storeId, 'stock');
        // let arr = [];
        let arr = await db.getColumns({
            key: val,
            indexes: ['sku'],
            columns: [
                `id`, `sku`, `hsn`, `product`, `pcode`, `size`,
                `unit`, `mrp`, `price`, `discount`, `gst`, `available`,
                `brand`, `category`, `colour`, `disc_type`, `label`,
                `section`, `season`, `sold`, `original_name`
            ],
            rename: { 'available': 'avl' },
            limit: 1,
        })
        // failsafe
        if (!arr.length) { arr = await queryData({ key: 'scanBarcode', values: [val, val] }) }
        return arr
    } catch (error) {
        log(error);
        return [];
    }
}

export async function _scanEAN(val) {
    try {
        let db = new xdb(storeId, 'stock');
        // let arr = [];
        let arr = await db.getColumns({
            key: val,
            indexes: ['ean'],
            columns: [
                `id`, `sku`, `hsn`, `product`, `pcode`, `size`,
                `unit`, `mrp`, `price`, `discount`, `gst`, `available`,
                `brand`, `category`, `colour`, `disc_type`, `label`,
                `section`, `season`, `sold`, `original_name`
            ],
            rename: { 'available': 'avl' },
            limit: 1,
        });
        // failsafe
        if (!arr.length) { arr = await queryData({ key: 'scanBarcode', values: [val, val] }) }
        return arr
    } catch (error) {
        log(error);
        return [];
    }
}

export async function _scanPurchProduct(val) {
    try {
        let db = new xdb(storeId, 'stock');
        let arr = db.getColumns({
            key: val,
            indexes: ['sku', 'ean'],
            // columns: [
            //     `id`, `sku`, `hsn`, `product`, `pcode`, `size`,
            //     `unit`, `mrp`, `price`, `discount`, `gst`, `avl`,
            //     `brand`, `category`, `colour`, `disc_type`, `label`,
            //     `section`, `season`, `sold`, `original_name`
            // ],
            limit: 1,
        })
        return arr
    } catch (error) {
        log(error);
        return [];
    }
}

export async function salesChart_() {
    try {
        let dbn = myIndexDBName('quickData');
        let db = new xdb(storeId, 'sales');
        let data = await db.all(); //log(data);
        let saleslm = new xdb(storeId, 'sales_lm');
        let datalm = await saleslm.all(); //log(datalm);
        // let rev = data.reverse();  log(rev);
        const ctx = document.getElementById('myChart');
        const chartType = getSettings()?.general?.chartType || 'line'; //log(chartType);
        let arr = [...data.map(d => parseNumber(d.date)), ...datalm.map(d => parseNumber(d.date))]; //log(arr)
        const labels = [...new Set(arr)]; //log(labels.sort((a,b)=>a-b).reverse());
        const today = new Date();
        let cmonth = today.toLocaleString('default', { month: 'short' });  //log(cmonth);
        const current = new Date();
        current.setMonth(current.getMonth() - 1);
        let lmonth = current.toLocaleString('default', { month: 'short' });;  //log(lmonth);
        log(data.map(d => d.sale));
        new Chart(ctx, {
            type: chartType, //doughnut, scatter, bar
            // data: {
            //     labels: data.reverse().map(d => d.date),
            //     datasets: [{
            //         label: 'Monthly Sales',
            //         data: data.reverse().map(d => d.sale),
            //         borderWidth: 2,
            //         fill: true,
            //         backgroundColor: 'rgba(255, 99, 132, 0.5)',
            //         borderColor: 'rgba(255, 99, 132, 1)',
            //         // pointBackgroundColor: 'rgb(255, 99, 132)',
            //     }]
            // },
            data: {
                // labels: labels.sort((a,b)=>a-b),
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], //for testing
                datasets: [
                    {
                        type: chartType,
                        label: cmonth,
                        data: data.reverse().map(d => d.sale),
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.2)'
                    },
                    {
                        type: chartType,
                        label: lmonth,
                        data: datalm.reverse().map(d => d.sale),
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        log(error);
    }
}

export async function _refreshSalesChart() {
    try {
        let db = new xdb(storeId, 'sales');
        let data = await db.all(); //log(data);
        let tbl = createTable(data, false, false);
        parseData({ tableObj: tbl, colsToTotal: ['sale'], alignRight: true, colsToHide: ['id', 'date'] });
        jq(div).html(tbl.table);
        salesChart();
    } catch (error) {
        log(error);
    }
}

export async function salesChart__(id) {
    const ctx = document.getElementById(id).getContext('2d');

    // let dbn = myIndexDBName('quickData');
    let db1 = new xdb(storeId, 'sales');
    let ds1 = await db1.all();

    let db2 = new xdb(storeId, 'sales_lm');
    let ds2 = await db2.all();

    // Your sales data for two months
    let data1 = ds1.map(d => ({ date: d.date, sale: d.sale })).reverse(); //log(data1);
    let data2 = ds2.map(d => ({ date: d.date, sale: d.sale })).reverse(); //log(data2);

    // Extracting the dates and sales
    const labels1 = data1.map(entry => entry.date);
    const sales1 = data1.map(entry => entry.sale);

    const labels2 = data2.map(entry => entry.date);
    const sales2 = data2.map(entry => entry.sale);

    // Combine the dates to have a common set of labels for both datasets
    const labels = Array.from(new Set([...labels1, ...labels2])).sort();

    // Align sales data with labels
    const salesData1 = labels.map(date => {
        const entry = data1.find(d => d.date === date);
        return entry ? entry.sale : null;
    });

    const salesData2 = labels.map(date => {
        const entry = data2.find(d => d.date === date);
        return entry ? entry.sale : null;
    });

    // Create the chart
    const chartType = getSettings()?.general?.chartType || 'line'; //log(chartType);
    const today = new Date();
    let cmonth = today.toLocaleString('default', { month: 'short' });  //log(cmonth);
    const current = new Date();
    current.setMonth(current.getMonth() - 1);
    let lmonth = current.toLocaleString('default', { month: 'short' });;  //log(lmonth);
    const salesChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: cmonth,
                    data: salesData1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 205, 86, 0.2)'
                },
                {
                    label: lmonth,
                    data: salesData2,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 205, 86, 0.2)'
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: 'Sales'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'top',
                }
            }
        }
    });
}

export async function _delStock(id, cb = null) {
    try {
        let db = new xdb(storeId, 'stock');
        let [arr] = await db.get(id); //log(arr.sold);
        if (arr.purch_id) { showErrors('Purchased Stock Cannot be Deleted from here!'); return }
        if (arr.sold) { showErrors('Only Unsold stock can be Deleted!'); return }
        let cnf = confirm('Are you sure want to delte this Article?');
        if (!cnf) return;
        let { data } = await advanceQuery({ key: 'deleteStock', values: [id] }); //log(data);
        if (!data.affectedRows) { showErrors('Could not delete, Try again, !'); return; }
        await db.delete(id);
        if (cb) cb();
    } catch (error) {
        log(error);
    }
}

export async function _addPartyPymt(id, cb = null) {
    try {
        let mb = help.showModal({ title: 'Add Payment', applyButtonText: 'Add', modalSize: 'modal-md' }).modal;
        let { form } = await help.getForm({ table: 'order_pymt' });
        jq(mb).find('div.modal-body').html(form);
        jq('#card, #online').change(async function () {
            if (this.valueAsNumber) {
                let rs = await advanceQuery({ key: 'defaultbank' });
                let defaultBank = rs.data[0].default_bank;
                if (defaultBank) jq('#bank_id').val(defaultBank);
            } else {
                jq('#bank_id').val('');
            }
        })
        jq(mb).find('button.apply').click(async function () {
            try {
                let data = fd2json({ form });
                let card = jq('#card').val();
                let online = jq('#online').val();
                let pymts = jq('#cash, #bank, #online, #card').map(function () { return this.valueAsNumber || 0 }).get();
                let banks = jq('#card, #bank, #online').map(function () { return this.valueAsNumber || 0 }).get();
                let amount = sumArray(pymts); //log(amount); return;
                let bank = sumArray(banks);
                if (!data.pymt_date) data.pymt_date = help.getSqlDate();
                if (data.card) data.bank_mode = 'Card';
                if (data.online) data.bank_mode = 'Online';
                if (data.card && data.online) {
                    data.bank_mode = 'Multiple';
                    data.notes = `Card: ${card}, Online: ${online}`
                }
                data.order_id = id;
                data.pymt_for = 'Sales';
                data.amount = amount;
                data.bank = bank;
                let res = await help.postData({ url: '/api/crud/create/payments', data: { data } });
                if (res.data?.insertId) {
                    jq('span.success').removeClass('d-none');
                    jq('span.fail').addClass('d-none');
                    jq(this).removeClass('disabled');
                } else {
                    throw res?.data;
                }
                cb && cb()
            } catch (error) {
                jq('span.success').addClass('d-none');
                jq('span.fail').removeClass('d-none');
                jq('div.error-msg').removeClass('d-none').text(error);
                log(error);
            }
        })
        jq(mb).modal('show');
        mb.addEventListener('hidden.bs.modal', function () { })
    } catch (error) {
        log(error);
    }
}

// salesChart('a')
export async function salesChart(id) {
    try {
        let res = await advanceQuery({ key: 'sales_comprasion' });
        const salesData = res.data || [];

        const labels = salesData.map(day => day.dated);
        const currentSales = salesData.map(item => parseFloat(item.current_month_sales) || null);
        const lastmnthSale = salesData.map(item => parseFloat(item.last_month_sales) || null);
        const ctx = document.getElementById(id).getContext('2d');
        const today = new Date();
        let cmonth = today.toLocaleString('default', { month: 'short' });
        const current = new Date();
        current.setMonth(current.getMonth() - 1);
        let lmonth = current.toLocaleString('default', { month: 'short' });
        const salesComparisonChart = new Chart(ctx, {
            // type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: cmonth,
                        data: currentSales,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: false,
                    },
                    {
                        type: 'line',
                        label: lmonth,
                        data: lastmnthSale,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: false,
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: false,
                            text: 'Sales'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        });

    } catch (error) {
        log(error);
    }
}

// monthlySales()
export async function monthlySales() {
    try {
        let res = await advanceQuery({ key: 'monthly_sales' }); //log(res.data);
        const salesData = res.data;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthColors = [
            "rgba(255, 99, 132, 0.2)",  // Jan
            "rgba(54, 162, 235, 0.2)",  // Feb
            "rgba(255, 206, 86, 0.2)",  // Mar
            "rgba(75, 192, 192, 0.2)",  // Apr
            "rgba(153, 102, 255, 0.2)", // May
            "rgba(255, 159, 64, 0.2)",  // Jun
            "rgba(255, 99, 132, 0.2)",  // Jul
            "rgba(54, 162, 235, 0.2)",  // Aug
            "rgba(255, 206, 86, 0.2)",  // Sep
            "rgba(75, 192, 192, 0.2)",  // Oct
            "rgba(153, 102, 255, 0.2)", // Nov
            "rgba(255, 159, 64, 0.2)"   // Dec
        ];

        const backgroundColors = salesData.map(item => monthColors[item.mnth - 1]);
        const borderColors = salesData.map(item => monthColors[item.mnth - 1].replace('0.2', '1'));

        const labels = salesData.map(item => monthNames[item.mnth - 1]);
        const sales = salesData.map(item => parseFloat(item.sales) || null);

        const ctx = document.getElementById('monthlySlaes').getContext('2d');
        const salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales',
                    data: sales,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    tension: 0.2,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        });
    } catch (error) {
        log(error);
    }
}

// fiscalyearSales()
export async function fiscalyearSales(params) {
    try {
        let res = await advanceQuery({ key: 'fy_sales' }); //log(res.data); return;
        const yearlySalesData = res.data;

        const yearLabels = yearlySalesData.map(item => item.fyear);
        const sales = yearlySalesData.map(item => parseFloat(item.sale));

        const backgroundColors = [
            "rgba(75, 192, 192, 0.2)", // 2024
            "rgba(153, 102, 255, 0.2)", // 2025
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
        ];

        const borderColors = [
            "rgba(75, 192, 192, 1)", // 2024
            "rgba(153, 102, 255, 1)",  // 2025
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(201, 203, 207, 1)'
        ];

        const ctx = document.getElementById('yearlySalesChart').getContext('2d');
        const yearlySalesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: 'Yearly Sales',
                    data: sales,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        });
    } catch (error) {
        log(error);
    }
}

// fiscalYearMonthlySales();
export async function fiscalYearMonthlySales() {
    try {
        let res = await advanceQuery({ key: 'fysales' }); //log(res.data);
        const salesData = res.data;
        const order = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

        salesData.sort((a, b) => order.indexOf(a.mnth) - order.indexOf(b.mnth));

        // const labels = salesData.map(item => monthNames[item.mnth - 1]); //log(labels)
        const labels = salesData.map(item => item.short_month); //log(labels)
        const currentFYSales = salesData.map(item => parseFloat(item.current_fy) || null); //log(currentFYSales);
        const lastFYSales = salesData.map(item => parseFloat(item.last_fy) || null); //log(lastFYSales);

        const ctx = document.getElementById('salesComparisonChart').getContext('2d');
        const salesComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Current',
                        data: currentFYSales,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.2,
                    },
                    {
                        label: 'Last',
                        data: lastFYSales,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2,
                        tension: 0.2,
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        // backgroundColor: 'white',
                        // titleColor: 'grey',
                        // bodyColor: 'grey',
                        // borderColor: 'grey',
                        // borderWidth: 1,
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        });
    } catch (error) {
        log(error);
    }
}

export async function createStock({ applyCallback = null, cb = null }) {
    try {
        let res = await createStuff({
            title: 'Add Stock',
            table: 'stock',
            url: '/api/crud/create/stock',
            focus: '#product',
            resetBtn: true,
            cb: async () => {
                let rsp = await queryData({ key: 'stock' });
                let db = new xdb(storeId, 'stock');
                await db.clear();
                await db.put(rsp);
            },
        });
        let mb = res.mb;
        setStockBody(mb);

        let settigns = getSettings();
        let cs = settigns?.customSizes || []; //log(cs);
        cs.forEach(size => { jq(mb).find('#size_group').append(new Option(size.group_name, size.size_group)); })

        let cover = createEL('div');
        jq('#size_group').change(function () {
            try {
                // cover.style.width = jq(mb).find('form').width();
                jq(mb).find('div.row').append(cover);
                cover.innerHTML = '';

                let val = this.value; //log(val);
                if (val) {
                    jq(mb).find('button.apply').val('2')
                    jq('#size, #qty, #ean').prop('disabled', true);
                } else {
                    jq(mb).find('button.apply').val('1');
                    jq('#size, #qty, #ean').prop('disabled', false);
                    return;
                }

                let sizes = val.split(',');
                cover.className = 'd-flex jcb aic flex-wrap gap-2 my-3 w-100';

                sizes.forEach(size => {
                    let input = createEL('input');
                    input.type = 'text';
                    input.name = size;
                    input.className = 'form-control';
                    input.placeholder = size;
                    input.style.width = '80px';
                    input.title = size;
                    let label = jq('<label></label>').addClass('form-label').text(size);
                    let div = jq('<div></div>').addClass('form-floating').append(input, label);
                    jq(cover).append(div);
                })
            } catch (error) {
                log(error);
            }
        })

        jq(mb).find('button.apply').click(async function () {
            try {
                if (this.value == '1') return;
                let proceed = true;
                let obj = res.obj
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
                jq('div.p-status').removeClass('d-none');
                jq('div.error-msg').addClass('d-none').text('');
                let data = fd2json({ form: obj.form });

                let val = data.size_group;
                let sizes = val.split(',').map(size => size.trim()).filter(Boolean);
                let resArr = []
                delete data.size_groups;
                for (let size of sizes) {
                    data.qty = data[size];
                    if (data.qty) {
                        let obj = { ...data, size: size, qty: data[size], ean: '' }; //log(obj); return;
                        let res = await postData({ url: '/api/crud/create/stock', data: { data: obj } });
                        resArr.push(res?.data?.insertId);
                    }
                }

                if (resArr.length) {
                    jq('span.success').removeClass('d-none');
                    jq('span.fail, div.p-status').addClass('d-none');
                } else {
                    throw 'Stock data not saved.';
                }

                jq(this).removeClass('disabled');
            } catch (error) {
                log(error);
                jq('span.success, div.p-status').addClass('d-none');
                jq('span.fail').removeClass('d-none');
                jq('div.error-msg').removeClass('d-none').text(error);
                log(error);
            }
        })

    } catch (error) {
        log(error);
    }
}

export function setStockBody(mb) {
    jq(mb).find('div.pcode').after('<div class="d-flex jcb aic gap-3 odd size-group w-100"></div>');
    jq(mb).find('div.size, div.size_group').appendTo(jq(mb).find('div.size-group'));
    jq(mb).find('div.size_group, div.size').addClass('w-50');

    jq(mb).find('div.size-group').after('<div class="d-flex jcb aic gap-3 odd qty-cost"></div>');
    jq(mb).find('div.qty, div.cost').appendTo(jq(mb).find('div.qty-cost'));

    jq(mb).find('div.qty-cost').after('<div class="d-flex jcb aic gap-3 odd price-gst"></div>');
    jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.price-gst'));

    jq(mb).find('div.price-gst').after('<div class="d-flex jcb aic gap-3 odd wsp-mrp"></div>');
    jq(mb).find('div.wsp, div.mrp').appendTo(jq(mb).find('div.wsp-mrp'));

    jq(mb).find('div.wsp-mrp').after('<div class="d-flex jcb aic gap-3 odd disc-per w-100"></div>');
    jq(mb).find('div.discount, div.disc_type').appendTo(jq(mb).find('div.disc-per'));
    jq(mb).find('div.discount, div.disc_type').addClass('w-50');

    jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-3 even sec-sea"></div>');
    jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

    jq(mb).find('div.sec-sea').after('<div class="d-flex jcb aic gap-3 even cat-col"></div>');
    jq(mb).find('div.category, div.colour').appendTo(jq(mb).find('div.cat-col'));

    jq(mb).find('div.cat-col').after('<div class="d-flex jcb aic gap-3 even upc-label"></div>');
    jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));

    jq(mb).find('div.upc-label').after('<div class="d-flex jcb aic gap-3 even hsn-unit"></div>');
    jq(mb).find('div.hsn, div.unit').appendTo(jq(mb).find('div.hsn-unit'));
}

export async function holdOrder_() {
    try {
        let data = getOrderData();
        let items = data.items;
        if (!items.length) return;
        delete data.enableScan;
        delete data.itemsMode;
        delete data.settigns;
        setupIndexDB([
            {
                store: 'holds',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }],
            }
        ]);

        const db = new xdb(storeId, 'holds');
        db.add(data);
        resetOrder();
        refreshOrder();
    } catch (error) {
        log(error);
    }
}

export async function holdOrder() {
    try {
        let data = getOrderData();
        if (!data.items.length) return;
        delete data.enableScan;
        delete data.itemsMode;
        delete data.settigns;
        let party = data.party_name;
        let hd = JSON.stringify(data); //log(hd);
        let res = await postData({ url: '/api/hold-order', data: { party, data: hd } });
        if (res.data.insertId) {
            resetOrder();
            refreshOrder();
        }
    } catch (error) {
        log(error);
    }
}


export function setEditStockBody(mb) {
    jq(mb).find('div.product').after('<div class="d-flex jcb aic gap-3 odd pcode-size"></div>');
    jq(mb).find('div.pcode, div.size').appendTo(jq(mb).find('div.pcode-size'));

    jq(mb).find('div.pcode-size').after('<div class="d-flex jcb aic gap-3 odd qty-cost"></div>');
    jq(mb).find('div.qty, div.cost').appendTo(jq(mb).find('div.qty-cost'));

    jq(mb).find('div.qty-cost').after('<div class="d-flex jcb aic gap-3 odd price-gst"></div>');
    jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.price-gst'));

    jq(mb).find('div.price-gst').after('<div class="d-flex jcb aic gap-3 odd wsp-mrp"></div>');
    jq(mb).find('div.wsp, div.mrp').appendTo(jq(mb).find('div.wsp-mrp'));

    jq(mb).find('div.wsp-mrp').after('<div class="d-flex jcb aic gap-3 odd disc-per w-100"></div>');
    jq(mb).find('div.discount, div.disc_type').appendTo(jq(mb).find('div.disc-per'));
    jq(mb).find('div.discount, div.disc_type').addClass('w-50');

    jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-3 even sec-sea"></div>');
    jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

    jq(mb).find('div.sec-sea').after('<div class="d-flex jcb aic gap-3 even cat-col"></div>');
    jq(mb).find('div.category, div.colour').appendTo(jq(mb).find('div.cat-col'));

    jq(mb).find('div.cat-col').after('<div class="d-flex jcb aic gap-3 even upc-label"></div>');
    jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));

    jq(mb).find('div.upc-label').after('<div class="d-flex jcb aic gap-3 even hsn-unit"></div>');
    jq(mb).find('div.hsn, div.unit').appendTo(jq(mb).find('div.hsn-unit'));
}

// sendOrderEmail('257').then(d => log(d)).catch(e => log(e));

export async function sendOrderEmail(orderid) {
    try {
        let cnf = confirm('Send Order Email?');
        if (!cnf) return;
        let [rsp] = await queryData({ key: 'sendEmail', values: [orderid] }); //log(rsp); return 'ok';
        let email = rsp.email;
        let party = rsp.party_name;
        if (!email) { errorMsg('No Email Id found!'); return };
        let { entity } = getSettings()
        let key = `${entity.entity_id}-${rsp.order_id}`;
        // let link = `${window.location.origin}/order/?key=${key}`;
        let link = `https://api.ebsserver.in/order/?key=${key}`;
        let html = `<div class="position-fixed top-0 start-50 translate-middle-x m-2 w-20 z-5" id="sending-email">
                        <div class="d-flex justify-content-between align-items-center gap-2 bg-primary-subtle py-3 px-4 rounded">
                            <span class="fs-5 text-primary-emphasis">Sending Email...</span>
                            <div class="spinner-border spinner-border-sm text-primary-emphasis" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>`;
        jq('body').append(html);
        let res = await postData({ url: '/api/email/order', data: { email, link, party } });
        jq('#sending-email').remove();
        if (res.data.status) { }
    } catch (error) {
        log(error);
    }
}


export async function addPurchPymt(id, balance) {
    try {
        let res = await createStuff({
            title: 'Purchase Payment',
            table: 'purch_pymt',
            url: '/api/crud/create/payments',
            defaultInputValues: [{ inputId: 'purch_id', value: id }, { inputId: 'balance', value: balance }],
        });
        let mb = res.mb; //log(mb);

        const [cashInput] = jq(mb).find('#cash');
        const [bankInput] = jq(mb).find('#bank');
        const [amountInput] = jq(mb).find('#amount');

        cashInput.addEventListener('input', updateAmount);
        bankInput.addEventListener('input', updateAmount);

        function updateAmount() {
            const cashValue = parseNumber(cashInput.value) || 0;
            const bankValue = parseNumber(bankInput.value) || 0;
            const totalAmount = cashValue + bankValue;
            amountInput.value = parseNumber(totalAmount); // Format to two decimal places
        }
    } catch (error) {
        log(error);
    }
}

export async function _viewOrderDetails(id) {
    try {
        let [res] = await queryData({ key: 'orderdetailsbyid', values: [id] });
        let mb = showModal({
            title: 'Order Details',
            modalSize: 'modal-md',
            showFooter: false
        }).modal; //log(mb);
        let ul = jq('<ul></ul>').addClass('list-group');
        for (let k in res) {
            let key = jq('<span></span>').addClass('fw-500').text(titleCase(k));
            let value = jq('<span></span>').addClass('fw-300').text(res[k]);
            let li = jq('<li></li>').addClass('list-group-item d-flex jcb aic').append(key, value);
            jq(ul).append(li);
        }
        jq(mb).find(`div.modal-body`).html(ul);
        new bootstrap.Modal(mb).show();
    } catch (error) {
        log(error);
    }
}



// backgroundColor: [
//     'rgba(255, 99, 132, 0.6)',
//     'rgba(255, 159, 64, 0.6)',
//     'rgba(255, 205, 86, 0.6)',
//     'rgba(75, 192, 192, 0.6)',
//     'rgba(54, 162, 235, 0.6)',
//     'rgba(153, 102, 255, 0.6)',
//     'rgba(201, 203, 207, 0.6)'
//   ],
