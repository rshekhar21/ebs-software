import help, { displayDatatable, doc, jq, log, pageHead, parseData, searchData } from "./help.js";


doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'party dues' });
    help.controlBtn({});
    loadData();
    searchData({ key: 'srchparty', showData, loadData});
})

async function loadData() {
    try {
        let res = await help.fetchTable({ key: 'partydues' }); //log(res);
        showData(res);
    } catch (error) {
        log(error); 
    } 
}

function showData(data){
    try {        
        let { table, tbody, thead } = data;
        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                let id = this.textContent;
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit Party', id: 'editParty' },
                        { key: 'Cancel', },
                    ]
                });
                jq('#editParty').click(async function () {
                    await M.editParty(id, true, loadData);

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