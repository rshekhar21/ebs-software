import help, { advanceQuery, calculateTotalTaxByGst, copyToClipboard, createEL, createNewPage, createStuff, createTable, doc, errorMsg, fd2json, fd2obj, fetchTable, generateUniqueAlphaCode, getClientType, getFinYear, getForm, getSettings, getSqlDate, isAdmin, isRestricted, jq, log, parseColumn, parseCurrency, parseData, parseLocals, parseNumber, popListInline, postData, queryData, setTable, shareOrder, showCalender, showErrors, showModal, showSuccess, showTable, storeId, titleCase, viewOrder, viewOrderA4, xdb, Storage } from "../help.js";
import { loadSettings } from "./settings.js";
import { icons } from "../svgs.js";
import { _addPartyPymt, _delStock, _loadSrchstock, _viewOrderDetails, addPurchPymt, createStock, editParty, numerifyObject, purchEntry, sendOrderEmail, setEditStockBody, stockSubMenu, viewArticles } from "../module.js";
import { getOrderData, hardresetData, loadOrderDetails, loadPartyDetails, quickData, refreshOrder, resetOrder, setItems, showOrderDetails, updateDetails } from "../order.config.js";
import { setupIndexDB } from "../_localdb.js";

// export default {}
export function leftPanel() {
    try {
        let topMenu = [
            // home
            {
                id: 'home', rc: '', name: "Home", title: 'Home Page', icon: icons.home, href: '/apps/app', class: 'menu-item',
                action: () => location.href = '/apps/app'
            },
            // create order
            {
                id: 'order', rc: '', name: "Order", title: 'Create New Order', icon: icons.plus, href: '', class: 'menu-item order-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) { alert('Please Un-Pin Purchase!'); return; }
                    jq('#new-order').removeClass('d-none');
                }
            },
            // view orders
            {
                id: 'vieworder', rc: 'PgBXvEqD', name: "View Orders", title: 'View Orders', icon: icons.orders, href: '', class: 'menu-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _viewOrders();
                }
            },
            // closing
            {
                id: 'closing', rc: 'jDzNlYbp', name: 'Closing', title: 'View Closing', icon: icons.closing, href: '', class: 'menu-item',
                action: async () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _viewClosing()
                }
            },
            // partys
            {
                id: 'party', rc: '', name: "Customers", title: 'View Customers', icon: icons.partys, href: '', class: 'menu-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _viewPartys();
                }
            },
            // create expense         
            {
                id: 'expense', rc: '', name: "Expense", title: 'Create Expense', icon: icons.expense1, href: '',
                action: () => createStuff({ title: 'Add Expnse', table: 'expense', url: '/api/crud/create/expense' })
            },
            // create stock
            {
                id: 'stock', rc: '', name: "Stock", title: 'Create New Stock', icon: icons.stock, href: '',
                action: () => createStock({})
            },
            // view stock
            {
                id: 'inventory', rc: '', name: "View Stock", title: 'View Stock', icon: icons.stock_1, href: '', class: 'menu-item',
                // action: () => location.href = '/apps/app/stock',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _viewStock();
                }
            },
            // view purchaes
            {
                id: 'viewpurch', rc: 'WnkzKJLc', name: "View Purchase", title: 'View Purchase', icon: icons.inventory, href: '', class: 'menu-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _viewPurch();
                },
            },
            // create purchase form
            {
                id: 'purchase', rc: 'FROKLrJs', name: "Purchase Entry", title: 'Purchase Stock', icon: icons.purchase, href: '', class: '', hide: true,
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    purchEntry()
                },
            },
            // create purchase
            {
                id: 'purchase', rc: 'FROKLrJs', name: "Purchase", title: 'Create New Purchase', icon: icons.purchase1, href: '', class: 'menu-item purch-item',
                action: () => {
                    jq('#purchase-order').removeClass('d-none');
                }
            },
            // monthly sales
            {
                id: 'monthlyhsales', rc: 'klidFVCa', name: "Monthly Sales", title: 'View Montyly Sales!', icon: icons.sales, href: '', class: 'menu-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _monthlySales()
                }
            },
            // monthly purchase
            {
                id: 'monthlyhsales', rc: 'klidFVCa', name: "Monthly Purhase", title: 'View Montyly Purchase!', icon: icons.sales, href: '', class: 'menu-item',
                action: () => {
                    const { pin_purch = null } = getOrderData();
                    if (pin_purch) return;
                    _monthlyPurchase()
                }
            },
        ];

        topMenu.forEach(menu => {
            let div = createEL('div');
            div.title = menu.title;
            let link = createEL('span');
            link.href = menu.href;
            jq(link).addClass(`d-none d-xl-flex ms-3 link-light`).text(menu.name);
            jq(div).addClass(`d-xl-flex jcs text-center p-1 aic role-btn fw-300 ${menu?.class ? menu.class : ''} ${menu.id}`).append(menu.icon, link);
            let divId = generateUniqueAlphaCode(8);
            jq(div).click(async function () {
                if (menu.rc) { if (await isRestricted(menu.rc)) return }
                const { pin_purch = null } = getOrderData();
                if (pin_purch) { return; }
                if (jq(this).hasClass('menu-item')) {
                    jq('div.top-side').find('div.menu-item').removeClass('fw-500');
                    jq('#desktop-body').find('div.menu-body').addClass('d-none');
                    jq(this).addClass('fw-500');
                }
                // jq('div.clear-data').html('');
                menu.action();
            }).hover(function () { jq(this).toggleClass('bg-hover rounded-end') }).prop('id', `${divId}`)
            jq('div.top-side').append(div);
            if (menu?.hide) jq(div).addClass('d-none').removeClass('d-xl-flex');
        })

        let { pin_purch = null } = getOrderData();

        if (pin_purch) {
            jq('#purchase-order, button.unpin-purch').removeClass('d-none');
            jq('#purchase-order button.pin-purch').addClass('d-none');
            jq('#side-panel div.purch-item').addClass('fw-500');
        } else {
            jq('#side-panel div.order-item').addClass('fw-500');
        }

        // bottom side
        let bottomMenu = [
            {
                id: 'app_settings', admin: true, name: 'Settings', title: 'Application Settings', icon: icons.settings, class: '',
                action: async (m) => {
                    if (m.admin) { if (!await isAdmin()) { errorMsg('Restricted Access!'); return }; }
                    jq('#settings').toggleClass('d-none');
                    loadSettings();
                }
            },
            //signout
            {
                id: 'logout', admin: false, name: 'Logout', title: 'Log Out Application', icon: icons.logout, class: '',
                action: async () => {
                    hardresetData();
                    window.location.href = '/logout'
                }
            },

        ];

        bottomMenu.forEach(async menu => {
            let div = createEL('div');
            div.title = menu.title;
            let span = createEL('span');
            jq(span).addClass('d-none d-xl-flex ms-3').text(menu.name);
            $(div).addClass(`d-xl-flex jcs text-center aic p-1 role-btn fw-300 ${menu.id} ${menu?.class || ''} `).append(menu.icon, span);
            jq(div).click(function () { menu.action(menu) }).hover(function () { jq(this).toggleClass('bg-hover rounded-end') })
            jq('div.bottom-side').append(div);
        })

    } catch (error) {
        log(error);
    }
}

export function rightPanel() {
    try {
        let arr = [
            { id: 'holds', name: 'Holds', restricted: false, title: 'View Hold Orders', action: (id) => { _viewholds(id); } },
            { id: 'party_dues', name: 'Party Dues', restricted: false, title: 'View Party Dues', action: (id, spinner) => { _partyDues(id, spinner) } },
            { id: 'recent_orders', name: 'Recent Orders', restricted: false, title: 'View Recent Orders', action: (id) => { _recent(id) } },
            { id: 'unpaid_orders', name: 'Unpaid Orders', restricted: false, title: 'View Orders Pending Payment', action: (id) => { _unpaid(id) } },
            { id: 'emp_sales', name: 'Employee Sales', restricted: true, title: 'View Employee Sales', action: (id) => { _empSales(id) } },
            { id: 'import_data', name: 'Import Orders Data', restricted: true, title: 'View Import Orders Data', action: (id) => { _importData(id) } },
        ];

        let cover = createEL('div');
        cover.className = 'd-flex flex-column bg-white rounded p-2';

        arr.forEach(async menu => {
            if (menu.restricted) {
                let admin = await isAdmin();
                if (!admin) return;
            };
            let [span] = jq('<span></span>').addClass('label fw-500').text(menu.name);
            let [hide] = jq('<span></span>').addClass('hide').html('<i class="bi bi-chevron-down"></i>')
            let [show] = jq('<span></span>').addClass('show d-none').html('<i class="bi bi-chevron-up"></i>');
            let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm me-auto status d-none').html(`<span class="visually-hidden">Loading...</span>`);
            let [matter] = jq('<div></div>').addClass('d-none overflow-auto matter').css('max-height', '250px').attr('id', menu.id);
            let [div] = jq('<div></div>').addClass('d-flex jcb aic role-btn gap-2 border-top py-3 wrapper small').append(span, spinner, hide, show).click(function () {
                $(hide).toggleClass('d-none');
                $(show).toggleClass('d-none');
                $(span).toggleClass('text-primary');
                $(matter).toggleClass('d-none');
                menu.action(menu.id, spinner);
            });
            let container = createEL('div');
            jq(container).addClass('vstack').append(div, matter)
            $(cover).append(container);
        })
        $('#content-right-panel').html(cover);
    } catch (error) {
        log(error);
    }
}

