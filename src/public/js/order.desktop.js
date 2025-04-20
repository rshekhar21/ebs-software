import { _unholdOrder, _viewHistory, _viewholds, leftPanel, rightPanel } from "./_components/panels.js";
import help, { advanceQuery, changeCase, convertToDecimal, createEL, createStuff, createTable, doc, errorMsg, fd2json, fd2obj, generateUniqueAlphaCode, getData, getSettings, getSqlDate, isRestricted, jq, log, parseCurrency, parseData, parseDecimal, parseLocal, parseLocals, parseNumber, popConfirm, popListInline, postData, queryData, removeDecimal, roundOff, separateDecimal, setTable, showError, showTable, Storage, storeId, sumArray, xdb } from "./help.js";
import { createEditParty, _loadSrchstock, numerifyObject, _scanProduct, _searchProduct, salesChart, _refreshSalesChart, holdOrder, _searchParty, _scanEAN } from "./module.js";
import { getOrderData, hardresetData, loadBankModes, loadBanks, loadBillNumber, loadOrderDetails, loadPartyDetails, loadPymtMethods, quickData, refreshOrder, resetOrder, saveOrder, setItems, setTaxOnAllItems, showOrderDetails, updateDetails, updateOrder } from "./order.config.js";


let showList = false;
let url = document.URL;
let page = `${window.location.origin}/apps/app/orders/create`;

doc.addEventListener('keydown', async function (e) {
    if (e.altKey && e.key.toLowerCase() == 'q' && url === page) { jq('div.pymtform').toggleClass('d-none'); }

    if (e.ctrlKey && e.key.toLowerCase() == 's' && url === page) {
        e.preventDefault();
        // execute();
    }

    if (e.altKey && e.key.toLowerCase() == 'c' && url === page) {
        let modal = jq('#ebsModal').is(':visible');
        if (!modal) jq('div.calculator').toggleClass('d-none'); jq('#equation').focus()
    }

    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() == 'm' && url === page){
        let cnf = await window?.app?.confirmIt('Create Order?'); //log(cnf); return; //|| confirm('Create Order?');
        if(!cnf) return;

        let { update = faslse } = getOrderData();
        update ? updateOrder() : saveOrder();
    }

    if(e.key === 'Escape') {
        jq('#addProduct').val('').focus();
    }
})

