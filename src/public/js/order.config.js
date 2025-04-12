import help, { doc, jq, log, Storage, advanceQuery, createEL, createTable, parseData, parseLocal, parseNumber, fd2json, updatePopupPosition, parseLocals, postData, parseDecimal, storeId, calculateTaxAndPrice, Cookie, xdb, roundOff, showError, showTable, popInput, getActiveEntity, getSettings, convertToDecimal, queryData, calculateTotalTaxByGst, calculateTotalTaxGstwise, cuid } from "./help.js";
import { _scanProduct, _searchProduct, numerifyObject, sendOrderEmail } from "./module.js";

// import 'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js';


export function getOrderData() { return Storage.get('ordersData') || {} }

export function applyItemsMode(mode) {
    if (mode == 'sku') {
        jq('#option1').prop('checked', true);
        skuMode();
    }
    if (mode == 'manual') jq('#option2').prop('checked', true);
}

export const purchase = {
    items: [],
    pymts: [],
    pymt: 0,
    qty: 0,
    tax: 0,
    disc: 0,
    round: 0,
    total: 0,
    sup_id: null,
    edit_id: null,
    supplier: '',
    freight: 0,
    balance: 0,
    subtotal: 0,
    disc_per: 0,
    disc_val: 0,
    bill_date: null,
    order_type: 'Purchase',
    bill_number: null,
    update: false,
    notes: null,
}

export let details = {
    order_date: help.getSqlDate(),
    order_type: 'invoice',
    order_number: null,
    party: null,
    party_name: null,
    email: null,
    party_id: null,
    emp_id: null,
    savings: 0,
    subtotal: 0,
    discount: 0,
    mrptotal: 0,
    qty: 0,
    tax: 0,
    freight: 0,
    round_off: 0,
    total: 0,
    pymt: 0,
    balance: 0,
    fin_year: help.getFinYear(),
    pymts: [],
    items: [],
    purchase,
    itemsMode: 'sku',
    taxType: null,
    gstType: null,
    manual_order_number: null,
    manual_tax: null,
    settings: null,
    // disc: 0,
    disc_id: null,
    // disc_type: null,
    disc_percent: null,
    category: null,
    edit_id: null,
    pin_category: false,
    previous_due: 0,
    rewards: null,
    redeem: null,
    location: null,
    pin_location: false,
    update: false,
    notes: null,
    enableScan: false,
    enable_rewards: false,
    reward_percent: 0,
}

export function resetOrder() {
    let data = Storage.get('ordersData');
    details.itemsMode = data.itemsMode;
    details.enableScan = data.enableScan;
    details.purchase = data.purchase;
    details.update = false;
    details.edit_id = null;
    Storage.set('ordersData', details);
}

export function hardresetData() {
    Storage.delete('ordersData');
    Storage.set('ordersData', details);
}

export function updateDetails(newDetails) {
    try {
        // Retrieve the existing details object from storage if it exists
        const storedDetails = Storage.get('ordersData') || details;

        // Merge new details into the existing details object
        const updatedDetails = {
            ...storedDetails,
            ...newDetails,
            // payments: {
            //     ...storedDetails.payments,
            //     ...(newDetails.payments || {})
            // },
            purchase: {
                ...storedDetails.purchase,
                ...(newDetails.purchase || {})
            },
            pymts: newDetails?.pymts !== undefined ? newDetails.pymts.length === 0 ? [] : [...storedDetails.pymts, ...newDetails.pymts] : storedDetails.pymts,
            items: newDetails?.items !== undefined ? newDetails.items.length === 0 ? [] : [...storedDetails.items, ...newDetails.items] : storedDetails.items
        };

        // Store the updated details object in storage
        Storage.set('ordersData', updatedDetails);
    } catch (error) {
        log(error);
    }
}

export function deleteItem(index) {
    // Retrieve the existing details object from storage
    const storedDetails = Storage.get('ordersData') || null;

    if (!storedDetails) return;

    // Check if the index is valid
    if (index < 0 || index >= storedDetails.items.length) {
        throw new Error('Invalid index');
    }

    // Remove the item at the specified index
    const updatedItems = storedDetails.items.filter((_, i) => i !== index);

    // Update the details object with the updated items array
    const updatedDetails = {
        ...storedDetails,
        items: updatedItems
    }; //log(updateDetails);

    // Store the updated details object in local storage
    // Storage.set('ordersData', updatedDetails);
    // updateDetails({ items: updatedItems})
}

export function editItemByIndex(index, newItem) {
    // Retrieve the existing details object from storage
    const storedDetails = Storage.get('ordersData') || null;

    if (!storedDetails) return;

    // Check if the index is valid
    if (index < 0 || index >= storedDetails.items.length) {
        throw new Error('Invalid index');
    }

    // Replace the item at the specified index with the new item
    const updatedItems = storedDetails.items.map((item, i) => i === index ? { ...item, ...newItem } : item);

    // Update the details object with the updated items array
    const updatedDetails = { ...storedDetails, items: updatedItems };

    // Store the updated details object in local storage
    Storage.set('ordersData', updatedDetails);
}

export function setBillNum(str) {
    // Regular expression to find the last numeric value in the string
    const regex = /(\d+)(?!.*\d)/;
    const match = str.match(regex);

    if (match) {
        // If there's a numeric value, increment it by one
        const number = match[0];
        const incrementedNumber = parseInt(number, 10) + 1;
        // Replace the last numeric value with the incremented value
        return str.replace(regex, incrementedNumber);
    } else {
        // If no numeric value is found, append 1 to the string
        return str + '-1';
    }
}

export function setDate(cal) {
    jq(cal).find('td').click(function () {
        let order_date = jq(this).data('date');
        jq(cal).modal('hide').remove();
        updateDetails({ order_date });
    })
}

export function skuMode() {
    try {
        let input = createEL('input');
        let form = createEL('form');
        let btn = createEL('button');
        btn.type = 'submit';
        btn.className = 'btn btn-light border px-3';
        btn.innerHTML = '<i class="bi bi-plus-lg"></i>';
        btn.title = 'Click to add SKU'
        input.id = 'input-sku';
        input.type = 'number';
        input.placeholder = 'Enter SKU';
        input.className = 'form-control';
        jq(form).addClass('input-group w-100 mb-0').append(input);
        jq('div.inputs').html(form);
        jq(form).submit(async function (e) {
            try {
                e.preventDefault();
                let sku = jq(input).val();
                if (!sku) throw 'missing sku';
                let arr = await _scanProduct(sku);
                if (!arr.length) {
                    let res = await advanceQuery({ key: 'scanBarcode', values: [sku, sku] });
                    arr = res.data;
                }
                if (arr.length) {
                    let data = arr[0];
                    data.qty = 1;
                    let obj = setItems(data);
                    updateDetails({ items: [obj] });
                    loadOrderDetails();
                    jq('#input-sku').removeClass('is-invalid').val('').focus();
                } else {
                    jq(input).addClass('is-invalid').val('').focus();
                }
            } catch (error) {
                log(error);
            }
        })
    } catch (error) {
        log(error);
    }
}

