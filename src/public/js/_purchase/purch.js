import { deleteIndexDBStore, setupIndexDB } from '../_localdb.js';
import help, { advanceQuery, createEL, createStuff, createTable, doc, fd2json, fd2obj, fetchTable, generateUniqueAlphaCode, jq, log, parseData, parseDecimal, parseLocal, parseLocals, parseNumber, popConfirm, popInput, postData, removeDecimal, roundOff, setTable, showTable, storeId, sumArray, titleCase, xdb, getSettings, showErrors, getSqlDate, queryData, calculateTotalTaxByGst, separateDecimal } from '../help.js';
import { _scanPurchProduct, _searchProduct, _searchPurchProduct, _searchSupplier, createEditParty, createEditSupplier, numerifyObject, } from '../module.js';
import { getOrderData, loadPartyDetails, purchase, updateDetails } from '../order.config.js';
import 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
// import '../_lib/xlsx.ful.min.js';

let url = document.URL; //log(url);
let page = `${window.location.origin}/apps/app/orders/create`;

$(document).ready(function (e) {
    if (e.altKey && e.key.toLowerCase() == 'c' && url === page) {
        let modal = jq('#ebsModal').is(':visible');
        if (!modal) jq('div.calculator').toggleClass('d-none'); jq('#equation').focus()
    }
});


