import help, { addTableColumnsTotal, clickModal, createEL, createTable, doc, fetchTable, getSqlDate, isRestricted, jq, log, pageHead, parseColumn, parseData, parseLocal, parseLocals, showCalender, showTable } from './help.js';

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'closing', viewSearch: false, spinner: false });
    let date = help.getSqlDate();
    loadData(date);
    help.controlBtn({
        buttons: [
            { title: 'Calander', key: 'calander', icon: '<i class="bi bi-calendar-date"></i>', cb: () => dateClosing() },
            { title: 'Next Month', key: 'next-month', icon: '<i class="bi bi-caret-right-fill"></i>', cb: () => nextDate(), hidden: true },
            { title: 'Previous Month', key: 'prev-month', icon: '<i class="bi bi-caret-left-fill"></i>', cb: () => { prevDate() } },
        ]
    })

    let day = 0;
    function prevDate() {
        day--;
        const newDate = help.getSqlDateAdvance(day, date);
        loadData(newDate);
        jq('div.next-month').removeClass('d-none');
        // date = newDate;
    }

    function nextDate() {
        day++;
        const newDate = help.getSqlDateAdvance(day, date);
        loadData(newDate);
        if (date === newDate) jq('div.next-month').addClass('d-none');
        // date=newDate;
    }

    async function dateClosing() {
        try {
            if (await isRestricted('ybaUOclE')) return;
            let cal = showCalender().modal;
            jq(cal).modal('show');
            jq('#calendarModal').off('calendarUpdated').on('calendarUpdated', function () {
                jq(this).find('td.calendar-day').off('click').on('click', async function () {
                    const date = jq(this).data('date');
                    jq(cal).modal('hide').remove();
                    jq('div.next-month').removeClass('d-none');
                    loadData(new Date(date));
                });
            });
            jq('#calendarModal').trigger('calendarUpdated');
        } catch (error) {
            log(error);
        }
    }
})

const arr = [
    {
        col: 'sales', items: [
            { key: 'cash_payments', name: 'cash' },
            { key: 'card_payments', name: 'card' },
            { 
                key: 'online_payments', 
                name: 'online',
                click: viewOnliePymts,
            },
            { key: 'bank_payments', name: 'bank' },
            {
                key: 'total_payments',
                name: 'payments',
                click: showPymts,
                query: 'pymtsbydate',
                totalfor: ['payment', 'cash', 'bank'],
                alignRight: true,
            },
            { key: 'gst', name: 'sale tax' },
            { key: 'freight', name: 'freight' },
            { key: 'forfeited', name: 'forfeited' },
            { key: 'disc', name: 'discount' },
            {
                key: 'retail',
                name: 'retail',
                click: showData,
                query: 'retailorders',
                totalfor: ['qty', 'disc', 'gst', 'tax', 'net', 'gross'], alignRight: true,
                colsToParse: ['price'],
                // display: showTable,
                // obj: {
                //     title: this.name,
                //     query: ''
                // }

            },
            {
                key: 'wholesale',
                name: 'whole sale',
                click: showData,
                query: 'wsaleorders',
                totalfor: ['qty', 'disc', 'gst', 'tax', 'net', 'gross'], alignRight: true,
                colsToParse: ['price'],
            },
            {
                key: 'sales',
                name: 'day closing',
                bold: true,
                // click: showData,
                click: showClosing,
                query: 'closing',
                totalfor: ['total', 'sold', 'return', 'ws', 'disc', 'tax', 'qty', 'gr', 'pymt', 'cash', 'bank', 'tp'],
                alignRight: true
            },
        ]
    },
    {
        col: 'others', items: [
            {
                key: 'orders',
                name: 'orders',
                click: showData,
                query: 'ordersbydate',
                totalfor: ['subtotal', 'gst', 'discount', 'freight', 'total', 'pymt'], alignRight: true
            },
            { key: 'highest_order', name: 'highest order' },
            { key: 'new_customers', name: "new party's" },
            { key: 'repeat_customers', name: 'repeted' },
            {
                key: 'total_qty_sold',
                name: 'sold',
                click: showData,
                query: 'soldbydate',
                totalfor: ['price', 'qty', 'disc', 'tax', 'net', 'gross'], alignRight: true
            },
            {
                key: 'total_qty_returned',
                name: 'gr',
                click: showData,
                query: 'grbydate',
                totalfor: ['price', 'qty', 'disc', 'tax', 'net', 'gross'], alignRight: true,
            },
            {
                key: 'total_expense',
                name: 'expense',
                click: showData,
                query: 'expensebydate',
                totalfor: ['amount']
            },
            {
                key: 'emp_advance',
                name: 'employee advance',
                click: showData,
                query: 'empadvbydate',
                totalfor: ['amount']
            },
            {
                key: 'new_stock',
                name: 'new stock',
                click: showData,
                query: 'stockbydate',
                totalfor: ['qty']
            },
            {
                key: 'total_purchase',
                name: 'purchase',
                click: showData, query: 'purchbydate',
                totalfor: ['qty', 'subtotal', 'gst', 'discount', 'freight', 'total'], alignRight: true
            },
            {
                key: 'supplier_pymt',
                name: "supplier payments",
                click: showData,
                query: 'suppymtbydate',
                totalfor: ['payment', 'cash', 'bank']
            },
            {
                key: 'total_monthly_sales',
                name: "month's sale",
                bold: true,
                click: showSales,
                query: 'sales',
                totalfor: ['bills', 'total', 'sale', 'return', 'ws', 'disc', 'gst', 'freight', 'qty', 'gr', 'pymt', 'cash', 'bank'],
                alignRight: true
            },
        ]
    }
];