doc.addEventListener('DOMContentLoaded', () => {
    leftPanel();
    rightPanel();
    salesChart('dailyComparisonChart');
    salesChart('myChart');

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // jq(doc).click(function(e){
    //     if(url==page){
    //         log(e.target);
    //         let mf = jq('#addManually').parent('div').hasClass('d-none'); log(mf);
    //     }

    // })

    jq('a.view-banks').click(async function () {
        showTable({
            query: { key: 'listBanks' },
            title: 'Banks List',
            serial: false,
        });
    })

    jq('span.add-category').click(function () {
        let { category } = getOrderData();
        if (category) return;
        jq('div.category').toggleClass('d-none');
        jq('#category').val('').focus();
    });

    // jq('#category').change(function () {
    //     let category = this.value;
    //     jq('div.hold-category').toggleClass('d-none', !Boolean(category));
    //     updateDetails({ category })
    //     let { pin_category } = getOrderData();
    //     if (!pin_category) jq('#hold-category').prop('checked', false);
    // })

    jq('#category').blur(function () {
        let category = this.value;
        if (!Boolean(this.value)) {
            jq('div.category, div.hold-category').addClass('d-none');
        }
        updateDetails({ category: category ? category.toUpperCase() : null, pin_category: false });
        let { pin_category } = getOrderData();
        if (!pin_category) jq('#hold-category').prop('checked', false);
        showOrderDetails();
    })

    jq('#hold-category').click(function () {
        let chked = jq(this).is(':checked');
        updateDetails({ pin_category: chked });
    })

    jq('span.add-location').click(function () {
        let { location } = getOrderData();
        if (location) return;
        jq('#location-form').toggleClass('d-none');
        jq('#location').focus()
    })

    jq('span.pin-location').click(function () {
        updateDetails({ pin_location: true });
        showOrderDetails();
    })

    jq('span.unpin-location').click(function () {
        updateDetails({ pin_location: false });
        showOrderDetails();
    })

    jq('#location').blur(function (e) {
        let location = this.value;
        if (!location) jq('#location-form, span.pin-location, span.unpin-location').addClass('d-none');
        updateDetails({ location: location ? location.toUpperCase() : null, pin_location: false });
        let { pin_location } = getOrderData();
        if (!pin_location) jq('span.pin-location').toggleClass('d-none', !Boolean(location));
    })

    jq('#location-form').submit(function (e) {
        e.preventDefault();
        let { location } = fd2obj({ form: this })
        updateDetails({ location: location ? location.toUpperCase() : null });
        showOrderDetails();
    })

    jq('span.roundoff-gst').click(function (event) {
        let { items } = getOrderData();
        const total = items.map(item => item.total).reduce((prev, curr) => prev + curr, 0);
        const { decimal, integer } = separateDecimal(total);
        event.ctrlKey ? updateDetails({ round_off: 0, total }) : updateDetails({ round_off: parseDecimal(decimal), total: integer });
        showOrderDetails();
    })

    jq('a.quick-reset').click(quickData)
    // jq('#addNewParty').hover(function () { jq(this).find('svg').prop('fill', '#ffff'); });
    jq('span.show-party-details').click(function () { $('div.party-data').toggleClass('d-none'); })

    jq('#setOrderDate').on('change', async function () {
        const date = getSqlDate();
        if (date !== this.value && await isRestricted('ybaUOclE')) { jq(this).val(date); return; }
        updateDetails({ order_date: this.value });
    });

    $('#equation').keyup(function (e) {
        if (e.key == 'Escape') {
            jq(this).val('');
            jq('div.calc-result').text('0.00');
        }
    });

    $('#equation').keydown(function (event) {
        if (event.ctrlKey && event.keyCode == 13) {
            // Trigger your desired action here
            const equation = document.getElementById('equation').value;
            let result;
            try {
                result = eval(equation);
            } catch (error) {
                result = 'Invalid equation';
            }
            jq('div.calc-result').text(roundOff(result));
        }
    });

    jq('button.calculate').click(function () {
        const equation = document.getElementById('equation').value;
        let result;
        try {
            result = eval(equation);
        } catch (error) {
            result = 'Invalid equation';
        }
        jq('div.calc-result').text(result);
    })

    jq('span.sync-stock')
        .hover(
            function () { jq(this).html('<i class="bi bi-arrow-clockwise"></i>') },
            function () { jq(this).html('<i class="bi bi-search"></i>') })
        .click(async function () {
            const { data } = await advanceQuery({ key: 'stock' });
            const db = new xdb(storeId, 'stock');
            await db.clear()
            await db.add(data);
            jq('span.sync-stock, span.sync-stock-success').toggleClass('d-none');
            setTimeout(() => {
                jq('span.sync-stock, span.sync-stock-success').toggleClass('d-none');
            }, 3000);
        });

    jq('span.sync-partys')
        .hover(
            function () { jq(this).html('<i class="bi bi-arrow-clockwise"></i>') },
            function () { jq(this).html('<i class="bi bi-search"></i>') })
        .click(async function () {
            const { data } = await advanceQuery({ key: 'party' });
            const db = new xdb(storeId, 'partys');
            await db.clear()
            await db.add(data);
            jq('span.sync-partys, span.sync-success').toggleClass('d-none');
            setTimeout(() => {
                jq('span.sync-partys, span.sync-success').toggleClass('d-none');
            }, 3000);
        });


    jq('button.clearcalc').click(function () { jq('#equation').val(''); jq('div.calc-result').text('0.00') })
    jq('button.closecalc').click(function () { jq('div.calc-result').text('0.00'); jq('#calc').addClass('d-none') })
    jq('h5.show-calc').click(function () {
        jq('#calc').toggleClass('d-none');
        jq('#equation').focus();

        jq('#calc').draggable({
            containment: "#desktop-body", axis: 'both'
        });
        // moveCalc();
    });

    jq('#manualEntry').click(async function () {
        if (await isRestricted('YhMtmjLe')) return;
        if (jq(this).is(':checked')) {
            jq('#addManually').parent('div').removeClass('d-none');
            updateDetails({ itemsMode: 'manual' });
            jq('#addManually').find('input[name="product"]').val('').focus();
        } else {
            jq('#addManually').parent('div').addClass('d-none');
            updateDetails({ itemsMode: 'sku' });
        }
    })

    jq('#addShipAddress').click(function () {
        try {
            let { party } = getOrderData();
            createStuff({
                title: 'Shipping Address',
                table: 'address',
                modalSize: 'modal-md',
                url: '/api/crud/create/address',
                addonData: { party },
                applyCallback: loadPartyDetails,
                focus: '#address',
            })
        } catch (error) {
            log(error);
        }
    });

    jq('#editShipAddress').click(function () {
        try {
            let { ship_id, party } = getOrderData();
            createStuff({
                title: 'Edit Ship Address',
                table: 'address',
                modalSize: 'modal-md',
                applyButtonText: 'Update',
                url: '/api/crud/update/address',
                qryObj: { key: 'editShipping', values: [ship_id] },
                addonData: { party },
                focus: '#address',
                applyCallback: loadPartyDetails,
            })
        } catch (error) {
            log(error);
        }
    })

    function getEmptyKeys(obj) {
        let emptyKeys = [];
        for (let key in obj) {
            if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
                emptyKeys.push(key);
            }
        }
        return emptyKeys;
    }

    jq('#addNewParty, .add-party').click(async function () {
        try {
            let { order_type } = getOrderData();
            let partyfields = getSettings().partyFields;
            let hideFields = getEmptyKeys(partyfields);
            let res = await createEditParty({
                quick: order_type == 'taxinvoice' ? false : true,
                focus: '#party_name',
                hideFields: order_type == 'taxinvoice' ? [] : hideFields,
                callback: () => {
                    let party = res?.insertId;
                    if (party) {
                        updateDetails({ party: party, party_name: res.fd.party_name, email: res.fd?.email || null });
                        loadOrderDetails();
                    }
                }
            });

        } catch (error) {
            log(error);
        }
    })

    jq('#searchParty').keyup(async function (e) {
        try {
            let key = e.key;
            let val = this.value;
            if (!val) {
                jq('div.search-party').addClass('d-none').html('');
                return
            };
            let data = await _searchParty(val);
            // create party 
            if (!data.length) {
                jq('div.search-party').html('').addClass('d-none');
                return;
                let btn = createEL('button');
                jq(btn).addClass('btn btn-primary btn-sm w-100').text('+ Party').click(async function () {
                    jq('div.search-party').addClass('d-none').html('');
                    jq('#searchParty').val('').focus();
                    let res = await createEditParty({
                        modalSize: 'modal-md',
                        quick: true,
                        callback: () => {
                            if (res.affectedRows) {
                                let party = res.insertId;
                                updateDetails({ party, party_name: res.fd.party_name, email: res.fd?.email || null });
                                // savePartysdata(party);
                            }
                        }
                    });
                    res.mb.addEventListener('shown.bs.modal', function () {
                        if (isNaN(val)) {
                            jq('#party_name').val(val.toUpperCase().trim());
                            jq('#contact').focus();
                        } else {
                            jq('#contact').val(val.trim());
                            jq('#party_name').focus();
                        }
                    });

                })
                jq('div.search-party').removeClass('d-none').html(btn);
                return
            };
            // load party
            let tbl = createTable(data, false);
            jq(tbl.table).addClass('mb-1').removeClass('table-sm');
            parseData({ tableObj: tbl, colsToRight: ['party_id', 'contact'], colsToShow: ['id', 'party_name', 'party_id', 'contact'] });
            jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, e) {
                jq(e).click(function () {
                    let index = jq(this).index();
                    let po = data[index];
                    let { id, party_name, party_id, email } = po;
                    jq('div.search-party').html('').addClass('d-none');
                    jq('#searchParty').val('');
                    jq('#addProduct').val('').focus();
                    updateDetails({ party: id, party_name, party_id, email });
                    loadPartyDetails();
                })
            })
            jq('div.search-party').removeClass('d-none').html(tbl.table);
            if (key === 'Enter') {
                let { id: party, party_name, party_id, email } = data[0];
                updateDetails({ party, party_name, party_id, email });
                jq('div.search-party').html('').addClass('d-none');
                jq('#searchParty').val('');
                jq('#addProduct').val('').focus();
                loadPartyDetails();
            }
        } catch (error) {
            log(error);
        }
    }).on('search', function () { jq('div.search-party').addClass('d-none').html('') })

    jq('#searchByMemid').keyup(async function (e) {
        try {
            if (e.key == 'Enter') {
                let party_id = this.value;
                let [res] = await queryData({ key: 'srchPartyByPartyId', values: [party_id] });
                if (!res) return;
                // let db = new xdb(storeId, 'partys');
                // let [res] = await db.searchByKey({ key: party_id, indexes: ['party_id'], limit: 1 });
                let { id, party_name, email, contact } = res;
                updateDetails({ party: id, party_name, party_id, email, contact });
                loadPartyDetails();
                jq(this).val('');
                jq('#addProduct').val('').focus();
            }
        } catch (error) {
            log(error);
        }
    })

    jq('#selectOrderType').change(function () {
        let order_type = this.value;
        updateDetails({ order_type, order_number: null });
        loadBillNumber(null);
        showOrderDetails();
    })

    jq('#setOrderNumber').on('blur', function (e) {
        let orderNumber = $(this).val().trim();
        let invNum = orderNumber ? orderNumber : null;
        updateDetails({ manual_order_number: invNum });
    })

    jq('#setOrderNumber').on('keydown', function (event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default Enter/Tab behavior (e.g., form submission, tab focus)
            let orderNumber = $(this).val().trim();
            let invNum = orderNumber ? orderNumber : null;
            updateDetails({ manual_order_number: invNum });
            jq('#addProduct')[0].focus();
        }
    });

    jq('#neworder').click(function (e) {
        popConfirm({
            el: this, msg: 'Set New Order?', cb: () => {
                let { location, pin_location, category, pin_category } = getOrderData();
                resetOrder();

                if (pin_location && location) { updateDetails({ location, pin_location }) }

                if (!pin_location) {
                    jq('span.pin-location, span.unpin-location').addClass('d-none');
                    jq('#location').val('');
                }

                if (pin_category && category) { updateDetails({ category, pin_category }) }
                if (!pin_category) {
                    jq('div.category, div.hold-category').addClass('d-none');
                    jq('#category').val('');
                }

                refreshOrder();
                jq('.order-status').addClass('d-none').removeClass('text-success text-danger').text('');
                jq('#statusMsg').addClass('d-none').removeClass('bg-danger bg-success-900');
                jq('span.execute-progress').addClass('d-none');
            }
        })
    });

    jq('#hard-reset').click(function () {
        let cnf = confirm('Reset Orders Data?');
        if (!cnf) return;
        hardresetData();
        window.location.reload();
    });

    jq('#execute').click(function () {
        let { location, category, order_number, items, subtotal, update = false } = getOrderData();
        if (!subtotal || !items.length) { showError('Incomplete Bill, No item found !'); return; }
        if (!order_number) { showError('Missing Order Number'); return; }

        let orderMsg = location ? `
            <p class="mb-0">Creaet Order?</p>
            <p class="small text-secondary fw-300 mb-0 ${category ? '' : 'd-none'}">Category: ${category}</p>
            <p class="small text-secondary fw-300 mb-0">Location: ${location}</p>
        `: 'Create Order?';

        let updateMsg = 'Update Order?';

        let msg = update ? updateMsg : orderMsg;

        popConfirm({ el: this, msg, cb: async () => { let res = update ? updateOrder() : saveOrder(); } })
    })

    // jq('#execute').click(function () {
    //     try {
    //         let data = getOrderData();
    //         if (!data.subtotal) throw 'Incomplete Bill, No item details found !';
    //         if (!data.items.length) throw 'Incomplete Bill, No item details found !';
    //         if (!data.order_number) throw 'Missing Order Number';

    //         confirmDialog({
    //             msg: 'Create Order?',
    //             callback: execute
    //         })
    //     } catch (error) {
    //         showError(error);
    //         // let str = `
    //         //     <div class="d-flex flex-column gap-2 position-fixed top-0 end-0 mt-2 me-2 p-2 rounded bg-danger-subtle fw-300 text-center" style="width: 300px; color: darkred;">
    //         //         <div class="d-flex jcb aic">
    //         //             <span class="fw-bold small">Error</span>
    //         //             <button type="button" class="btn btn-close" onclick="this.parentNode.parentNode.remove()"></button>
    //         //         </div>
    //         //         <div class="text-center">${error}</div>
    //         //     </div>
    //         // `;
    //         // jq('body').append(str);
    //     }
    // });

    jq('#scanEntry').change(function () {
        let scan = jq(this).is(':checked');
        scan ? updateDetails({ enableScan: true }) : updateDetails({ enableScan: false });
    })

    jq('#addProduct').keyup(function (e) {
        let scan = getOrderData().enableScan;
        // searchItemsSpecial()
        if (!scan) searchItem();

    })

    jq('#add-item').submit(function (e) {
        e.preventDefault();
        let scan = getOrderData().enableScan;
        if (scan) scanItem();
    })

    jq('span.gst-config, button.close-gstbox').click(function () {
        try {
            jq('div.gst-box').toggleClass('d-none');
            let { gstType, taxType } = getOrderData();
            jq(`#gstConfig select[name="gstType"]`).val(gstType);
            jq(`#gstConfig select[name="taxType"]`).val(taxType);
        } catch (error) {
            log(error);
        }
    })

    jq('#gstConfig').submit(function (e) {
        try {
            e.preventDefault();
            let fd = fd2json({ form: this });
            let gstType = fd.gstType || null;
            let taxType = fd.taxType || null;
            updateDetails({ gstType, taxType });
            setTaxOnAllItems();
            showOrderDetails();
            jq('div.gst-box').toggleClass('d-none');
        } catch (error) {
            log(error);
        }
    })

    jq('#percent').click(function () {
        jq('input.add-disc').focus();
    })

    // jq('form.add-disc').submit(function (e) {
    //     try {
    //         e.preventDefault();
    //         let  { disc } = fd2obj({ form: this}); 
    //         disc = parseNumber(disc); 
    //         if (disc < 0) disc = 0;
    //         let data = getOrderData();
    //         let subtotal = data.subtotal;
    //         let tax = data.tax;
    //         if (!subtotal) { throw 'Zero Total' };
    //         let percent = jq('#percent').is(':checked');
    //         if (percent) {
    //             if (disc > 100) throw 'Discount Cannot be greater than subtotal'
    //             disc = subtotal ? (subtotal * disc) / 100 : 0; 
    //             updateDetails({ discount: disc, disc_percent: disc });
    //         } else {
    //             if (disc > (subtotal + tax)) throw 'Discount Cannot be greater than subtotal'
    //             disc > 0 ? updateDetails({ discount: disc }) : updateDetails({ discount: 0 });
    //         }
    //         jq(this).find('ipput.add-disc').val('');
    //         jq('span.discount, form.add-disc').toggleClass('d-none');
    //         jq('#percent').parent('div').toggleClass('d-none');
    //         jq('#percent').prop('checked', false);
    //         jq('ul li.error-msg').addClass('d-none').text('');
    //         showOrderDetails();
    //     } catch (error) {
    //         log(error);
    //         jq(this).val('');
    //         updateDetails({ discount: 0 });
    //         jq('span.discount, form.add-disc').toggleClass('d-none');
    //         jq('ul li.error-msg').removeClass('d-none').text(error);
    //         showOrderDetails();
    //     }
    // })

    jq('button.close-discbox').click(function () {
        jq('#disc-form')[0].reset();
        jq('div.disc-box').addClass('d-none');
    })

    jq('span.add-disc').click(function () {
        let settigns = getSettings();
        let discs = settigns.discounts;
        jq('#disc-type').html('').append(new Option('Value', '0'));
        if (discs?.length) { discs.forEach(disc => { jq('#disc-type').append(new Option(disc.disc_name, disc.id)) }) }
        jq('div.disc-box').removeClass('d-none');
        jq('#disc-value').focus();
    })

    jq('ul span.disc').click(function () {
        const { disc_percent, discount } = getOrderData();
        jq('span.discount, form.add-disc').toggleClass('d-none');
        // if (disc_type == '#') jq('#percent').prop('checked', false);
        // if (disc_type == '%') jq('#percent').prop('checked', true);
        // let chked = disc_percent?true
        let chked = discount && !disc_percent ? false : true;
        jq('#percent').prop('checked', chked);
        let disc_val = disc_percent ? disc_percent : discount ? discount : '';
        jq('input.add-disc').focus().val(roundOff(disc_val)).select();
    })

    const percentCheckbox = document.getElementById('percent');
    const discountInput = document.querySelector('input[name="disc"]');

    percentCheckbox.addEventListener('change', function () {
        discountInput.value = ''; // Clear the input when the checkbox state changes
        discountInput.classList.remove('is-invalid'); // Remove any previous invalid state
        discountInput.title = ''; // Clear any previous tooltip
    });

    discountInput.addEventListener('input', function () {
        if (percentCheckbox.checked) {
            const value = parseFloat(this.value);
            if (value < 0 || value > 100) {
                this.classList.add('is-invalid');
                this.title = 'Percent can only range between 0 - 100';
            } else {
                this.classList.remove('is-invalid');
                this.title = '';
            }
        } else {
            this.classList.remove('is-invalid');
            this.title = '';
        }
    });

    jq('form.add-disc').submit(function (e) {
        try {
            e.preventDefault();
            let fd = fd2obj({ form: this });
            const disc = parseNumber(fd.disc);
            const percent = jq('#percent').is(':checked');
            if (percent) {
                if (disc > 100) throw 'Disc. Percent Cannot be greater than 100'
            }

            if (!disc) {
                updateDetails({ discount: 0, disc_id: null, disc_percent: null });
            } else {
                const { items, tax } = getOrderData();
                const subtotal = items.map(item => (item.clc)).reduce((prev, curr) => prev + curr, 0);

                const discount = percent ? (subtotal * disc) / 100 : disc;
                const disc_percent = percent ? disc : null;
                updateDetails({ disc_id: null, disc_percent, discount });
            }
            jq('span.discount, form.add-disc').toggleClass('d-none');
            jq('#percent').parent('div').toggleClass('d-none');
            showOrderDetails();
        } catch (error) {
            log(error);
            // updateDetails({ discount: null, disc_id: null, disc_type: null, disc_percent: null });
            updateDetails({ discount: null, disc_id: null, disc_percent: null });
        }
    })

    jq('#disc-form').submit(function (e) {
        try {
            e.preventDefault();
            const data = getOrderData();
            const { disc: discount, disc_id, disc_type, disc_percent, coupoun } = fd2obj({ form: this });
            const disc = parseNumber(discount);
            const subtotal = data.items.map(item => (item.clc)).reduce((prev, curr) => prev + curr, 0);
            if (disc_type == '%') {
                if (subtotal) {
                    if (parseNumber(disc_percent) > 100) throw 'Discount Cannot be greater than subtotal';
                    // updateDetails({ disc_id, disc_percent, discount: disc });
                }
            } else {
                updateDetails({ disc_id, disc_percent, discount: disc });
            }

            jq('#disc-form')[0].reset();
            jq('div.disc-box').addClass('d-none');
            jq('ul li.error-msg').addClass('d-none').text('');
            showOrderDetails();
        } catch (error) {
            log(error);
            jq('span.discount, form.add-disc').toggleClass('d-none');
            jq('ul li.error-msg').removeClass('d-none').text(error);
            updateDetails({ discount: null, disc_id: null, disc_percent: null });
        }
    })

    jq('#disc-type').change(async function () {
        try {
            let disc_id = this.value;
            if (disc_id == '0') {
                // value
                jq('#discPerc').val('');
                jq('#discType').val('#');
                jq('span.discType').text('#');
            } else if (disc_id == '1') {
                // rewards
                let { party } = getOrderData();
                let res = await queryData({ key: 'partyRwds', values: [party] });
                let rwds = res.length ? res[0].rwds : null;
                jq('#discPerc').val('');
                jq('#discType').val('#');
                jq('#disc-value').val(rwds);
                jq('span.discType').text('#');
            } else {
                // others
                let settings = getSettings();
                let discarr = settings.discounts;
                let discobj = discarr.find(disc => disc.id == disc_id);
                let disc_type = discobj.disc_type;
                let disc = discobj.value;
                let disc_percent = disc_type == '%' ? disc : null
                jq('#discType').val(disc_type);
                jq('#discPerc').val(disc_percent);
                jq('#disc-value').val(disc);
                jq('span.discType').text(disc_type);
            }
        } catch (error) {
            log(error);
        }
    })

    jq('button.remove-disc').click(function () {
        try {
            jq('#disc-form')[0].reset();
            jq('div.disc-box').addClass('d-none');
            // updateDetails({ disc: null, discount: null, disc_id: null, disc_type: null, disc_percent: null });
            updateDetails({ disc: null, discount: null, disc_id: null, disc_percent: null });
            showOrderDetails();
        } catch (error) {
            log(error);
        }
    })

    jq('span.add-freight, ul span.freight').click(function () {
        jq('span.freight, input.add-freight').toggleClass('d-none');
        jq('input.add-freight')[0].focus();
    })

    jq('input.add-freight').on('keypress', function (e) {
        let freight = this.value;
        if (e.key === 'Enter') {
            freight > length ? updateDetails({ freight: parseNumber(freight) }) : updateDetails({ freight: 0 });
            jq('span.freight, input.add-freight').toggleClass('d-none');
            showOrderDetails();
        }
    })

    jq('button.close-pymtform').click(function () {
        jq('#pymtForm')[0].reset();
        jq('#pymtForm button.apply-pymt').val('add').text('Apply');
        jq('div.pymtform').addClass('d-none');
    });

    jq('button.add-payment').click(async function () {
        let data = getOrderData();
        let pymts = data.pymts; log(pymts);

        if (data.update) {
            if (pymts.length > 1) {
                errorMsg('Thre are Multiple Payment Entries Found. Select Entry from View Entries to Update!');
                return;
            }
        }

        let settings = getSettings();
        let banks = settings?.banks || [];

        banks.forEach(bank => {
            let option = new Option(bank.value, bank.id);
            jq('#banks_list').append(option);
        });

        loadBanks('#bankslist');
        loadBankModes('#bankModes');
        loadPymtMethods('#pymtMehtods');

        jq('#bankModes').change(function () {
            let mode = this.value;
            if (mode == 'Card') jq('#pymtMehtods').val('4')
        })

        let indexAmount = 0
        if (pymts.length == 1 && !pymts[0]?.del) {
            let index = pymts.length - 1;
            let pymt = pymts[index];
            indexAmount = pymt.amount;
            pymt.balance = data.balance;
            pymt.index = index;
            jq.each(pymt, function (key, value) { jq('#pymtForm').find(`input[name="${key}"], select[name="${key}"]`).val(value); });
            jq('#pymtForm button.apply-pymt').val('update').text('Update');
        }

        jq('div.pymtform').toggleClass('d-none');
        jq('#pymtForm input.cash').focus();

        jq('#p_cash, #p_bank, #p_other').on('change', function () {
            try {
                let total = data.total;
                let pymts = jq('#p_cash, #p_bank, #p_other').map(function () { return this.valueAsNumber || 0 }).get();
                let amount = sumArray(pymts);
                let pymt = data.pymt - indexAmount;
                let bal = total - (amount + pymt);
                jq('#received').val(amount);
                jq('#pymtBalance').val(bal);

                let bank = jq('#p_bank').val();
                if (bank) {
                    let defaultBank = settings?.default_bank;
                    jq('#bankslist').val(defaultBank);
                } else {
                    jq('#bankslist, #pymtMehtods, #bankModes').val('');
                }
            } catch (error) {
                log(error);
            }
        });

    })

    jq('#pymtForm').on('submit', function (e) {
        try {
            e.preventDefault();
            let fd = fd2json({ form: this });
            let { amount, bank, bank_id, bank_mode, cash, notes, other, pymt_method } = fd;
            let obj = { amount, bank, bank_id, bank_mode, cash, notes, other, pymt_method };
            obj = numerifyObject(obj);
            let type = jq('#pymtForm button.apply-pymt').val();
            let { pymts, edit_id = false } = getOrderData();
            if (type === 'update') {
                let index = fd.index;
                if (edit_id) obj.edited = true;
                const updatedPymt = pymts.map((pymt, i) => i == index ? { ...pymt, ...obj } : pymt);
                updateDetails({ pymts: [] });
                updateDetails({ pymts: updatedPymt });
                jq('#pymtForm button.apply-pymt').val('add').text('Apply');
            } else {
                if (edit_id) obj.order_id = edit_id;
                updateDetails({ pymts: [obj] });
            }
            showOrderDetails();
            jq('#pymtForm')[0].reset();
            jq('#pymtForm button.apply-pymt').val('');
            jq('div.pymtform').toggleClass('d-none');
        } catch (error) {
            log(error);
        }
    })

    jq('a.new-pymt, span.payment').click(function () {
        try {
            let settings = getSettings();
            let banks = settings?.banks || [];
            banks.forEach(bank => {
                let option = new Option(bank.value, bank.id);
                jq('#banks_list').append(option);
            });

            loadBanks('#bankslist');
            loadBankModes('#bankModes');
            loadPymtMethods('#pymtMehtods');

            jq('div.pymtform').toggleClass('d-none');
            jq('#pymtForm input.cash').focus();


            jq('#bankModes').change(function () {
                let mode = this.value;
                if (mode == 'Card') jq('#pymtMehtods').val('4')
            })

            let data = getOrderData();
            jq('#p_cash, #p_bank, #p_other').on('change', function () {
                try {
                    let pymts = jq('#p_cash, #p_bank, #p_other').map(function () { return this.valueAsNumber || 0 }).get();
                    let amount = sumArray(pymts);
                    let total = data.total;
                    let pymt = data.pymt;
                    let bal = total - (amount + pymt);
                    jq('#received').val(amount);
                    jq('#pymtBalance').val(bal);

                    let bank = jq('#p_bank').val();
                    if (bank) {
                        let defaultBank = settings?.default_bank;
                        jq('#bankslist').val(defaultBank);
                    } else {
                        jq('#bankslist, #pymtMehtods, #bankModes').val('');
                    }
                } catch (error) {
                    log(error);
                }
            });
        } catch (error) {
            log(error);
        }
    });

    jq('span.all-cash').click(function () {
        try {
            let { total, edit_id } = getOrderData();
            let pymt = total
            let obj = {
                "cash": pymt,
                "bank": "",
                "other": "",
                "amount": pymt,
                "bank_mode": "",
                "bank_id": "",
                "pymt_method": "",
                "notes": ""
            }
            if (edit_id) obj.order_id = edit_id;

            updateDetails({ pymts: [] });
            updateDetails({ pymts: [obj] });
            showOrderDetails()
        } catch (error) {
            log(error);
        }
    })

    jq('span.all-card').click(function () {
        try {
            let { balance, edit_id } = getOrderData();
            let pymt = balance;
            let settings = getSettings();
            let pymtMethod = settings?.pymtMethods;
            let db = pymtMethod.find(pm => pm.value == "Card");
            let defaultBank = db?.default_bank || settings?.default_bank;

            let obj = {
                "cash": "",
                "bank": pymt,
                "other": "",
                "amount": pymt,
                "bank_mode": "Card",
                "bank_id": defaultBank,
                "pymt_method": 4,
                "notes": ""
            }
            if (edit_id) obj.order_id = edit_id;
            updateDetails({ pymts: [] });
            updateDetails({ pymts: [obj] });
            showOrderDetails();
        } catch (error) {
            log(error);
        }
    })

    jq('button.quick-pay').click(function () {
        try {
            let val = this.value;
            let { pymtMethods } = getSettings();
            let { total, balance } = getOrderData();
            let method = {};


            if (val == 'gpay') { method = pymtMethods.find(method => method.id == '1'); }
            if (val == 'ppay') { method = pymtMethods.find(method => method.id == '2'); }
            if (val == 'paytm') { method = pymtMethods.find(method => method.id == '3'); }

            let type = jq('#pymtForm button.apply-pymt').val();
            let amount = type == 'update' ? total : balance;

            if (val == 'cash') {
                jq('#pymtForm')[0].reset();
                jq('#p_cash, #received').val(amount);
                return;
            }

            if (val.includes('gpay', 'ppay', 'paytm')) {
                jq('#p_cash').val('');
            }

            jq('#p_bank, #received').val(amount);
            jq('#pymtMehtods').val(method.id)
            jq('#bankslist').val(method.default_bank);
            jq('#bankModes').val('Online');
        } catch (error) {
            log(error);
        }
    })

    jq('span.remove-pymts').click(function () {
        updateDetails({ pymts: [] });
        showOrderDetails();
        jq('#pymtForm button.apply-pymt').val('add').text('Apply');
    })

    jq('a.view-pymts').click(function () {
        let od = getOrderData();
        let { pymts } = od; log(pymts);
        if (pymts.length < 1) return;
        let tbl = createTable(pymts, true, false);
        help.parseData({
            tableObj: tbl,
            colsToParse: ['cash', 'bank', 'other', 'amount'],
            colsToTotal: [], alignRight: true,
            colsToHide: ['id', 'bank_id', 'bank_mode', 'pymt_method', 'pymt_date', 'notes', 'order_id', 'del', 'edited'],
            colsToRight: ['cash', 'bank', 'other', 'amount'],
        });

        jq(tbl.thead).find('tr').addClass('align-middle').each(function () { jq(this).append(`<th data-key="edit" class="text-end">EDIT</th>`) });
        jq(tbl.tbody).find('tr').addClass('align-middle').each(function () { jq(this).append(`<td data-key="edit" class="text-end"></td>`) });


        jq(tbl.tbody).find(`[data-key="edit"]`).each(function () {
            // let edit = createEL('span');
            let edit = jq('<span></span>').addClass('role-btn edit-pymt').html('<i class="bi bi-pencil-fill"></i>').click(function () {
                let index = jq(this).closest('tr').index();
                let pymt = pymts[index];
                pymt.index = index;
                jq.each(pymt, function (key, value) { jq(`#pymtForm input[name="${key}"]`).val(value); });
                jq('#pymtForm button.apply-pymt').val('update').text('Update');
                jq('div.pymtEntries, div.pymtform').toggleClass('d-none');
            });


            let delPymt = jq('<span></span>').addClass('role-btn del del-pymt').html('<i class="bi bi-x-lg"></i>').click(function () {
                try {
                    let index = jq(this).closest('tr').index();
                    if (index < 0 || index >= pymts.length) { throw new Error('Invalid index'); }
                    let pymt = pymts[index];
                    if (pymt.order_id) {
                        pymt.del = true;
                        pymts.splice(index, 1, pymt);
                        jq(this).closest('tr').addClass('text-decoration-line-through');
                        jq(this).closest('tr').find('span.edit-pymt').addClass('d-none');
                        jq(this).addClass('d-none');
                        jq(undel).removeClass('d-none');
                    } else {
                        pymts.splice(index, 1);
                        jq(this).closest('tr').remove();
                    }

                    updateDetails({ pymts: [] });
                    updateDetails({ pymts });
                    showOrderDetails();

                    if (pymts?.length == 0) jq('div.pymtEntries').toggleClass('d-none');
                } catch (error) {
                    log(error);
                }
            }).prop('title', 'Delete Payment');

            let undel = jq('<span></span>').addClass('role-btn del d-none').click(function () {
                try {
                    let index = jq(this).closest('tr').index();
                    if (index < 0 || index >= pymts.length) { throw new Error('Invalid index'); }
                    let pymt = pymts[index];
                    delete pymt.del;
                    pymts.splice(index, 1, pymt);
                    jq(this).addClass('d-none');
                    jq(delPymt).removeClass('d-none');

                    updateDetails({ pymts: [] });
                    updateDetails({ pymts });
                    showOrderDetails();
                    jq(this).closest('tr').removeClass('text-decoration-line-through');
                    jq(this).closest('tr').find('span.edit-pymt').removeClass('d-none');
                    if (pymts?.length == 0) jq('div.pymtEntries').toggleClass('d-none');
                } catch (error) {
                    log(error);
                }
            }).html('<i class="bi bi-arrow-counterclockwise"></i>').prop('title', 'Undo Delete');

            let div = jq('<div></div>').addClass('d-flex jce aic gap-2').append(edit, delPymt, undel);

            jq(this).html(div);
        })

        jq(tbl.tbody).find(`[data-key="del"]`).each(function (i, e) {
            if (e.textContent == 'true') {
                jq(e).closest('tr').addClass('text-decoration-line-through');
                jq(e).closest('tr').find('span.del').toggleClass('d-none');
                jq(e).closest('tr').find('span.edit-pymt').toggleClass('d-none');
            }
        });
        jq('div.pymtEntries').toggleClass('d-none');
        jq('div.pymtEntries div.data-table').html(tbl.table);

        jq('div.pymtEntries div.data-table table tfoot tr').addClass('align-middle').each(function () { jq(this).append(`<th></th>`) });
    })

    jq('button.close-pymt-tbale').click(function () {
        jq('div.pymtEntries').toggleClass('d-none');
        jq('div.pymtEntries div.data-table').html('');
    })

    jq('a.import-json').click(function () {
        importJson();
    })

    jq('a.clear-allitems').click(function () {
        updateDetails({ items: [] });
        showOrderDetails();
    })

    jq('#confirm-box button.cancel').click(function () {
        jq('#confirm-box').addClass('d-none');
    })

    jq('a.add-bank').click(async function () {
        if (await isRestricted('FnhxaHlT')) return;
        createStuff({
            title: 'Add New Bank',
            modalSize: 'modal-md',
            table: 'banks',
            url: '/api/crud/create/bank',
        })
    });

    jq('a.delete-pymts, span.remove-pymts').click(function () {
        updateDetails({ pymts: [] });
        // updateDetails({ pymt: 0 });
        showOrderDetails();
    })

    jq('#addManually').submit(function (e) {
        try {
            e.preventDefault();
            let type = jq(this).find(`button[type="submit"]`).val();
            let fd = fd2json({ form: this });
            let obj = setItems(fd);
            if (type == 'add') {
                updateDetails({ items: [obj] });
            } else {
                let index = fd.index;
                let { items, edit_id = false } = getOrderData();
                if (edit_id) obj.edited = true;
                const updatedItems = items.map((item, i) => i == index ? { ...item, ...obj } : item);
                updateDetails({ items: [] });
                updateDetails({ items: updatedItems });
                jq('#addManually').find(`button[type="submit"]`).val('add').text('Add');
                jq('#addManually')[0].reset();
                if (!jq('#manualEntry').is(':checked')) jq('#addManually').parent('div').addClass('d-none');
            }

            showOrderDetails();
            showOrderDetails();
            jq('#addManually')[0].reset();
            jq(this).find(`input[name="product"]`).val('').focus();
        } catch (error) {
            log(error);
        }
    })

    jq('button.close-manual').click(function () {
        jq('#addManually').parent('div').addClass('d-none');
        updateDetails({ itemsMode: 'sku' });
        jq('#manualEntry').prop('checked', false);
        jq('#addManually')[0].reset();
    })

    jq('#addManually button.reset-manual').click(function () {
        jq('#addManually')[0].reset();
    })

    jq('a.hold').click(function () { holdOrder() })

    jq('a.unhold').click(async function () {
        let db = new xdb(storeId, 'holds');
        let data = await db.all();
        if (!data.length) return;
        jq('div.ihold-panel').removeClass('d-none');
        _viewholds('inv-hold');
        // _unholdOrder(1);   
    })

    let lastWin = null;
    jq('a.view-last').click(async function () {
        try {
            if (lastWin && !lastWin.closed) {
                lastWin.focus();
                return;
            }
            let db = new xdb(storeId, 'orders');
            let id = await db.maxId();
            let [data] = await db.get(id);
            let url = `${window.location.origin}/apps/order/thermal/?orderid=${data.order_id}`;
            if (window?.app?.node()) {
                window?.app?.showThermal(url)
            } else {
                let height = window.innerHeight;
                let width = window.innerWidth;
                lastWin = window.open(url, "_blank", "top=0, width=550, height=100");
                lastWin.resizeTo(550, height);
                lastWin.moveTo(width / 2 - 250, 0)
            }
        } catch (error) {
            log(error);
        }
    })

    let myWin = null
    jq('a.print-last').click(async function () {
        try {
            if (myWin && !myWin.closed) {
                myWin.focus();
                return;
            }
            let db = new xdb(storeId, 'orders');
            let id = await db.maxId();
            let [data] = await db.get(id);
            let url = `${window.location.origin}/view/order/format/b/?orderid=${data.order_id}`;
            if (window?.app?.node()) {
                window?.app?.showA4(url)
            } else {
                let height = window.innerHeight;
                let width = window.innerWidth;
                myWin = window.open(url, "_blank", "top=0, width=1024, height=700");
                myWin.resizeTo(1024, height);
                myWin.moveTo(width / 2 - 512, 0)
            }
        } catch (error) {
            log(error);
        }
    })

    let estWin = null
    $('a.print-estimate').click(async function () {
        try {
            if (estWin && !estWin.closed) {
                estWin.focus();
                return;
            }
            let { items } = getOrderData();
            if (items.length == 0) return;
            let url = `${window.location.origin}/apps/order/estimate/`;
            if (window?.app?.node()) {
                window?.app?.showThermal(url);
            } else {
                let height = window.innerHeight;
                let width = window.innerWidth;
                estWin = window.open(url, "_blank", "top=0, width=550, height=100");
                estWin.resizeTo(550, height);
                estWin.moveTo(width / 2 - 250, 0)
            }
        } catch (error) {
            log(error);
        }
    })

    jq('button.close-ipanel, span.close-ipanel').click(function () { jq('div.ihold-panel').addClass('d-none'); jq('#inv-hold').html('') })

    jq('span.fs-chart').click(function () {
        jq('div.sales-chart').addClass('position-fixed top-0 start-0 h-100 ps-5 pb-5 z-5').removeClass('mt-auto pt-2 border-top');
        jq('button.close-chart, span.fs-chart').toggleClass('d-none')
    })

    jq('button.close-chart').click(function () {
        jq('div.sales-chart').removeClass('position-fixed top-0 start-0 h-100 ps-5 pb-5').addClass('mt-auto pt-2 border-top');
        jq('button.close-chart, span.fs-chart').toggleClass('d-none')
    })

    jq('button.close-charts').click(function () { jq('#charts').addClass('d-none') });
    jq('button.close-msales').click(function () { jq('#monthlySales').addClass('d-none') });

    jq('span.refresh-chart').click(function () {
        _refreshSalesChart();
    })

    jq('a.select-emp').click(async function () { loadEmployees(); })

    jq('a.remove-emp').click(function () {
        let { items } = getOrderData();
        let newItems = items.map(item => ({ ...item, emp_id: null }));
        updateDetails({ emp_id: null, items: [] });
        updateDetails({ items: newItems });
        showOrderDetails()
    });

    jq('a.refresh-emp').click(async function () {
        try {
            let db = new xdb(storeId, 'employees');
            let res = await queryData({ key: 'employee' });
            await db.put(res);
        } catch (error) {
            log(error);
        }
    })

    jq('a.show-empid').click(function () {
        jq('#order-table').find(`[data-key="emp_id"]`).toggleClass('d-none');
    })

    jq('span.view-history').click(function () {
        jq('#history').removeClass('d-none');
        let { party } = getOrderData();
        _viewHistory(party);
    })
    jq('button.close-history').click(function () { jq('#history').addClass('d-none') });

    // jq('#history-by-dates').submit(async function (e) {
    //     e.preventDefault();
    //     let { party } = getOrderData();
    //     let { to, from } = fd2json({ form: this });
    //     if (!to || !from) return;
    //     let tbl = await setTable({
    //         // qryObj: { key: 'party_history_bydates', values: [party, to, from] },
    //         qryObj: { key: 'partyledger_bydates', values: [party, to, from, party, to, from] },
    //         colsToTotal: ['subtotal', 'discount', 'freight', 'tax', 'total', 'payment', 'balance'],
    //         colsToRight: ['clear', 'timestamp'],
    //         hideBlanks: ['freight'],
    //         alignRight: true,
    //     });
    //     jq('div.history-data').html(tbl.table || 'No Records Found');
    //     jq(this).parent('div').toggleClass('d-none');
    // })

    jq('button.print-ledger').on('click', function () {
        let { party } = getOrderData();
        let url = `${window.location.origin}/apps/app/party/ledger/?party=${party}`;
        window?.app?.node() ? window.app?.showA4(url) : window.open(url, '_blank');
    })

    jq('#store-details div.details').hover(
        function () { jq(this).toggleClass('bg-primary text-white') }
    )

    jq('a.sort-byproduct').click(function () {
        let { items } = getOrderData();
        if (!items.length) return;
        let result = sortArrayByProduct(items);
        updateDetails({ items: [] });
        updateDetails({ items: result });
        loadOrderDetails();
    })

    jq('a.set-lowercase').click(function () {
        let { items } = getOrderData();
        let result = changeCase(items, 'lower'); //log(result);
        updateDetails({ items: [] });
        updateDetails({ items: result });
        loadOrderDetails();
    })

    jq('a.set-titlecase').click(function () {
        let { items } = getOrderData();
        let result = changeCase(items, 'title'); //log(result);
        updateDetails({ items: [] });
        updateDetails({ items: result });
        loadOrderDetails();
    })

    jq('a.set-uppercase').click(function () {
        let { items } = getOrderData();
        let result = changeCase(items, 'upper'); //log(result);
        updateDetails({ items: [] });
        updateDetails({ items: result });
        loadOrderDetails();
    })

    jq('span.copy-contact').click(function () {
        let contact = jq('span.contact').text();
        if (!contact) return;
        copyToClipboard(contact);
        jq('span.copy-contact-status').removeClass('d-none');
        setTimeout(() => {
            jq('span.copy-contact-status').addClass('d-none');
        }, 4000);
    })
})