let editAll = false;
doc.addEventListener('DOMContentLoaded', function () {

    let od = getOrderData(); //log(od.order_type);
    showPODetails();

    jq('#bill-date').change(function () { if (this.value) updateDetails({ purchase: { bill_date: this.value } }) })
    jq('#bill-num').blur(function () { if (this.value) updateDetails({ purchase: { bill_number: this.value } }) })

    jq('button.unpin-purch').click(function () {
        updateDetails({ pin_purch: false });
        jq('button.pin-purch, button.unpin-purch').toggleClass('d-none');
        jq('#purchase-order').removeClass('stick');
    })

    jq('button.pin-purch').click(function () {
        updateDetails({ pin_purch: true });
        jq('button.pin-purch, button.unpin-purch').toggleClass('d-none');
        jq('#purchase-order').addClass('sticky');
    })

    // let pin_purch = getOrderData()?.pin_purch || false;
    // jq('button.pin-purch').click(function () {
    //     updateDetails({ pin_purch: !pin_purch });
    //     jq('button.pin-purch, button.unpin-purch').toggleClass('d-none');
    // })

    // jq('button.unpin-purch').click(function () {
    //     jq('button.unpin-purch, button.pin-purch').toggleClass('d-none');
    //     updateDetails({ pin_purch: false });
    // })

    function isValidString(str) {
        // Regular expression pattern to match the format
        // const pattern = /^[0-9]{2}[A-Z]{5}[a-z]{5}[0-9]{2}[A-Z]{3}[0-9]{8}$/;
        // const pattern = /^[0-9]{2}[A-Z]{5}[a-z]{5}[0-9]{2}[A-Z]{3}[0-9]{8}(-[0-9]+)?$/;
        const pattern = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;

        // Test if the string matches the pattern
        return pattern.test(str);
    }

    jq('a.importjson').click(function () {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json'; // Only allow JSON files
            input.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const jsonData = JSON.parse(event.target.result);
                            // Do something with the imported data
                            // console.log(jsonData);
                            loadJPurchase(jsonData);
                        };
                        reader.readAsText(file);
                    } catch (error) {
                        console.error('Error importing JSON:', error);
                    }
                }
            });
            input.click();
        } catch (error) {
            log(error);
        }
    })

    jq('a.import-online').click(async function () {
        try {
            let key = prompt('Enter Order Key. eg. 69NCEZrype2MawDEc8SbeX-1728021690154');
            if (!key) return;
            key = key.trim();
            let isValidKey = isValidString(key); //log(isValidKey);
            if (!isValidKey) { showErrors('Invalid Key'); return };
            let arr = key.split('-');

            let [folder, fileName] = arr;
            let res = await axios.post(`${window.location.origin}/aws/download`, { folder, fileName });
            loadJPurchase(res.data)
        } catch (error) {
            log(error);
        }
    })

    function loadJPurchase(arr) {
        let { soldItems, orderData: [od] } = arr;
        let itemsArr = []
        soldItems.forEach(item => {
            let obj = {};
            obj.product = item.product;
            obj.pcode = item.pcode;
            obj.size = item.size;
            obj.unit = item.unit;
            obj.qty = parseNumber(item.qty);
            obj.hsn = item.hsn;
            obj.purch_price = parseNumber(item.price) - (parseNumber(item.disc) / parseNumber(item.qty));
            obj.cost_gst = item.gst;
            obj.disc_type = null,
                obj.brand = null,
                obj.colour = null,
                obj.label = null,
                obj.section = null,
                obj.season = null,
                obj.category = null,
                obj.upc = null,
                obj.ean = null,
                obj.mrp = null,
                obj.wsp = null,
                itemsArr.push(obj);
        })
        let disc_val = parseNumber(od.discount);
        if (disc_val) {
            let disc_per = ((parseNumber(disc_val) / od.subtotal) * 100);
            updateDetails({ purchase: { disc_per, disc: disc_per, disc_val } });
        }
        let items = itemsArr.map(item => setPurchItems(item));
        // log(od.order_date, getSqlDate(od.order_date));  return;
        // 69NCEZrype2MawDEc8SbeW-1728813319885
        updateDetails({ purchase: { items, bill_number: od.inv_number, bill_date: getSqlDate(od.order_date) } });
        showPODetails();
    }

    jq('input.srch-supplier').keyup(async function () {
        let key = this.value;
        if (!key) {
            jq('div.search-supplier').addClass('d-none').html('');
            return;
        };
        let data = await _searchSupplier(key);
        if (!data.length) { jq('div.search-supplier').addClass('d-none').html(''); return; }
        let tbl = createTable(data, false);
        jq(tbl.table).addClass('mb-1').removeClass('table-sm');
        jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, e) {
            jq(e).click(function () {
                let { id: supid, sup_id, supplier } = data[i];
                updateDetails({ purchase: { supid, sup_id, supplier } });
                showPODetails();
                jq('div.search-supplier').html('').addClass('d-none');
                jq('input.srch-supplier').val('');
                jq('#add-product').val('').focus();
            })
        })
        parseData({ tableObj: tbl, colsToRight: ['sup_id', 'contact'], colsToShow: ['supplier', 'sup_id', 'contact'] });

        jq('div.search-supplier').removeClass('d-none').html(tbl.table);
    }).on('search', function () { jq('div.search-supplier').addClass('d-none').html('') });

    jq('#searachBySupid').keyup(async function (e) {
        try {
            if (e.key == 'Enter') {
                let sup_id = this.value;
                let db = new xdb(storeId, 'supplier');
                let res = await db.searchByKey({ key: sup_id, indexes: ['sup_id'], limit: 1 }); //log(res);
                if (!res.length) return;
                const { id, supplier } = res[0];
                updateDetails({ purchase: { supid: id, sup_id, supplier } });
                showPODetails();
                jq(this).val('');
                jq('#add-product').val('').focus();
            }
        } catch (error) {
            log(error);
        }
    })

    jq('#addNewSupplier').click(function () {
        createEditSupplier({
            hideFields: ['gender', 'opening_bal'],
            applyCallback: async () => {
                try {
                    let res = await queryData({ key: 'latest_supplier' });
                    if (!res.length) return;
                    const { id: supid, sup_id, supplier } = res[0];
                    updateDetails({ purchase: { supid, sup_id, supplier } });
                    showPODetails();
                    let db = new xdb(storeId, 'supplier');
                    db.put(res);
                } catch (error) {
                    log(error);
                }
            }
        });
    });

    jq('span.edit-sup').click(function () {
        let id = getPurchData().supid; log(id);
        id && createEditSupplier({ update_id: id })
    })

    jq('span.view-sup-history').click(async function () {
        let { supid } = getPurchData(); log(supid);
        let url = window.location.origin + '/apps/app/supplier/ledger/?supplier=' + supid;
        window?.app?.node() ? window.app?.showA4(url) : window.open(url, '_blank');       
    })

    // jq('button.refresh-supdata').click(async function () {
    //     let rs = await advanceQuery({ key: 'supplier' });
    //     if (data.length) await db.put(data);
    // })

    jq('span.sync-sup')
        .hover(
            function () { jq(this).html('<i class="bi bi-arrow-clockwise"></i>') },
            function () { jq(this).html('<i class="bi bi-search"></i>') })
        .click(async function () {
            let { data } = await advanceQuery({ key: 'supplier' });
            let db = new xdb(storeId, 'supplier'); db.clear
            await db.put(data);
            jq('span.sync-sup, span.sync-sup-success').toggleClass('d-none');
            setTimeout(() => {
                jq('span.sync-sup, span.sync-sup-success').toggleClass('d-none');
            }, 3000);
        });

    jq('button.supplier-list').click(async function () {
        try {
            let db = new xdb(storeId, 'supplier');
            let data = await db.getColumns({
                columns: ['id', 'sup_id', 'supplier'], sortby: 'supplier',
            });
            if (data.length == 0) {
                let arr = await queryData({ key: 'supplier' });
                db.put(arr);
                return;
            }
            let { mb, tbody } = await showTable({
                title: 'Select Supplier',
                modalSize: 'modal-md',
                colsToHide: ['id'],
                serial: false,
                fixhead: false,
                data
            });
            jq(tbody).find('tr').addClass('role-btn').each(function (i, e) {
                jq(e).click(function () {
                    try {
                        let { id: supid, sup_id, supplier } = data[i];
                        updateDetails({ purchase: { supid, sup_id, supplier } });
                        jq(mb).modal('hide').remove();
                        showPODetails();
                    } catch (error) {
                        log(error);
                    }
                })
            })
        } catch (error) {
            log(error);
        }
    })

    jq('#manual-entry').click(function () {
        purchaseManual({})
    })
    jq('button.new-po').click(function () {
        popConfirm({
            el: this,
            msg: 'Set New Order?',
            cb: () => {
                purchase.tmp_id = Date.now(); //log(purchase);
                updateDetails({ purchase });
                showPODetails();
                jq('#purchase-order .completed').text('');
            }
        })
    })

    // jq('span.roundoff').click(function () {
    //     jq('span.roundoff, form.roundoff').toggleClass('d-none');
    //     jq('input.roundoff').focus();
    // })


    // jq('form.roundoff').submit(function (event) {
    //     event.preventDefault();
    //     let round = jq(this).find('input').val();
    //     jq('span.roundoff, form.roundoff').toggleClass('d-none');
    //     round = round == '' ? 0 : Number(round); //log(round);
    //     updateDetails({ purchase: { round } })
    //     showPODetails();
    // })

    jq('span.roundup').click(function (event) {
        const { items } = getPurchData();
        const total = items.map(item => item.total).reduce((prev, curr) => prev + curr, 0);
        const { decimal, integer } = separateDecimal(total);
        event.ctrlKey ? (updateDetails({ purchase: { round: 0, total } })) : (updateDetails({ purchase: { round: parseDecimal(decimal), total: integer } }))
        showPODetails();
    })

    jq('#scan-entry').change(function () {
        let scan = jq(this).is(':checked');
        scan ? updateDetails({ purchase: { scan: true } }) : updateDetails({ purchase: { scan: false } });
    })

    jq('#add-product').keyup(function (e) {
        let val = this.value.trim(); //log(val);
        if (!val) {
            jq('#hybrid-list').addClass('d-none')
            jq('#hybrid-search-list').html('');
            return;
        };
        let scan = getPurchData().scan;
        scan ? scanItems(e) : searchItems(val);
    })

    jq('button.close-hybridlist').click(function () {
        jq('#hybrid-list').addClass('d-none')
        jq('#hybrid-search-list').html('');
        jq('#add-product').val('').focus();
    })

    jq('a.clear-items').click(function () {
        updateDetails({ purchase: { items: [] } });
        showPODetails();
    })

    // jq('th.update-gst').click(function (event) {
    //     if (event.ctrlKey) {
    //         // Your click event code here
    //         // console.log("Click event with Ctrl key pressed.");
    //         popInput({
    //             el: this, type: 'number', ph: 'Cost GST', cb: (gst) => {
    //                 let items = getPurchData().items;
    //                 // const updatedItems = items.map(item => ({ ...item, cost_gst: gst }));
    //                 items.forEach(item => item.cost_gst = gst);
    //                 updateDetails({ purchase: { items } });
    //                 showPODetails();
    //             }
    //         })
    //     }
    // })

    jq('th.update-unit').click(function (event) {
        if (event.ctrlKey) {
            popInput({
                el: this, type: 'text', ph: 'UNIT', cb: (unit) => {
                    let items = getPurchData().items;
                    items.forEach(item => item.unit = unit);
                    updateDetails({ purchase: { items } });
                    showPODetails();
                }
            })
        }
    })

    jq('a.fit-page').click(function () { jq('#purch-table').toggleClass('overflow-auto') })

    jq('a.import-excel').click(function () {
        document.getElementById('import-excel').click();
        document.getElementById('import-excel').addEventListener('change', handleFileSelect, false);
        // const fileInput = document.getElementById('import-excel');
        // fileInput.addEventListener('click', handleFileSelect);
    })

    jq('a.del-purchpymt').click(function () {
        updateDetails({ purchase: { pymts: [] } });
        showPODetails();
    })

    jq('a.list-pymtentries').click(async function () {
        showPymts();
    })

    jq('a.new-purchpymt').click(async function () {
        let { pymts } = getPurchData();
        let { mb, form } = await createStuff({
            title: 'Payment',
            table: 'purchpymt',
            focus: '#cash',
            applyCallback: () => {
                let pymt = fd2obj({ form });
                pymts.push(pymt);
                updateDetails({ purchase: { pymts } });
                jq('span.success').removeClass('d-none');
            },
            cb: showPODetails,
        });

        jq(mb).find('#cash, #bank, #other').change(function () {
            let pymts = jq('#cash, #bank, #other').map(function () { return this.valueAsNumber || 0 }).get();
            let amount = sumArray(pymts); //log(amount);
            jq('#amount').val(amount);
        })
    })

    jq('button.add-purchpymt').click(async function () {
        let { pymts } = getPurchData(); //log(pymts);
        let index = pymts.length - 1;
        let pymt = pymts[index]; //log(pymt); return;
        let defaultInputValues = pymts.length ? ([
            { inputId: 'cash', value: pymt.cash },
            { inputId: 'bank', value: pymt.bank },
            { inputId: 'other', value: pymt.other },
            { inputId: 'amount', value: pymt.amount },
            { inputId: 'bank_id', value: pymt.bank_id },
            { inputId: 'bank_mode', value: pymt.bank_mode },
            { inputId: 'pymt_method', value: pymt.pymt_method },
            { inputId: 'notes', value: pymt.notes },
            { inputId: 'pymt_date', value: pymt.pymt_date },
        ]) : [];

        let { mb, form } = await createStuff({
            title: 'Payment',
            table: 'purchpymt',
            focus: '#cash',
            defaultInputValues,
            applyButtonText: pymts.length ? 'Update' : 'Add',
            applyCallback: () => {
                let pymt = fd2obj({ form }); log(pymt);
                pymts.length ? pymts.splice(index, 1, pymt) : pymts.push(pymt);
                updateDetails({ purchase: { pymts } });
                jq('span.success').removeClass('d-none');
            },
            cb: showPODetails,
        });

        jq(mb).find('#cash, #bank, #other').change(function () {
            let pymts = jq('#cash, #bank, #other').map(function () { return this.valueAsNumber || 0 }).get(); //log(pymts);
            let amount = sumArray(pymts); log(amount);
            jq('#amount').val(amount);
        })
    })

    jq('a.hold-purch').click(async function () {
        // deleteIndexDBStore(storeId, 'purch_hold'); return;
        setupIndexDB([
            {
                store: 'purch_hold',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }],
            }
        ]); //return;

        let data = getPurchData();
        if (!data.items.length) return;
        data.dated = help.getSqlDate();

        const db = new xdb(storeId, 'purch_hold');
        db.add(data);
        updateDetails({ purchase: purchase, });
        showPODetails();
    })

    jq('a.unhold-purch').click(async function () {
        let db = new xdb(storeId, 'purch_hold');
        let data = await db.getColumns({
            columns: ['supplier', 'dated', 'id'],
            sortby: 'id'
        });
        if (!data.length) return;
        let tbl = await setTable({ data, colsToHide: ['id'], colsToRight: ['dated'], serial: false, });
        jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, event) {
            jq(event).click(async function () {
                let id = jq(this).closest('tr').find(`[data-key="id"]`).text();
                let [data] = await db.get(id);
                await db.delete(id);
                delete data.id;
                updateDetails({ purchase: data });
                showPODetails();
                jq('div.quick-panel').addClass('d-none');
            })
        })
        let div = jq('<div></div>').addClass('').html(tbl.table);
        jq('div.panel-body').html(div);
        jq('div.quick-panel').removeClass('d-none');
    });

    jq('button.close-panel').click(function () {
        jq('div.panel-body').html('');
        jq('div.quick-panel').addClass('d-none');
    })

    jq('span.purchgst').click(function () {
        jq('span.purchtax, form.purchgst').toggleClass('d-none');
        jq('input.purchgst').focus();
    })

    jq('span.purchdisc, button.closedisc-box').click(function () {
        jq('div.purchdisc-box').toggleClass('d-none');
        jq('input.disctype-percent').focus().select();
    })

    jq('#purch-disc-form').submit(function (e) {
        e.preventDefault();
        let { disc_per, disc_val } = fd2obj({ form: this });
        let { items } = getPurchData();
        const subtotal = items.map(item => (item.purch_price * item.qty)).reduce((prev, curr) => prev + curr, 0); //log(subtotal); //return;
        if (disc_val) { disc_per = ((parseNumber(disc_val) / subtotal) * 100); }
        if (disc_per) { disc_val = subtotal * (parseNumber(disc_per) / 100) }
        jq('div.purchdisc-box').toggleClass('d-none');
        disc_per = parseNumber(disc_per);
        editAll = true;
        updateDetails({ purchase: { disc_per, disc: disc_per, disc_val: roundOff(disc_val) } });
        showPODetails()
    })

    jq('button.freight-paid').click(function () {
        jq('input.freight-paid, span.freight-paid').toggleClass('d-none');
        jq('input.freight-paid')[0].focus();
    })

    jq('input.freight-paid').on('keypress', function (e) {
        let freight = this.value;
        if (e.key === 'Enter') {
            freight > length ? updateDetails({ purchase: { freight: parseNumber(freight) } }) : updateDetails({ purchase: { freight: 0 } });
            jq('input.freight-paid, span.freight-paid').toggleClass('d-none');
            showPODetails()
        }
    })

    jq('form.purchgst').submit(function (e) {
        e.preventDefault();
        let { gst } = fd2obj({ form: this });
        let items = getPurchData().items;
        items.forEach(item => item.cost_gst = gst);
        editAll = true;
        updateDetails({ purchase: { items } });
        showPODetails();
        jq('span.purchtax, form.purchgst').toggleClass('d-none');
    })

    jq('button.execute-po').click(function () {
        let pd = getPurchData();
        popConfirm({
            el: this,
            msg: pd.edit_id ? 'Update Order?' : 'Create Order?',
            cb: pd.edit_id ? updateOrder : saveOrder
        })
    })

    jq('#purch-comments').keyup(function () {
        updateDetails({ purchase: { notes: this.value } });
    })
})

