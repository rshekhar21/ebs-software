import help, { LStore, Months, advanceQuery, createEL, displayDatatable, doc, jq, log, pageHead, parseNumber, storeId } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'BANKS', viewSearch: false });
    loadData();
    help.controlBtn({
        buttons: [
            {
                title: 'Add Bank', cb: () => {
                    help.createStuff({ 
                        title: 'Add Bank', 
                        modalSize: 'modal-md', 
                        table: 'banks', 
                        url: '/api/crud/create/bank', 
                        applyCallback: loadData, 
                        cb: setBanksList 
                    })
                }
            }
        ]
    })
})

async function setBanksList() {
    try {
        let res = await advanceQuery({ key: 'listofBanks' });
        let obj = LStore.get(storeId);
        obj.banks = res.data;
        LStore.set(storeId, obj);
    } catch (error) {
        log(error);
    }
}

async function loadData() {
    try {
        let res = await help.fetchTable({ key: 'listBanks' }, false);
        let { table, tbody, thead } = res;
        if (!table) return;

        jq(table).find(`[data-key="entity"]`).addClass('d-none');
        jq(tbody).find(`[data-key="bank"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(this).click(function () {
                let id = jq(this).closest('tr').find(`[data-key="id"]`).text();
                let bank = jq(this).closest('tr').find(`[data-key="bank_name"]`).text(); //log(bank);
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editBank' },
                        { key: 'Statement', id: 'viewStmt' },
                        { key: 'Set Defalt', id: 'setdefault' },
                        { key: 'Cancel', }
                    ]
                })
                jq('#editBank').click(async function () {
                    try {
                        help.createStuff({
                            title: 'Edit Bank',
                            modalSize: 'modal-md',
                            applyButtonText: 'Update',
                            table: 'banks',
                            url: '/api/crud/update/bank',
                            qryObj: { key: 'editBank', values: [id] },
                            applyCallback: loadData,
                            cb: setBanksList,
                        })
                    } catch (error) {
                        log(error);
                    }
                })

                jq('#viewStmt').click(async function () {
                    try {
                        const year = help.getCYear();
                        const mnth = help.getMonth();
                        const key = 'bankstmt'
                        const colsToTotal = ['debit', 'credit']
                        const res = await help.setTable({ qryObj: { key, values: [id, mnth, year] }, colsToTotal, alignRight: true, showProcess: false });

                        const mb = help.showModal({ title: 'Emp. Sales', showFooter: false }).modal;
                        jq(mb).modal('show');

                        const div = createEL('div');
                        jq(div).addClass('d-flex jcb aic gap-2 mb-2');
                        jq(mb).find('div.modal-body').prepend(div);

                        const dataDiv = createEL('div');
                        const selectMonth = createEL('select');
                        const selectYear = createEL('select');

                        jq(selectMonth).addClass('form-select form-select-sm');
                        jq(selectYear).addClass('form-select form-select-sm');

                        Months.forEach(m => {
                            let option = new Option(m.full, m.month);
                            selectMonth.add(option);
                        });

                        selectMonth.value = mnth.toLocaleString();
                        for (let i = parseNumber(year); i >= parseNumber(year) - 2; i--) {
                            let option = new Option(i);
                            selectYear.add(option);
                        }
                        selectYear.value = year

                        const prevMonth = createEL('button');
                        const nextMonth = createEL('button');

                        jq(prevMonth).addClass('btn btn-light prev').html(`<i class="bi bi-chevron-left"></i>`);
                        jq(nextMonth).addClass('btn btn-light next').html(`<i class="bi bi-chevron-right"></i>`);

                        jq(prevMonth).click(async function () {
                            let cMonth = jq(selectMonth).val();
                            let prevMonth = parseNumber(cMonth) - 1;
                            selectMonth.value = prevMonth.toLocaleString();
                            const res = await help.setTable({ qryObj: { key, values: [id, prevMonth, year] }, colsToTotal, alignRight: true, showProcess: false });
                            jq(dataDiv).html(res?.table || '');
                        })

                        jq(nextMonth).click(async function () {
                            let cMonth = jq(selectMonth).val();
                            let nextMonth = parseNumber(cMonth) + 1;
                            selectMonth.value = nextMonth.toLocaleString();
                            const res = await help.setTable({ qryObj: { key, values: [id, nextMonth, year] }, colsToTotal, alignRight: true, showProcess: false });
                            jq(dataDiv).html(res?.table || '');
                        })

                        jq(selectMonth).change(async function () {
                            const mnth = jq(selectMonth).val();
                            const year = jq(selectYear).val();
                            const res = await help.setTable({ qryObj: { key, values: [id, mnth, year] }, colsToTotal, alignRight: true, showProcess: false });
                            jq(dataDiv).html(res?.table || '');
                        })

                        jq(selectYear).change(async function () {
                            const mnth = jq(selectMonth).val();
                            const year = jq(selectYear).val();
                            const res = await help.setTable({ qryObj: { key, values: [id, mnth, year] }, colsToTotal, alignRight: true, showProcess: false });
                            jq(dataDiv).html(res?.table || '');
                        })

                        jq(div).append(selectMonth, selectYear, prevMonth, nextMonth);

                        jq(dataDiv).addClass('table-responsive').html(res?.table || '');
                        jq(mb).find('div.modal-body').append(dataDiv)
                    } catch (error) {
                        log(error)
                    }
                })

                jq('#setdefault').click(function(){
                    try {
                        let lobj = LStore.get(storeId);
                        lobj.default_bank = id;
                        LStore.set(storeId, lobj);
                    } catch (error) {
                        log(error);
                    }
                })
            })
        })
        displayDatatable(table);
    } catch (error) {
        log(error);
    }
}