async function loadEmployees(data = null) {
    let db = new xdb(storeId, 'employees');
    data = await db.getColumns({
        columns: ['id', 'emp_name', 'emp_id'], sortby: 'emp_name',
    });

    if (!data.length) {
        let res = await queryData({ key: 'empData' });
        await db.put(res);
        res?.length ? loadEmployees(res) : showError('No Employee Found!');
        return;
    }

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
            updateDetails({ emp_id: id });
            jq(mb).modal('hide').remove();
            showOrderDetails();
        })
    })
}

// let lastPosition = { top: 0, right: 0 };

function moveCalc() {
    let calcDiv = $("#calc");
    let initialTop = 0;
    let initialRight = 0;

    if (lastPosition.top === 0) initialTop = ($(window).height() - calcDiv.outerHeight()) / 2;
    // if (jq(calcDiv).hasClass('d-none')) return;

    // Set initial position to center-right

    // let topPosition = ($(window).height() - calcDiv.outerHeight()) / 2; // Vertically centered

    // calcDiv.css({
    //     top: topPosition + 'px', // Set the top position
    //     right: '0' // Align to the right edge
    // });

    lastPosition = { top: initialTop, right: initialRight };

    function setPosition(top, right) {
        calcDiv.css({
            top: top + 'px',
            right: right + 'px'
        });
    }

    setPosition(lastPosition.top, lastPosition.right);

    $("#calc").draggable({
        containment: "#desktop-body",
        axis: 'both',
        scroll: false,
        stop: function (event, ui) {
            // Store the current top and left values
            lastPosition = {
                top: ui.position.top,
                right: parseInt($(window).width() - (ui.position.left + calcDiv.outerWidth()))
            };
        } // Optionally restricts dragging within this container
    });
}