// $('#purchase-order').scroll(function(){
//     log('ok');
// })



function getPurchData() { return getOrderData().purchase }

function idExists(array, id) {
    // Use the find() method to efficiently search for the object with the given ID
    const foundObject = array.find(obj => obj.id === id);

    // Return true if the object was found, otherwise return false
    return foundObject !== undefined;
}

function findMatchingIds(arr1, arr2) {
    // Create a set of IDs from arr1 for efficient lookup
    const idSet = new Set(arr1.map(obj => obj.id));

    // Filter arr2 to keep only objects whose IDs are in the set
    const matchingIds = arr2.filter(obj => idSet.has(obj.id)).map(obj => obj.id);

    return matchingIds;
}

function highlightMatchingRows(table, matchingIds) {
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let hasMatchingId = false;

        cells.forEach(cell => {
            if (cell.getAttribute('data-key') === 'id' && matchingIds.includes(Number(cell.textContent))) {
                hasMatchingId = true;
                // console.log('Match found for ID:', cell.textContent); // Debugging line
                return;
            }
        });

        if (hasMatchingId) {
            row.classList.add('fw-500');
        }
    });
}

async function scanItems(e) {
    try {
        if (e.key == 'Enter') {
            let val = e.target.value;
            if (!val) return;
            let items = getPurchData().items; //log(items);
            let arr = await _scanPurchProduct(val); //log(arr);
            if (arr.length) {
                let data = arr[0];
                delete data.sku;
                let obj = setPurchItems(data);
                obj.qty = 1;
                if (items.length) {
                    let exist = items.some(item => item.id == obj.id); //log(exist);
                    if (!exist) {
                        items.push(obj);
                        updateDetails({ purchase: { items } });
                        showPODetails();
                    }
                }
            }
        }
    } catch (error) {
        log(error);
    }
}

