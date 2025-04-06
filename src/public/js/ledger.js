import { _viewHistory } from './_components/panels.js';
import help, { doc, jq, log } from './help.js';

doc.addEventListener('DOMContentLoaded', () => {
    const party = help.getUrlParams().party;
    if (!party) return;
    _viewHistory(true);

    let app = window?.app?.node();
    if(app) jq('button.set-printer').removeClass('d-none');

    jq('button.print-page').on('click', async ()=>{
        let printer = Storage.get('Printer') || null;
        if (!printer) {
            printer = await window?.app?.showPrinters();
            Storage.set('Printer', printer);
            window?.app?.printPage(printer);
            return;
        };
        window?.app?.printPage(printer);
    })

    jq('button.set-printer').on('click', async ()=>{
        let printer = await window?.app?.showPrinters();
        Storage.set('Printer', printer);
    })

    jq('button.print-ledger').on('click', () => { window.print() })
})