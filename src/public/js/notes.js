import help, { displayDatatable, doc, jq, log, pageHead, searchData } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'notes' });
    loadData();
    help.controlBtn({ buttons: [
        { title: 'Create Note', icon: '<i class="bi bi-plus-lg"></i>', cb: createNote }
    ]})
    searchData({ key: 'srchnotes', loadData, showData });
})

async function loadData() {
    let res = await help.fetchTable({ key: 'viewNotes' }); //log(res);
    showData(res);  
}

function showData(data){
    try {        
        let { table, tbody, thaed } = data;
        if (!table) return;
        jq(tbody).find(`[data-key="id"]`).addClass('role-btn text-primary').each(function (i, e) {
            jq(e).click(function () {
                let id = this.textContent;
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editNote' },
                        { key: 'Delete', id: 'delNote' },
                        { key: 'Cancel' }
                    ]
                })
                jq('#editNote').click(async function () {
                    let mb = help.showModal({ title: 'Edit Note', modalSize: 'modal-md', applyButtonText: 'Update' }).modal;
                    let { form, res } = await help.getForm({ table: 'editNotes', qryobj: { key: 'editNote', values: [id] } });
                    help.loadOptions({ selectId: 'folder_id', qryObj: { key: 'notefolders' }, defaultValue: res.data[0].folder_id });
                    jq(mb).find('div.modal-body').html(form);
                    jq(mb).find('button.apply').click(async function () {
                        try {
                            jq(this).addClass('disablded');
                            jq('div.p-status').removeClass('d-none');
                            let data = help.fd2json({ form });
                            let res = await help.postData({ url: '/api/crud/update/notes', data: { data } });
                            if (res.data?.affectedRows) {
                                jq('span.success').removeClass('d-none');
                                jq('span.fail, div.p-status').addClass('d-none');
                                jq(this).removeClass('disabled');
                            }
                        } catch (error) {
                            log(error);
                            jq('span.success, div.p-status').addClass('d-none');
                            jq('span.fail').removeClass('d-none');
                        }
                    })
                    new bootstrap.Modal(mb).show();
                    mb.addEventListener('hidden.bs.modal', function () {
                        loadData();
                    })
                })
                jq('#delNote').click(async function () {
                    try {
                        let confirm = help.confirmMsg('Are you sure want to delete this note?');
                        if (!confirm) return;
                        await help.advanceQuery({ key: 'deleteNote', values: [id] });
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
        log(error);
    }
}

async function createNote() {
    try {
        const mb = help.showModal({ title: 'Add Note', modalSize: 'modal-md' }).modal;
        let { form } = await help.getForm({ table: 'notes' });
        jq(mb).find('div.modal-body').html(form);

        jq(mb).find('div.folder').addClass('d-none');
        help.loadOptions({ selectId: 'folder_id', createNew: true, qryObj: { key: 'notefolders' } });

        jq(mb).find('#folder_id').change(function () {
            if (this.value == 'create') {
                jq(mb).find('div.folder').removeClass('d-none');
            } else {
                jq(mb).find('#folder').val('');
                jq(mb).find('div.folder').addClass('d-none');
            }
        })

        jq(mb).find('button.apply').click(async function () {
            try {
                jq(this).addClass('disabled');
                jq('div.p-status').removeClass('d-none');
                let data = help.fd2json({ form });
                if (data.folder) {
                    let rs = await help.postData({ url: '/api/crud/create/folders', data: { data } }); //log(rs);
                    data.folder_id = rs.data.insertId;
                }
                let res = await help.postData({ url: '/api/crud/create/notes', data: { data } }); //log(res);
                if (res.data?.insertId) {
                    jq('span.success').removeClass('d-none');
                    jq('span.fail, div.p-status').addClass('d-none');
                    jq(this).removeClass('disabled');
                }else {
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