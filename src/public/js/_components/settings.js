import { advanceQuery, createEL, createTable, doc, fd2json, fd2obj, fetchTable, getActiveEntity, getForm, getSettings, jq, log, popConfirm, postData, setAppID, updateSettings } from "../help.js";


let setting = 'general';

doc.addEventListener('DOMContentLoaded', function () {

    jq('div.settings-type h6').click(function () {
        setting = this.dataset.ebs;
        let settingName = this.dataset.name;
        jq('#settings span.setting-name').text(settingName);
        jq('#settings span.saved').addClass('d-none');
        //.attr('data-setting', setting);
        // jq('div.settings div.actions, div.settings span.saved').addClass('d-none');
        // jq(`div.settings div.${className}`).removeClass('d-none');
        jq('div.settings-type h6').removeClass('text-primary');
        jq(this).addClass('text-primary');
        loadSettings();

    }).hover(function () { jq(this).toggleClass('bg-primary-subtle') })

    jq('button.close-settings').click(function () { jq('#settings').addClass('d-none'); jq('#view-settings').html('') });
    jq('button.apply-general-settings').click((e) => saveSettings(e));
});


let settingsObj = {
    general: { table: 'settings', name: 'general', data: 'general' },
    remote: { table: 'remoteSettings', name: 'remote', width: '60%', data: 'remote' },
    customsizes: { table: 'customsizes', name: 'customsizes', data: null },
    restrictions: { table: 'restrictions', name: 'restriction', width: '60%', data: null },
    partyFields: { table: 'partyFields', name: 'partyFields', data: 'partyFields' },
    discounts: { table: 'discounts', name: 'discounts', width: '60%', data: null },
    pymtmethods: { table: 'pymt_method', name: 'pymtMethods', width: '60%', data: null },
}

export async function loadSettings() {
    try {
        let settings = getSettings(); //log(settings);
        jq('#view-settings').html('');
        let s = settingsObj[setting]; //log(s) 

        let qry = {
            table: s.table,
            idName: '_create_form', // s.id,
            data: settings[s.data] || null,
            formWidth: s?.width,
            qryObj: null,
        }; //log(qry);
        let data = settings[s.data]; //log(data);

        if (!s?.data) delete qry.data; //log(qry);
        const res = await getForm(qry); //log(res);
        // let res = await getForm({ table: 'settings', idName: 'generalSettings' });
        const form = res.form;
        jq('#view-settings').html(form);

        if (setting === 'customsizes') customSizes(form, settings);
        if (setting === 'restrictions') viewUserRestrictions(form);
        if (setting === 'discounts') loadDiscounts(settings);
        if (setting === 'pymtmethods') loadPymtmethods(settings);
        if (setting === 'partyFields') laodPartyFields(form, settings);

    } catch (error) {
        log(error);
    }
}

function saveSettings(e) {
    try {
        e.preventDefault();
        let proceed = true;
        let [form] = jq('#view-settings form'); //log(form); //return;
        jq(form).find('input:not([type="hidden"]), textarea:not([type="hidden"])').change(function () {
            if (this.hasAttribute('required')) {
                jq(this).toggleClass('is-valid', !!this.value).toggleClass('is-invalid', !this.value);
            }
        });

        jq(form).find('input:not([type="hidden"]), textarea:not([type="hidden"])').each(function () {
            if (this.hasAttribute('required')) {
                if (this.value == '' || this.value == '0') {
                    jq(this).addClass('is-invalid');
                    proceed = false;
                }
            }
        })
        if (!proceed) return; //log(setting);
        let data = fd2obj({ form }); //log(data);
        let settings = getSettings(); //log(data, settings); return;

        if (setting == 'customsizes') {
            delete data.edit_group;
            addEditSizes(data, settings);
        } else if (setting === 'restrictions') {
            let id = jq(form).find('#userid').val();
            if (!id) return;
            saveRestrictions(data, id);
        } else if (setting === 'discounts') {
            delete data.del_disc;
            createDiscount(data, settings);
        } else if (setting === 'pymtmethods') {
            addPymtMode(data, settings);
        } else if (setting === 'remote') {
            remoteSettings(data, settings);
        } else {
            // general
            let updatedSettings = { [settingsObj[setting].name]: data }; //log(updatedSettings); return;
            updateSettings(updatedSettings);
        }
        jq('#settings span.saved').removeClass('d-none');
        loadSettings();
    } catch (error) {
        log(error);
    }
}

