import { _viewHistory } from './_components/panels.js';
import help, { doc, jq, log, Storage } from './help.js';

doc.addEventListener('DOMContentLoaded', () => {
    const party = help.getUrlParams().party;
    if (!party) return;
    _viewHistory(party, true);

    let app = window?.app?.node(); log(app);
    if(app) jq('button.set-printer').removeClass('d-none');

    jq('button.printledger').on('click', async ()=>{
        let printer = Storage.get('Printer') || null;
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

})