async function monthlySalesData(year) {
    try {
        let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        let values = Array(12).fill(year).concat([year]); //log(values)
        let tbl = await setTable({
            qryObj: { key: 'dailySalesFY', values },
            colsToTotal: months,
            alignRight: true,
            serial: false,
        })
        jq('div.sales-data').html(tbl.table);

    } catch (error) {
        log(error);
    }
}

async function recentOrders(id) {
    try {
        let div = doc.getElementById(id);
        if (jq(div).hasClass('d-none')) {
            jq(div).parent('div').find('div.status').removeClass('d-none');
            let res = await fetchTable({ key: 'recent_order' }, false, false); //log(res);  
            parseData({ tableObj: res, colsToParse: ['total'], alignRight: true })
            jq(div).html(res.table).parent('div').find('div.status').addClass('d-none');
        } else {
            jq(div).html('');
        }
    } catch (error) {
        log(error);
    }
}

async function unpaidOrders(id) {
    try {
        let div = doc.getElementById(id);
        if (jq(div).hasClass('d-none')) {
            jq(div).parent('div').find('div.status').removeClass('d-none');
            let res = await fetchTable({ key: 'unpaid_orders' }, false, false); //log(res);        
            parseData({ tableObj: res, colsToParse: ['total'], alignRight: true })
            jq(div).html(res.table).parent('div').find('div.status').addClass('d-none');
        } else {
            jq(div).html('');
        }
    } catch (error) {
        log(error);
    }
}

async function _closing(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'closing');
        let data = await db.all();
        let res = await setTable({ data, colsToTotal: ['total'], alignRight: true, serial: false });
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _recent(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'recent');
        let data = await db.getColumns({ sortby: 'id', sortOrder: 'desc' });
        let res = await setTable({ data, colsToParse: ['total'], colsToHide: ['id'], alignRight: true, serial: false });
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _unpaid(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'unpaid');
        let data = await db.getColumns({ sortby: 'id', sortOrder: 'desc' });
        let res = await setTable({ data, colsToParse: ['amount'], colsToHide: ['id'], alignRight: true, serial: false });
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _monthSales(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'sales_data');
        let data = await db.all();
        let res = await setTable({ data, serial: false, colsToTotal: ['sale'], alignRight: true, colsToHide: ['id', 'date'] });
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _partyDues(id, spinner) {
    try {
        let div = document.getElementById(id); //log(id, spinner)
        if (jq(div).hasClass('d-none')) return;
        jq(spinner).removeClass('d-none');
        let res = await setTable({
            qryObj: { key: 'partydues' },
            colsToHide: ['id', 'ob', 'total', 'pymt'],
            colsToParse: ['balance'],
            alignRight: true
        });
        jq(spinner).addClass('d-none');
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _empSales(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        // let rsp = await queryData({ key: 'empSalesByMonth'}); log(rsp);
        let res = await setTable({ qryObj: { key: 'empSalesByMonth' }, colsToParse: ['sales'], alignRight: true, serial: false, }); //log(res)
        jq(div).html('').html(res.table);
    } catch (error) {
        log(error);
    }
}

async function _importData(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let btnImport = jq('<button></button>').addClass('btn btn-light btn-sm').text('Import')
        let btnClear = jq('<button></button>').addClass('btn btn-light btn-sm').text('Clear All')
        let btngroup = jq('<div></div>').addClass('btn-group mb-2 w-100').append(btnImport, btnClear);
        jq(div).html(btngroup);
        let importedData = Storage.get('importedOrdersData'); //log(importedData);
        jq(btnImport).click(() => {
            if (importedData) return;
            readJsonFile(loadTable);
        });

        jq(btnClear).click(() => {
            Storage.delete('importedOrdersData');
            // Storage.delete('importProcessed');
            loadTable();
        });
        if (importedData) {
            loadTable()
        }
        function loadTable() {
            let data = Storage.get('importedOrdersData'); //log('loadTale', data);
            if (!data) {
                jq('div.imported-data').html('');
                return;
            }
            let tbl = createTable(data, false, false);
            parseData({
                tableObj: tbl,
                colsToShow: ['party_name', 'order_date'],
                colsToRename: [
                    { 'old': 'party_name', 'new': 'party' },
                    { 'old': 'order_date', 'new': 'date' }
                ],
                colsToRight: ['order_date'],
            })
            let tbldiv = jq('<div></div>').addClass('imported-data').html(tbl.table);
            jq(tbl.tbody).find(`[data-key="order_date"]`).each(function (i, e) {
                let { order_date } = data[i];
                jq(e).text(moment(order_date).format('DD/MM/YYYY'))
            })
            jq(tbl.tbody).find(`[data-key="party_name"]`).addClass('role-btn').each(function (i, e) {
                jq(e).click(function () {
                    let data = importedData[i]; //log(data.id); return;
                    let obj = {
                        order_date: moment(data.order_date).format('YYYY-MM-DD'),
                        party: data.party,
                        party_id: data.party_id,
                        party_name: data.party_name,
                        imported: data.id
                    }
                    let pymts = data.pymts.map(pymt => numerifyObject(pymt)); //log(pymts);
                    // log(data.items); return;
                    updateDetails(obj);
                    updateDetails({ items: [], pymts: [] });
                    updateDetails({ items: data.items, pymts });
                    loadOrderDetails();
                })
            })
            let importProcessed = Storage.get('importProcessed') || []; //log(importProcessed);
            if (importProcessed.length) {
                jq(tbl.tbody).find(`[data-key="id"]`).each(function (i, e) {
                    const cellText = jq(this).text().trim(); // Get the text and trim whitespace
                    if (importProcessed.includes(parseInt(cellText))) { // Check if the text (parsed as an integer) is in the array
                        jq(this).closest('tr').addClass('text-decoration-line-through');
                    }
                })
            }
            jq(div).append(tbldiv);
        }
    } catch (error) {
        log(error);
    }
}

function readJsonFile(callback = null) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // Only allow JSON files
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const jsonData = JSON.parse(event.target.result); //log(jsonData);
                    // Do something with the imported data
                    // console.log(jsonData);
                    Storage.set('importedOrdersData', jsonData);
                    if (callback) callback();
                };
                reader.readAsText(file);
            } catch (error) {
                console.error('Error importing JSON:', error);
            }
        }
    });
    input.click();
}

export async function _unholdOrder(id) {
    try {
        // let div = document.getElementById(id); //log(div);
        // if (jq(div).hasClass('d-none')) return;
        let [data] = await queryData({ key: 'uholdOrder', values: [id] }); //log(data);
        // let date = moment(data.dated).format('D-M-yyyy'); //log(date);

    } catch (error) {
        log(error);
    }
}

