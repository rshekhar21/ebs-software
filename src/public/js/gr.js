import h, { displayDatatable, doc, jq, log, pageHead, parseData, searchData } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'goods returned', ph: 'Search by Item' });
    loadData();
    h.controlBtn({});
    searchData({ key: 'srchsold', showData, loadData });
})

async function loadData() {
    try {
        let res = await h.fetchTable({ key: 'viewgr' });
        showData(res);
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        parseData({ tableObj: data, colsToParse: ['qty', 'rate', 'disc', 'gst', 'tax', 'net', 'gross'], alignRight: true })
        displayDatatable(data.table, 'container-fluid');
    } catch (error) {
        log(error);
    }
}