async function searchItems(val) {
    try {
        let arr = await _searchPurchProduct(val); //log(arr); return;
        if (!arr.length) {
            jq('#hybrid-search-list').html('');
            jq('#hybrid-list').addClass('d-none')
            return;
        }
        let res = await fetchTable({}, false, true, arr); //log(res);
        let items = getPurchData().items || []; //log(arr, items)
        let { table, tbody, thead } = res;
        parseData({
            tableObj: res,
            colsToShow: ['hsn', 'product', 'pcode', 'size', 'cost', 'price'],
            colsToParse: ['cost', 'price'],
            colsToRight: ['cost', 'price'],

            // colsToRename: [{ old: 'purch_price', new: 'pp' }],
            // colsTitle: [{ col: 'purch_price', title: 'Purchase Price' }]
        })

        let match = findMatchingIds(arr, items); //log(match);

        highlightMatchingRows(tbody, match);

        jq(table).find('tr').each(function (i, e) {
            jq(e).addClass('role-btn').click(function () {
                jq(e).addClass('fw-500');
                let index = jq(e).index();
                let data = arr[index]; //log(data); return;
                delete data.sku;
                let exist = idExists(items, data.id); //log(exist);
                if (!exist) {
                    let obj = setPurchItems(data);
                    obj.qty = 1;
                    items.push(obj);
                    updateDetails({ purchase: { items } });
                    showPODetails();
                }
            })
        })
        // jq(tbody).find(`[data-key='hsn']`).addClass('text-secondary')
        jq(tbody).find(`[data-key="cost"], [data-key="product"]`).addClass('fw-500')
        jq(tbody).find(`[data-key="price"], [data-key='hsn']`).addClass('fst-italic text-secondary')
        jq('#hybrid-list').removeClass('d-none')
        jq('#hybrid-search-list').html(table);

    } catch (error) {
        log(error);
    }
}

async function purchaseManual({ title = 'Add Item', applyButtonText = 'Apply', hideFields = [], defaultInputValues = [] }) {
    try {
        let res = await createStuff({
            title,
            table: 'purch',
            focus: '#product',
            buttonApply: false, // apply button will be proessed from here
            applyButtonText,
            defaultInputValues,
            hideFields,
            resetBtn: true,
        });

        let mb = res.mb;

        setManualBody(mb);

        let settigns = getSettings();
        let cs = settigns?.customSizes || []; //log(cs);
        cs.forEach(size => { jq(mb).find('#size_group').append(new Option(size.group_name, size.size_group)); })

        let cover = createEL('div');
        jq('#size_group').change(function () {
            try {
                let val = this.value;
                jq(mb).find('div.row').append(cover);
                cover.innerHTML = '';
                // cover.style.width = jq(mb).find('form').width();

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
                let proceed = true;
                let obj = res.obj;

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
                let data = fd2json({ form: obj.form }); //log(data); //return;

                // update
                if (Boolean(data.updated)) {
                    let po = getPurchData();
                    data.disc = po.disc_per;
                    data = setPurchItems(data);
                    data.edited = true;
                    let index = data.index;
                    let items = po.items;
                    items.splice(index, 1, data);
                    updateDetails({ purchase: { items } });
                    showPODetails();
                    return;
                }

                let sg = data.size_group; //log(sg); //return;
                let items = getPurchData().items || [];

                if (sg) {
                    // multi
                    let sizes = sg.split(',').map(size => size.trim()).filter(Boolean);

                    for (let size of sizes) {
                        data.qty = data[size];
                        if (data.qty) {
                            let obj = { ...data, size: size, qty: data[size], ean: '' };
                            obj = setPurchItems(obj);
                            delete obj.size_group; //log(obj);
                            items.push(obj); //log(items);
                            updateDetails({ purchase: { items } })
                        }
                    }
                } else {
                    // single
                    let obj = setPurchItems(data); //log(obj);                    
                    items.push(obj);
                    updateDetails({ purchase: { items } })
                }
                showPODetails();


            } catch (error) {
                log(error);
            }
        })

    } catch (error) {
        log(error);
    }
}

function setPurchase() {
    try {
        let data = getPurchData();
        let items = data.items || [];
        let disc = data.disc_per;
        if (!items.length) return;
        let arr = [`brand`, `category`, `colour`, `disc_type`, `hsn`, `label`, `season`, `section`, `size`, `upc`, `unit`, `wsp`, `ean`, `discount`, `pcode`];


        let modifiedItems = items.map(item => {
            item.disc = disc;
            if (editAll) item.edited = true;
            arr.forEach(a => {
                if (item[a] == '' || item[a] == 'null' || item[a] == 'undefined') item[a] = '';
            })
            let obj = setPurchItems(item); //log(obj);
            return obj;
        });
        updateDetails({ purchase: { items: modifiedItems } });
    } catch (error) {
        log(error);
    }
}

// log(numerifyObject({cost: "22.50"}))

function setPurchItems(items) {
    try {
        let obj = numerifyObject(items); //log(obj.cost);
        let { qty, purch_price: pp, cost_gst, size, unit, disc = 0 } = obj;
        let tax = 0;
        let cost = pp > 0 ? pp : 0;
        let discPerPeice = 0;
        if (qty == '') qty = 1;

        if (disc) {
            discPerPeice = pp * (disc / 100);
            cost = pp - discPerPeice;
        }

        let clc = cost > 0 ? ((pp * qty) - (qty * discPerPeice)) : 0;
        if (cost_gst) { tax = (clc * (cost_gst / 100)); }

        obj.qty = qty;
        obj.tax = roundOff(tax);
        obj.net = (clc);
        obj.clc = roundOff(clc);
        obj.cost = cost;
        obj.total = (clc + tax);
        obj.disc = (disc);
        obj.purch_disc = (discPerPeice * qty);
        obj.size = size && size.toUpperCase();
        obj.unit = unit && unit.toUpperCase();
        return obj;
    } catch (error) {
        log(error);
        return null;
    }
}