export async function _viewholds_(id) {
    try {
        let div = document.getElementById(id); //log(div);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'holds');
        let data = await db.getColumns({
            columns: ['party_name', 'order_date', 'id'],
            rename: { 'party_name': 'party', 'order_date': 'dated' },
            sortby: 'id'
        }); //log(data);

        let tbl = await setTable({ data, colsToHide: ['id'], colsToRight: ['dated'], serial: false, });
        jq(div).html('').html(tbl.table);
        jq(tbl.tbody).find(`[data-key="party"]`).each(function (e) {
            let party = this.textContent; //log(party);
            if (party == '') jq(this).text('N/A');
        })
        jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, e) {
            jq(e).click(async function () {
                let od = getOrderData();
                if (od.items.length) {
                    let cnf = confirm('All Existing Data will be Cleared? are you sure want to Unhold?');
                    if (!cnf) return;
                }
                let id = jq(this).closest('tr').find(`[data-key="id"]`).text();
                let [data] = await db.get(id);
                await db.delete(id);
                let pymts = data.pymts;
                let items = data.items;
                let payments = data.payments;
                delete data.pymts;
                delete data.items;
                delete data.payments;
                data.order_date = getSqlDate();
                updateDetails(data);
                updateDetails({ pymts: [], items: [] });
                updateDetails({ pymts, items });
                // updateDetails({ items });
                jq(this).closest('tr').remove();
                loadOrderDetails();
                refreshOrder();
                jq('div.ihold-panel').addClass('d-none');
            })
        })
    } catch (error) {
        log(error);
    }
}

export async function _viewholds(id) {
    try {
        let div = document.getElementById(id);
        if (jq(div).hasClass('d-none')) return;
        let db = new xdb(storeId, 'holds');
        let data1 = await db.getColumns({
            columns: ['party_name', 'order_date', 'id'],
            rename: { 'party_name': 'party', 'order_date': 'dated' },
            sortby: 'id'
        });
        let data2 = await queryData({ key: 'holdsList' });

        let data = data1.length ? [...data1, ...data2] : data2;

        let tbl = await setTable({ data, colsToHide: ['id'], colsToRight: ['dated'], serial: false, });
        jq(div).html('').html(tbl.table);
        jq(tbl.tbody).find(`[data-key="party"]`).each(function (e) {
            let party = this.textContent;
            if (party == '') jq(this).text('N/A');
        })
        jq(tbl.tbody).find('tr').addClass('role-btn').each(function (i, e) {
            jq(e).click(async function () {
                let od = getOrderData();
                if (od.items.length) {
                    let cnf = confirm('All Existing Data will be Cleared? are you sure want to Unhold?');
                    if (!cnf) return;
                }
                let id = jq(this).closest('tr').find(`[data-key="id"]`).text();
                let [data1] = await db.get(id);
                let [res] = await queryData({ key: 'uholdOrder', values: [id] });
                let data = data1 || res?.data;
                let pymts = data.pymts;
                let items = data.items;
                let payments = data.payments;
                delete data.pymts;
                delete data.items;
                delete data.payments;
                data.order_date = getSqlDate();
                updateDetails(data);
                updateDetails({ pymts: [], items: [] });
                updateDetails({ pymts, items });
                jq(this).closest('tr').remove();
                loadOrderDetails();
                refreshOrder();
                jq('div.ihold-panel').addClass('d-none');
                queryData({ key: 'delHoldById', values: [id] });
                await db.delete(id);
            })
        })
    } catch (error) {
        log(error);
    }
}

async function _viewPurch() {
    try {
        let [h5] = jq('<h4></h4>').addClass('mb-0').text('Purchases');
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto d-none').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary ms-auto').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [search] = jq('<input></input>').addClass('form-control me-auto').attr({ 'type': 'search', 'placeholder': 'Search Purchase' }).css('width', '300px');
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, search, spinner, refresh);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto')
        let db = new xdb(storeId, 'purchase');

        loadData();

        async function refreshData() {
            try {
                jq(spinner).removeClass('d-none');
                let data = await queryData({ key: 'purchases' }); //log(data);  return
                db.put(data);
                jq(spinner).addClass('d-none');
                loadData();
            } catch (error) {
                log(error);
            }
        }

        jq(search).keyup(async function () {
            let key = this.value; //log(key);
            if (key) {
                let data = await db.getColumns({
                    key, indexes: ['id', 'dated', 'supid', 'supplier'],
                    table: 'purchase', limit: 50, sortby: 'id', sortOrder: 'desc',
                });
                loadData(data);
            }
        }).on('search', function () { loadData() })

        async function loadData(data = null, key = null) {
            if (!data) {
                data = await db.getColumns({
                    key, indexes: ['id', 'dated', 'supid', 'supplier'],
                    table: 'purchase', limit: 50, sortby: 'id', sortOrder: 'desc',
                });
            }

            if (!data.length) {
                jq(spinner).addClass('d-none');
                jq(tbldiv).html('');
                return;
            }

            jq(spinner).removeClass('d-none');
            let res = await fetchTable({ key: 'purchase' }, true, true, data);
            jq(spinner).addClass('d-none');
            if (!res) return;

            let { tbl } = res;

            parseData({
                tableObj: tbl,
                colsToParse: ['qty', 'subtotal', 'disc', 'tax', 'freight', 'total', 'pymt', 'balance'],
                alignRight: true,
                colsToHide: ['supid', 'order_number', 'freight', 'fin_year', 'timestamp', 'bdate', 'fyear'],
                colsToRename: [{ old: 'bill_type', new: 'type' }],
                hideBlanks: ['supid', 'freight', 'timestamp', 'bdate']
            });

            jq(tbl.tbody).find(`[data-key="id"]`).each(function (i, e) {
                jq(e).addClass('role-btn text-primary').click(function () {
                    let { id, balance, supplier } = data[i];
                    popListInline({
                        el: this,
                        li: [
                            // { key: 'View', id: 'viewPOrder' },
                            // { key: 'Print View', id: 'printView' },
                            { key: 'View Articles', id: 'viewArticles' },
                            { key: 'Add Payment', id: 'addPurchPymt' },
                            { key: 'View Payments', id: 'viewPayments' },
                            { key: 'Edit', id: 'editPOrder' },
                            { key: 'Delete', id: 'deletePOrder' },
                            { key: 'Cancel' }
                        ]
                    });

                    jq('#editPOrder').click(async function () {
                        try {
                            if (await isRestricted('tfjlDGeL')) return;
                            let [[data], items, pymts] = await Promise.all([
                                await queryData({ key: 'editPurch', values: [id] }),
                                await queryData({ key: 'purchasedStock', values: [id] }),
                                await queryData({ key: 'purchPymt', values: [id] }),
                            ]); //log(items); return;

                            // let items = y.data;
                            // let pymts = z.data;
                            // let data = x.data[0];
                            data.update = true;
                            data.items = items || [];
                            data.pymts = pymts || [];
                            data.supplier = supplier;
                            delete items.timestamp;
                            // log(data); return;
                            updateDetails({ purchase: { ...data }, pin_purch: true });
                            // updateDetails({ purchase: { ...data } });                            
                            // history.pushState({}, null, '/apps/app/orders/create/purchase');
                            location.reload()

                        } catch (error) {
                            log(error);
                        }
                    })

                    jq('#deletePOrder').click(async function () {
                        if (await isRestricted('eVyiaFnt')) return;
                        let cnf = confirm('Are you sure want to delete this Purchaes?'); //log(cnf);
                        if (cnf) {
                            await advanceQuery({ key: 'delPurch', values: [id] });
                            await db.delete(id);
                            let key = jq(search).val();
                            loadData(null, key)
                            let res = await advanceQuery({ key: 'stock' });
                            if (res.data.length) {
                                let stkdb = new xdb(storeId, 'stock')
                                stkdb.clear();
                                stkdb.add(res.data);
                            }
                        }
                    })

                    jq('#viewArticles').click(async function () {
                        let items = await queryData({ key: 'purchArticles', values: [id] }); //log(items);
                        showTable({
                            data: items,
                            title: 'Purchased Stock',
                            colsToParse: ['qty', 'price', 'cost', 'purch_price', 'sold', 'avl'],
                            colsToTotal: ['qty', 'avl', 'sold'],
                            alignRight: true
                        })
                    })

                    jq('#viewPayments').click(async function () {
                        try {
                            let db = new xdb(storeId, 'payments');
                            let data = await db.getColumns({ where: { purch_id: id }, });

                            if (!data.length) {
                                data = await queryData({ key: 'pymtByPurchid', values: [id] });
                                db.put(data);
                            }
                            showTable({
                                data,
                                title: 'Purchased Stock',
                                colsToShow: ['id', 'amount', 'cash', 'bank', 'other', 'bank_name', 'bank_mode', 'payment_method'],
                                colsToTotal: ['amount', 'cash', 'bank', 'other'],
                                colsToRename: [
                                    { old: 'payment_method', new: 'method' },
                                    { old: 'bank_mode', new: 'mode' },
                                    { old: 'amount', new: 'pymt' },
                                    { old: 'bank_name', new: 'a/c' },
                                ]
                            })
                        } catch (error) {
                            log(error);
                        }
                    })

                    jq('#addPurchPymt').click(async function () {
                        addPurchPymt(id, balance);
                    })
                })
            })

            jq(tbl.tbody).find(`[data-key="pymt"]`).each(function (i, e) {
                try {
                    let pymt = jq(this).text();
                    if (!pymt) {
                        let [span] = jq('<span></span>').addClass('text-primary role-btn small').text('+Pymt').click(function () {
                            let { id, balance } = data[i];
                            addPurchPymt(id, balance);
                        }).prop('title', 'Add Payment')
                        jq(this).append(span);
                    }
                } catch (error) {
                    log(error);
                }
            })

            jq(tbldiv).html(tbl.table);
        }

        // const divElement = document.createElement('div');
        // divElement.textContent = 'This is the content of the new div.';
        // divElement.className = 'my-div';
        // divElement.style.backgroundColor = 'blue';
        // const win = window.open('/ebs', '_blank', 'width=auto,height=auto');
        // const content = `
        // <h1>This is the content of the new page</h1>
        // <p>You can add more elements here.</p>
        // `;
        // // $(newWindow).ready(function () {
        // //     jq(this).find('#root').append(content);
        // // });


        // // jq(win).find('#root').append(content);
        // // let blankPage = createNewPage(content);
        // // win.document.write(content);


        jq('#view-purchase').removeClass('d-none').html('').append(header, tbldiv);
    } catch (error) {
        log(error);
    }
}