export function srchMode() {
    try {
        jq('div.manual-items').removeClass('d-none');
        jq('#search-item').val('').focus();

        jq('#search-item').keyup(async function () {
            try {
                let val = this.value;
                if (val.length > 0) {
                    let arr = [];
                    if (!arr.length) {
                        let res = await advanceQuery({ key: 'srchProduct', type: 'search', searchfor: val });
                        arr = res.data;
                    }

                    if (!arr.length) {
                        jq('div.search-result').addClass('d-none').html('');
                        jq('#add-manual').removeClass('d-none');
                        return
                    };

                    $('#add-manual').addClass('d-none');
                    // let list = res.data;
                    let list = arr;
                    let ul = createEL('ul');
                    ul.className = 'items-list list-group list-group-flush overflow-auto bg-white';
                    ul.innerHTML = '';
                    list.forEach((item, i) => {
                        let str = `
                            <div class="d-flex jcb aic gap-2">
                                <div class="product-details d-flex flex-column gap-1 flex-fill">
                                    <span class="product-name fw-400">${item.product}</span>
                                    <div class="d-flex jcs aic gap-3 small text-secondary">
                                        <div class="d-flex jcs aic gap-1">
                                            SKU <span class="sku text-dark">${item.sku}</span>
                                        </div>
                                        <div class="d-flex jcs aic gap-1">
                                            DISC. <span class="disc">0</span>
                                        </div>
                                        <div class="d-flex jcs aic gap-1 small">
                                            AVL. <span class="avl text-success fw-500">${parseLocal(item.avl)}</span>
                                        </div>                                
                                    </div>
                                </div>
                                <div class="product-amount">${parseLocal(item.price)}</div>
                            </div>
                    `;
                        let li = createEL('li');
                        jq(li).addClass('list-group-item small role-btn p-0').html(str).click(function () {
                            list[i].qty = 1;
                            let obj = setItems(list[i]);
                            updateDetails({ items: [obj] });
                            // jq(li).css('background-color', 'var(--blue-200)');
                            jq('div.search-result').addClass('d-none').html('');
                            jq('#add-manual').removeClass('d-none');
                            jq('#search-item').val('').focus();
                            loadOrderDetails();
                        })
                        jq(ul).append(li);
                    })
                    let btn = jq('<button></button>').addClass('btn btn-close text-end position-fixed bottom-0 end-0 mb-3 me-3').click(function () {
                        jq('div.search-result').addClass('d-none').html('');
                        jq('#add-manual').removeClass('d-none');
                        jq('#search-item').val('').focus();
                    }).prop('title', 'Close Search')
                    jq('div.search-result').removeClass('d-none').html(ul).append(btn);
                } else {
                    jq('div.search-result').addClass('d-none').html('');
                    jq('#add-manual').removeClass('d-none');
                }
            } catch (error) {
                log(error);
            }
        })

        jq('button.close-manual').click(function () {
            jq('#search-item').val('');
            jq('div.manual-items').addClass('d-none');
            showBilledItems();
        })

        jq('#search-item').on('search', function () {
            jq('div.search-result').addClass('d-none').html('');
            jq('#add-manual').removeClass('d-none');
            jq(this).val('').focus();
        })
    } catch (error) {
        log(error);
    }
}

export async function loadBillNumber(order_number = null) {
    try {
        if (!order_number) {
            let { order_type } = getOrderData();
            let key = ['invoice', 'taxinvoice', 'refund'].includes(order_type) ? 'billNumber' : 'otherBillNumber'; //log(key);
            let res = await advanceQuery({ key, values: [order_type] }); //log(res)
            if (res.data.length) {
                order_number = setBillNum(res.data[0].inv_number);
            } else {
                order_number = 1
            }
            updateDetails({ order_number })
        }
        jq('div.order-number').text(`# ${order_number}`)
        jq('#setOrderNumber').val(order_number)
    } catch (error) {
        log(error);
    }
}

export function setTaxOnAllItems() {
    try {
        let data = getOrderData()
        let items = data.items;
        let taxType = data.taxType;
        if (!items.length) return;

        let arr = items.map(item => {
            let { net, tax } = calculateTaxAndPrice(item.clc, item.gst, taxType); //log(x);
            let total = net + tax;
            return { ...item, net, tax, total };
        }); //log(arr);

        updateDetails({ items: [] });
        updateDetails({ items: arr });
    } catch (error) {
        log(error);
    }
}

function setAddlDiscOnItems(data) {
    try {
        let { subtotal, discount, disc_percent, items } = data;

        let newitems = items.map(item => {
            let adp = disc_percent ? disc_percent : (discount / subtotal) * 100;
            let obj = { ...item, adp }
            return setItems(obj);
        }); //log(newitems);
        updateDetails({ items: [] });
        updateDetails({ items: newitems });
    } catch (error) {
        log(error);
    }
}

export function setItems(obj) { //log('setitems')
    try {
        let item = numerifyObject(obj);
        let { qty, price, gst, disc_per, size, unit, disc_val, adp = 0, emp_id = null } = item;
        let { order_type, emp_id: default_empid, disc_percent, discount, taxType } = getOrderData(); //log(disc_percent);
        let discPerPeice = 0;
        let disc = 0;
        let tax = 0;
        if (qty == '') qty = 1;
        let addl_disc = 0;

        let return_item = false;
        if (jq('#returnItem').is(':checked')) return_item = true;

        qty = (order_type === 'cn' || order_type === 'refund' || return_item) ? -Math.abs(qty) : qty; //log(qty);

        price = price > 0 ? price : 0;

        if (disc_per) {
            disc = price * qty * (disc_per / 100);
            discPerPeice = Math.round(price * (disc_per / 100));
        }

        if (disc_val) {
            disc = disc_val ? qty * disc_val : 0;
            discPerPeice = Math.round(disc_val);
        }

        let clc = (qty * price) - (qty * discPerPeice);

        let dp = 0

        addl_disc = clc * (adp / 100);

        let net = Math.round(clc) - addl_disc;

        if (gst) {
            let x = calculateTaxAndPrice(net, gst, taxType); //log(x);
            tax = x.tax;
            net = x.net;
        }

        let total = net + tax;
        item.clc = clc;
        item.tax = tax;
        item.net = net;
        item.total = total;
        item.gross = total
        item.disc = Math.round(disc);
        item.qty = qty;
        item.price = price;
        item.addl_disc = addl_disc;
        item.size = size && size.toUpperCase() || '';
        item.unit = unit && unit.toUpperCase() || '';
        item.hsn = item.hsn || '';
        item.gst = item.gst || '';
        item.sku = item.sku || '';
        item.pcode = item.pcode || '';
        item.emp_id = emp_id || default_empid || null;
        item.product = item.product.toUpperCase();

        return item;
    } catch (error) {
        log(error);
        return null;
    }
}

function setOrder() {
    try {
        let { discount, disc_percent, items, tax } = getOrderData();
        if (tax === 0) {disc_percent = 0; discount = 0;}
        const itemsArr = items.filter(item => !item.hasOwnProperty('del'));
        const subtotal = itemsArr.map(item => (item.clc)).reduce((prev, curr) => prev + curr, 0);
        if (!items.length) return;
        let modifiedItems = items.map(item => {
            let adp = disc_percent ? disc_percent : (discount / subtotal) * 100;
            let obj = { ...item, adp }
            return setItems(obj);
        });
        updateDetails({ items: [] });
        updateDetails({ items: modifiedItems });
    } catch (error) {
        log(error);
    }
}