function openCenteredWindow(url, width, height) {
    // Calculate the position for centering the window
    var left = (screen.width / 2) - (width / 2);
    var top = (screen.height / 2) - (height / 2);

    // Open a new window with the specified dimensions and position
    window.open(url, '_blank', `width=${width},height=${height},top=${top},left=${left}`);
}

function confirmBox({ msg, cb, paid = false, unpaid = false }) {
    try {
        jq('#confirm-box .confirm-msg').text(msg);
        jq('#confirm-box').removeClass('d-none');
        jq('#confirm-box button.cancel').click(function () { jq('#confirm-box').addClass('d-none'); return; });
        jq('#confirm-box button.confirm').click(function () { jq('#confirm-box').addClass('d-none'); cb(); });
        if (paid) {
            jq('#confirm-box div.paid').removeClass('d-none');
            jq('#confirm-box div.unpaid').addClass('d-none');
        }
        if (unpaid) {
            jq('#confirm-box div.unpaid').removeClass('d-none');
            jq('#confirm-box div.paid').addClass('d-none');
        }
        const focusableElements = document.querySelectorAll('#confirm-box button');
        const firstFocusableElement = focusableElements[1];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        e.preventDefault();
                        lastFocusableElement.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        e.preventDefault();
                        firstFocusableElement.focus();
                    }
                }
            }
        })
        firstFocusableElement.focus();

    } catch (error) {
        log(error);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                jsonData.forEach(item => { insertItem(item) })
                // displayJsonData(jsonData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    }
}