async function _viewOrders() {
    try {
        let [h5] = jq('<h4></h4>').addClass('mb-0').text('Orders');
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary ms-auto').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [search] = jq('<input></input>').addClass('form-control w-25 me-auto').attr('type', 'search').prop('placeholder', 'Search');
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, search, spinner, refresh);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto');

        let db = new xdb(storeId, 'orders');
        jq(search).on('keyup', async function () {
            let key = this.value;
            if (key) {
                jq(spinner).removeClass('d-none');
                // let res = await db.getColumns({
                //     key,
                //     indexes: ['id', 'year', 'month', 'dated', 'party', 'biller', 'fin_year', 'party_name'],
                //     limit: 50,
                //     sortby: 'id',
                //     sortOrder: 'desc'
                // });
                let res = await queryData({ key: 'srchordersbyparty', type: 'search', searchfor: key })
                loadData(res);
            } else {
                loadData();
            }
        }).on('search', function () { loadData() })

        async function refreshData() {
            try {
                jq(spinner).removeClass('d-none');
                let [a, b, c] = await Promise.all([
                    await advanceQuery({ key: 'orders' }),
                    await advanceQuery({ key: 'sold' }),
                    await advanceQuery({ key: 'payments' }),
                ]);
                let db = new xdb(storeId);
                db.clearAll(['orders', 'sold', 'payments']);
                await db.add(a.data, 'orders');
                await db.add(b.data, 'sold');
                await db.add(c.data, 'payments');
                loadData();
            } catch (error) {
                log(error);
            }
        }

        loadData();

        async function loadData(data = null) {
            // let db = new xdb(storeId, 'orders');
            // if (!data) {
            //     data = await db.getColumns({
            //         sortby: 'id',
            //         sortOrder: 'desc',
            //         limit: 150
            //     });
            // }

            // if (!data.length) {
            //     jq(tbldiv).html('');
            //     jq(spinner).addClass('d-none');
            //     return;
            // }

            let res = await fetchTable({ key: 'orders', limit: 150 }, true, true, data);
            jq(spinner).addClass('d-none');
            if (!res) return;
            let { tbl } = res;

            parseData({
                tableObj: tbl,
                // colsToShow: [`id`, `dated`, `party_name`, `inv_number`, `order_type`, `category`, `location`, `qty`, `subtotal`, `discount`, `tax`, `freight`, `round_off`, `total`, `pymt`, `balance`, `notes`, `order_id`],
                colsToParse: ['subtotal', 'qty', 'discount', 'tax', 'freight', 'total', 'cash', 'bank', 'pymt', 'balance', 'round_off'],
                colsToHide: ['order_date', 'party', 'adjustment', 'disc_id', 'disc_percent', 'ship_id', 'tax_type', 'gst_type', 'month', 'year', 'timestamp', 'order_id', 'email'],
                hideBlanks: ['category', 'location', 'freight', 'round_off', 'notes', 'tax', 'disc', 'manual_tax', 'balance', 'rewards', 'redeem', 'previous_due'],
                colsToCenter: ['inv_num', 'qty', 'notes'],
                colsToRename: [
                    { old: 'party_name', new: 'customer' },
                    { old: 'inv_number', new: 'inv#' },
                    { old: 'discount', new: 'disc' },
                    { old: 'round_off', new: 'rnd_off' },
                    { old: 'order_type', new: 'type' },
                ],
                colsToRight: ['fin_year', 'biller'],
                alignRight: true,
            })

            jq(tbl.tbody).find(`[data-key="notes"]`).addClass('role-btn').each(function (i, e) {
                let title = this.textContent;
                if (title) {
                    jq(e)
                        .attr({ 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'left', 'data-bs-title': title })
                        .html(`<i class="bi bi-chat-square-text"></i>`);
                }
            })

            jq(tbl).find(`[data-key="email"]`).addClass('d-none');

            jq(tbl.tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
                jq(e).click(async function () { orderSubmenu(e, i, res.data, loadData) });
            })

            jq(tbldiv).html(tbl.table);
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

        }

        jq('#view-orders').removeClass('d-none').html('').append(header, tbldiv);
    } catch (error) {
        log(error);
    }
}

async function _viewPartys() {
    try {
        let [h5] = jq('<h4></h4>').addClass('mb-0').text('Customers');
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary ms-auto').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [search] = jq('<input></input>').addClass('form-control me-auto w-25')
            .attr({ 'type': 'search', 'placeholder': 'Search Customer' });
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, search, spinner, refresh);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto')
        let db = new xdb(storeId, 'partys');
        loadData();

        async function refreshData() {
            let res = await advanceQuery({ key: 'party' });
            db.clear();
            db.add(res.data);
            loadData();
        }

        jq(search).keyup(async function () {
            let val = this.value;
            if (val) {
                jq(spinner).removeClass('d-none');
                let data = await db.getColumns({
                    key: val,
                    indexes: ['party_id', 'party_name', 'contact', 'email'],
                    columns: [
                        `id`, `title`, `party_name`, `party_id`, `contact`,
                        `email`, `gender`, `birthday`, `opening`, `orders`,
                        `billing`, `payments`, `balance`
                    ],
                    limit: 30,
                    rename: {
                        'payments': 'pymts'
                    },
                    sortby: 'party_name',
                }); //log(data);
                loadData(data);
            } else {
                loadData();
            }

        })

        async function loadData(data = null) {
            if (!data) {
                data = await db.getColumns({
                    // columns: [ `id`, `title`, `party_name`, `party_id`, `contact`, `email`, `gender`, `birthday`, `opening`, `orders`, `billing`, `payments`, `balance`],
                    // rename: { 'payments': 'pymts' },
                    limit: 150,
                    sortby: 'id',
                    sortOrder: 'desc',
                })
            }

            if (!data.length) {
                jq(spinner).addClass('d-none');
                jq(tbldiv).html('');
                return;
            }

            let res = await fetchTable({ key: 'party' }, true, true, data);
            jq(spinner).addClass('d-none');
            if (!res) return;

            let { tbl } = res;
            parseData({
                tableObj: tbl,
                colsToShow: [`id`, `title`, `party_name`, `party_id`, `contact`, `email`, `gender`, `birthday`, `opening`, `orders`, `billing`, `payments`, `balance`],
                colsToParse: [`opening`, `orders`, `billing`, `payments`, `balance`],
                colsToHide: [],
                alignRight: true,
                colsToRename: [
                    { old: 'payments', new: 'pymts' }
                ]
            })

            jq(tbl.tbody).find(`[data-key="id"]`).each(function (i, e) {
                jq(e).addClass('role-btn text-primary').click(function () {
                    let id = this.textContent;
                    let index = jq(this).index();
                    // let balance = data.data[index].balance;
                    let supplier = jq(this).closest('tr').find(`[data-key="supplier"]`).text();
                    popListInline({
                        el: this,
                        li: [
                            { key: 'Edit', id: 'editParty' },
                            { key: 'Delete', id: 'delParty' },
                            { key: 'Cancel' }
                        ]
                    });

                    jq('#editParty').click(async function () {
                        if (await isRestricted('PUgTVuft')) return;
                        editParty(id, false,
                            async () => {
                                let [party] = await queryData({ key: 'getpartyByid', values: [id] }); //log(party);
                                await db.put(party);
                            },
                            () => {
                                loadData();
                            });
                    })

                    jq('#delParty').click(async function () {
                        if (await isRestricted('PUgTVuft')) return;
                        let [x] = await db.get(id); log(x);
                        if (x.billing || x.payments) {
                            showErrors('Customers with No Billing/Payments can be Deleted!');
                            return;
                        }
                        let cnf = confirm('Are you sure want to delete this Party/Customer?');
                        if (cnf) {
                            let res = await advanceQuery({ key: 'delParty', values: [id] });
                            if (res.data.affectedRows) {
                                db.delete(id);
                                loadData();
                            }
                        }
                    })
                })
            })

            jq(tbldiv).html(tbl.table);
        }

        jq('#view-partys').removeClass('d-none').html('').append(header, tbldiv);
    } catch (error) {
        log(error);
    }
}

