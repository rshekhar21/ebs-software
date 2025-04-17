import help, { displayDatatable, doc, jq, log, pageHead, parseData, searchData } from "./help.js";


doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'party dues' });
    help.controlBtn({});
    loadData();
    searchData({ key: 'srchparty', showData, loadData });
})

async function loadData() {
    try {
        let res = await help.fetchTable({ key: 'partydues' }); //log(res);
        showData(res);
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data;
        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                let { id } = data.data[i];
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit Party', id: 'editParty' },
                        { key: 'View Ledger', id: 'viewLedger' },
                        { key: 'Cancel', },
                    ]
                });
                jq('#editParty').click(async function () {
                    await M.editParty(id, true, loadData);
                });

                jq('#viewLedger').click(() => {
                    try {
                        let url = `${window.location.origin}/apps/app/party/ledger/?party=${id}`;
                        window?.app?.node() ? window.app?.showA4(url) : window.open(url, '_blank');
                    } catch (error) {
                        log(error);
                    }
                })
            })
        })
        parseData({
            tableObj: data,
            colsToParse: ['ob', 'total', 'pymt', 'balance'],
            alignRight: false,

        })
        displayDatatable(table);
    } catch (error) {
        log(error);
    }
}