import { jq, log, doc, getData, create, postData, showModal, quickData, Storage } from './help.js';

doc.addEventListener('DOMContentLoaded', function () {
    loadApps();


    jq('button.settings').click(function () {
        let mb = showModal({
            title: "Vefify Password",
            modalSize: 'modal-md',
            applyButtonText: 'Submit',
        }).modal;
        jq(mb).modal('show');

        let input = jq('<input></input>').addClass('form-control').attr({ 'type': 'password', 'placeholder': 'Account Passwrod' });
        let note = jq('<div></div>').addClass('text-danger small mt-3').text('For security purposes, please re-enter your account password to proceed.')
        jq(mb).find('div.modal-body').append(input, note);

        jq(mb).find('button.apply').click(async function () {
            let password = jq(input).val(); //log(pwd)
            if (password.trim().length === 0) return;
            let res = await postData({ url: '/verify-password', data: { password } });
            if (res.data) {
                jq(input).val('');
                jq(mb).modal('hide').remove();
                window.location.href = '/settings';
            }
        });

    })

    jq('button.signout').click(function () { window.location.href = '/signout' })

})

function getTrialStatus(user) {
    if (user.status === "active" || user.status === "activated") {
        return `Activated, ${user?.version || 'Basic'}`;
    }

    const signupDate = new Date(user.signup_date); log(signupDate);
    const today = new Date();
    const trialPeriod = user.trial_period;

    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const timeDifference = today - signupDate;
    const daysElapsed = Math.floor(timeDifference / oneDay);

    if (daysElapsed >= trialPeriod) {
        return "Expired";
    } else {
        const daysLeft = trialPeriod - daysElapsed;
        return `${daysLeft} Trial Days Left.`;
    }
}

async function loadApps() {
    try {
        let res = await quickData('/listapps'); //log(res);
        if (!res.length) { window.location.href = '/'; return }
        // if (res.data.length == 0) { return };
        jq('div.process, div.apps').toggleClass('d-none');
        let apps = res;
        for (let a of apps) {
            // let div = create('div');
            // div.dataset.key = a.app_id;
            let ts = getTrialStatus(a);
            let [link] = jq('<span></span>')
                .addClass('text-dark small position-absolute top-50 end-0 translate-middle-y me-2 d-none d-md-block')
                .text(ts)
                .click(function () {
                    log('ok');
                })
            // .prop('title', 'Click To Activate Product')

            let title = ts == "Expired" ? 'Please Activate your Product' : 'Click to Start';
            let [trade] = jq('<span></span>')
                .addClass(`${ts == 'Expired' ? '' : 'role-btn'} px-5 fw-bold`)
                .text(a.trade_name)
                .attr({ 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'left', 'data-bs-title': title, 'data-key': a.app_id })
                .click(async function () {
                    let res = await postData({ url: '/setapp', data: { app_id: a.app_id, trade: a.trade_name } });
                    let ver = await quickData('/version');
                    Storage.set('appver', ver);
                    if (res.data) window.location.href = '/apps/app';
                })
            let [div] = jq('<div></div>').addClass('py-4 d-flex jcc aic bg-blue1 rounded text-white position-relative').append(trade, link)
            jq('div.apps').append(div);
        }

        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    } catch (error) {
        log(error);
    }
}