let selectedIds = [];
async function _viewStock() {
    try {
        let [h5] = jq('<h4></h4>').addClass('mb-0').text('Stock');
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary ms-auto').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [search] = jq('<input></input>').addClass('form-control w-25').attr({ 'type': 'search', 'placeholder': 'Search Stock' });
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, search, spinner, refresh);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto')
        let db = new xdb(storeId, 'stock');

        loadData();

        async function refreshData() {
            jq(spinner).removeClass('d-none');
            let data = await queryData({ key: 'stock' });
            await db.put(data);
            jq(spinner).addClass('d-none');
            loadData();
        }

        jq(search).keyup(async function () {
            let val = this.value;
            if (val) {
                jq(spinner).removeClass('d-none');
                let data = await db.getColumns({
                    key: val,
                    indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
                    limit: 400,
                    sortby: 'product',
                });
                loadData(data);

            } else {
                loadData();
            }

        }).on('search', function () { loadData() })

        async function reloadData(key) {
            let data = await db.getColumns({
                key: key,
                indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
                limit: 400,
                sortby: 'product',
            });
            loadData(data);
        }

        async function loadData(data = null, key = null) {

            if (!data) {
                data = await db.getColumns({
                    key: key || null,
                    indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
                    limit: 250, sortby: 'id', sortOrder: 'desc',
                });
            }

            if (!data.length) {
                jq(spinner).addClass('d-none');
                jq(tbldiv).html('');
                return;
            }

            let res = await fetchTable({ key: 'stock' }, true, true, data);
            jq(spinner).addClass('d-none');
            if (!res) return;
            let { tbl } = res;
            parseData({
                tableObj: tbl,
                colsToShow: [`id`, `sku`, `product`, `pcode`, `mrp`, `price`, `wsp`, `gst`, `size`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `hsn`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost`, `purch_price`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`,],
                colsToHide: ['purch_id', 'supid', 'cost', 'purch_price', 'cost_gst', 'bill_number', 'prchd_on'],
                hideBlanks: ['wsp', 'mrp', 'gst', 'size', 'discount', 'disc_type', 'brand', 'colour', 'label', 'section', 'season', 'category', 'upc', 'ean', 'hsn', 'unit', 'purch_on', 'supplier', 'defect', 'returned'],
                colsToParse: ['price', 'mrp', 'wsp', 'gst', 'qty', 'sold', 'returned', 'available'],
                colsToCenter: ['gst', 'size', 'hsn', 'uni', 'qty', 'sold', 'available'],
                colsToRename: [
                    { old: 'available', new: 'avl' },
                    { old: 'returned', new: 'gr' },
                    { old: 'discount', new: 'disc' },
                ]
            })

            jq(tbl.tbody).find(`[data-key="id"]`).addClass('role-btn text-primary').each(function (i, e) {
                jq(e).click(function () { stockSubMenu(e, i, data, loadData) })
            })

            let srch = jq(search).val(); //log(srch);
            if (srch) {
                let [li1] = jq('<li></li>').addClass('dropdown-item role-btn').text('Set Classic SKU');
                let [li2] = jq('<li></li>').addClass('dropdown-item role-btn').text('Edit Selected');
                let [li3] = jq('<li></li>').addClass('dropdown-item role-btn').text('Delete');
                let [li4] = jq('<li></li>').addClass('dropdown-item role-btn').text('Cancel');
                let [ul] = jq('<ul></ul>').addClass('dropdown-menu');
                let [btn] = jq('<span></span>').addClass('role-btn').attr('data-bs-toggle', 'dropdown').html(`<i class="bi bi-gear-fill"></i>`)
                let [div] = jq('<div></div>').addClass('dropdown').attr('data-ebs', 'dropdown');
                jq(ul).append(li1, li2, li3, li4);
                jq(div).append(btn, ul);

                if (jq(header).find(`[data-ebs="dropdown"]`).length == 0) { jq(header).children().eq(1).after(div); }

                jq(tbl.tbody).find(`[data-key="sku"]`).addClass('role-btn').prop('title', 'Select SKU').click(function () {
                    let id = jq(this).closest('tr').find(`[data-key="id"]`).text(); //log(id);
                    let exists = selectedIds.includes(id);
                    if (!exists) {
                        selectedIds.push(id);
                        $(this).addClass('fw-bold');
                    } else {
                        // If the ID exists, remove it from the array and remove the class
                        selectedIds.splice(selectedIds.indexOf(id), 1);
                        $(this).removeClass('fw-bold');
                    }
                })

                jq(li1).click(function () {
                    let cnf = confirm(`Are you sure want to Update all selected SKU'S to Classic SKU?\nOnly Unsold SKU's will be Converted!`);
                    if (!cnf) return;
                    let ids = data.map(item => item.id);
                    selectedIds.length ? updateSkus(selectedIds) : updateSkus(ids);
                })

                jq(li2).click(async function () {
                    try {
                        if (!selectedIds.length) return;
                        let mb = showModal({
                            title: 'Bulk Edit',
                            callback: async () => { let val = search.value; reloadData(val); }
                        }).modal;

                        let { form } = await getForm({ table: 'editSelected' });
                        jq(mb).find('div.modal-body').html(form);

                        function setModalBody(mb) {
                            // odd side
                            jq(mb).find('div.pcode').after('<div class="d-flex jcb aic gap-2 odd price-gst"></div>');
                            jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.price-gst'));

                            jq(mb).find('div.price-gst').after('<div class="d-flex jcb aic gap-2 odd wsp-size"></div>');
                            jq(mb).find('div.wsp, div.size').appendTo(jq(mb).find('div.wsp-size'));

                            jq(mb).find('div.wsp-size').after('<div class="d-flex jcb aic gap-2 odd unit-hsn"></div>');
                            jq(mb).find('div.unit, div.hsn').appendTo(jq(mb).find('div.unit-hsn'));

                            jq(mb).find('div.unit-hsn').after('<div class="d-flex jcb aic gap-2 odd disc-per w-100"></div>');
                            jq(mb).find('div.discount, div.disc_type').addClass('w-50').appendTo(jq(mb).find('div.disc-per'));

                            // even side
                            jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-2 even colour-cat"></div>');
                            jq(mb).find('div.colour, div.category').appendTo(jq(mb).find('div.colour-cat'));

                            jq(mb).find('div.brand').before('<div class="d-flex jcb aic gap-2 even sec-sea"></div>');
                            jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

                            jq(mb).find('div.colour-cat').after('<div class="d-flex jcb aic gap-2 even upc-label"></div>');
                            jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));

                            jq(mb).find('button.apply').click(function () {
                                //log('ok');
                            })
                        }
                        setModalBody(mb);

                        jq(mb).find('button.apply').click(async function () {
                            try {
                                let data = fd2obj({ form });
                                jq(this).addClass('disabled');
                                jq('div.p-status').removeClass('d-none');
                                let res = await postData({ url: '/api/bulk-edit', data: { data: { data, selected: selectedIds } } });
                                if (res.data?.affectedRows) {
                                    jq(this).removeClass('disabled');
                                    jq(mb).find('span.success').removeClass('d-none');
                                    jq(mb).find('span.fail, div.p-status').addClass('d-none');
                                    let data = await queryData({ key: 'stock' });
                                    await db.put(data);
                                } else {
                                    throw res.data;
                                }
                            } catch (error) {
                                jq(mb).find('span.success, div.p-status').addClass('d-none');
                                jq(mb).find('span.fail').removeClass('d-none');
                                jq(mb).find('div.error-msg').removeClass('d-none').text(error);
                                log(error);
                            }
                        })
                        new bootstrap.Modal(mb).show();

                    } catch (error) {
                        log(error);
                    }
                })

                async function updateSkus(ids) {
                    let arr = [];
                    ids.forEach(async (id) => {
                        let { data: res } = await postData({ url: '/api/set-classic-sku', data: { data: { id } } });
                        arr.push(res.affectedRows);
                    });
                    let data = await queryData({ key: 'stock' });
                    await db.put(data);
                    let val = search.value;
                    reloadData(val);
                }
                // jq(tbl.thead).find(`[data-key="sku"]`).addClass('role-btn').prop('title', 'Select All SKU').click(function () {})
            } else {
                if (jq(header).find(`[data-ebs="dropdown"]`).length > 0) jq(header).find(`[data-ebs="dropdown"]`).remove();
                selectedIds = [];
            }



            jq(tbldiv).html(tbl.table);
        }

        jq('#view-stock').removeClass('d-none').html('').append(header, tbldiv);
    } catch (error) {
        log(error);
    }
}

