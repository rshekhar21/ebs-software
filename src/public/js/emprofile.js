import help, { log, doc, jq, pageHead, controlBtn, fetchTable, createStuff, createEL, queryData } from './help.js';

doc.addEventListener('DOMContentLoaded', function(){
    let empid = help.getUrlParams().id; //log(empid);
    pageHead({ title: 'Emp Profile', viewSearch: false, viewTrade: false });
    controlBtn({ home: false,
        buttons: [
            {
                title: 'Edit Employee',
                icon: '<i class="bi bi-pencil"></i>',
                cb: () => {
                    createStuff({
                        title: 'Edit Employee',
                        modalSize: 'modal-md',
                        applyButtonText: 'Update',
                        table: 'employee',
                        url: '/api/crud/update/employee',
                        qryObj: { key: 'editEmployee', values: [empid] },
                        applyCallback: loadData,
                    })
                }
            }
        ]
    });
    loadData();
});

async function loadData(){
    try {
        let id = help.getUrlParams().id; //log(id);
        // let res = await help.fetchTable({ key: 'empbyid', values: [id] }); //log(res);
        // let obj = res.data[0];
        let [obj] = await queryData({ key: 'empbyid', values: [id] }); log(obj);
        let ul = createEL('ul');
        jq(ul).addClass('list-group list-group-flush px-2 entity-details mb-8').html('');
        for (let k in obj) {
            let li = createEL('li');
            let span = createEL('span');
            $(span).addClass('fw-400 ' + k).text(obj[k]);;
            $(li).addClass('list-group-item d-flex jcb aic').append(help.titleCase(k), span);
            $(ul).append(li);
        }
        $('#root').html(ul);
    } catch (error) {
        log(error);
    }
}