async function createDiscount(data, settings) {
    try {
        let arr = settings.discounts;
        data.id = arr.length + 1;
        arr.push(data);
        updateSettings({ discounts: [] });
        updateSettings({ discounts: arr });
        loadSettings();
        await postData({ url: '/api/crud/create/discounts', data: { data } });

    } catch (error) {
        log(error);
    }
}

async function loadDiscounts(settings) {
    try {
        let discount = settings.discounts; //log(discount);
        if (discount?.length) {
            let list = jq('<ul></ul>').addClass('list-group list-group-numbered border-0 mb-4');
            discount.forEach((disc, i) => {
                if (disc.id === 1) return;
                let [discValue] = jq('<input></input>').addClass('form-control form-control-sm').val(disc.value).attr('type', 'number').css('width', '100px').keyup(async function (e) {
                    if (e.key === 'Enter') {
                        let index = i;
                        let data = discount[i];
                        data.value = this.value; //log(data); return;
                        const updatedDiscs = settings.discounts.map((disc, i) => i == index ? { ...disc, ...data } : disc);
                        updateSettings({ discounts: [] });
                        updateSettings({ discounts: updatedDiscs });
                        loadSettings();
                        await postData({ url: '/api/crud/update/discounts', data: { data } })
                    }
                });
                let [delDisc] = jq('<button></button>').addClass('btn btn-close').attr('type', 'button').prop('title', 'Delete Discount').click(async function () {
                    let x = discount.splice(i, 1);
                    let id = x[0].id;
                    updateSettings({ discounts: [] });
                    updateSettings({ discounts: discount });
                    await advanceQuery({ key: 'delDisc', values: [id] });
                    loadSettings();
                })
                let [discName] = jq('<span></span>').addClass('abcd').text(disc.disc_name);
                let [discType] = jq('<input></input>')
                    .addClass('ms-auto btn-check').attr({ 'type': 'checkbox', 'name': 'disc_type', 'id': disc.id + '-disctype' })
                    .click(async function () {
                        let val = jq(this).is(':checked'); log(val);
                        let res = val ? await advanceQuery({ key: 'setDiscTypePercent', values: [i + 1] }) : await advanceQuery({ key: 'setDiscTypeValue', values: [i + 1] });
                        if (res.data.affectedRows) {
                            // let { data } = await advanceQuery({ key: 'discounts' }); 
                            let data = discount[i]; //log(data); return;
                            let index = i;
                            data.disc_type = val ? '%' : '#';
                            const updatedDiscs = settings.discounts.map((disc, i) => i == index ? { ...disc, ...data } : disc); //log(updatedDiscs); return;
                            updateSettings({ discounts: [] });
                            updateSettings({ discounts: updatedDiscs });
                            loadSettings();
                        }
                    }).prop('checked', disc.disc_type === '%' ? true : false);
                let [discLabel] = jq('<label></label>').addClass('btn bgn-sm btn-light py-0').text(disc.disc_type).attr('for', disc.id + '-disctype');
                let [discGroup] = jq('<div></div>').addClass('ms-auto').append(discType, discLabel)
                let li = jq('<li></li>').addClass('list-group-item d-flex jcs aic gap-3 px-0 border-0').append(discName, discGroup, discValue);
                if (i > 5) jq(li).append(delDisc);
                jq(list).append(li);
            })
            let str = `<h6>Discounts</h6><h6>Default Values</h6>`;
            let span = jq('<span></span>').addClass('d-flex jcb aic mb-3 gap-3').html(str);
            let div = jq('<div></div>').addClass('d-flex flex-column').css('width', '60%').append(span, list);
            jq('#view-settings').prepend(div);
        }
    } catch (error) {
        log(error);
    }
}