function importJson() {
    try {
        document.getElementById('jsonFileInput').click();
        document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect, false);

        // let rawdata = [
        //     {
        //         "sku": "",
        //         "hsn": null,
        //         "product": "TSHIRT",
        //         "pcode": "TS",
        //         "unit": "",
        //         "price": 800,
        //         "gst": 0,
        //         "size": "",
        //         "disc": 0,
        //         "qty": 5,
        //         "disc_per": 0,
        //         "disc_val": 0,
        //         "emp_id": 0
        //     },
        //     {
        //         "sku": "",
        //         "hsn": null,
        //         "product": "JEANS",
        //         "pcode": "JNS",
        //         "unit": "",
        //         "price": 1500,
        //         "gst": 0,
        //         "size": "",
        //         "disc": 0,
        //         "qty": 2,
        //         "disc_per": 0,
        //         "disc_val": 0,
        //         "emp_id": 0
        //     },
        //     {
        //         "sku": "",
        //         "hsn": null,
        //         "product": "JACKET",
        //         "pcode": "JKT",
        //         "unit": "",
        //         "price": 3500,
        //         "gst": 0,
        //         "size": "",
        //         "disc": 0,
        //         "qty": 1,
        //         "disc_per": 0,
        //         "disc_val": 0,
        //         "emp_id": 0
        //     },
        //     {
        //         "sku": "",
        //         "hsn": null,
        //         "product": "LOWER",
        //         "pcode": "LWER",
        //         "unit": "",
        //         "price": 750,
        //         "gst": 0,
        //         "size": "",
        //         "disc": 0,
        //         "qty": 3,
        //         "disc_per": 0,
        //         "disc_val": 0,
        //         "emp_id": 0
        //     }
        // ];

        // let jsondata = JSON.stringify(rawdata); log(jsondata);
        // let data = JSON.parse(jsondata); 

        // data.forEach(item=>{
        //     insertItem(item);
        // })
    } catch (error) {
        log(error);
    }
}