async function _monthlySales() {
    try {
        let fy = getFinYear();
        let [h5] = jq('<h4></h4>').addClass('mb-0').text("Month's Sale");
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto d-none').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [fyear] = jq('<span></span>').addClass('ms-auto').text('FY').prop('title', 'Financial Year');
        let [select] = jq('<select></select>').addClass('form-select').css('width', '200px').attr('name', 'fin-year').prop('title', 'Select FY');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, spinner, fyear, select, refresh);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto');
        let [div] = jq('<div></div>').addClass('d-flex justify-content-around aic text-success fw-bold');


        let fys = await queryData({ key: 'fin_years' });
        loadData(fy);

        jq(select).html('');
        fys.forEach(fy => {
            let option = new Option(fy.fin_year);
            jq(select).append(option);
        })
        jq(select).val(fy);

        async function refreshData() {
            try {
                let data = await queryData({ key: 'allsales' }); log(data);
                let db = new xdb(storeId, 'sales');
                db.clear();
                await db.add(data);
                loadData(fy);
            } catch (error) {
                log(error);
            }
        }

        async function loadData(year) {
            try {
                let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                let values = Array(12).fill(year).concat([year]);
                jq(spinner).removeClass('d-none');
                let tbl = await setTable({
                    qryObj: { key: 'dailySalesFY', values },
                    colsToTotal: months,
                    alignRight: true,
                    serial: false,
                })
                jq(tbldiv).html(tbl.table);
                jq(spinner).addClass('d-none');
            } catch (error) {
                log(error);
            }
        }

        jq(select).change(async function () {
            let fy = this.value;
            loadData(fy);
            // let { data: [{ sale }] } = await advanceQuery({ key: 'fysales', values: [fy] });
            let [sales] = await queryData({ key: 'fysales', values: [jq(select).val()] }); //log(sales);
            jq(div).html(`<span>Total Sales (${jq(select).val()})</span> <span>${parseCurrency(sales.sale)}</span>`);

        })

        let [sales] = await queryData({ key: 'fysales', values: [jq(select).val()] }); //log(sales);
        jq(div).html(`<span>Total Sales (${jq(select).val()})</span> <span>${parseCurrency(sales.sale)}</span>`);
        jq('#monthlySales').removeClass('d-none').html('').append(header, tbldiv, div);

    } catch (error) {
        log(error);
    }
}

async function _monthlyPurchase() {
    try {
        let fy = getFinYear();
        let [h5] = jq('<h4></h4>').addClass('mb-0').text("Monthly Purchase");
        let [spinner] = jq('<div></div>').addClass('spinner-border spinner-border-sm text-primary me-auto d-none').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [fyear] = jq('<span></span>').addClass('ms-auto').text('FY').prop('title', 'Financial Year');
        let [select] = jq('<select></select>').addClass('form-select').css('width', '200px').attr('name', 'fin-year').prop('title', 'Select FY');
        let [refresh] = jq('<button></button>').addClass('btn btn-secondary').html('<i class="bi bi-arrow-counterclockwise"></i>').click(refreshData).prop('title', 'Refresh Data');
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5').append(h5, spinner, fyear, select);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto');
        let [div] = jq('<div></div>').addClass('d-flex justify-content-around aic text-success fw-bold');

        let fys = await queryData({ key: 'purchfin_years' });
        if (!fys.length) {
            jq('#monthlyPurchase').removeClass('d-none').html(`<span class="text-secondary fs-1">No Records Found!</span>`)
            return
        };
        loadData(fy);

        jq(select).html('');
        fys.forEach(fy => {
            let option = new Option(fy?.fin_year || '');
            jq(select).append(option);
        })
        jq(select).val(fy);

        async function refreshData() {
            try {
                let { data } = await advanceQuery({ key: 'allsales' });
                let db = new xdb(storeId, 'sales');
                db.clear();
                await db.add(data);
                loadData(fy);
            } catch (error) {
                log(error);
            }
        }

        async function loadData(year) {
            try {
                let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                let values = Array(12).fill(year).concat([year]);
                jq(spinner).removeClass('d-none');
                let tbl = await setTable({
                    qryObj: { key: 'dailyPurchFY', values },
                    colsToTotal: months,
                    alignRight: true,
                    serial: false,
                })
                jq(tbldiv).html(tbl.table);
                jq(spinner).addClass('d-none');
            } catch (error) {
                log(error);
            }
        }

        jq(select).change(async function () {
            let fy = this.value;
            loadData(fy);
            let [res] = await queryData({ key: 'fypurchase', values: [jq(select).val()] });
            jq(div).html(`<span>Total Purchase (${jq(select).val()})</span> <span>${parseCurrency(res.purchase)}</span>`);

        })

        let [res] = await queryData({ key: 'fypurchase', values: [jq(select).val()] });
        jq(div).html(`<span>Total Purchase (${jq(select).val()})</span> <span>${parseCurrency(res.purchase)}</span>`);
        jq('#monthlyPurchase').removeClass('d-none').html('').append(header, tbldiv, div);

    } catch (error) {
        log(error);
    }
}