function setTotals() {
    try {
        const od = getPurchData(); //log(od.pymts)
        const { round = 0, pymts = [], items = [], freight = 0 } = od;
        if (!items.length) {
            updateDetails({ purchase: { subtotal: 0, tax: 0, qty: 0, total: 0, balance: 0 } });
            return;
        };

        let itemsArr = items.filter(item => !item.hasOwnProperty('del')); //log(arr);
        let pymtsArr = pymts.filter(pymt => !pymt.hasOwnProperty('del')); //log(arr);

        const subtotal = itemsArr.map(item => (parseNumber(item.purch_price) * parseNumber(item.qty))).reduce((prev, curr) => prev + curr, 0); //log(subtotal);

        const ttl = itemsArr.map(item => parseNumber(item.total)).reduce((prev, curr) => prev + curr, 0);
        const tax = itemsArr.map(item => parseNumber(item.tax)).reduce((prev, curr) => prev + curr, 0); //log(tax);
        const net = itemsArr.map(item => parseNumber(item.net)).reduce((prev, curr) => prev + curr, 0); //log(net);
        const qty = itemsArr.map(item => parseNumber(item.qty)).reduce((prev, curr) => prev + curr, 0);
        const pymt = pymtsArr.map(pymt => parseNumber(pymt.amount)).reduce((prev, curr) => prev + curr, 0); //log(pymt);

        const total = (ttl + freight) - round;
        const disc = parseNumber(od.disc);
        const disc_val = disc ? (subtotal * (disc / 100)) : 0;

        updateDetails({
            purchase: {
                subtotal: roundOff(subtotal),
                tax: roundOff(tax),
                qty: roundOff(qty),
                total: roundOff(total),
                pymt: roundOff(pymt),
                net: roundOff(net),
                disc_val: roundOff(disc_val),
                balance: roundOff(total - pymt)
            }
        });
    } catch (error) {
        log(error);
    }
}

async function showPymts() {
    try {
        let { pymts } = getPurchData();
        if (!pymts.length) return;
        let tbl = await showTable({
            title: 'Payment Entries',
            fixhead: false,
            data: pymts,
            alignRight: true,
            colsToHide: ['pymt_date', 'pymt_for', 'bank_id', 'bank_mode', 'pymt_method', 'notes', 'del'],
        });
        jq(tbl.thead).find('tr').addClass('align-middle').each(function () { jq(this).append(`<th data-key="delete" class="text-end">DELETE</th>`) });
        jq(tbl.tbody).find('tr').addClass('align-middle').each(function () { jq(this).append(`<td data-key="delete" class="text-end"></td>`) });

        jq(tbl.tbody).find(`[data-key="delete"]`).each(function () {
            let delPymt = createEL('span');
            let undo = createEL('span');
            jq(delPymt).addClass('role-btn text-danger del-entry').click(function () {
                try {
                    // let pymts = getPurchData().pymts;
                    let index = jq(this).closest('tr').index();
                    if (index < 0 || index >= pymts.length) { throw new Error('Invalid index'); }
                    let pymt = pymts[index];

                    if (pymt.purch_id) {
                        pymt.del = true;
                        pymts.splice(index, 1, pymt);
                        jq(this).closest('tr').addClass('text-decoration-line-through');
                        jq(this).addClass('d-none');
                        jq(undo).removeClass('d-none');
                        updateDetails({ purchase: { pymts } });
                        showPODetails();
                    } else {
                        pymts.splice(index, 1);
                        updateDetails({ purchase: { pymts } });
                        jq(this).closest('tr').remove();
                        if (!pymts.length) jq(tbl.mb).modal('hide').remove();
                        showPODetails();
                    }
                } catch (error) {
                    log(error);
                }
            }).html('<i class="bi bi-x-lg"></i>').prop('title', 'Delete Entry');

            jq(undo).addClass('role-btn d-none undel-entry').click(function () {
                // let pymts = getPurchData().pymts;
                let index = jq(this).closest('tr').index();
                if (index < 0 || index >= pymts.length) { throw new Error('Invalid index'); }
                let pymt = pymts[index];
                delete pymt.del;
                pymts.splice(index, 1, pymt);
                jq(this).addClass('d-none');
                jq(delPymt).removeClass('d-none');
                jq(this).closest('tr').removeClass('text-decoration-line-through');
                updateDetails({ purchase: { pymts } });
                showPODetails();
            }).html('<i class="bi bi-arrow-counterclockwise"></i>').prop('title', 'Undo Delete');

            let div = createEL('div');
            jq(div).addClass('d-flex jce aic gap-2').append(delPymt, undo);

            jq(this).html(div);
        })

        pymts.forEach((pymt, i) => {
            if (pymt.del) {
                let [tr] = jq(tbl.tbody).find(`tr`).eq(i);
                jq(tr).addClass('text-decoration-line-through').find('span.del-entry, span.undel-entry').toggleClass('d-none');
            }
        })
    } catch (error) {
        log(error);
    }
}