async function addPymtMode(data, settings) {
    try {
        let arr = settings.pymtMethods;
        data.id = arr.length + 1;
        arr.push(data);
        updateSettings({ pymtMethods: [] });
        updateSettings({ pymtMethods: arr });
        let obj = { method: data.value, default_bank: data.default_bank }; //log(obj);
        let res = await postData({ url: '/api/crud/create/pymtmethods', data: { data: obj } }); //log(res.data);
        loadSettings();
    } catch (error) {
        log(error);
    }
}

async function loadPymtmethods(settings) {
    try {
        let pm = settings.pymtMethods; //log(pm);
        if (!pm || !pm?.length) return;

        let list = jq('<ul></ul>').addClass('list-group list-group-numbered border-0 mb-4');
        pm.forEach((method, i) => {
            let select = createEL('select');
            select.style.width = "200px";
            let banks = settings.banks;
            let blank_option = new Option('', '');
            jq(select).append(blank_option);
            banks.forEach(bank => {
                let option = new Option(bank.value, bank.id);
                jq(select).append(option);
            })
            jq(select).addClass('form-select form-select-sm ms-auto').val(method.default_bank).change(async function () {
                let index = i;
                let data = pm[i];
                data.default_bank = this.value;
                const updatedPM = settings.pymtMethods.map((method, i) => i == index ? { ...method, ...data } : method);
                data.method = data.value; log(data);
                updateSettings({ pymtMethods: [] });
                updateSettings({ pymtMethods: updatedPM });
                loadSettings();
                await postData({ url: '/api/crud/update/pymtmethods', data: { data } });

                let [span] = jq('<span></span').addClass('d-flex jce aic gap-2').html(`<i class="bi bi-check2-circle"></i> Bank Changed Scucessfully!`).css('color', 'green');
                jq('#view-settings').append(span);
                setTimeout(() => { jq(span).remove(); }, 3000);
            })
            let delPmode = jq('<button></button>').addClass('btn btn-close').attr('type', 'button').prop('title', 'Delete Payment Method').click(async function () {
                let cnf = confirm('All payments entries having this method will have no Payment Method.\nAre you sure want to delete this Method? ');
                if (!cnf) return;
                let x = pm.splice(i, 1);
                let id = x[0].id;
                updateSettings({ pymtMethods: [] });
                updateSettings({ pymtMethods: pm });
                await advanceQuery({ key: 'delPymtmethod', values: [id] });
                loadSettings();

            })
            let li = jq('<li></li>').addClass('list-group-item d-flex jcs aic gap-2 px-0 border-0').append(method.value, select);
            if (i > 6) jq(li).append(delPmode);
            jq(list).append(li);
        })
        let str = `<h6>Payment Methods</h6><h6>Default Bank</h6>`;
        let span = jq('<span></span>').addClass('d-flex jcb aic mb-3').html(str);
        let div = jq('<div></div>').addClass('d-flex flex-column').css('width', '60%').append(span, list);
        jq('#view-settings').prepend(div);

    } catch (error) {
        log(error);
    }
}

function viewUserRestrictions(mb) {
    try {
        jq(mb).find('#userid').change(async function () {
            let id = this.value;
            let res = await advanceQuery({ key: 'userRestrictions', values: [id] }); //log(res);
            let obj = res.data[0];  //log(obj);
            let rest_id = obj.id;
            delete obj.id;
            delete obj.userid;
            let form = createEL('div');
            // form.id = 'restrictionForm';
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
            jq(form).addClass('mt-4 overflow-auto').html(ul);
            form.style.height = '500px';
            jq(mb).find('div.userid').append(form);
        });

    } catch (error) {
        log(error);
    }
}

async function saveRestrictions(fd, id) {
    try {
        let res = await advanceQuery({ key: 'userRestrictions', values: [id] }); //log(res);
        let obj = res.data[0];
        let rest_id = obj.id;
        delete obj.id;
        delete obj.userid;
        let data = Object.fromEntries(Object.keys(obj).map(k => [k, fd[k] ? '1' : '0'])); //log(data);
        data.id = rest_id; //log(data); return;
        await help.postData({ url: '/api/crud/update/restrictions', data: { data } }); //log(res);
        loadSettings();
    } catch (error) {
        log(error);
    }
}

