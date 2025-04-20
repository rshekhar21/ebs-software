import help, { doc, fetchTable, jq, log, parseData, parseLocals, setTable, Storage } from './help.js';

doc.addEventListener('DOMContentLoaded', () => {
    const supplier = help.getUrlParams().supplier;
    if (!supplier) return;
    loadData(supplier);

    let app = window?.app?.node();    
    if(app) jq('button.set-printer').removeClass('d-none');

    jq('button.printledger').on('click', async ()=>{
        let printer = Storage.get('Printer') || null; //log(printer);
        if (printer) {
            printer = await window?.app?.showPrinters();
            Storage.set('Printer', printer);
            window?.app?.printPage(printer);
            return;
        };
        window.print();
    })

    jq('button.set-printer').on('click', async ()=>{
        let printer = await window?.app?.showPrinters();
        Storage.set('Printer', printer);
    })

    jq('button.refreshhist').on('click', function(){
        loadData(supplier)
    })

});

async function loadData(supid) {
    try {
        jq('div.status').removeClass('d-none');
        let res = await Promise.all([
            fetchTable({ key: 'sup_ledger', values: [supid, supid] }),
            fetchTable({ key: 'purchBySup', values: [supid] }),
            fetchTable({ key: 'pymtsBySup', values: [supid] }),
            fetchTable({ key: 'stockBySup', values: [supid] }),
            fetchTable({ key: 'supDetails', values: [supid] }),
        ]);
        jq('div.status').addClass('d-none');
        let [a, b, c, d, e] = res;
        // arr = [a.data, b.data, c.data, d.data];

        let { ob, supplier_name, sup_id, purchase, payments, balance } = e.data[0];
        // jq('.supplier').text(`LEDGER OF ${supplier_name} / ${sup_id}`)
        jq('.supplier').html(`Ledger of <span class="text-primary ms-3">${supplier_name}</span>/${sup_id}`)
        jq('span.opening').text(parseLocals(ob));
        jq('span.payments').text(parseLocals(payments));
        jq('span.purchase').text(parseLocals(purchase));
        jq('span.balance').text(parseLocals(balance));

        parseData({
            tableObj: a,
            colsToParse: ['subtotal', 'discount', 'freight', 'tax', 'total', 'payment', 'balance', 'qty', 'round'],
            colsToRight: ['time'],
            hideBlanks: ['freight', 'discount', 'round'],
            alignRight: true,
        });

        parseData({
            tableObj: b,
            colsToParse: ['subtotal', 'discount', 'freight', 'tax', 'total', 'payment', 'balance', 'qty', 'round'],
            colsToRight: ['time'],
            hideBlanks: ['freight', 'discount', 'round'],
            alignRight: true,
        });

        parseData({
            tableObj: c,
            colsToParse: ['cash', 'bank', 'payment'],
            colsToRight: ['cash', 'bank', 'payment', 'notes'],
            // hideBlanks: ['freight'],
            // alignRight: true,
        });

        parseData({
            tableObj: d,
            colsToParse: ['qty', 'cost', 'gst', 'sold', 'gr', 'available'],
            colsToRight: ['qty', 'cost', 'gst', 'sold', 'gr', 'available'],
            // hideBlanks: ['freight'],
            // alignRight: true,
        });

        jq('#panel-one').html(a.table);
        jq('#panel-two').html(b.table);
        jq('#panel-three').html(c.table);
        jq('#panel-four').html(d.table);
    } catch (error) {
        log(error);
    }
}