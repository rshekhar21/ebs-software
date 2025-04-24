import help, { jq, log, doc, fd2json, fd2obj, getData, postData, LStore, Cookie, advanceQuery, setAppID, getActiveEntity, trade_name, getCookie, loading, store_id } from './help.js';
import { details, getOrderData, purchase, updateDetails } from './order.config.js';

doc.addEventListener('DOMContentLoaded', function () {
    getAppUsers();

    jq('div.close').click(function () { jq('div.password').addClass('d-none'); jq('#user-nane, #pass-word').val('') });
    jq('div.app-name').text(trade_name);

    jq('button.fg-pwd').click(function () {
        jq('#forgot-pwd, #user-login, button.login, button.fgpwd, button.fg-pwd, button.cancel').toggleClass('d-none');
    })

    jq('button.cancel').click(function () {
        jq('#forgot-pwd, #user-login, button.login, button.fgpwd, button.fg-pwd, button.cancel').toggleClass('d-none');
    })

    jq('#forgot-pwd').submit(async function (e) {
        try {
            e.preventDefault();
            let username = jq('#user-name').val();
            let { password, authkey } = fd2obj({ form: this });
            if (!password || !authkey) return;
            const [mb] = jq('#loginModal'); //log(mb);
            let res = await postData({ url: '/rest-admin-pwd', data: { username, password, authkey } }); //log(res.data.affectedRows);
            if (res?.data?.affectedRows) {
                jq('div.modal-msg').html(`<span class="text-success pb-2">Password Changed Successfully!</span>`);
                jq('#forgot-pwd, #user-login, button.login, button.fgpwd, button.fg-pwd, button.cancel').toggleClass('d-none');
                jq('#api-key, #new-pwd').val('');
                // jq(mb).modal('show');
                // jq(mb).modal('hide');
            }
            mb.addEventListener('hide.bs.modal', () => { })
        } catch (error) {
            log(error);
        }
    })

    jq('#user-login').on('submit', async function (e) {
        try {
            e.preventDefault();
            let fd = fd2obj({ form: this }); //log(fd.password); return;
            if (!fd.password) return;
            let partyFields = {
                "title": "",
                "email": "",
                "company": "",
                "gender": "",
                "birthday": "",
                "address": "",
                "city": "",
                "state": "",
                "pincode": "",
                "opening_bal": ""
            }
            
            jq('button.login').addClass('disabled'); //return 

            let res = await postData({ url: '/app-login', data: fd }); //log(res, res.data); return;
            if (res.data.status) {
                jq('div.modal-msg').html('');
                let loader = jq('<div></div>').addClass('me-auto').html(loading);
                jq('div.loading-status').removeClass('d-none').html(loader);
                let settings = LStore.get(store_id) || {};
                settings.storeId = store_id;
                settings.bankModes = ['', 'Card', 'Online', 'Multiple', 'Cheque', 'Draft'];
                let rsp = await Promise.all([
                    await advanceQuery({ key: 'pymtmethodslist' }),
                    await advanceQuery({ key: 'listofBanks' }),
                    await advanceQuery({ key: 'discounts' }),
                    await advanceQuery({ key: 'remotesettings' }),
                ]);
                settings.pymtMethods = rsp[0].data || [];
                let banks = rsp[1].data;
                let disc = rsp[2].data;
                let remote = rsp[3].data[0]; //log(remote); return;
                settings.discounts = disc;
                settings.partyFields = partyFields;
                settings.remote = remote;
                if (banks.length) {
                    settings.banks = rsp[1].data || [];
                    let default_bank = settings?.default_bank || banks[0].id;
                    settings.default_bank = default_bank
                }
                let customSizes = settings.customSizes || [];
                if (customSizes.length === 0) settings.customSizes = [{
                    "size_group": "XS,S,M,L,XL,XXL,3XL",
                    "group_name": "SML"
                }];

                let general = {
                    "bank_id": "",
                    "defaultInvFormat": "format-b",
                    "basePrice": "sp",
                    "productMode": "Search",
                    "thermalFormat": "Classic",
                    "chartType": "line",
                    "showPymt": "No",
                    "showBankOnInv": "No",
                    "sendEmail": "No",
                    "invoiceMessage": "",
                    "declareMessage": "This invoice reflects the actual price of the items described and all details are true and correct.",
                    "showEntity": "Yes",
                    "showOrderType": "Yes",
                    "showPartyAddress": "No",
                    "screenSaverWait": "10",
                    "groupItems": ""
                }

                let gs = settings?.general || null;
                if (!gs) { settings.general = general; }

                let entity = await getActiveEntity();
                settings.entity = entity;
                updateDetails(details);

                LStore.set(store_id, settings);
                if (!LStore.get(store_id)) { }

                // help.Storage.set('ordersData', orderdData);


                jq('#user-nane, #pass-word').val('');
                jq('#loginModal').modal('hide');
                window.location.href = '/apps/app';
            }

            if (!res.data.status) {
                jq('div.modal-msg').html(`<span class="text-danger pb-2">${res.data.msg}</span>`);
                jq('button.login').removeClass('disabled'); 
            }
        } catch (error) {
            log(error);
        }
    })

    jq('button.signout').click(function () { window.location.href = '/signout' })
    jq('button.switch').click(function () { window.location.href = '/apps' })


});