function addEditSizes(data, settings) {
    try {
        let index = jq('#edit_group').val();
        if (index) {
            const updatedSizes = settings.customSizes.map((size, i) => i == index ? { ...size, ...data } : size);
            updateSettings({ customSizes: [] });
            updateSettings({ customSizes: updatedSizes });
        } else {
            // updateSettings({ customSizes: [] });
            updateSettings({ customSizes: [data] });
        }
    } catch (error) {
        log(error);
    }
}

function customSizes(form, settings) {
    try {
        // load sizes
        let sizes = settings?.customSizes || []; //log(sizes);
        if (sizes.length) {
            let list = jq('<ul></ul>').addClass('list-group list-group-numbered mb-4');
            sizes.forEach((size, i) => {
                let name = jq('<span></span>').addClass('me-auto').text(size.group_name);
                let matter = jq('<span></span>').addClass('').text(size.size_group);
                let delsize = jq('<span></span>').addClass('role-btn text-danger ms-3').prop('title', 'Delete Size').html('<i class="bi bi-x-lg"></i>').click(function () {
                    try {
                        sizes.splice(i, 1); log(sizes);
                        updateSettings({ customSizes: [] });
                        updateSettings({ customSizes: sizes });
                        loadSettings();
                    } catch (error) {
                        log(error);
                    }
                })
                let li = jq('<li></li').addClass('list-group-item d-flex jcb aic gap-2').append(name, matter, delsize);
                jq(list).append(li);
            })
            let str = `<h6>Group Name</h6><h6>Sizes Included</h6>`;
            let span = jq('<span></span>').addClass('d-flex jcb aic mb-3').html(str);
            let div = jq('<div></div>').addClass('d-flex flex-column').append(span, list);
            jq('#view-settings').prepend(div);
        }

        jq(form).find('#edit_group').html('');
        let blankoption = new Option('');
        jq(form).find('#edit_group').append(blankoption);
        let sizeArr = settings?.customSizes; //log(sizeArr);

        if (sizeArr?.length) {
            sizeArr.forEach((size, i) => {
                let option = new Option(size.group_name, i);
                jq(form).find('#edit_group').append(option);
            })
        }

        jq(form).find('#edit_group').change(function (e) {
            try {
                let val = this.value; //log(val);
                if (!val) return;
                let arr = settings.customSizes;
                let group = arr[val]; //log(group);
                jq(form).find('#size_group').val(group.size_group);
                jq(form).find('#group_name').val(group.group_name);
            } catch (error) {
                log(error);
            }
        })

        let delAll = createEL('button');
        delAll.title = "Delete All Sizes";
        delAll.type = 'button';
        jq(delAll).addClass('btn btn-outline-danger').text('Delete All Sizes').click(function (e) {
            popConfirm({
                el: this, msg: 'Delete all sizes?', cb: () => {
                    updateSettings({ pymtMethods: [] });
                    loadSettings();
                }
            })
        })

        let div = jq('<div></div>').addClass('d-flex jce aic').append(delAll);
        jq(form).find('div.group_name').parent('div').append(div);

    } catch (error) {
        log(error);
    }
}

function laodPartyFields(form) {
    try {
        let arr = getAllIdsFromForm(form);
        arr.forEach(id => {
            jq(form).find(`#${id}`).change(function () {
                let checked = jq(this).is(':checked');
                checked ? this.value = id : this.value = '';
            });
        })

    } catch (error) {
        log(error);
    }
}

function getAllIdsFromForm(form) {
    let ids = [];
    jq(form).find('[id]').each(function () {
        ids.push(this.id);
    });
    return ids;
}

async function remoteSettings(data, settings) {
    try {
        let updatedSettings = { remote: data }; //log(updatedSettings);
        updateSettings(updatedSettings);
        data.id = 1;
        let res = await postData({ url: '/api/crud/update/settings', data: { data } }); //log(res);
        loadSettings();
    } catch (error) {
        log(error);
    }
}