function calculateTotal() {
    try {
        const data = getOrderData();
        let { items, pymts, round_off: round, disc_percent, discount, freight, order_type, previous_due } = data;

        const itemsArr = items.filter(item => !item.hasOwnProperty('del')); //log(arr);
        const pymtsArr = pymts.filter(pymt => !pymt.hasOwnProperty('del')); //log(arr);

        if (itemsArr.length) {
            // const subtotal = itemsArrArr.map(item => (parseNumber(item.price) * parseNumber(item.qty))).reduce((prev, curr) => prev + curr, 0); log(subtotal);
            const subtotal = itemsArr.map(item => item.clc).reduce((prev, curr) => prev + parseDecimal(curr), 0);
            const tax = itemsArr.map(item => item.tax).reduce((prev, curr) => prev + parseDecimal(curr), 0);
            const ttl = itemsArr.map(item => item.total).reduce((prev, curr) => prev + curr, 0);
            const net = itemsArr.map(item => item.net).reduce((prev, curr) => prev + curr, 0);
            const savings = itemsArr.map(item => item.disc).reduce((prev, curr) => prev + curr, 0);
            const mrptotal = itemsArr.map(item => (item.price * item.qty)).reduce((prev, curr) => prev + curr, 0);
            const qty = itemsArr.map(item => item.qty).reduce((prev, curr) => prev + curr, 0);
            const qtyP = itemsArr.map(item => item.qty).filter(qty => qty > 0).reduce((a, b) => a + b, 0);
            const qtyM = itemsArr.map(item => item.qty).filter(qty => qty < 0).reduce((a, b) => a + b, 0);
            const dx = itemsArr.map(item => item.disc).reduce((prev, curr) => prev + curr, 0);
            const addldisc = itemsArr.map(item => item.addl_disc).reduce((prev, curr) => prev + curr, 0);
            const pymt = pymtsArr.map(pymt => pymt.amount).reduce((prev, curr) => prev + curr, 0); //log(pymt);

            let disc = addldisc || discount;

            if (discount && !disc_percent) disc = discount;

            let return_item = false;
            if (jq('#returnItem').is(':checked')) return_item = true;

            disc = (order_type === 'cn' || order_type === 'refund' || return_item) ? -Math.abs(disc) : Math.abs(disc);

            const total = (ttl + freight) - (tax ? 0 : disc) - round;
            const balance = previous_due == 0 ? (total - pymt) : (total + previous_due) - pymt;
            updateDetails({ subtotal, tax, total, savings, mrptotal, qty, discount: disc, mrptotal, savings, balance, pymt });

        } else {
            updateDetails({ subtotal: 0, tax: 0, total: 0, savings: 0, mrptotal: 0, qty: 0, discount: 0, balance: 0, pymt: 0 });
        };

    } catch (error) {
        log(error);
    }
}

function calculateGSTsTotal(items) {
    try {
        const tax = items.map(item => item.tax).reduce((prev, curr) => prev + parseDecimal(curr), 0);
        if (tax === 0) return;
        if (!items) { jq('div.order-gst').html(''); return; }
        let arr = calculateTotalTaxGstwise(items);
        let ul = jq('<ul></ul>').addClass('list-group list-group-flush').css({ 'min-width': '256px' });
        jq('div.order-gst').html('');
        arr.forEach(item => {
            let gst = jq('<span></span>').text(`GST ${item.gst}%`)
            let tax = jq('<span></span>').text(`${parseDecimal(item.totalTax)}`).css('min-width', '95px').addClass('text-end')
            let li = jq('<li></li>').addClass('list-group-item d-flex jce aic py-1 gap-3').append(gst, tax);
            jq(ul).append(li);
            jq('div.order-gst').html(ul);
        })
    } catch (error) {
        log(error);
    }
}

export function showOrderDetails() {
    try {
        setOrder();
        calculateTotal();
        setItemsTable();
        showBilledItems();
        beautifyTable();
        let data = getOrderData();  //log(data.items)
        calculateGSTsTotal(data.items);
        data = getOrderData();
        let { subtotal, total, round_off: round, tax, savings, qty, freight, discount, balance, pymt, disc_percent, location = null, pin_location = false, taxType, category = null, pin_category = false, update = false, gstType, order_type, notes, emp_id, previous_due, enableScan } = data; //log(data)

        let strdisc = disc_percent ? `(${parseDecimal(disc_percent)}%) ${parseDecimal(discount)}` : discount ? '(#) ' + parseDecimal(discount) : '0';
        let strtax = tax ? `<div class="d-flex jce aic"><span class="text-secondary text-uppercase fst-italic me-2" title="Tax Type">${taxType || 'EXC'}</span>${parseDecimal(tax)}<span></span></div>` : 0;
        jq('span.tax-type').html(gstType ? gstType.toUpperCase() : '')
        jq('button.set-total, button.add-pymt, button.exc-order, button.cash-pymt').removeClass('disabled');
        jq('span.total-qty, h3.order-qty').html(parseLocals(qty));
        jq('span.sub-total').html(parseLocals(subtotal));
        jq('span.tax').html(strtax);
        jq('span.savings').html(parseLocals(savings));
        jq('span.freight').html(parseLocals(freight));
        jq('span.discount').html(strdisc);
        jq('span.order-amount, h3.order-amount').html(parseLocals(total));
        jq('span.gst-roundoff').html(parseDecimal(round));
        jq('span.total-pymt, h3.pymts').html(parseLocals(pymt));
        jq('span.balance, h3.balance').html(parseLocals(balance));
        jq('h3.pymts, h3.balance').toggleClass('d-none', total == 0);
        jq('#order-comments').val(notes);
        jq('span.old-bal').html(parseLocal(previous_due) || 0);
        update ? jq('#execute').html('UPDATE') : jq('#execute').html('EXECUTE');
        let scan = jq('#scanEntry');
        enableScan ? jq(scan).prop('checked', true) : jq(scan).prop('checked', false);

        jq('.order-emp').toggleClass('d-none', !emp_id).html(emp_id);
        if (previous_due != 0) {
            jq('span.collect-pymt').html(`(${total + (previous_due || 0)})`);
        } else {
            jq('span.collect-pymt').html('');
        }

        if (location) {
            jq('#location').val(location);
            jq('#location-form').removeClass('d-none');

            if (pin_location) {
                jq('span.unpin-location').removeClass('d-none');
                jq('span.pin-location').addClass('d-none');
            } else {
                jq('span.unpin-location').addClass('d-none');
                jq('span.pin-location').removeClass('d-none');
            }
        } else {
            jq('#location-form').addClass('d-none');
        };

        if (category) {
            jq('#category').val(category);
            jq('div.category, div.hold-category').removeClass('d-none');
            if (pin_category) {
                jq('#hold-category').prop('checked', true);
            } else {
                jq('#hold-category').prop('checked', false);
            }
        } else {
            jq('#div.category, div.hold-category').addClass('d-none');
        };

        let paid = false;
        if (data.order_type === 'cn') {
            jq('.order-status').addClass('d-none');
        } else {
            if (total !== 0) {
                if (total > 0) {
                    paid = pymt >= total ? true : false;
                }
                if (total < 0) {
                    paid = pymt <= total ? true : false;
                }
            }
        }

        if (paid) {
            jq('.order-status').text('PAID').css('color', 'green');
        } else {
            if (total != 0) jq('.order-status').text('UNPAID').css('color', 'red');
        }

        jq('div.pymt-btn-group button').toggleClass('disabled', order_type == 'cn');
        jq('div.add-quick-pymt').toggleClass('d-none', order_type == 'cn');

        // beautifyTable();
    } catch (error) {
        log(error);
    }
}

