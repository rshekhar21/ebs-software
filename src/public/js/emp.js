import help, { Months, advanceQuery, controlBtn, createEL, displayDatatable, doc, getCYear, getMonth, jq, log, pageHead, parseNumber, queryData, searchData, storeId, xdb } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'EMPLOYEES' });
    loadData();
    searchData({ key: 'srchemp', loadData, showData });
    controlBtn({
        buttons: [
            // { title: 'Advance Pymt', icon: '<i class="bi bi-currency-rupee"></i>', cb: () => { log('ok') } },
            {
                title: 'Add Employee',
                cb: () => { help.createStuff({ title: 'New Employee', table: 'employee', url: '/api/crud/create/employee', hideFields: ['lwd'], cb: loadData }) }
            },
        ]
    });
})

async function loadData() {
    try {
        // let db = new xdb(storeId, 'employees');
        // let data = await db.getColumns({
        //     columns: [`id`, `emp_name`, `emp_id`, `contact`, `exprience`, `joined_on`, `ref`, `department`, `lwd`, `status`],
        //     sortby: 'id',
        //     sortOrder: 'desc',
        // })
        // if (!data.length) {
        //     let data = await queryData({ key: 'employee' });
        //     if (data.length) {
        //         db.put(data);
        //         loadData();
        //     }
        // }
        let res = await help.fetchTable({ key: 'employees' }, true, true, null);
        showData(res);
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data;
        if (!table) return;
        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                // let id = jq(this).closest('tr').find(`[data-key="id"]`).text();
                let id = this.textContent;
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editEmp' },
                        { key: 'Profile', id: 'viewProfile' },
                        { key: 'View Sales', id: 'viewSales' },
                        { key: 'Advance Pymt', id: 'advPymt' },
                        { key: 'Delete', id: 'deleteEmp' },
                        { key: 'Cancel' }
                    ]
                });

                jq('#editEmp').click(async function () {
                    help.createStuff({
                        title: 'Edit Employee',
                        modalSize: 'modal-lg',
                        applyButtonText: 'Update',
                        table: 'employee',
                        url: '/api/crud/update/employee',
                        qryObj: { key: 'editEmployee', values: [id] },
                        applyCallback: loadData
                    })

                    // try {
                    //     let mb = help.showModal({ title: 'Edit Employee', applyButtonText: 'Update' }).modal;
                    //     let { form, res } = await help.getForm({ table: 'employee', qryobj: { key: 'editEmployee', values: [id] } });
                    //     jq(mb).find('div.modal-body').html(form);
                    //     jq(mb).find('button.apply').click(async function () {
                    //         jq(this).addClass('disabled');
                    //         jq('div.p-status').removeClass('d-none');
                    //         const data = help.fd2json({ form });
                    //         let res = await help.postData({ url: '/api/crud/update/employee', data: { data } });
                    //         if (res.data?.affectedRows) {
                    //             jq('span.success').removeClass('d-none');
                    //             jq('span.fail, div.p-status').addClass('d-none');
                    //             jq(this).removeClass('disabled');
                    //         }
                    //     })
                    //     new bootstrap.Modal(mb).show();
                    //     mb.addEventListener('hidden.bs.modal', function () { loadData() })
                    // } catch (error) {
                    //     jq('span.success, div.p-status').addClass('d-none');
                    //     jq('span.fail').removeClass('d-none');
                    //     log(error);
                    // }
                })

                jq('#viewProfile').click(async function () {
                    // let url = `${window.location.origin}/apps/app/emprofile?id=${id}`;
                    // let height = window.innerHeight;
                    // let width = window.innerWidth;
                    // const myWin = window.open(url, "_blank", "top=0, width=800, height=100");
                    // myWin.resizeTo(750, height);
                    // myWin.moveTo(width / 2 - 400, 0);

                    let [obj] = await queryData({ key: 'empbyid', values: [id] }); log(obj);
                    let ul = jq('<ul></ul>').addClass('list-group list-group-flush px-2 entity-details overflow-auto').html('');
                    for (let k in obj) {
                        let li = createEL('li');
                        let span = createEL('span');
                        $(span).addClass('fw-400 ' + k).text(obj[k]);;
                        $(li).addClass('list-group-item d-flex jcb aic').append(help.titleCase(k), span);
                        $(ul).append(li);
                    }

                    let span = jq('<span></span>').addClass('fs-5').text('Employee Profile');
                    let btn = jq('<button></button>').addClass('btn btn-close').click(function () { jq('div.emp-profile').remove() });
                    let head = jq('<div></div>').addClass('d-flex jcb aic bg-primary text-white py-2 px-3 rounded-top').append(span, btn).attr('data-bs-theme', 'dark');
                    let div = jq('<div></div>').addClass('position-fixed top-0 start-50 translate-middle-x bg-white shadow rounded mt-3 emp-profile d-flex flex-column gap-2').css({ 'width': '800px', 'height': '800px', 'z-index': '1000' }).append(head, ul);
                    jq('body').append(div);
                })

                jq('#deleteEmp').click(async function () {
                    try {
                        let confirm = help.confirmMsg('Are you sure want to delete this Employee?');
                        if (!confirm) return;
                        await help.advanceQuery({ key: 'deleteEmp', values: [id] });
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })

                jq('#advPymt').click(async function () {
                    help.createStuff({
                        title: 'Advance Payment',
                        table: 'empAdvance',
                        url: '/api/crud/create/emp_advance',
                        cb: loadData,
                        defaultInputValues: [
                            {
                                inputId: '#emp_id',
                                value: id,
                            }
                        ]
                    })
                })

                jq('#viewSales').click(async function () {
                    try {
                        let year = getCYear(); //log(year)
                        let mnth = getMonth(); //log(mnth)
                        let res = await help.setTable({ qryObj: { key: 'empSales', values: [id, mnth, year] }, colsToParse: ['disc', 'price'], colsToTotal: ['qty', 'sale'], alignRight: true, showProcess: false }); //log(res);
                        let mb = help.showModal({ title: 'Emp. Sales', showFooter: false }).modal;
                        jq(mb).modal('show');
                        let div = createEL('div');
                        jq(div).addClass('d-flex jcb aic gap-2 mb-2');
                        let selectMonth = createEL('select');
                        let selectYear = createEL('select');
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
                        jq(div).append(selectMonth, selectYear);
                        jq(mb).find('div.modal-body').prepend(div);
                        jq(selectMonth, selectYear).change(async function () {
                            let mnth = jq(selectMonth).val();
                            let year = jq(selectYear).val();
                            let res = await help.setTable({ qryObj: { key: 'empSales', values: [id, mnth, year] }, colsToParse: ['disc', 'price'], colsToTotal: ['qty', 'sale'], alignRight: true, showProcess: false }); //log(res);
                            jq(mb).find('div.data-table').html(res?.table || '');
                        })
                        let dataDiv = createEL('div');
                        jq(dataDiv).addClass('data-table table-responsive').html(res?.table || '');
                        jq(mb).find('div.modal-body').append(dataDiv)
                    } catch (error) {
                        log(error)
                    }
                })
            })
        })
        displayDatatable(table, 'container');
    } catch (error) {
        log(error);
    }
}