async function scanItem() {
    try {
        let sku = jq('#addProduct').val();
        if (!sku) throw 'missing sku';
        if (sku.length < 4) return;
        let arr = sku.length <= 8 ? await _scanProduct(sku) : await _scanEAN(sku);
        if (arr.length) {
            let data = arr[0];
            data.qty = 1;
            let obj = setItems(data);
            updateDetails({ items: [obj] });
            showOrderDetails()
            jq('#addProduct').removeClass('is-invalid').val('').focus();
        } else {
            jq('#addProduct').addClass('is-invalid').val('').focus();
        }
    } catch (error) {
        log(error);
    }
}

function loadTags({ el, item, arr }) {
    try {
        if (arr.length) {
            jq('ul.tags-list').html('');
            // let div = createEL('button');
            // div.style.right = '-2.3rem';
            // div.tabIndex='0';
            // jq(div).addClass('position-absolute top-0 p-2 btn btn-close').html('<i class="bi bi-x-lg"></i>').click(function () {
            //     jq('ul.tags-list').html('');
            //     jq('div.view-tags').addClass('d-none');
            // });
            // jq('div.view-tags').prepend(div);            

            arr.forEach((tag, i) => {
                let span = createEL('span');
                span.tabIndex = '0';
                jq(span).addClass('role-btn role-btn flex-fill').text(tag).on('click keypress', function (e) {
                    if (e.type == 'click' || e.key == 'Enter' || e.key == ' ') {
                        item.tag = tag;
                        item.modified_name = `${item.original_name} (${item.tag})`;
                        jq('#input-tag').val('');
                        jq('div.view-tags').addClass('d-none');
                        jq('ul.tags-list').html('');
                        jq(el).find('span.tag-name').text(tag);
                        jq(el).focus();
                    }
                })

                let deltag = createEL('span');
                deltag.title = 'Delete Tag';
                jq(deltag).addClass('role-btn text-danger d-none').html('<i class="bi bi-x-lg"></i>').click(function () {
                    let index = jq(this).closest('li').index();
                    arr.splice(index, 1);
                    jq(this).parent().remove();
                    Storage.set('tagslist', arr);
                });

                let li = createEL('li');
                jq(li).hover(function () { jq(deltag).toggleClass('d-none') })
                jq(li).addClass('list-group-item d-flex jcb aic gap-1').append(span, deltag);
                jq('ul.tags-list').append(li);
            })
        } else {
            jq('ul.tags-list').html('');
        }
    } catch (error) {
        log(error);
    }
}