function beautifyTable() { //log(5,'beautity')
    const data = getOrderData();
    const items = data.items || [];
    const tbl = jq('#order-table');
    const arr = ['disc', 'hsn', 'unit', 'pcode', 'sku', 'tax', 'gst', 'addl_disc', 'emp_id', 'category'];
    const hideIfEmpty = (key) => items.every(item => item[key] === null || typeof item[key] === 'undefined' || item[key] === '' || item[key] === 0);
    arr.forEach(a => jq(tbl).find(`[data-key=${a}]`).toggleClass('d-none', hideIfEmpty(a)));

    // items.forEach(item=>log(item.addl_disc));

    // Hide/show columns based on emptiness checks with ternary operators
    // jq(tbl).find(`[data-key="disc"]`).toggleClass('d-none', hideIfEmpty('disc'));
    // jq(tbl).find(`[data-key="hsn"]`).toggleClass('d-none', hideIfEmpty('hsn'));
    // jq(tbl).find(`[data-key="unit"]`).toggleClass('d-none', hideIfEmpty('unit'));
    // jq(tbl).find(`[data-key="pcode"]`).toggleClass('d-none', hideIfEmpty('pcode'));
    // jq(tbl).find(`[data-key="sku"]`).toggleClass('d-none', hideIfEmpty('sku'));
    // jq(tbl).find(`[data-key="tax"]`).toggleClass('d-none', hideIfEmpty('tax'));
    // jq(tbl).find(`[data-key="gst"]`).toggleClass('d-none', hideIfEmpty('gst'));
    // jq(tbl).find(`[data-key="empid"]`).toggleClass('d-none', hideIfEmpty('emp_id')); // Correct key name
}

export function beautifyTable_() {
    const data = getOrderData();
    const items = data.items;

    const sku = items.every(item => (item.sku === null));
    const hsn = items.every(item => (item.hsn === null));
    const tax = items.every(item => (item.tax === 0));
    const gst = items.every(item => (item.gst === null));
    const disc = items.every(item => item.disc === 0);
    const unit = items.every(item => (item.unit === null));
    const pcode = items.every(item => (item.pcode === null));
    const empid = items.every(item => (item.emp_id === null));

    let tbl = jq('#order-table');

    disc ? jq(tbl).find(`[data-key="disc"]`).addClass('d-none') : jq(tbl).find(`[data-key="disc"]`).removeClass('d-none');
    hsn ? jq(tbl).find(`[data-key="hsn"]`).addClass('d-none') : jq(tbl).find(`[data-key="hsn"]`).removeClass('d-none');
    unit ? jq(tbl).find(`[data-key="unit"]`).addClass('d-none') : jq(tbl).find(`[data-key="unit"]`).removeClass('d-none');
    pcode ? jq(tbl).find(`[data-key="pcode"]`).addClass('d-none') : jq(tbl).find(`[data-key="pcode"]`).removeClass('d-none');
    sku ? jq(tbl).find(`[data-key="sku"]`).addClass('d-none') : jq(tbl).find(`[data-key="sku"]`).removeClass('d-none');
    tax ? jq(tbl).find(`[data-key="tax"]`).addClass('d-none') : jq(tbl).find(`[data-key="tax"]`).removeClass('d-none');
    gst ? jq(tbl).find(`[data-key="gst"]`).addClass('d-none') : jq(tbl).find(`[data-key="gst"]`).removeClass('d-none');
    empid ? jq(tbl).find(`[data-key="empid"]`).addClass('d-none') : jq(tbl).find(`[data-key="empid"]`).removeClass('d-none');
}

export function showBilledItems() {
    // for mobile
    try {
        let items = getOrderData().items;
        if (!items?.length) {
            jq('ul.items-list').html('');
            jq('div.items-list').removeClass('position-absolute top-0 start-0 w-100 h-100 z-3').css('max-height', '217px');
            jq('div.items-list, button.close-list').addClass('d-none');
            return;
        }
        items.length > 3 ? jq('button.maximise-items').removeClass('d-none') : jq('button.maximise-items').addClass('d-none');

        jq('ul.items-list').html('');
        jq('span.total-amt').text(0.00);
        items.forEach((item, i) => {
            //log(item);
            let amount = parseNumber(item.qty) * parseNumber(item.price);
            let str = `
            <div class="product-details d-flex flex-column gap-0 flex-fill small">
                <div class="d-flex jcs aic gap-2">
                    <span class="product-name fw-700">${item.product}</span>
                    <span class="${item.size ? 'd-flex' : 'd-none'}">${item.size}</span>
                </div>
                <div class="d-flex jcs aic gap-3 small">                    
                    <div class="d-flex jcs aic gap-1">
                        PRICE <span class="fw-500">${parseLocal(item.price)}</span>
                    </div>
                    <div class="d-flex jcs aic gap-1">
                        QTY <span class="fw-500">${item.qty}</span>
                    </div> 
                    <div class="jcs aic gap-1 d-none">
                        AVL <span class="text-success">${parseLocals(item.avl)}</span>
                    </div>
                </div>
                <div class="d-flex jcs aic gap-3">
                     <div class="jcs aic gap-1 small">
                        SKU <span class="">${item.sku}</span>
                    </div>
                    <div class="${item.disc ? 'd-flex' : 'd-none'} jcs aic gap-1 small">
                        DISC <span class="disc">${parseLocal(item.disc)}</span>
                    </div>                    
                    <div class="${item.tax ? 'd-flex' : 'd-none'} jcs aic gap-1 small">
                        TAX <span class="">${parseLocal(item.tax)}</span>
                    </div>                    
                </div>
            </div>
            <div class="product-amount fw-bold">${parseLocal(amount)}</div>
            `;

            let remove = createEL('span');
            jq(remove).addClass('role-btn').prop('title', 'Delete Item').html('<i class="bi bi-trash-fill"></i>').click(function () {
                // updatePopupPosition({ el: this, msg: 'Delete Item?', cb: () => { log('delete') } });
                let cnf = confirm('Delete Item?');
                if (cnf) {
                    try {
                        let index = i;
                        let data = getOrderData();
                        let items = getOrderData().items;
                        items.splice(index, 1);
                        const updatedDetails = { ...data, items: items };
                        Storage.set('ordersData', updatedDetails);
                        jq(this).closest('li').remove();
                        showOrderDetails();
                    } catch (error) {
                        log(error);
                    }
                }

            })

            let edit = createEL('span');
            jq(edit).addClass('role-btn').prop('title', 'Edit Item').html('<i class="bi bi-pencil-fill" title="Edit Item"></i>').click(function () {
                jq('div.item-ctrl').removeClass('d-none');
                for (const key in item) {
                    jq('#item-edit-form').find(`input[name="${key}"]`).val(item[key]);
                }
                jq('#edit-index').val(i);
            })

            let action = createEL('div');
            jq(action).addClass('item-action d-flex flex-column justify-content-around aie small border-start ps-4 d-none').append(remove, edit);

            let main = createEL('div');
            jq(main).addClass('d-flex jcb aic gap-2 flex-fill role-btn').prop('title', 'Click to Edit').html(str).click(function () {
                jq('div.item-action').not(action).addClass('d-none');
                jq(action).toggleClass('d-none');
            });

            let li = createEL('li');
            jq(li).addClass('list-group-item small px-2 d-flex gap-2').append(main, action);
            jq('ul.items-list').append(li);
        });

        jq('div.items-list').removeClass('d-none');
    } catch (error) {
        log(error);
    }
}