function setItemsTable() {
    try {
        let pd = getPurchData();
        let items = pd.items || []; //log(items); return;
        let tbody = jq('#items-body')[0];

        if (items?.length == 0) {
            jq(tbody).html('');
            updateDetails({ purchase: { subtotal: 0, tax: 0, qty: 0, total: 0, balance: 0 } });
            return
        };

        jq('#items-body').empty();

        const closeButton = `
            <div class="d-flex jce aic gap-2" style="padding-right: 1px;">
                <span class="role-btn btn--edit" title="Edit Item"><i class="bi bi-pencil-square"></i></span>
                <span class="role-btn btn--plus" title="Repete Item"><i class="bi bi-plus-lg"></i></span>
                <span class="role-btn btn--del" title="Delte Line"><i class="bi bi-x-lg"></i></span>
                <span class="role-btn btn--undo d-none" title="Undo Delete"><i class="bi bi-arrow-counterclockwise"></i></span>
            </div>
        `;

        // create table
        items.forEach((obj, i) => {
            let td = null, tr = null;
            tr = createEL('tr');
            for (let k in obj) {
                let { hsn, qty, unit, product, size, cost, purch_price, price, disc, cost_gst, clc, net, tax, total, pcode, ean, id, avl, edited = false, adl_disc = 0, purch_disc = 0 } = obj;

                const roundArr = ['price', 'disc', 'cost_gst', 'clc', 'net', 'tax', 'total']

                for (const r of roundArr) {
                    obj[r] = parseNumber(obj[r]);
                    obj[r] = roundOff(obj[r]);
                }

                let discstr = disc ? (disc) + '%' : '';
                let strprod = pd?.edit_id ? (edited ? `${product} <span class="text-warning ms-2" title="This item will be Updated!">*</span>` : product) : product;
                td = `
                    <td class="text-secondary fw-light fst-italic"></td>
                    <td class="d-none" data-key="id">${id || ''}</td>
                    <td class="role-btn change-ean" data-key="ean">${ean || ''}</td>
                    <td class="role-btn change-hsn" data-key="hsn">${hsn || ''}</td>
                    <td class="role-btn change-pcode" data-key="pcode">${pcode || ''}</td>
                    <td class="role-btn change-product" data-key="product">${strprod}</td>
                    <td class="role-btn change-size" data-key="size" title="Change Szie">${size || ''}</td>
                    <td class="role-btn change-unit" data-key="unit" title="Change Unit">${unit || ''}</td>
                    <td class="role-btn change-qty text-center" data-avlqty="${avl}" title="Change Quantity" >${qty || 0}</td>
                    <td class="role-btn change-pp text-end" data-key="purch_price" title="Change Purchase Price">${parseLocals(purch_price)}</td>
                    <td class="role-btn change-sp text-end fw-light fst-italic text-secondary" data-key="price" title="Change Selling Price">${parseLocal(price)}</td>
                    <td class="text-end d-none">${discstr}</td>
                    <td class="text-end text-secondary fst-italic purch-disc">${roundOff(purch_disc / qty)}</td>
                    <td class="text-end text-secondary fst-italic">${(cost)}</td>
                    <td class="role-btn text-end change-cgst" title="Change Cost GST">${cost_gst ? cost_gst + '%' : ''}</td>
                    <td class="text-end d-none">${parseLocals(net)}</td>
                    <td class="text-end text-secondary" data-ebs="select">${tax ? parseLocals(tax) : 0}</td>
                    <td class="text-end" data-ebs="select">${total && parseLocals(total)}</td>
                    <td class="d-none">${clc}</td>                    
                    <td class="d-none adl-disc">${adl_disc}</td>                    
                    <td class="text-end">${closeButton}</td>
                `;
            }

            jq(tr).html(td);
            if (obj.del) {
                jq(tr).addClass('text-decoration-line-through');
                jq(tr).find('span.btn--del, span.btn--undo').toggleClass('d-none');
            }

            jq('#items-body').append(tr);

            if (obj.purch_id) { jq(tbody).find('span.btn--plus').addClass('d-none') }
        });

        // set table
        // select line
        jq(tbody).find(`[data-ebs="select"]`).addClass('role-btn').click(function (i, e) {
            jq(this).closest('tr').toggleClass('fw-500');
        })

        // delete line
        jq(tbody).find('span.btn--del').click(function () {
            try {
                let index = jq(this).closest('tr').index(); //log(index);
                if (index < 0 || index >= items.length) { throw new Error('Invalid index'); }
                let item = items[index];

                if (item.purch_id) {
                    item.del = true;
                    items.splice(index, 1, item);
                    updateDetails({ purchase: { items } });
                } else {
                    items.splice(index, 1);
                    updateDetails({ purchase: { items } });
                    jq(this).closest('tr').remove();
                }
                showPODetails();
            } catch (error) {
                log(error);
            }
        })

        jq(tbody).find('span.btn--undo').click(function () {
            let index = jq(this).closest('tr').index(); //log(index);
            if (index < 0 || index >= items.length) { throw new Error('Invalid index'); }
            let item = items[index];
            delete item.del;
            items.splice(index, 1, item);
            updateDetails({ purchase: { items } });
            showPODetails();
        })

        // repete item
        jq(tbody).find('span.btn--plus').click(function () {
            let index = jq(this).closest('tr').index();
            const obj = Object.assign({}, items[index]);
            delete obj.avl;
            delete obj.supid;
            delete obj.sold;
            delete obj.gr;
            delete obj.purch_on;
            delete obj.purch_num;
            delete obj.defect;
            delete obj.purch_id;
            obj.id = null; obj.sku = null; obj.ean = null;
            items.splice(index + 1, 0, obj);
            updateDetails({ purchase: { items } });
            showPODetails();
        })

        // edit line
        jq(tbody).find('span.btn--edit').click(function () {
            try {
                let index = jq(this).closest('tr').index();
                let obj = items[index];
                function objectToArray(obj) {
                    delete obj.size_group;

                    const array = [];
                    for (const key in obj) {
                        array.push({ inputId: key, value: obj[key] });
                    }
                    return array;
                }

                purchaseManual({
                    title: 'Edit Item',
                    applyButtonText: 'Update',
                    hideFields: ['size_group'],
                    defaultInputValues: [
                        { inputId: 'product', value: obj.product },
                        { inputId: 'pcode', value: obj.pcode },
                        { inputId: 'size', value: obj.size },
                        { inputId: 'unit', value: obj.unit },
                        { inputId: 'qty', value: obj.qty },
                        { inputId: 'purch_price', value: obj.purch_price || obj.cost },
                        { inputId: 'cost_gst', value: obj.cost_gst },
                        { inputId: 'price', value: obj.price },
                        { inputId: 'gst', value: obj.gst },
                        { inputId: 'wsp', value: obj.wsp },
                        { inputId: 'mrp', value: obj.mrp },
                        { inputId: 'discount', value: obj.discount },
                        { inputId: 'disc_type', value: obj.disc_type },
                        { inputId: 'brand', value: obj.brand },
                        { inputId: 'section', value: obj.section },
                        { inputId: 'season', value: obj.season },
                        { inputId: 'category', value: obj.category },
                        { inputId: 'colour', value: obj.colour },
                        { inputId: 'upc', value: obj.upc },
                        { inputId: 'hsn', value: obj.hsn },
                        { inputId: 'ean', value: obj.ean },
                        { inputId: 'cost', value: obj.cost },
                        { inputId: 'index', value: index },
                        { inputId: 'updated', value: true },
                    ]
                });

                showPODetails();
            } catch (error) {
                log(error);
            }
        });

        function editProperty(key, className, propertyName, placeholder, type = 'number', ucase = false, value = true) {
            jq(tbody).find(className).click(function () {
                let index = jq(this).closest('tr').index();
                let item = items[index];
                popInput({
                    el: this,
                    type,
                    value: value ? item[key] : '',
                    name: propertyName,
                    ph: placeholder,
                    cb: (val) => {
                        let index = jq(this).closest('tr').index();
                        let obj = items[index];
                        obj.edited = true;
                        obj[propertyName] = ucase ? val.toUpperCase().trim() : val.trim();
                        items.splice(index, 1, obj);
                        updateDetails({ purchase: { items } });
                        showPODetails();
                    }
                });
            });
        }

        editProperty('price', 'td.change-sp', 'price', 'Price',);
        editProperty('purch_price', 'td.change-pp', 'purch_price', 'Purchase Price');
        editProperty('qty', 'td.change-qty', 'qty', 'QTY', 'number', false);
        editProperty('cost_gst', 'td.change-cgst', 'cost_gst', 'GST');
        editProperty('size', 'td.change-size', 'size', 'SIZE', 'text', true);
        editProperty('unit', 'td.change-unit', 'unit', 'UNIT', 'text', true);
        editProperty('hsn', 'td.change-hsn', 'hsn', 'HSN', 'text');
        editProperty('pcode', 'td.change-pcode', 'pcode', 'PCODE', 'text', true);
        editProperty('product', 'td.change-product', 'product', 'Product', 'text', true);
        editProperty('ean', 'td.change-ean', 'ean', 'EAN', 'text');

    } catch (error) {
        log(error);
    }
}

function calculateGSTsTotal(data) {
    try {
        if (!data) {
            jq('div.purchase-gst').removeClass('border-end').html('');
            return;
        }
        let arr = calculateTotalTaxByGst(data);
        let ul = jq('<ul></ul>').addClass('list-group list-group-flush').css('max-width', '425px');
        jq('div.purchase-gst').html('');
        arr.forEach(item => {
            let gst = jq('<span></span>').text(`GST ${item.gst}%`)
            let tax = jq('<span></span>').text(`${parseDecimal(item.totalTax)}`).css('min-width', '95px').addClass('text-end')
            let li = jq('<li></li>').addClass('list-group-item d-flex jcb aic py-1').append(gst, tax);
            jq(ul).append(li);
            jq('div.purchase-gst').html(ul).addClass('border-end');
        })
    } catch (error) {
        log(error);
    }
}