async function _viewClosing() {
    try {
        let [h5] = jq('<h4></h4>').addClass('mb-0').text('Closing');
        let [spinner] = jq('<div></div>').addClass('spinner-border text-primary me-auto d-none').html('<span class="visually-hidden">Loading...</span>').prop('role', 'status');
        let [inputDate] = jq('<input></input>').addClass('form-control').attr('type', 'date').css('width', '175px').val(moment(new Date).format('YYYY-MM-DD')).change(function () {
            log(this.value);
            loadData(this.value);
        })
        let [btn] = jq('<button></button').addClass('btn btn-sm btn-primary d-none').text('View').click(function () {
            let date = jq(inputDate).val();
            loadData(date);
        })
        let [prev] = jq('<button></button>').addClass('btn btn-light ms-auto').html('<i class="bi bi-caret-left-fill"></i>').click(function () {
            decreaseDate();
            jq(btn).click();
        }).prop('title', 'View Previous')
        let [next] = jq('<spn></spn>').addClass('btn btn-light').html('<i class="bi bi-caret-right-fill"></i>').click(function () {
            increaseDate();
            jq(btn).click();
        }).prop('title', 'View Next')

        let [refresh] = jq('<button></button>').addClass('btn btn-secondary').html('<i class="bi bi-arrow-counterclockwise"></i>').prop('title', 'Refresh Data');
        let [header] = jq('<div></div>').addClass('d-flex jcb aic gap-5 mb-5 d-print-none').append(h5, spinner, prev, next, inputDate, btn);
        let [tbldiv] = jq('<div></div>').addClass('table-responsive mb-auto')

        loadData();
        async function loadData(closing_date = null) {
            try {
                jq(spinner).removeClass('d-none');
                if (!closing_date) closing_date = getSqlDate(); //log(closing_date);
                let { data } = await advanceQuery({ key: 'closing_rep', values: [closing_date] }); //log(data); return;
                jq(spinner).addClass('d-none');

                if (data.length) {
                    let res = await fetchTable({}, true, true, data); //log(res.data);                
                    let { tbl } = res; //log(tbl);
                    parseData({
                        tableObj: tbl,
                        colsToTotal: ['total', 'sold', 'return', 'ws', 'disc', 'tax', 'qty', 'gr', 'pymt', 'cash', 'bank', 'freight', 'pre_adj'],
                        hideBlanks: ['return', 'ws', 'disc', 'tax', 'gr', 'freight'],
                        colsToHide: ['party_id', 'orderid'],
                        colsToRight: ['total', 'sold', 'return', 'ws', 'disc', 'tax', 'gr', 'pymt', 'cash', 'bank', 'freight', 'pre_adj', 'type', 'timestamp']
                    })
                    // log(tbl);
                    jq(tbl.thead).find(`[data-key="pre_adj"]`).prop('title', 'Previous Dues Adjusted')

                    jq(tbl.tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
                        if (data[i].type == 'Pymt') jq(this).removeClass('text-primary role-btn')
                        jq(e).click(function () {
                            try {
                                let { id, orderid, type } = data[i];
                                if (type == 'Pymt') return;
                                popListInline({
                                    el: this,
                                    li: [
                                        { key: 'View', id: 'viewOrder' },
                                        { key: 'Print Order', id: 'viewPrint' },
                                        { key: 'View Articles', id: 'viewItems' },
                                        { key: 'View OrderDetails', id: 'orderDetails' },
                                        { key: 'Add Payment', id: 'addPymts' },
                                        { key: 'Delete', id: 'delOrder' },
                                        { key: 'Cancel' }
                                    ]
                                });

                                jq('#viewOrder').click(function () {
                                    viewOrder(orderid);
                                })

                                jq('#viewPrint').click(function () {
                                    let url = `${window.location.origin}/view/order/format/b/?orderid=${orderid}`;
                                    let height = window.innerHeight;
                                    let width = window.innerWidth;
                                    const myWin = window.open(url, "_blank", "top=0, width=1024, height=700");
                                    myWin.resizeTo(1024, height);
                                    myWin.moveTo(width / 2 - 512, 0)
                                })

                                jq('#addPymts').click(async function () {
                                    _addPartyPymt(id, loadData);
                                });

                                jq('#delOrder').click(async function () {
                                    try {
                                        let cnf = confirm('Are you sure want to delete this order?');
                                        if (!cnf) return;
                                        let db = new xdb(storeId);
                                        await Promise.all([
                                            await advanceQuery({ key: 'deleteorder', values: [id] }),
                                            await db.delete(id, 'orders'),
                                            await db.deleteByIndexKeySmartCheck(id, 'order_id', 'sold'),
                                            await db.deleteByIndexKeySmartCheck(id, 'order_id', 'payments'),
                                        ])
                                        loadData();
                                    } catch (error) {
                                        log(error);
                                    }
                                })

                                jq('#viewItems').click(async function () {
                                    let items = await queryData({ key: 'vieworderitems', values: [id] });
                                    await showTable({
                                        title: 'Order Items',
                                        data: items,
                                        colsToParse: ['price', 'qty', 'gross'],
                                        colsToTotal: ['qty', 'gross'],
                                    })
                                });

                                jq('#orderDetails').click(function () {
                                    _viewOrderDetails(id);
                                })
                            } catch (error) {
                                log(error);
                            }
                        })
                    })

                    jq(tbldiv).html(tbl.table);
                } else {
                    jq(tbldiv).html('');
                    return;

                }

            } catch (error) {
                log(error);
            }
        }

        function increaseDate() {
            // const inputDate = document.getElementById("myDate");
            const date = new Date(inputDate.value);
            date.setDate(date.getDate() + 1);
            inputDate.value = date.toISOString().slice(0, 10);
        }

        function decreaseDate() {
            // const inputDate = document.getElementById("myDate");
            const date = new Date(inputDate.value);
            date.setDate(date.getDate() - 1);
            inputDate.value = date.toISOString().slice(0, 10);
        }
        jq('#view-closing').removeClass('d-none').html('').append(header, tbldiv);
    } catch (error) {
        log(error);
    }
}

export async function _viewHistory(party, print = false) {
    try {
        // let { party } = getOrderData();
        let [pd] = await queryData({ key: 'party_stacks', values: [party] });
        jq('span.cal').click(function () { jq('#history-by-dates').parent('div').toggleClass('d-none'); })
        jq('h5.party').html(`Ledger of <span class="text-primary ms-3">${pd.party_name}</span>/${pd.party_id}`);
        jq('span>span.opening').text(parseLocals(pd.opening)).toggleClass('text-success', pd.opening < 0).toggleClass('text-danger', pd.opening > 0);
        jq('span>span.orders').text(parseLocals(pd.orders));
        jq('span>span.pymts').text(parseLocals(pd.pymts));
        jq('span>span.balance').text(parseLocals(pd.balance))
        if (!print) jq('span>span.balance').toggleClass('text-success', pd.balance < 0).toggleClass('text-danger', pd.balance > 0);
        jq('button.refresh-hist').click(function () { loadData() });
        jq('#history-by-dates').submit(async function (e) {
            e.preventDefault();
            let { to, from } = fd2json({ form: this });
            if (!to || !from) return;
            let tbl = await setTable({
                // qryObj: { key: 'party_history_bydates', values: [party, to, from] },
                qryObj: { key: 'partyledger_bydates', values: [party, to, from, party, to, from] },
                colsToTotal: ['subtotal', 'discount', 'freight', 'tax', 'total', 'payment'],
                colsToRight: ['clear', 'timestamp'],
                colsToParse: ['balance'],                
                hideBlanks: ['freight'],
                alignRight: true,
            });
            jq('div.history-data').html(tbl.table || 'No Records Found');
            jq(this).parent('div').toggleClass('d-none');
        })

        loadData()
        async function loadData() {
            let tbl = await setTable({
                qryObj: { key: 'partyLedger', values: [party, party] },
                colsToTotal: ['subtotal', 'discount', 'freight', 'tax', 'total', 'payment'],
                colsToRight: ['clear', 'time'],
                colsToHide: ['sort_date', 'sort_ts'],
                colsToParse: ['balance'],
                hideBlanks: ['freight'],
                alignRight: true,
            });

            jq('div.history-data').html(tbl.table);

            jq(tbl.tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
                if (tbl.data[i].type == 'Payment') return;
                jq(e).click(async function () { orderSubmenu(e, i, tbl.data, loadData) });
            });

            jq(tbl.tbody).find(`[data-key="type"]`).each(function (i, e) {
                if (tbl.data[i].type == 'Payment') jq(this).closest('td').addClass('text-success');
            })
        }
    } catch (error) {
        log(error);
    }
}