function setItemsTable() { //log(3, 'set item table')
    try {
        let data = getOrderData();
        let items = data.items;
        let tbody = jq('#itemsBody')[0];

        if (items?.length == 0) {
            jq(tbody).html('');
            return
        };

        jq('#itemsBody').empty();

        const closeButton = `
            <div class="d-flex jce aic gap-2" style="padding-right: 1px;">
                <span class="role-btn btn-edit" title="Click to Edit this Line"><i class="bi bi-pencil-square"></i></span>
                <span class="role-btn btn-del" title="Click to Delete this Line"><i class="bi bi-x-lg"></i></span>
                <span class="role-btn btn-undodel d-none"  title="Undo Delete"><i class="bi bi-arrow-counterclockwise"></i></span>
            </div>
        `;

        // create table
        items.forEach((obj, i) => {
            let td = null, tr = null;
            tr = createEL('tr');
            for (let k in obj) {
                let { sku, hsn, category, qty, unit, product, size, price, disc, addl_disc = 0, gst, clc, net, tax, total, image, pcode, id, disc_type, disc_val, disc_per, emp_id, avl = 'na', edited = false } = obj;

                const roundArr = ['price', 'disc', 'gst', 'clc', 'net', 'tax', 'total']

                for (const r of roundArr) {
                    obj[r] = parseNumber(obj[r]);
                    obj[r] = roundOff(obj[r]);
                }

                let img = '';
                if (image) {
                    img = `<span class="view-image d-print-none" role="button" title="View Image"><i class="fas fa-image ms-2 small"></i></span>`
                }

                // let strprod = edited ? `${product} <span class="text-warning ms-2" title="This item will be Updated!">*</span>` : product;
                let strprod = data?.edit_id ? (edited ? `${product} <span class="text-secondary ms-2" title="This item will be Updated!">*</span>` : product) : product;
                // log(emp_id);
                td = `
                    <td class="text-secondary fw-light fst-italic"></td>
                    <td class="role-btn d-none" data-key="sku" data-ebs="select">${sku || ''}</td>
                    <td class="role-btn d-none inline-hsn" data-key="hsn" title="Product HSN Number">${hsn || ''}</td>
                    <td class="role-btn d-none inline-empid" data-key="emp_id">${emp_id == '*' ? '*' : emp_id || ''}</td>
                    <td class="role-btn d-none inline-category" data-key="category" title="Product Category">${category || ''}</td>
                    <td class="role-btn d-none inline-pcode" data-key="pcode" title="Product Code">${pcode || ''}</td>
                    <td class="role-btn inline-product" data-key="product" title="Product Name">${strprod}</td>
                    <td class="role-btn inline-size text-center" data-key="size" title="Product Size">${size || ''}</td>
                    <td class="role-btn inline-qty text-center " data-avlqty="${avl}">${qty || 0}</td>
                    <td class="role-btn d-none text-end inline-unit" data-key="unit" title="Unit Type">${unit || ''}</td>
                    <td class="role-btn text-end inline-price fw-500" data-key="price" title="Product Price">${parseLocal(price)}</td>
                    <td class="role-btn d-none text-end inline-disc" data-key="disc" title="Product Discount /Item ${disc / qty}">${parseLocal(disc) || ''}</td>
                    <td class="role-btn d-none text-end inline-disc fst-italic text-secondary" data-key="addl_disc" title="Additionsl Discount /Item ${addl_disc / qty}">${roundOff(addl_disc) || ''}</td>
                    <td class="role-btn d-none text-end inline-gst" data-key="gst">${gst ? gst + '%' : ''}</td>
                    <td class="text-end text-secondary" data-key="net">${parseLocal(net)}</td>
                    <td class="text-end d-none" data-key="tax" data-ebs="select" title="Tax Amount">${tax ? parseLocal(tax) : ''}</td>
                    <td class="text-end" data-key="total" data-ebs="select">${total && parseLocal(total)}</td>
                    <td class="d-none" data-key="clc">${clc}</td>
                    <td class="d-none" data-key="id">${id}</td>
                    <td class="d-none" data-key="disc_type">${disc_type}</td>
                    <td class="d-none" data-key="disc_val">${disc_val}</td>
                    <td class="d-none" data-key="disc_per">${disc_per}</td>
                    <td class="d-none" data-key="image">${image}</td>
                    <td class="text-end">${closeButton}</td>
                `;
            }
            jq(tr).html(td);
            if (obj.del) {
                jq(tr).addClass('text-decoration-line-through');
                jq(tr).find('span.btn-del, span.btn-undodel').toggleClass('d-none');
            }
            jq('#itemsBody').append(tr);
        });

        editProperty('hsn', 'td.inline-hsn', 'hsn', 'HSN', 'text', false);
        editProperty('category', 'td.inline-category', 'category', 'CAT', 'text');
        editProperty('pcode', 'td.inline-pcode', 'pcode', 'Pcode', 'text', true, true);
        editProperty('product', 'td.inline-product', 'product', 'Product', 'text');
        editProperty('size', 'td.inline-size', 'size', 'Size', 'text', true, true);
        editProperty('unit', 'td.inline-unit', 'unit', 'Unit', 'text', true, true);
        editProperty('qty', 'td.inline-qty', 'qty', 'Qty', 'number', false);
        editProperty('gst', 'td.inline-gst', 'gst', 'Gst', 'number', false);
        editProperty('price', 'td.inline-price', 'price', 'Price', 'number', false);

        // set table
        // select line
        jq(tbody).find(`[data-ebs="select"]`).addClass('role-btn').click(function (i, e) {
            jq(this).closest('tr').toggleClass('fw-500');
        })

        // delete line
        jq(tbody).find('span.btn-del').click(function () {
            try {
                let index = jq(this).closest('tr').index();
                if (index < 0 || index >= items.length) { throw new Error('Invalid index'); }
                let item = items[index];

                if (item.order_id) {
                    item.del = true;
                    items.splice(index, 1, item);
                    updateDetails({ items: [] });
                    updateDetails({ items });
                } else {
                    items.splice(index, 1);
                    updateDetails({ items: [] });
                    updateDetails({ items });
                    jq(this).closest('tr').remove();
                    jq('#addManually').find(`button[type="submit"]`).val('add').text('Add');
                    jq('#addManually')[0].reset();
                }

                // const updatedDetails = { ...data, items: items };
                // Storage.set('ordersData', updatedDetails);
                showOrderDetails();
            } catch (error) {
                log(error);
            }
        })

        // undo delete
        jq(tbody).find('span.btn-undodel').click(function () {
            let index = jq(this).closest('tr').index(); //log(index);
            if (index < 0 || index >= items.length) { throw new Error('Invalid index'); }
            let item = items[index];
            delete item.del;
            items.splice(index, 1, item);
            updateDetails({ items: [] });
            updateDetails({ items });
            showOrderDetails();
        })

        // edit line
        jq(tbody).find('span.btn-edit').click(function () {
            try {
                let index = jq(this).closest('tr').index();
                let obj = items[index];
                obj.index = index;
                for (let k in obj) { jq('#addManually').find(`input[name="${k}"]`).val(obj[k]); }
                jq('#addManually').find(`button[type="submit"]`).val('update').text('Update');
                jq('#addManually').parent('div').removeClass('d-none');
            } catch (error) {
                log(error);
            }
        });

        // undo edit
        jq(tbody).find('span.btn-undo').click(function () {
            try {
                jq(this).closest('div').find('span.btn-edit, span.btn-undo').toggleClass('d-none');
                jq(this).closest('tr').removeClass('border-bottom border-primary');
                jq('#addManually').find(`button[type="submit"]`).val('add').text('Add');
                jq('#addManually')[0].reset();
                jq('#addManually').parent('div').addClass('d-none');
            } catch (error) {
                log(error);
            }
        })

        jq(tbody).find('td.inline-empid').click(async function () {
            let index = jq(this).closest('tr').index(); //log(index); return;
            // let { items } = getOrderData();

            let db = new xdb(storeId, 'employees');
            let data = await db.getColumns({
                columns: ['id', 'emp_name', 'emp_id'], sortby: 'emp_name',
            }); //log(data); return;

            // data.push({ id: null, emp_name: 'Remove Employee', emp_id: null });
            data.push({ id: '*', emp_name: 'Exempted', emp_id: '*' });

            let { mb, tbody } = await showTable({
                title: 'Select Employee',
                modalSize: 'modal-md',
                colsToHide: ['emp_id'],
                serial: false,
                fixhead: false,
                data
            });

            jq(tbody).find('tr').addClass('role-btn').each(function (i, e) {
                jq(e).click(function () {
                    let id = jq(this).find(`[data-key="id"]`).text();
                    const updatedItems = items.map((item, i) => i == index ? { ...item, emp_id: id } : item); //log(updatedItems); return;
                    updateDetails({ items: [] });
                    updateDetails({ items: updatedItems });
                    jq(mb).modal('hide').remove();
                    setItemsTable();
                    beautifyTable();
                })
            })
        });

        function editProperty(key, className, propertyName, placeholder, type = 'number', value = true, ucase = false) {
            jq(tbody).find(className).click(function () {
                let index = jq(this).closest('tr').index();
                let item = items[index];
                popInput({
                    el: this,
                    name: propertyName,
                    type,
                    value: value ? item[key] : '',
                    ph: placeholder,
                    cb: (val) => {
                        let index = jq(this).closest('tr').index();
                        let obj = items[index];
                        if (data?.edit_id) obj.edited = true;
                        obj[propertyName] = ucase ? val.toUpperCase().trim() : val.trim(); //log(obj); return;
                        items.splice(index, 1, obj);
                        updateDetails({ items: [] });
                        updateDetails({ items });
                        // setItems(obj);
                        showOrderDetails();
                        showOrderDetails();
                    }
                });
            });
        }
    } catch (error) {
        log(error);
    }
}