async function loadData(date) {
    try {
        jq('span.custom-text').addClass('text-primary fw-bold').text(moment(date).format('DD MMM YYYY'));
        let container = createEL('div');
        let spinner = `<div class="vh-60 d-flex jcc aic"><div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
        </div></div>`;
        jq(container).html(spinner);
        jq('#root').html(container);

        date = help.getSqlDate(date);
        let res = await help.advanceQuery({ key: 'closing_matrix', values: [date] });
        let data = res.data[0];

        let row = createEL('div');
        row.style.fontSize = '0.8rem';
        jq(row).addClass('row max-vh-80 overflow-auto');

        arr.forEach(obj => {
            let col = createEL('div');
            let ul = createEL('ul');
            jq(ul).addClass('list-group list-group-flush my-3');
            let h6 = createEL('h6');
            jq(h6).addClass('text-center').text(obj.col.toUpperCase());

            obj.items.forEach(item => {
                let value = data[item.key];
                let li = createEL('li');
                let span = createEL('span');
                jq(span).addClass('flex-fill').text(item.name.toUpperCase())
                if (item.click) {
                    jq(span).addClass('role-btn text-decoration-underline');
                    span.addEventListener('click', () => {
                        item.click({
                            date,
                            query: item.query,
                            totalfor: item.totalfor,
                            title: item.name.toUpperCase(),
                            colsToParse: item?.colsToParse || [],
                            alignRight: item?.alignRight || false
                        });
                    })
                }
                jq(li).addClass(`list-group-item d-flex jcb aic  ${item.bold ? 'fw-bold' : ''}`);
                jq(li).append(span, help.parseLocal(value))
                jq(ul).append(li);
            })
            jq(col).addClass('col-12 col-md-6').append(h6);
            jq(col).append(ul);
            jq(row).append(col);
        })

        jq(container).addClass('container-md mb-6 mb-md-0').html(row);
    } catch (error) {
        log(error);
    }
}

async function displayData(obj) {
    try {
        await showTable(obj)
    } catch (error) {
        log(error);
    }
}

async function showData({ date, query, totalfor, title, colsToParse, alignRight }) {
    try {
        const mb = help.showModal({ title, showFooter: false, modalSize: 'modal-xl', }).modal;
        let res = await fetchTable({ key: query, values: [date] }); //log(res);
        let { table, tbody, thead } = res;
        if (!table) return;
        jq(mb).find('div.modal-body').html(table);
        addTableColumnsTotal({ table, thead, tbody }, totalfor, false, alignRight);
        parseColumn({ table, tbody, cols: colsToParse, alignRight: true })
        new bootstrap.Modal(mb).show();
    } catch (error) {
        log(error);
    }
}

async function showSales({ date, query, totalfor, title }) {
    try {
        const mb = help.showModal({ title, showFooter: false, modalSize: 'modal-xl', }).modal;
        let year = help.getFinYear(date);
        let month = help.getMonth(date);
        let res = await fetchTable({ key: query, values: [year, month] }); //log(res);
        parseData({
            tableObj: res.tbl,
            colsToShow: ['dated', 'sales', 'returns', 'discount', 'gst', 'freight', 'net_sales', 'orders', 'qty', 'pymt', 'cash', 'bank', 'month', 'year', 'fyear'],
            colsToHide: ['month', 'year', 'fyear'],
            hideBlanks: ['gst', 'freight'],
            colsToTotal: ['sales', 'returns', 'discount', 'gst', 'freight', 'orders', 'qty', 'pymt', 'cash', 'bank'],
            colsToRight: ['sales', 'returns', 'discount', 'gst', 'freight', 'orders', 'qty', 'pymt', 'cash', 'bank'],
            colsToRename: [
                { old: 'discount', new: 'disc' }
            ]
        })
        let { table, tbody, thead } = res;
        if (!table) return;
        jq(mb).find('div.modal-body').html(table);
        // addTableColumnsTotal({ table, thead, tbody }, totalfor, false)
        new bootstrap.Modal(mb).show();
    } catch (error) {
        log(error);
    }
}

async function showClosing({ date, query, title }) {
    try {
        const mb = help.showModal({ title, showFooter: false, modalSize: 'modal-xl', }).modal;
        let res = await fetchTable({ key: query, values: [date] });
        parseData({
            tableObj: res.tbl,
            colsToTotal: ['total', 'sold', 'return', 'ws', 'disc', 'tax', 'qty', 'gr', 'pymt', 'cash', 'bank', 'freight'],
            hideBlanks: ['return', 'ws', 'disc', 'tax', 'gr', 'freight'],
            colsToHide: ['party_id', 'orderid'],
            colsToRight: ['type'],
            alignRight: true,
        })
        let { table, tbody, thead } = res;
        if (!table) return;
        jq(mb).find('div.modal-body').html(table);
        new bootstrap.Modal(mb).show();
    } catch (error) {
        log(error);
    }
}

async function showPymts({ date, query, title }) {
    try {
        const mb = help.showModal({ title, showFooter: false, modalSize: 'modal-xl', }).modal;
        let res = await fetchTable({ key: query, values: [date] });
        parseData({
            tableObj: res.tbl,
            colsToTotal: ['payment', 'cash', 'bank'],
            colsToRight: ['payment', 'cash', 'bank', 'bank_mode', 'account', 'pymt_method', 'notes'],
            colsToRename: [
                { old: 'party_name', new: 'party' },
                { old: 'bank_mode', new: 'mode' },
                { old: 'pymt_method', new: 'method' },
            ],
            hideBlanks: ['notes']
        })
        let { table, tbody, thead } = res;
        if (!table) return;
        jq(mb).find('div.modal-body').html(table);
        new bootstrap.Modal(mb).show();
    } catch (error) {
        log(error);
    }
}

async function  viewOnliePymts(params) {
    try {
        
    } catch (error) {
        
    }
}