async function searchItemsSpecial() {
    try {
        let input = doc.getElementById('addProduct');
        let val = input.value;
        if (!val || val.length < 2) {
            jq('#viewItems').addClass('d-none').html('');
            return;
        }
        let returning = false;
        if (jq('#returnItem').is(':checked')) returning = true;
        let db = new xdb(storeId, 'stock');
        let arr = await db.getColumns({
            key: val,
            indexes: [`product`, `pcode`, `brand`, `label`],
            columns: [`product`, `pcode`, `price`, `size`, `available`],
            limit: 21,
            sortby: 'price'
        }); log(arr);

        if (arr.length) {
            jq('#viewItems').html('');
            arr.forEach(item => {
                let price = jq('<span></span>').addClass('fs-3').text(parseNumber(item.price));
                let product = jq('<span></span>').addClass('text-secondary').text(item.product);
                let pcode = jq('<span></span>').addClass('text-secondary small').text(item.pcode);
                let div = jq('<div></div>').addClass('d-flex flex-column jcc aic gap-2 bg-light border rounded role-btn')
                    .css({ 'width': '200px', 'height': '150px' }).append(product, price, pcode).click(async function () {
                        log('ok');
                    });
                jq('#viewItems').append(div).removeClass('d-none');
            })
        } else {
            jq('#viewItems').addClass('d-none').html('');
        }
    } catch (error) {
        log(error);
    }
}