async function getAppUsers() {
    try {
        jq('div.users-list').html(loading); //return;
        let res = await getData('/users-list'); //log(res.data); 
        jq('div.users-list').html('');
        if (!res?.data) return;
        res?.data.forEach(u => {
            let div = `
                <div class="d-flex flex-column justify-content-around aic gap-2 p-2 rounded login-from role-btn user" style="
                    width: 10rem; 
                    height: 10rem; 
                    background-image: url('https://ik.imagekit.io/dc4yyiiq7/EBS/myebs/public/admin-user.png?updatedAt=1741426893596'); 
                    background-position: center; 
                    background-size: cover; 
                    background-repeat: no-repeat;">
                    <span class="fs-2 username uppercase">${u.name}</span>
                    <input type="hidden" name="username" value="${u.username}">
                    <input type="hidden" class="user-role" value="${u.user_role}">
                </div>
            `;
            jq('div.users-list').append(div);
        })

        jq('div.users-list').find('div.user').click(function () {
            let username = jq(this).find('input').val(); //log(username);
            let userrole = jq(this).find('input.user-role').val(); //log(userrole);
            jq('#user-name').val(username);
            // jq('div.password').removeClass('d-none');
            const [mb] = jq('#loginModal'); //log(mb);
            jq(mb).modal('show');
            mb.addEventListener('shown.bs.modal', function () {
                if (userrole === 'user') jq('button.fg-pwd').addClass('d-none');
                jq('button.fg-pwd').toggleClass('d-none', userrole != 'admin')
                jq('#pass-word').focus();
            });

            // jq('#pass-word').on('keypress', function(){
            //     jq('#pwd').val(this.value); 
            // })



            // let pwd = [];
            // jq('#pass-word').on('keydown', function (e) {
            //     const key = e.key; //log(key);
            //     const allowedChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+$/;
            //     if (e.key === 'Backspace') { pwd.pop(); }
            //     if (e.key === 'Delete') { pwd.shift(); }
            //     if (key.length == 1 && allowedChars.test(key)) {
            //         pwd.push(key)
            //         jq('#pass-word').on('input', function (e) {
            //             jq(this).val(jq(this).val().replace(/./g, '*'));
            //         })
            //     }
            //     let str = pwd.join('');
            //     jq('#pwd').val(str);
            //     if (e.key === 'Enter') { jq('#user-login').submit(loginUser) }
            // })


        })
    } catch (error) {
        log(error);
    }
}