async function orderSubmenu(el, i, data, cb = null) {
    let { id, order_date, email, party, order_id } = data[i]; //log(data[i]); return;
    if (!order_id) { [{ order_id }] = await queryData({ key: 'getorderids', values: [id, id] }) }

    popListInline({
        el, li: [
            { key: 'View', id: 'viewOrder' },
            { key: 'Share', id: 'shareDetails' },
            { key: 'Print Order', id: 'viewPrint' },
            { key: 'Email Order', id: 'emailOrder' },
            { key: 'View Articles', id: 'viewSold' },
            { key: 'Order Details', id: 'orderDetails' },
            { key: 'Add Payment', id: 'addPymts' },
            { key: 'View Payments', id: 'viewPymts' },
            { key: 'Add/Edit Party', id: 'addParty' },
            { key: 'Edit Inv-Number', id: 'editInv' },
            { key: 'Change Date', id: 'editDate' },
            { key: 'Export JSON', id: 'exportJson' },
            { key: 'Refetch', id: 'refetch' },
            { key: 'Edit', id: 'editOrder' },
            { key: 'Delete', id: 'delOrder' },
            { key: 'Cancel' },
        ]
    });

    jq('#viewOrder').click(function () {
        // let url = `${window.location.origin}/apps/order/thermal/?orderid=${order_id}`;
        // let height = window.innerHeight;
        // let width = window.innerWidth;
        // // let myWindow = window.open(url, "_blank", "width=500, height=700, top=0, right=0");
        // if(window?.app?.node()){
        //     window?.app?.showThermal(url)
        // }else{
        //     const myWin = window.open(url, "_blank", "top=0, width=550, height=100");
        //     myWin.resizeTo(550, height);
        //     myWin.moveTo(width / 2 - 250, 0);
        // }
        viewOrder(order_id)
    })

    jq('#viewPrint').click(function () {
        // let url = `${window.location.origin}/view/order/format/b/?orderid=${order_id}`;
        // if(window?.app?.node()){
        //     window?.app?.showA4(url)
        // }else{
        //     let height = window.innerHeight;
        //     let width = window.innerWidth;
        //     const myWin = window.open(url, "_blank", "top=0, width=1024, height=700");
        //     myWin.resizeTo(1024, height);
        //     myWin.moveTo(width / 2 - 512, 0);
        // }
        viewOrderA4(order_id);
    })

    jq('#editOrder_').click(async function () {
        if (await isRestricted('fiSvlNab')) return;
        let db = new xdb(storeId);
        let [data] = await db.getColumns({
            table: 'orders',
            columns: [
                'id', 'order_date', 'order_type', 'inv_number', 'party', 'party_id', 'party_name', 'subtotal', 'disc',
                'tax', 'freight', 'round_off', 'total', 'pymt', 'fin_year', 'tax_type', 'gst_type', 'manual_tax',
                'discount', 'disc_id', 'disc_percent', 'category', 'location', 'notes',
            ],
            rename: {
                'id': 'edit_id',
                'inv_number': 'order_number',
            },
            where: {
                id: id
            }
        });

        data.tax = parseNumber(data.tax);
        data.pymt = parseNumber(data.pymt);
        data.total = parseNumber(data.total);
        data.freight = parseNumber(data.freight);
        data.subtotal = parseNumber(data.subtotal);
        data.discount = parseNumber(data.discount);
        //log(data); return;
        let items = await db.getColumns({
            columns: ['id', 'sku', 'hsn', 'category', 'unit', 'pcode', 'product', 'qty', 'price', 'gst', 'disc_val', 'disc_per', 'emp_id', 'order_id'],
            table: 'sold',
            where: { order_id: id }
        });


        let pymts = await db.getColumns({
            columns: ['id', 'cash', 'bank', 'other', 'amount', 'bank_id', 'bank_mode', 'pymt_method', 'pymt_for', 'notes', 'order_id'],
            table: 'payments',
            where: { order_id: id }
        });

        pymts.forEach(pymt => numerifyObject(pymt)); //log(pymts); return;  

        updateDetails({ items: [], pymts: [] });
        updateDetails({ ...data, update: true, items, pymts });
        loadOrderDetails();
        jq('#side-panel div.order').click();
    })

    jq('#editOrder').click(async function () {
        if (await isRestricted('fiSvlNab')) return;
        let [a, b, c] = await Promise.all([
            await queryData({ key: 'editOrder', values: [id] }),
            await queryData({ key: 'editOrderItems', values: [id] }),
            await queryData({ key: 'editOrderPymts', values: [id, order_date] })
        ]); //log(a, b, c); return;
        const [data] = a, items = b, pymts = c; //log(data); return;
        pymts.forEach(pymt => numerifyObject(pymt)); 
        updateDetails({ items: [], pymts: [] });
        updateDetails({ ...data, update: true, items, pymts });
        loadOrderDetails();
        jq('#side-panel div.order').click();
    })


    jq('#delOrder').click(async function () {
        try {
            if (await isRestricted('jFxGDeft')) return;
            let cnf = confirm('Are you sure want to delete this order?');
            if (!cnf) return;
            let db = new xdb(storeId);
            await Promise.all([
                await advanceQuery({ key: 'deleteorder', values: [id] }),
                await db.delete(id, 'orders'),
                await db.deleteByIndexKeySmartCheck(id, 'order_id', 'sold'),
                await db.deleteByIndexKeySmartCheck(id, 'order_id', 'payments'),
            ])
            if (cb) cb();
        } catch (error) {
            log(error);
        }
    })

    jq('#viewSold').click(async function () {
        viewArticles(id);
    });

    jq('#viewPymts').click(async function () {
        let db = new xdb(storeId, 'payments');
        let data = await db.getColumns({
            columns: ['id', 'cash', 'bank', 'other', 'amount', 'bank_name', 'payment_method'],
            rename: { 'amount': 'payment', 'payment_method': 'pymt_method' },
            where: { order_id: id }
        }); //log(data);

        await showTable({
            data,
            colsToTotal: ['cash', 'bank', 'other', 'payment'],
        })
    })

    jq('#refetch').click(async function () {
        let { entity_id: folder } = getSettings().entity;
        let res = await postData({ url: '/aws/upload', data: { folder, orderid: id } });
    })

    jq('#shareDetails_').click(function () {
        let { entity } = getSettings()
        let key = `${entity.entity_id}-${order_id}`;
        // let url = `${window.location.origin}/order/?key=${key}`;
        let url = `https://api.ebsserver.in/order/?key=${key}`;
        let message = `View Order\n${url}`;
        let encodedMessage = encodeURIComponent(message);
        let location = `https://api.whatsapp.com/send/?text=${encodedMessage}`;
        window.open(location);
    });

    jq('#shareDetails').click(async function () {
        shareOrder(order_id);
    });

    jq('#emailOrder').click(async function () {
        sendOrderEmail(id);
    })

    jq('#exportJson').click(async function () {
        try {
            if (await isRestricted('fiSvlNab')) return;
            let db = new xdb(storeId);
            let items = await db.getColumns({
                table: 'sold',
                columns: ['hsn', 'pcode', 'product', 'size', 'price', 'unit', 'qty', 'price', 'disc', 'gst'],
                where: { order_id: id }
            });
            if (!items.length) { items = await queryData({ key: 'purchItems', values: [id] }); }
            let [{ subtotal, discount, inv_number, order_date }] = await db.get(id, 'orders');
            let orderData = [{ discount, subtotal, inv_number, order_date }];
            let obj = { soldItems: items, orderData };
            let json = JSON.stringify(obj);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ebs-export.json';
            link.click();
        } catch (error) {
            log(error);
        }
    })

    jq('#editDate').click(async function () {
        try {
            if (await isRestricted('ybaUOclE')) return;

            let cal = showCalender().modal;

            jq(cal).modal('show');

            // Reattach click events when calendar is updated
            jq('#calendarModal').off('calendarUpdated').on('calendarUpdated', function () {
                jq(this).find('td.calendar-day').off('click').on('click', async function () {
                    const date = jq(this).data('date');
                    const fy = getFinYear(date);

                    jq(cal).modal('hide');
                    jq(cal).remove();

                    const [a, b] = await Promise.all([
                        advanceQuery({ key: 'editorderdate', values: [date, fy, id] }),
                        advanceQuery({ key: 'updateIndexdbOrder', values: [id] }),
                    ]);

                    const db = new xdb(storeId);
                    await db.put(b.data, 'orders'); //log(b.data);
                    if (cb) cb();
                });
            });

            // Manually trigger calendarUpdated for the default view
            jq('#calendarModal').trigger('calendarUpdated');
        } catch (error) {
            log(error);
        }
    });

    jq('#editInv').click(async function () {
        try {
            if (await isRestricted('fiSvlNab')) return;
            createStuff({
                title: 'Edit Inv Number',
                table: 'editInvNo',
                modalSize: 'modal-md',
                addonData: { id },
                advQry: { key: 'editinvno', values: ['_invoice_number', '_id'] },
                cb: async () => {
                    let { data } = await advanceQuery({ key: 'updateIndexdbOrder', values: [id] });
                    let db = new xdb(storeId);
                    db.put(data, 'orders');
                    if (cb) cb();
                },
            });
        } catch (error) {
            log(error);
        }
    });

    jq('#addParty').click(async function () {
        try {
            if (await isRestricted('fiSvlNab')) return;
            createStuff({
                title: 'Add / Edit Party',
                table: 'addeditparty',
                modalSize: 'modal-md',
                addonData: { id },
                advQry: { key: 'addeditparty', values: ['_party', '_id'] },
                cb: async () => {
                    let { data } = await advanceQuery({ key: 'updateIndexdbOrder', values: [id] });
                    let db = new xdb(storeId);
                    db.put(data, 'orders');
                    if (cb) cb();
                },
            })
        } catch (error) {
            log(error)
        }
    })

    jq('#addPymts').click(async function () {
        _addPartyPymt(id);
    });

    jq('#orderDetails').click(async function () {
        _viewOrderDetails(id);
    })
}


