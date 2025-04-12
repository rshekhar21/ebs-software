import help, { controlBtn, create, createEL, doc, getActiveEntity, jq, log, pageHead, setAppID } from "./help.js";

doc.addEventListener('DOMContentLoaded', (e) => {
    pageHead({ title: 'entity', viewSearch: false });
    controlBtn({
        buttons: [
            {
                title: 'Edit Entity',
                icon: '<i class="bi bi-pencil"></i>',
                cb: () => {
                    help.createStuff({
                        title: 'Edit Entity',
                        applyButtonText: 'Update',
                        table: 'entity',
                        url: '/api/crud/update/entity',
                        qryObj: { key: 'entity' },
                        applyCallback: loadData,
                        cb: setAppID
                    })
                }
            }
        ]
    });
    loadData();
});


async function loadData() {
    try {
        let res = await help.fetchTable({ key: 'entity' }); //log(res);
        let obj = res.data[0];
        let ul = jq('<ul></ul>').addClass('list-group list-group-flush entity-details mb-8').html('');
        for (let k in obj) {
            let li = createEL('li');
            let span = createEL('span');
            $(span).addClass('fw-400 ' + k).text(obj[k]);;
            $(li).addClass('list-group-item d-flex jcb aic').append(help.titleCase(k), span);
            $(ul).append(li);
        }
        let div = jq('<div></div>').addClass('container').html(ul);
        $('#root').html(div);
    } catch (error) {
        log(error);
    }
}