function showPODetails() {
    try {
        setPurchase();
        setTotals();
        setItemsTable();
        let pd = getPurchData();
        calculateGSTsTotal(pd.items)
        let { subtotal, total, tax, qty, disc_val, pymt, disc_per, scan, balance, round, freight, update = false, notes = null } = pd; //log(update);
        round = parseNumber(round);
        let str = disc_val ? `${(disc_per)}% (${(disc_val)})` : 0; //log(str, disc_per);
        // jq('button.set-total, button.add-pymt, button.exc-order, button.cash-pymt').removeClass('disabled');
        // total = total - round
        jq('span.total-qty, h3.order-qty').text(parseLocals(qty));
        jq('span.purchtax').text(tax);
        jq('span.purcdisc').html(str)
        jq('span.purcpymt').text(pymt);
        jq('span.roundoff').html(Math.abs(round))
        jq('span.pbalance').text(balance);
        jq('span.subtotal').text(subtotal);
        jq('span.freight-paid').text(freight);
        jq('span.purchamt, h3.purchamt').text(total);
        jq('h3.purchqty').text(qty);
        jq('h3.supplier-name').text(pd.supplier);
        jq('#bill-num').val(pd.bill_number);
        jq('#bill-date').val(pd.bill_date);
        jq('#scan-entry').prop('checked', scan);
        jq('#purch-comments').val(notes);
        jq('div.sup-details').toggleClass('d-none', !pd.supid)
        if (total > 0 && balance === 0) jq('.paid-status').removeClass('text-danger').addClass('text-success').text('PAID');
        if (total === 0) jq('.paid-status').text('');
        if (balance > 0) jq('.paid-status').addClass('text-danger').text('UNPAID');
        if (update) jq('button.execute-po').text('UPDATE');

        // jq('h3.pymts, h3.balance').toggleClass('d-none', total == 0);
    } catch (error) {
        log(error);
    }
}

function handleFileSelect(evt) {
    const files = evt.target.files;

    if (files.length === 0) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);

        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log(json); // Array of objects representing the Excel data
        } catch (error) {
            console.error('Error parsing Excel file:', error);
        }
    };

    reader.readAsArrayBuffer(files[0]);
}

// getMaxSku().then(d=>log(d)).catch(err=>log(err));

function generate13DigitRandomNumber() {
    const min = 1000000000000; // 13 digits starting with 1
    const max = 9999999999999; // 13 digits ending with 9

    const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    return randomNumber;
}

function generateSKU(startNumber, length) {
    const base = 10; // Base for the number system (10 for decimal)
    const minDigits = 10; // Minimum number of digits

    // Ensure the start number has at least the minimum number of digits
    while (startNumber.toString().length < minDigits) {
        startNumber *= base;
    }

    const skuNumbers = [];
    for (let i = 0; i < length; i++) {
        skuNumbers.push(startNumber + i);
    }
    return skuNumbers;
}