async function insertSold(orderid) {
    try {
        if (!orderid) return false;
        let entity = 1;
        let empid = null; //log(empid);
        let items = getOrderData().items; //log(items);
        let str = ``
        for (let key of items) {
            let product = key['product'];
            let pcode = key['pcode'];
            product = String(product).replace(/'/g, "\\'");
            pcode = String(pcode).replace(/'/g, "\\'");
            let emp_id = key['emp_id'];
            emp_id = isNaN(emp_id) ? null : emp_id || empid;
            str += `('${orderid}', ${key['sku'] || null}, ${key['hsn'] || null}, '${key['qty']}', '${product}', '${pcode}','${key['size']}', '${key['unit']}', ${key['price']}, ${key['price']}, ${key['disc'] || null}, ${key['gst'] || null}, ${key['tax'] || null},${key['net'] || null},'${key['total']}',${emp_id},${key['disc_val'] || null},${key['disc_per'] || null},'${entity}'),`;
        }
        let bulkstr = str.slice(0, -1); //log(bulkstr); return;
        let res = await advanceQuery({ key: 'insertsold', bulk: true, bulkstr }); //log(res);
        return res;
    } catch (error) {
        log(error);
        return false;
    }
}

async function insertPymt(orderid = null) {
    try {
        let order = getOrderData();
        let pymts = order.pymts;
        let pdata = {
            party: order?.party || null,
            pymt_date: order.order_date,
            pymt_for: 'Sales',
            order_id: orderid,
            purch_id: null,
            txnid: null,
            adjustment: 0,
            entity: 1,
        }
        let data = {};
        if (pymts.length) {
            pymts.forEach(async pymt => {
                data = { ...pdata, ...pymt };
                await postData({ url: '/api/crud/create/payments', data: { data } }); //log(res);
            })
        }
    } catch (error) {
        log(error);
    }
}

export async function loadPartyDetails() {
    try {
        let od = getOrderData(); //log(od);
        let id = od.party; //log(id);

        if (!id) {
            jq('.party-id, span.contact, span.email, span.billing, span.last-bill, span.payments, span.due-amount, span.gstin, span.address, span.city, span.pincode, span.state, span.state-code, span.partyid').text('');
            jq('.party-name').removeClass('text-danger text-success').text('');
            jq('div.party-actions, div.party-addreses, div.party-data').addClass('d-none');
            return
        };
        // let db = new xdb(storeId, 'partys');
        // let [party] = await db.searchByKey({ key: od.party_id, indexes: ['party_id'], limit: 1 }); //log(party, party.id);
        // let data = await db.get(Number(id)); //log(data);
        // let { data: [party] } = await advanceQuery({ key: 'getpartyby_id', values: [id] }); //log(party); //return;
        // if(!party?.id){ [party] = await queryData({ key: 'partyDetails', values: [id] }); }

        let [party] = await queryData({ key: 'partyDetails', values: [id] }); //log(party);
        let [rewds] = await queryData({ key: 'partyRewards', values: [id] }); //log(rewds);

        if (od.order_type == "taxinvoice") {
            let rs = await advanceQuery({ key: 'shipAddress', values: [id] });
            if (rs.data.length) {
                party.shipping = rs.data[0];
            }
        }

        let dueAmt = parseNumber(party?.balance);
        jq('div.party-details').toggleClass('d-none', !party.id);
        jq('span.partyid').text(party.id);
        jq('.party-name').removeClass('text-danger text-success').addClass(dueAmt > 0 ? 'text-danger' : dueAmt < 0 ? 'text-success' : '').text(party?.party_name);
        jq('.party-id').text(party.party_id);
        jq('span.contact').text(party?.contact || 'Contact Number');
        jq('span.email').text(party?.email || 'Email Address');
        jq('div.party-actions').removeClass('d-none');
        jq('span.billing').text(parseLocals(party.billing));
        jq('span.last-bill').text(parseLocals(party.latest_order_total));
        jq('span.payments').text(parseLocals(party.pymts));
        jq('span.orders-cnt').text(parseLocals(party.orders_cnt));
        jq('span.opening-bal').text(parseLocals(party.opening_bal));
        jq('span.rewards').text(parseLocals(rewds?.rwds));
        jq('span.due-amount').removeClass('text-danger text-success').addClass(dueAmt > 0 ? 'text-danger' : dueAmt < 0 ? 'text-success' : '').text(parseLocals(dueAmt));

        if (od.order_type == 'taxinvoice') {
            jq('div.party-addreses').removeClass('d-none');
            jq('span.gstin').text('GSTIN: ' + party?.gst_number);
            jq('div.billing span.address').text(party?.address);
            jq('div.billing span.city').text(party?.city);
            jq('div.billing span.pincode').text(party?.pincode);
            jq('div.billing span.state').text(party?.state);
            jq('div.billing span.state-code').text(party?.state_code);

            if (jq('#sameAsBilling').is(':checked')) {
                jq('div.shipping span.address').text(party?.shipping?.address);
                jq('div.shipping span.city').text(party?.shipping?.city);
                jq('div.shipping span.pincode').text(party?.shipping?.pincode);
                jq('div.shipping span.state').text(party?.shipping?.state);
            }

            jq('#sameAsBilling').change(function () {
                try {
                    let sameAsBillign = jq(this).is(':checked');
                    if (!sameAsBillign) {
                        jq('div.shipping span.address').text(party?.shipping?.address);
                        jq('div.shipping span.city').text(party?.shipping?.city);
                        jq('div.shipping span.pincode').text(party?.shipping?.pincode);
                        jq('div.shipping span.state').text(party?.shipping?.state);
                    } else {
                        jq('div.shipping span.address').text('');
                        jq('div.shipping span.city').text('');
                        jq('div.shipping span.pincode').text('');
                        jq('div.shipping span.state').text('');
                    }
                } catch (error) {
                    log(error);
                }
            })
        } else {
            jq('div.party-addreses').addClass('d-none');
        }
        jq('li span.add-due').click(function () {
            updateDetails({ previous_due: dueAmt });
            showOrderDetails();
        })
        jq('li span.rem-due').click(function () {
            updateDetails({ previous_due: 0 });
            showOrderDetails();
        })
        if (party?.state) {
            let { entity } = getSettings();
            let estate = entity?.state ? entity.state.toLowerCase(): null;
            if(!estate){
                updateDetails({ gstType: null });
                return;
            }
            party.state.toLowerCase() !== entity?.state.toLowerCase() ? updateDetails({ gstType: 'igst' }) : updateDetails({ gstType: null });
        }
        updateDetails({ enable_rewards: party.enable_rewards, reward_percent: party.reward_percent });
    } catch (error) {
        log(error);
    }
}

export async function savePartysdata(party) {
    try {
        let res = await Promise.all([
            await advanceQuery({ key: 'getpartyby_id', values: [party] }),
            await advanceQuery({ key: 'shipAddress', values: [party] }),
        ]);

        let db = new xdb(storeId, 'party');
        let obj = { ...res[0].data[0], shipping: res[1].data[0] }; //log(obj);
        db.clear();
        db.put(obj);

        loadPartyDetails();
    } catch (error) {
        log(error);
    }
}

export async function loadOrderDetails() {
    let data = getOrderData();
    let { entity } = getSettings(); //log(entity);
    jq('#side-panel .entity-name').text(entity?.entity_name || '')
    if (data?.party) {
        jq('div.party-details').removeClass('d-none');
        jq('div.party-name').text(data?.party_name);
    } else {
        jq('div.party-details').addClass('d-none');
        jq('div.party-name, h3.party-name').text('Party').removeClass('text-danger');
    }

    jq('div.order-date').text(moment(new Date(data?.order_date || null)).format('DD/MM/YYYY'));
    jq('#setOrderDate, #set_order_date').val(data?.order_date);
    jq('#selectOrderType').val(data.order_type);
    jq('select.set-article-mode').val(data?.itemsMode);
    jq('button.maximise-items').addClass('d-none');

    // if(data.items.length) jq('#addPayment').removeClass('disabled');

    jq('#addPayment').toggleClass('disabled', !data.items.length);


    loadBillNumber(data?.manual_order_number || data?.order_number);
    applyItemsMode(data?.itemsMode || 'sku');
    loadPartyDetails()
    showOrderDetails();
}

export function refreshOrder() {
    try {
        let data = getOrderData();
        loadOrderDetails();
        let settigns = getSettings();
        let productMode = settigns?.general?.productMode;
        if (data?.itemsMode == 'manual') { $('#manualEntry').prop('checked', true); $('#addManually').parent('div').removeClass('d-none'); }
        if (data?.enableScan) {
            jq('#scanEntry').prop('checked', true);
        } else if (productMode == 'Scan') {
            jq('#scanEntry').prop('checked', true);
        } else if (productMode == 'Search') {
            jq('#scanEntry').prop('checked', false);
        }
    } catch (error) {
        log(error);
    }
}

export async function quickData() {
    try {
        let keys = ['quick_closing', 'recent_order', 'unpaid_orders', 'emp_month_sales'];
        let [closing, recent, unpaid, emp_sales] = await Promise.all(keys.map(async key => await advanceQuery({ key: key })));

        let db = new xdb(storeId);
        await db.clearAll(['closing', 'recent', 'unpaid', 'sales_data', 'sales_lm', 'emp_sales']);
        let rs1 = await db.put(closing.data, 'closing'); //log(rs1);
        let rs2 = await db.put(recent.data, 'recent'); //log(rs2);
        let rs3 = await db.put(unpaid.data, 'unpaid'); //log(rs3);
        let rs4 = await db.put(emp_sales.data, 'emp_sales'); //log(rs4);

        let res = await Promise.all([
            await db.put(closing.data, 'closing'),
            await db.put(recent.data, 'recent'),
            await db.put(unpaid.data, 'unpaid'),
            await db.put(emp_sales.data, 'emp_sales'),
        ]); //log(res);

    } catch (error) {
        log(error);
    }
}

export async function executeOrder() {
    try {
        let obj = getOrderData(); //log(obj);
        if (!obj.items.length) return;
        let data = {
            party: obj.party,
            inv_number: obj.manual_order_number || obj.order_number,
            fin_year: obj.fin_year,
            order_date: obj.order_date,
            subtotal: obj.subtotal,
            discount: obj.discount,
            alltotal: obj.total,
            gst_type: obj.gstType,
            tax_type: obj.taxType,
            totaltax: obj.tax,
            freight: obj.freight,
            status: 'closed',
            adjustment: '0.00',
            order_type: 'invoice',
            manual_tax: null,
            notes: null,
            ship_id: null,
            disc_id: null,
            disc_percent: null,
            rewards: null,
            redeem: null,
            category: null,
            previous_due: null,
            round_off: obj.round_off,
            order_id: new Date().getTime(),
            user_id: 1,
        };
        let res = await postData({ url: '/api/crud/create/orders', data: { data } });
        if (res?.data?.insertId) {
            let id = res?.data?.insertId;
            await insertSold(id);
            await insertPymt(id);
            resetOrder();
        }
    } catch (error) {
        log(error);
    }
}

export async function saveOrder() {
    try {
        calculateRewards();
        let obj = getOrderData();
        jq('div.exec-process').removeClass('d-none');
        let data = {
            order: {
                party: obj.party || 1,
                inv_number: obj.manual_order_number || obj.order_number,
                fin_year: obj.fin_year,
                order_date: obj.order_date,
                subtotal: obj.subtotal,
                discount: obj.discount,
                alltotal: obj.total,
                gst_type: obj.gstType,
                tax_type: obj.taxType,
                totaltax: obj.tax,
                freight: obj.freight,
                status: 'closed',
                adjustment: '0.00',
                order_type: obj.order_type,
                manual_tax: obj.manual_tax,
                ship_id: null,
                disc_id: obj.disc_id,
                disc_percent: obj.disc_percent,
                rewards: obj.rewards,
                redeem: null,
                previous_due: obj.previous_due,
                order_id: new Date().getTime(),
                user_id: cuid || 1,
                notes: obj?.notes,
                category: obj?.category,
                location: obj?.location,
                round_off: obj?.round_off
            },
            items: obj.items,
            pymts: obj.pymts,
        }; //log(data); return;

        if (obj.disc_id == '1') data.order.redeem = obj.discount; //log(data.order); return;

        let res = await postData({ url: '/api/create/order', data: { data } });
        if (res.data.status) {
            jq('div.exec-process').addClass('d-none');
            jq('span.execute-progress').text(`${100}%`);
            jq('.order-status').addClass('d-none').removeClass('text-success text-danger').text('');
            resetOrder();
            refreshOrder();

            let { entity_id: folder } = getSettings().entity;
            let orderid = res.data.orderid;
            await postData({ url: '/aws/upload', data: { folder, orderid } });

            if (window?.app?.node()) {
                let cnf = confirm('Print Order?');
                if (!cnf) return;
                let order_id = data.order.order_id;
                let url = `${window.location.origin}/apps/order/thermal/?orderid=${order_id}`; //log(url);
                window?.app?.showThermal(url);
            }

            let sendEmail = getSettings().general.sendEmail;
            sendEmail === 'Yes' && sendOrderEmail(orderid);
            await updateIndexdbOrders(orderid);
            await quickData();
            return true;
        }
    } catch (error) {
        log(error);
        showError(error);
        return false
    }
}

export async function updateOrder() {
    try {
        calculateRewards();
        let obj = getOrderData();
        jq('div.exec-process').removeClass('d-none');
        let data = {
            order: {
                party: obj.party,
                inv_number: obj.manual_order_number || obj.order_number,
                fin_year: obj.fin_year,
                order_date: obj.order_date,
                subtotal: obj.subtotal,
                discount: obj.discount,
                alltotal: obj.total,
                gst_type: obj.gstType,
                tax_type: obj.taxType,
                totaltax: obj.tax,
                freight: obj.freight,
                order_type: obj.order_type,
                manual_tax: obj.manual_tax,
                ship_id: obj.ship_id,
                disc_id: obj.disc_id,
                disc_percent: obj.disc_percent,
                rewards: obj.rewards,
                redeem: null,
                previous_due: obj.previous_due,
                user_id: cuid || 1,
                order_id: obj.order_id,
                notes: obj.notes,
                category: obj?.category,
                location: obj?.location,
                round_off: obj?.round_off,
                id: obj.edit_id,
            },
            items: obj.items,
            pymts: obj.pymts,
        };

        if (obj.disc_id == '1') data.order.redeem = obj.discount;
        let index = 1;
        let res = await postData({ url: '/api/crud/update/orders', data: { data: data.order } });
        if (!res.data || res.data.affaffectedRows === 0) { throw 'Error Updating Order'; }
        jq('span.execute-progress').removeClass('d-none').text(`${10}%`);

        // update edited items
        for (let item of obj.items) {
            if (item.order_id && item.del) {
                let res = await advanceQuery({ key: 'delsolditem', values: [item.id] });
                item.edited = false;
            }
            if (item?.edited && item.order_id) {
                item.mrp = item.price
                let res = await postData({ url: '/api/crud/update/sold', data: { data: item } });
            }
            if (!item.order_id) {
                item.order_id = obj.edit_id;
                item.mrp = item.price
                let res = await postData({ url: '/api/crud/create/sold', data: { data: item } });
            }

            let pgrs = Math.round((index / obj.items.length) * 99);
            jq('span.execute-progress').removeClass('d-none').text(`${pgrs}%`);
            index++
        }

        if (obj.pymts.length) {
            for (let pymt of obj.pymts) {
                pymt.order_id = obj.edit_id;
                pymt.pymt_for = 'Sales';

                if (pymt.order_id && pymt.del) {
                    await queryData({ key: 'deletePymt', values: [pymt.id] });
                }

                if (pymt?.edited && pymt.order_id) {
                    await postData({ url: '/api/crud/update/payments', data: { data: pymt } });
                }

                if (!pymt?.id) {
                    await postData({ url: '/api/crud/create/payments', data: { data: pymt } })
                }
            }
        }

        jq('div.exec-process').addClass('d-none');
        jq('span.execute-progress').text(`${100}%`);
        jq('.order-status').addClass('d-none').removeClass('text-success text-danger').text(''); //paid/unpaid
        // jq('#statusMsg').addClass('bg-success-900').removeClass('bg-danger d-none');
        // jq('#statusMsg>div').text('Order Updated Successfully !');
        // jq('#statusMsg>button').click(function () { jq('#statusMsg').addClass('d-none') });

        resetOrder();
        refreshOrder();
        showOrderDetails();

        let { entity_id: folder } = getSettings().entity;
        await postData({ url: '/aws/upload', data: { folder, orderid: obj.edit_id } });
        let db = new xdb(storeId);
        await db.deleteByIndexKeySmartCheck(obj.edit_id, 'order_id', 'sold');
        await db.deleteByIndexKeySmartCheck(obj.edit_id, 'order_id', 'payments');
        await updateIndexdbOrders(obj.edit_id)
        await quickData();

        // setTimeout(() => { jq('#statusMsg').addClass('d-none') }, 2000);
        // db.deleteByIndexKeySmartCheck(id,'order_id', 'sold'),
        // setTimeout(() => { quickData(); }, 1000);

        return true;
    } catch (error) {
        log(error);
        jq('div.exec-process').addClass('d-none');

    }
}

async function updateIndexdbOrders(id) {
    let [a, b, c] = await Promise.all([
        await advanceQuery({ key: 'updateIndexdbOrder', values: [id] }),
        await advanceQuery({ key: 'updateIndexdbSolds', values: [id] }),
        await advanceQuery({ key: 'updateIndexdbPymts', values: [id] }),
    ]);
    let db = new xdb(storeId);
    db.put(a.data, 'orders')
    db.put(b.data, 'sold')
    db.put(c.data, 'payments')
}

async function calculateRewards() {
    try {
        let er = getSettings().remote?.rewards || false; //log(er);
        if (!er) return;
        let od = getOrderData();
        let enable_rewards = od?.enable_rewards || false;
        if (!enable_rewards) return;
        let reward_percent = od?.reward_percent || 1;
        let total = od?.total;
        let rewards = total * reward_percent / 100; //log(rewards);
        updateDetails({ rewards });
    } catch (error) {
        log(error);
    }
}

export function loadPymtMethods(elementId) {
    let arr = getSettings()?.pymtMethods || [];
    if (!arr.length) return;
    let default_option = new Option('', '');
    jq(elementId).html(default_option);
    arr.forEach(method => {
        let option = new Option(method.value, method.id);
        jq(elementId).append(option);
    })
}

export function loadBanks(elementId) {
    let arr = getSettings()?.banks || [];
    if (!arr.length) return;
    let default_option = new Option('', '');
    jq(elementId).html(default_option);
    arr.forEach(method => {
        let option = new Option(method.value, method.id);
        jq(elementId).append(option);
    })
}

export function loadBankModes(elementId) {
    let arr = getSettings()?.bankModes || [];
    if (!arr.length) return;
    jq(elementId).html('');
    arr.forEach(method => {
        let option = new Option(method);
        jq(elementId).append(option);
    })
}





// jq('input[type=radio][name=itemsmode').change(function(){
//     let mode = this.value;
//     if (mode == 'sku') { updateDetails({ itemsMode: 'sku' }); }
//     if (mode == 'search') { updateDetails({ itemsMode: 'search' }); }
// })
// log(jq('div.inputs').is(':empty'));