async function searchItem() {
    try {
        let input = doc.getElementById('addProduct');
        let val = input.value;
        if (!val || val.length < 2) { jq('#hybridSearchList').html(''); jq('#hybridList').addClass('d-none'); return; }

        let returning = false;
        if (jq('#returnItem').is(':checked')) returning = true;
        let key = 'srchProduct';
        let arr = await _searchProduct(val);
        if (!arr.length) {
            if (returning) key = 'srchAllProduct'
            let res = await queryData({ key, type: 'search', searchfor: val });
            arr = res;
        }

        if (arr.length > 0) {
            jq('#hybridList').removeClass('d-none');
            jq('#hybridSearchList').html('');
            jq('span.result-count').text(`First ${arr.length} records`);
            jq('#hybridList button.close-hybrid-list').click(function () {
                jq('#hybridList').addClass('d-none');
                jq('#hybridList #hybridSearchList').html('');
                jq(input).val('').focus();
            })
            jq('#hybridList button.close-view-tags').click(function () {
                jq('#hybridList ul.tags-list').html('');
                jq('#hybridList div.view-tags').addClass('d-none');
            })

            // <span class="small text-white text-center flex-fill"><i class="fas fa-plus"></i></span>
            arr.forEach((item, i) => {
                let str = `
                    <div class="d-flex jcs aic gap-2 small">
                        <span class="small d-flex jcs aic gap-2">
                            <span class="fw-bold product-name" title="Product Name">${item.product}</span>
                            <span class="tag-name text-warning" title="Additinal Tag Name"></span>
                        </span>
                        <span class="small text-dark ${item.size ? '' : 'd-none'}" title="Size">${item.size}</span>                        
                        <span class="small text-dark ${item.mrp ? '' : 'd-none'}" title="MRP">MRP (${parseNumber(item.mrp)})</span>
                        <span class="small text-dark ms-auto ${item.price ? '' : 'd-none'}" title="Selling Price">SP (${parseNumber(item.price)})</span>
                        <span class="small text-dark ${item.wsp ? '' : 'd-none'}" title="Wholesale Price">WSP (${parseNumber(item.wsp)})</span>                        
                    </div>
                    <div class="d-flex jcs aic gap-2 small my-auto">
                        <span class="small text-muted ${item.pcode ? '' : 'd-none'}" title="Product Code">${item.pcode}</span>
                        <span class="small text-dark ${item.brand ? '' : 'd-none'}" title="Brand">${item.brand}</span>
                        <span class="small text-muted ${item.colour ? '' : 'd-none'}" title="Colour">${item.colour}</span>
                        <span class="small text-muted ${item.section ? '' : 'd-none'}" title="Section">${item.section}</span>
                        <span class="small text-muted ${item?.season ? '' : 'd-none'}" title="Season">${item.season}</span>
                        <span class="small text-muted ${item?.category ? '' : 'd-none'}" title="Category">${item.category}</span>
                    </div>                    
                    <div class="d-flex jcs aic gap-2 small">
                        <span class="small" title="SKU">SKU ${item.sku}</span> 
                        <span class="small text-muted ${item?.ean ? '' : 'd-none'}" title="EAN">EAN @ ${item.ean}</span>
                        <span class="small text-muted ${item?.gst ? '' : 'd-none'}" title="GST">GST @ ${parseLocal(item.gst)}%</span>
                        <span class="small text-muted ${item?.hsn ? '' : 'd-none'}" title="HSN">${item.hsn}</span>
                        <span class="small text-muted ${item?.disc_per ? '' : 'd-none'}" title="Percent Discount">DISC. ${parseLocal(item.disc_per)}%</span>
                        <span class="small text-muted ${item?.disc_val ? '' : 'd-none'}" title="Value Discount">DISC. ${parseLocal(item.disc_val)}</span>
                        <span class="small text-muted role-btn ms-auto edit-item" title="Edit Item"><i class="bi bi-pencil-fill"></i></span>
                    </div>
                `;

                // <span class="small text-muted ${item?.ean ? '' : 'd-none'}" title="EAN/BARCODE">${item.ean}</span>
                let inpqty = document.createElement('input');
                inpqty.type = 'number';
                inpqty.name = 'qty';
                inpqty.step = '0.001';
                inpqty.tabIndex = '0';
                jq(inpqty).addClass('form-control form-control-sm text-center item-qty mt-auto').prop('title', 'Quantity').val(1);
                // inpqty.placeholder = 'Qty';

                let qtydiv = createEL('div');
                jq(qtydiv).addClass('d-flex flex-column gap-1');

                qtydiv.innerHTML = `
                <div class="d-flex jcb aic gap-1 small" title="Available, Sold: ${parseLocals(item.sold)}">
                    <span class="small text-grey">AVL</span>
                    <span class="fw-500">${parseLocal(item?.avl) || 0}</span>
                    <span class="small text-grey" title="Item Unit Type">${item?.unit || 'UNT'}</span>
                </div>
                `;

                let left = createEL('div');
                jq(left).addClass('d-flex flex-column jcb h-100');
                left.append(qtydiv, inpqty);

                let inprice = document.createElement('input');
                inprice.type = 'number';
                inprice.name = 'price';
                inprice.step = '0.01';
                inprice.tabIndex = '0';
                inprice.placeholder = 'Price';
                jq(inprice).addClass('form-control form-control-sm text-end mb-auto').prop('title', 'Price').val(parseNumber(item.price));

                let qtyplus = createEL('button');
                jq(qtyplus).addClass('btn btn-light').html('<i class="bi bi-plus-lg"></i>').click(function (e) {
                    e.preventDefault();
                    let qty = jq(inpqty).val();
                    if (qty == '') qty = 0;
                    let nqty = parseNumber(qty) + 1;
                    jq(inpqty).val(nqty);
                })

                let qtyminus = createEL('button');
                jq(qtyminus).addClass('btn btn-light').html('<i class="bi bi-dash"></i>').click(function (e) {
                    e.preventDefault();
                    let qty = jq(inpqty).val();
                    if (qty == '') qty = 0;
                    let nqty = parseNumber(qty) - 1;
                    jq(inpqty).val(nqty);
                })

                let btngroup = createEL('div');
                jq(btngroup).addClass('btn-group').append(qtyminus, qtyplus);

                let right = createEL('div');
                jq(right).addClass('d-flex flex-column jcb h-100').append(inprice, btngroup);

                let submit = createEL('button');
                submit.type = 'submit';
                jq(submit).addClass('d-none').text('submit');

                let form = createEL('form');
                jq(form).addClass('mb-0 hstack p-1 gap-2 ms-auto ms-auto').append(submit, left, right);
                form.style.width = '220px';
                form.style.minHeight = "75px";

                jq(form).submit(function (e) {
                    e.preventDefault();
                    let { qty, price } = fd2json({ form: this });
                    let obj = arr[i];
                    obj.qty = qty;
                    obj.price = price;
                    insertItem(obj);
                    jq('#addProduct').val('').focus();
                })

                let mainDiv = createEL('div');
                jq(mainDiv).addClass('d-flex jcb aic gap-1 maindiv px-1 h-100');
                mainDiv.style.minHeight = "75px";

                let itemDetails = createEL('div');
                itemDetails.tabIndex = '0';

                let addTag = createEL('div');
                addTag.tabIndex = '0';

                jq(addTag).addClass('d-flex jcc aic h-100 role-btn px-1').html('<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="m517.85-480-184-184L376-706.15 602.15-480 376-253.85 333.85-296l184-184Z"/></svg>');
                jq(addTag).on('click keypress', function (e) {
                    if (e.type == 'click' || e.key == 'Enter' || e.key == ' ') {
                        jq('div.view-tags').removeClass('d-none');
                        jq('#input-tag').focus();

                        jq('#input-tag').keyup(function () {
                            let val = this.value;
                            if (val) {
                                let tags = Storage.get('tagslist') || [];
                                let filteredTags = tags.filter(tag => tag.includes(val.toUpperCase()));
                                loadTags({ el: itemDetails, item, arr: filteredTags });
                            } else {
                                let tags = Storage.get('tagslist') || [];
                                loadTags({ el: itemDetails, item, arr: tags });
                            }
                        })

                        jq('#tag-form').submit(function (e) {
                            e.preventDefault();
                            let data = fd2json({ form: this });
                            let tag = data.tag;
                            if (tag === '') return;
                            let tags = Storage.get('tagslist') || [];
                            if (!tags.includes(tag.toUpperCase())) { tags.push(tag.toUpperCase()) };
                            Storage.set('tagslist', tags);
                            loadTags({ el: itemDetails, item, arr: tags });
                            jq('#input-tag').val('').focus();
                            if (tags.length) { loadTags({ el: itemDetails, item, arr: tags }); }

                        })
                    }
                })

                jq(itemDetails).addClass('vstack flex-fill role-btn p-1 item-div').prop('title', 'Click To Add Item').html(str);
                jq(itemDetails).on('click keypress', function (e) {
                    if (e.type == 'click' || e.key == 'Enter' || e.key == ' ') {
                        let qty = jq(inpqty).val();
                        let price = jq(inprice).val();
                        let obj = arr[i];
                        obj.qty = qty;
                        obj.price = price;
                        insertItem(obj);
                        if (e.key == 'Enter') {
                            jq('#addProduct').select().focus();
                            // close list
                            jq('#hybridList').addClass('d-none');
                            jq('#hybridList #hybridSearchList').html('');
                            jq(input).val('').focus();
                        };
                    }
                });

                jq(mainDiv).append(itemDetails, addTag, form);

                jq(itemDetails).find('span.edit-item').click(function (e) {
                    try {
                        e.stopPropagation();
                        editStock({
                            applyCallback: () => {
                                _loadSrchstock(item.id)
                            }, cb: searchItem, id: item.id
                        })
                    } catch (error) {
                        log(error);
                    }
                })

                let li = createEL('li');
                jq(li).addClass('list-group-item list-group-item-action px-1 py-2 d-flex flex-column rounded-0').html(mainDiv);
                jq('#hybridSearchList').append(li);
            })

            const listItems = document.querySelectorAll('#hybridSearchList li div.item-div');
            let currentIndex = 0;
            document.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    currentIndex = (currentIndex + 1) % listItems.length;
                    listItems[currentIndex].focus();
                } else if (event.key === 'ArrowUp') {
                    currentIndex = (currentIndex - 1 + listItems.length) % listItems.length;
                    listItems[currentIndex].focus();
                }
            });

        } else {
            jq('#hybridSearchList').html('');
            jq('#hybridList').addClass('d-none');
        }

    } catch (error) {
        log(error);
    }
}

function insertItem(obj) {
    try {
        if (obj?.modified_name) { obj.product = obj.modified_name; }
        let items = setItems(obj);
        updateDetails({ items: [items] });
        showOrderDetails();
    } catch (error) {
        log(error);
    }
}

async function execute() {
    jq('#hybridList').addClass('d-none');
    jq('#hybridSearchList').html('');
    jq('#addProduct').val('');
    saveOrder();
}

async function editStock({ applyCallback, cb, id }) {
    try {
        let db = new xdb(storeId, 'stock');
        let [arr] = await db.getColumns({ key: id, indexes: ['id'], columns: ['id', 'purch_id'], limit: 1, });
        let table = 'stock';
        if (arr.purch_id) { table = 'purchStockEdit' };
        let res = await createStuff({
            title: 'Edit Stock',
            table: table,
            applyButtonText: 'Update',
            url: '/api/crud/update/stock',
            qryObj: { key: 'editStock', values: [id] },
            focus: '#product',
            hideFields: ['size_group'],
            applyCallback,
            cb,
        });

        let mb = res.mb;

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

    } catch (error) {
        log(error);
    }
}






// https://bucket-ebs.s3.ap-south-1.amazonaws.com/rshekhar21/pdf-lamda.zip
// bucket-ebs.s3.ap-south-1.amazonaws.com