function setItems(purch_id, tmp_id, items) {
    let str = '';
    let skus = generateSKU(Date.now(), items.length); //log(items);
    items.forEach((item, i) => {
        let product = item['product'];
        let pcode = item['pcode'];
        product = String(product).replace(/'/g, "\\'");
        pcode = String(pcode).replace(/'/g, "\\'");
        str += `('${skus[i]}','${item['ean']}','${item['hsn']}','${item['upc']}','${pcode || null}','${product}','${item['mrp'] || null}','${item['price'] || null}','${item['wsp'] || null}','${item['gst'] || null}','${item['purch_price'] || null}','${item['cost'] || null}','${item['cost_gst'] || null}','${item['unit']}','${item['size']}',${item['qty']},${item['discount'] || null},'${item['disc_type']}','${item['colour']}','${item['season']}','${item['section']}','${item['category']}','${item['label']}','${item['brand']}',${purch_id},'${tmp_id}'),`;
    });
    // log(str); return;
    let updatedStr = str.replace(/'null'/g, null);  //log(updatedStr); return;  
    // updatedStr = updatedStr.replace(/""/g, null);  //log(updatedStr); return;  
    return updatedStr.slice(0, -1) + ";";
}

async function saveOrder() {
    try {
        let pd = getPurchData();
        if (!pd.supid) throw 'Missing Supplier';
        if (!pd.items.length) throw 'Missing Items';
        if (!pd.tmp_id) pd.tmp_id = Date.now();
        jq('div.porder-status').removeClass('d-none');

        let data = {
            supid: pd.supid,
            order_date: help.getSqlDate(),
            order_number: pd.tmp_id,
            bill_date: pd.bill_date,
            bill_type: pd.order_type,
            bill_number: pd.bill_number,
            sub_total: pd.subtotal,
            bill_amount: pd.total,
            discount: pd.disc_val,
            tax_amount: pd.tax,
            gst_roundoff: pd.round,
            quantity: pd.qty,
            freight: null,
            fin_year: help.getFinYear(pd.bill_date),
            notes: null,
        }; //log(data); return;



        // add purchase
        let res = await postData({ url: '/api/crud/create/purchase', data: { data } });
        let purch_id = res.data.insertId; //log(purch_id);
        jq('#purchase-order .completed').text('10%')
        if (!purch_id) throw 'something went wrong!';

        // let index = 0;
        // for (let item of pd.items) {
        // item.temp_id = pd.tmp_id;
        // item.purch_id = purch_id;
        // await postData({ url: '/api/crud/create/stock', data: { data: item } });
        // jq('#purchase-order .completed').text(Math.round(index / (pd.items.length - 1) * 95) + '%');
        // index++
        // }


        // add items
        // let sku = await getMaxSku(); 
        let str = setItems(purch_id, pd.tmp_id, pd.items); //log(str); //return;
        let rsp = await advanceQuery({ key: 'insertStock', bulk: true, bulkstr: str }); //log(rsp);
        jq('#purchase-order .completed').text('75%')

        // add paymetns
        if (pd.pymts.length) {
            for (let pymt of pd.pymts) {
                pymt.purch_id = purch_id;
                await postData({ url: '/api/crud/create/payments', data: { data: pymt } });
            }
        }
        jq('#purchase-order .completed').text('95%')

        // set new
        updatePurch(purch_id);
        updateStock(purch_id);
        purchase.tmp_id = Date.now();
        updateDetails({ purchase: purchase, });
        showPODetails();
        jq('div.porder-status').addClass('d-none');
        jq('#purchase-order .completed').text('100%');

    } catch (error) {
        log(error);
    }
}

async function updateOrder() {
    try {
        let pd = getPurchData(); //log(pd)
        let { edit_id, items, pymts } = pd;
        if (!pd.supid) throw 'Missing Supplier';
        if (!pd.items.length) throw 'Missing Items';
        jq('div.porder-status').removeClass('d-none');

        let data = {
            supid: pd.supid,
            order_date: pd.order_date,
            bill_date: pd.bill_date,
            bill_type: pd.order_type,
            bill_number: pd.bill_number,
            sub_total: pd.subtotal,
            bill_amount: pd.total,
            discount: pd.disc_val,
            tax_amount: pd.tax,
            freight: null,
            gst_roundoff: pd.round,
            quantity: pd.qty,
            fin_year: help.getFinYear(pd.bill_date),
            notes: pd.notes,
            id: edit_id,
        }; //log(data); return;

        // update purchase
        let res = await postData({ url: '/api/crud/update/purchase', data: { data } }); //log(res.data)
        if (res.data.affaffectedRows === 0) throw 'Error Updating Purchaes';

        let index = 1
        // let sku = await getMaxSku();
        let sku = generateSKU(Date.now(), 1);
        for (let item of items) {
            if (item.id && item.del) {
                let res = await advanceQuery({ key: 'setDelStock', values: [item.id] }); //log(res.data);
                item.edited = false;
            }
            if (item?.edited && item.purch_id) {
                let res = await postData({ url: '/api/crud/update/stock', data: { data: item } }); //log(res.data);
            }
            if (!item.id) {
                item.sku = sku;
                item.purch_id = pd.edit_id;
                let res = await postData({ url: '/api/crud/create/stock', data: { data: item } }); //log(res.data);
                sku++
            }

            let pgrs = Math.round((index / items.length) * 99); //log(pgrs);
            jq('#purchase-order .completed').text(`${pgrs}%`);
            index++
        }

        // update payments
        if (pd.pymts.length) {
            for (let pymt of pd.pymts) {
                if (pymt.id && pymt.del) {
                    await advanceQuery({ key: 'deletePymt', values: [pymt.id] });
                    pymt.edited = false;
                }
                if (!pymt.id) {
                    pymt.purch_id = pd.edit_id;
                    await postData({ url: '/api/crud/create/payments', data: { data: pymt } });
                }
                if (pymt.id) {
                    await postData({ url: '/api/crud/update/payments', data: { data: pymt } });
                }
            }
        }

        // set new
        updatePurch(edit_id);
        updateStock();
        purchase.tmp_id = Date.now();
        updateDetails({ purchase: purchase, });
        showPODetails();
        jq('div.porder-status').addClass('d-none');
        jq('#purchase-order .completed').text('100%');

    } catch (error) {
        log(error);
    }
}

async function getMaxSku() { let { data } = await advanceQuery({ key: 'maxsku' }); return data[0]?.sku || 1001 };


async function updateStock(id = null) {
    //this function will update stock. if the id is null, it will updte whole stock else it will reload whole
    let obj = id ? { key: 'stockbyPurchid', values: [id] } : { key: 'stock' };
    let res = await advanceQuery(obj);
    if (res.data.length) { let ldb = new xdb(storeId, 'stock'); await ldb.put(res.data); }
}

async function updatePymt(id) {

}

async function updatePurch(id) {
    let res = await advanceQuery({ key: 'updateIndexDBPurchase', values: [id] });
    if (res.data.length) { let ldb = new xdb(storeId, 'purchase'); await ldb.put(res.data); }
}

function setManualBody(mb) {
    jq(mb).find('div.product').after('<div class="d-flex jcb aic gap-3 odd pcode-hsn w-100"></div>');
    jq(mb).find('div.pcode, div.hsn').appendTo(jq(mb).find('div.pcode-hsn'));

    jq(mb).find('div.pcode-hsn').after('<div class="d-flex jcb aic gap-3 odd size-group w-100"></div>');
    jq(mb).find('div.size, div.size_group').appendTo(jq(mb).find('div.size-group'));
    jq(mb).find('div.size_group, div.size').addClass('w-50');

    jq(mb).find('div.size-group').after('<div class="d-flex jcb aic gap-3 odd unit-qty"></div>');
    jq(mb).find('div.unit, div.qty').appendTo(jq(mb).find('div.unit-qty'));

    jq(mb).find('div.unit-qty').after('<div class="d-flex jcb aic gap-3 odd pp-gst"></div>');
    jq(mb).find('div.purch_price, div.cost_gst').appendTo(jq(mb).find('div.pp-gst'));

    jq(mb).find('div.pp-gst').after('<div class="d-flex jcb aic gap-3 odd prics-gst"></div>');
    jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.prics-gst'));

    jq(mb).find('div.prics-gst').after('<div class="d-flex jcb aic gap-3 odd wsp-mrp"></div>');
    jq(mb).find('div.wsp, div.mrp').appendTo(jq(mb).find('div.wsp-mrp'));

    jq(mb).find('div.brand').before('<div class="d-flex jcb aic gap-3 even disc-per w-100"></div>');
    jq(mb).find('div.discount, div.disc_type').addClass('w-50').appendTo(jq(mb).find('div.disc-per'));

    jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-3 even sec-sea"></div>');
    jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

    jq(mb).find('div.sec-sea').after('<div class="d-flex jcb aic gap-3 even cat-col"></div>');
    jq(mb).find('div.category, div.colour').appendTo(jq(mb).find('div.cat-col'));

    jq(mb).find('div.cat-col').after('<div class="d-flex jcb aic gap-3 even upc-label"></div>');
    jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));
}

let obj1 = {
    "id": 42,
    "sku": "1042",
    "product": "Jeans",
    "pcode": "JNS",
    "mrp": 500,
    "price": 500,
    "wsp": 0,
    "gst": 5,
    "size": null,
    "discount": 0,
    "disc_type": null,
    "brand": null,
    "colour": null,
    "label": null,
    "section": null,
    "season": null,
    "category": null,
    "upc": null,
    "hsn": null,
    "unit": "PCS",
    "prchd_on": 0,
    "purch_id": 3,
    "prch_num": 0,
    "supid": 19,
    "supplier": 0,
    "ean": 6565698,
    "cost": 0,
    "cost_gst": 5,
    "purch_price": 0,
    "qty": 1,
    "sold": 0,
    "defect": 0,
    "gr": 0,
    "avl": 20,
    "original_name": "Jeans",
    "tax": 0,
    "net": 0,
    "clc": 0,
    "total": 0,
    "disc": 0,
    "purch_disc": 0
}

let obj2 = {
    "product": "JEANS",
    "pcode": "JNS",
    "size": "M",
    "size_group": "",
    "unit": "PCS",
    "qty": 25,
    "purch_price": 900,
    "cost_gst": 5,
    "price": 2500,
    "gst": 12,
    "wsp": 1250,
    "mrp": 3000,
    "discount": "",
    "disc_type": "",
    "brand": "DIESEL",
    "section": "",
    "season": "",
    "category": "PREMIUM",
    "colour": "",
    "upc": "",
    "label": "",
    "hsn": "",
    "ean": "",
    "cost": 900,
    "index": "",
    "update": "",
    "purch_id": "",
    "id": "",
    "tax": 1125,
    "net": 22500,
    "clc": 22500,
    "total": 23625,
    "disc": 0,
    "purch_disc": 0
}



// let x = 11
// for (let index = 5; index <= x; index++) {
//     console.log(Math.round(index / x * 100));
// }
