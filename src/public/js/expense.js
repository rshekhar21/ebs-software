import help, { displayDatatable, doc, fd2json, fetchTable, getForm, isRestricted, jq, log, pageHead, queryData, searchData } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'EXPENSE' });
    loadData();
    filterExpense();
    help.controlBtn({ 
        buttons: [
            { title: 'New Expense', cb: createExpense },
            { title: 'Refresh', icon: '<i class="bi bi-arrow-clockwise"></i>', cb: ()=>{
                jq('div.process').removeClass('d-none');  
                loadData();
            } },
        ] 
    });
    searchData({ key: 'srchexpense', loadData, showData });
})

async function loadData() {
    let res = await fetchTable({ key: 'expense' });
    jq('div.process').addClass('d-none');
    showData(res);
}

function filterExpense() {
    try {
        let span = jq('<span></span>').addClass('text-dark me-auto').text('Filter Expense');
        let spanFrm = jq('<span></span>').addClass('text-secondary ms-3').text('From');
        let from = jq('<input></input>').addClass('form-control').attr('type', 'date').attr('id', 'from');
        let spanTo = jq('<span></span>').addClass('text-secondary').text('To');
        let to = jq('<input></input>').addClass('form-control').attr('type', 'date').attr('id', 'to');
        let btn = jq('<button></button>').addClass('btn btn-sm btn-primary ms-3').text('Apply').click(async function (e) { 
            e.preventDefault();
            let from = jq('#from').val(); let to = jq('#to').val(); //log(from, to);
            if(!from || !to) return;
            jq('div.process').removeClass('d-none');
            let res = await fetchTable({ key: 'filterExpense', values: [from, to]}); //log(res);
            showData(res);
        })
        let print = jq('<button></button>').addClass('btn btn-sm btn-secondary ms-3').text('Print').click(function () {
           window.print(); 
        })
        let [form] = jq('<form></form>').addClass('d-flex jce aic gap-2 mb-0').append(spanFrm).append(from).append(spanTo).append(to).append(btn); //log(form);
        let [div] = jq('<div></div>').addClass('container-md d-flex jcb aic gap-2 mb-3 d-print-none').append(span).append(form).append(print);
        jq(div).insertBefore('#root');
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data; //log(data);
        if (!table) return;
        jq(tbody).find(`[data-key="id"]`).addClass('role-btn text-primary').each(function (i, e) {
            jq(e).click(function () {
                let id = this.textContent; //log(id);
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editExp' },
                        { key: 'Delete', id: 'deleteExp' },
                        { key: 'Cancel' }
                    ]
                });
                jq('#editExp').click(async function () {
                    try {
                        if (await isRestricted('nvWYRrLe')) return;
                        let mb = help.showModal({ title: 'Exit Expense', applyButtonText: 'Update' }).modal;
                        let { form, res } = await help.getForm({ table: 'expense', qryobj: { key: 'editExpense', values: [id] } });
                        jq(mb).find('div.modal-body').html(form);
                        help.loadOptions({ selectId: 'bank_id', qryObj: { key: 'selectBanks' }, defaultValue: res.data[0].bank_id });
                        help.loadOptions({ selectId: 'pymt_method', qryObj: { key: 'pymtmethods' }, defaultValue: res.data[0].pymt_method });
                        jq(mb).find('button.apply').click(async function () {
                            try {
                                jq('div.p-status').removeClass('d-none');
                                jq(this).addClass('disabled');
                                let data = help.fd2json({ form }); //log(data);
                                let res = await help.postData({ url: '/api/crud/update/expense', data: { data } }); //log(res);
                                if (res.data?.affectedRows) {
                                    jq('span.success').removeClass('d-none');
                                    jq('span.fail, div.p-status').addClass('d-none');
                                    jq(this).removeClass('disabled');
                                }
                            } catch (error) {
                                jq('span.success, div.p-status').addClass('d-none');
                                jq('span.fail').removeClass('d-none');
                                log(error);
                            }
                        })
                        new bootstrap.Modal(mb).show();
                        mb.addEventListener('hidden.bs.modal', function () { loadData() })
                    } catch (error) {
                        log(error);
                    }
                })
                jq('#deleteExp').click(async function () {
                    try {
                        if (await isRestricted('yYMmqZwl')) return;
                        let confirm = help.confirmMsg('Are you sure want to delete this Expense?');
                        if (!confirm) return;
                        await help.advanceQuery({ key: 'deleteExp', values: [id] });
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })
            })

        })
        // jq('div.data-table').html(table);
        displayDatatable(table);
    } catch (error) {
        jq('span.success, div.p-status').addClass('d-none');
        jq('span.fail').removeClass('d-none');
        log(error);
    }
}

async function createExpense() {
    try {
        const mb = help.showModal({ title: 'New Expense' }).modal;
        let { form } = await getForm({ table: 'expense' }); //log(res);

        jq(mb).find('div.modal-body').html(form);

        // help.loadOptions({ selectId: 'bank_id', qryObj: { key: 'selectBanks' } });
        // help.loadOptions({ selectId: 'pymt_method', qryObj: { key: 'pymtmethods' } });

        jq(mb).find('button.apply').click(async function () {
            try {
                jq('div.p-status').removeClass('d-none');
                jq(this).addClass('disabled');
                const data = fd2json({ form });
                if (!data.date) data.date = help.getSqlDate();
                let res = await help.postData({ url: '/api/crud/create/expense', data: { data } }); //log(res);
                if (res.data?.insertId) {
                    jq('span.success').removeClass('d-none');
                    jq('span.fail, div.p-status').addClass('d-none');
                    jq(this).removeClass('disabled');
                } else {
                    throw res.data;
                }
            } catch (error) {
                jq('span.success, div.p-status').addClass('d-none');
                jq('span.fail').removeClass('d-none');
                jq('div.error-msg').removeClass('d-none').text(error);
                log(error);
            }
        })

        new bootstrap.Modal(mb).show();
        mb.addEventListener('hidden.bs.modal', function () { loadData() })

    } catch (error) {
        log(error);
    }
}