import help, { advanceQuery, controlBtn, createEL, cuser, displayDatatable, doc, errorMsg, fd2json, fetchTable, getCookie, getForm, isAdmin, isRrestricted, jq, log, pageHead, popListInline, setTable, showModal } from "./help.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'USERS', viewSearch: false, spinner: false });
    controlBtn({
        buttons: [
            {
                title: 'Add New User',
                cb: async () => {
                    if (await isRrestricted('CrOdiKbL')) return;
                    help.createStuff({
                        title: 'Add User',
                        modalSize: 'modal-md',
                        table: 'appUsers',
                        url: '/api/crud/create/users',
                        cb: loadData
                    })
                }
            }
        ]
    });
    loadData();
});

async function loadData() {
    try {
        let res = await fetchTable({ key: 'appusers' }); //log(res);
        displayDatatable(res.table, 'container-sm');
        jq(res.tbody).find(`[data-key="id"]`).each(function () {
            jq(this).addClass('role-btn text-primary').click(function () {
                let id = this.textContent;
                let username = jq(this).closest('tr').find(`[data-key="username"]`).text();
                popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editUser' },
                        { key: 'Restrictions', id: 'editRestictions' },
                        { key: 'Reset Password', id: 'resetPwd' },
                        { key: 'Delete', id: 'delUser' },
                        { key: 'Cancel' }
                    ]
                });
                if (id == 1) jq('#delUser').addClass('disabled');
                jq('#editUser').click(async function () {
                    try {
                        if (!await isAdmin()) { if (cuser !== username) { errorMsg('Unauthorized Action!'); return } }
                        const mb = help.showModal({ title: 'Edit User', applyButtonText: 'Update' }).modal;
                        const { form } = await help.getForm({ table: 'editUsers', qryobj: { key: 'editUser', values: [id] } });
                        jq(mb).find('div.modal-body').html(form);
                        help.clickModal({ modal: mb, form, url: '/api/crud/update/users' });
                        new bootstrap.Modal(mb).show();
                        mb.addEventListener('hidden.bs.modal', function () { loadData() })
                    } catch (error) {
                        log(error);
                    }
                });

                jq('#editRestictions').click(async function () {
                    try {
                        if (await isRrestricted('CrOdiKbL')) return;
                        let res = await advanceQuery({ key: 'userRestrictions', values: [id] });
                        if (!res.data.length) return;
                        let obj = res.data[0];  //log(obj);
                        let rest_id = obj.id;
                        delete obj.id;
                        delete obj.userid;
                        let form = createEL('form');
                        form.id = 'restrictionForm';
                        let ul = createEL('ul');
                        ul.className = 'list-group list-group-flush'
                        for (let k in obj) {
                            // if(k=='id' || k=='userid') continue;
                            let input = createEL('input');
                            input.type = 'checkbox';
                            input.name = k;
                            input.role = 'switch';
                            input.id = k;
                            input.value = obj[k];
                            input.checked = obj[k] ? true : false;
                            input.className = 'form-check-input order-2';
                            let div = createEL('div');
                            div.className = 'form-check form-switch d-flex px-0';
                            let label = createEL('label');
                            label.className = 'form-check-label me-auto';
                            label.htmlFor = k;
                            jq(label).text(k);
                            jq(div).append(input, label);
                            jq(input).change(function () { jq(this).is(':checked') ? this.value = 1 : this.value = 0 });
                            let li = createEL('li');
                            jq(li).addClass('list-group-item').append(div);
                            jq(ul).append(li);
                        }
                        jq(form).html(ul);
                        let mb = showModal({ title: 'User Restrictions', modalSize: 'modal-md' }).modal;
                        jq(mb).find('div.modal-body').html(form);
                        jq(mb).find('button.apply').click(async function () {
                            try {
                                let fd = fd2json({ form });
                                // let data = {};
                                // for(let k in obj){ data[k]= fd[k]?'1':'0'; }
                                // log(data);
                                let data = Object.fromEntries(Object.keys(obj).map(k => [k, fd[k] ? '1' : '0'])); //log(data);
                                data.id = rest_id; //log(data); return;
                                let res = await help.postData({ url: '/api/crud/update/restrictions', data: { data } }); //log(res);
                                if (res.data?.affectedRows) {
                                    jq(this).removeClass('disabled');
                                    jq(mb).find('span.success').removeClass('d-none');
                                    jq(mb).find('span.fail, div.p-status').addClass('d-none');
                                } else {
                                    throw res.data;
                                }
                            } catch (error) {
                                jq(mb).find('span.success, div.p-status').addClass('d-none');
                                jq(mb).find('span.fail').removeClass('d-none');
                                jq(mb).find('div.error-msg').removeClass('d-none').text(error);
                                log(error);
                            }
                        })
                        new bootstrap.Modal(mb).show();
                    } catch (error) {
                        log(error);
                    }
                })

                jq('#delUser').click(async function () {
                    try {
                        if (id == 1) {
                            alert('This User Cannot be Deleted!');
                            return;
                        }
                        if (await isRrestricted('CrOdiKbL')) return;
                        let cnf = confirm('Are you sure want to delete this user');
                        if (!cnf) return;
                        await advanceQuery({ key: 'delUser', values: [id] });
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })

                jq('#resetPwd').click(async function () {
                    try {
                        if (!await isAdmin()) { if (cuser !== username) { errorMsg('Unauthorized Action!'); return } }
                        let mb = showModal({ title: 'Reset Password', modalSize: 'modal-md', applyButtonText: 'Reset' }).modal;
                        let { form } = await getForm({ table: 'resetUserPwd' });
                        jq(mb).find('div.modal-body').html(form);
                        jq(mb).find('button.apply').click(async function () {
                            try {
                                let data = fd2json({ form }); log(data);
                                if (!data.password) throw 'Missing Password';
                                if (data.password.length < 6) throw 'Password must be 6 charactors long!';
                                let res = await advanceQuery({ key: 'updateUserPwd', values: [id] }); //log(res);
                                if (res.data?.affectedRows) {
                                    jq(mb).find('span.success').removeClass('d-none');
                                    jq(mb).find('span.fail, div.p-status').addClass('d-none');
                                } else {
                                    throw res.data;
                                }
                            } catch (error) {
                                jq(mb).find('span.success, div.p-status').addClass('d-none');
                                jq(mb).find('span.fail').removeClass('d-none');
                                jq(mb).find('div.error-msg').removeClass('d-none').text(error);
                                log(error);
                            }
                        })
                        new bootstrap.Modal(mb).show();
                    } catch (error) {
                        log(error);
                    }
                })
            });

        })
    } catch (error) {
        log(error);
    }
}