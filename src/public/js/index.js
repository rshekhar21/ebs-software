import help, { jq, log, doc, formDataToJson, postData, fd2json, isEmail, Storage } from './help.js';

doc.addEventListener('DOMContentLoaded', function () {
    // jq('body').addClass('gred-blue')
    window.onReCaptchaVerified = onReCaptchaVerified;

    let year = new Date().getFullYear();
    jq('span.copyright').text(`Copyright ${year}, All Rights Reserved`);

    setInterval(() => {
        jq('div.clock').text(moment().format('h:mm'));
        jq('div.date').text(moment().format('D MMMM'));
        jq('div.day').text(moment().format('dddd'));
    }, 0);


    jq('p.forgot-pwd, span.back').click(function () {
        jq('#login-form, #reset-pwd').toggleClass('d-none');
        jq('div.resp-code').addClass('d-none').removeClass('text-danger').text('');
        jq('span.send-reset-code, span.have-code').removeClass('d-none')
        jq('#acnt-email').parent('div').removeClass('d-none');
        jq('div.reset-pwd').addClass('d-none');
        jq('#reset-pwd')[0].reset();
    })

    jq('#acnt-email').blur(function () {
        if (isEmail(this.value)) {
            jq('span.send-reset-code').removeClass('text-secondary').addClass('role-btn text-primary');
        } else {
            jq('span.send-reset-code').removeClass('role-btn text-primary').addClass('text-secondary');
        }
    })

    jq('span.send-reset-code').click(async function () {
        try {
            let email_id = jq('#acnt-email').val();
            if (!email_id) return;
            jq('div.sending-status').removeClass('d-none'); //return;
            let res = await help.postData({ url: '/getuserpwdresetcode', data: { email_id } });
            if (res.data.status) {
                jq('div.send-reset-code, div.sending-status').addClass('d-none');
                jq('p.server-msg').removeClass('d-none text-danger').addClass('text-success').text(res.data.msg)
                jq('div.reset-pwd').removeClass('d-none')
            } else {
                jq('div.sending-status, div.reset-pwd').addClass('d-none');
                jq('p.server-msg').removeClass('d-none text-success').addClass('text-danger').text(res.data.msg)
            }
        } catch (error) {
            log(error);
        }
    })

    jq('span.have-code').click(function () {
        jq('div.reset-pwd').removeClass('d-none');
        jq('span.send-reset-code, span.have-code').addClass('d-none')
        jq('#acnt-email').parent('div').addClass('d-none');
    })

    let rememberMe = Storage.get('rememberMe'); //log(rememberMe);
    if (rememberMe) {
        jq('#loign-email').val(rememberMe);
        jq('#login-pwd')[0].focus();
        jq('#remember-me').prop('checked', true);
    } else {
        jq('#loign-email')[0].focus();
    }


    jq('#login-form').submit(async function (e) {
        try {
            e.preventDefault();
            let data = formDataToJson({ form: this });
            let res = await postData({ url: '/login', data });
            if (res.data.status == 'error') {
                throw res.data.message
            } else {                
                window.location.href = '/apps'
            }
        } catch (error) {
            log(error);
            jq('div.error').removeClass('d-none').text(error);
        }
    })

    jq('#reset-pwd').submit(async function (e) {
        try {
            e.preventDefault();
            let data = fd2json({ form: this }); //log(data); return;
            if (!data.username || !data.password || !data.resetcode) throw 'All fields are required to reset password !';
            if (data.password.length < 6) throw 'Password must be 6 characters long !';
            let submitBtn = jq(this).find('button[type="submit"]');
            submitBtn.attr('disabled', true);
            let res = await postData({ url: '/reset-user-password', data });
            if (res.data?.status) {
                jq('div.resp-code').removeClass('d-none text-danger').addClass('text-success').text(res.data.msg);
                jq('button.show-login').removeClass('d-none').click(function () {
                    jq('#reset-pwd')[0].reset();
                    submitBtn.attr('disabled', false);
                    jq('#login-form, #reset-pwd').toggleClass('d-none');
                });
            } else { throw res.data.msg }
        } catch (error) {
            log(error);
            jq('div.resp-code').removeClass('d-none').addClass('text-danger').text(error);
        }
    })

})

async function onReCaptchaVerified(token) {
    try {
        // Get the form data
        let form = jq('#login-form')[0];
        let data = formDataToJson({ form }); //log(data); return;
        // jq('button.login').addClass('disabled'); return;
        // Attach the reCAPTCHA token to the data
        data['g-recaptcha-response'] = token;

        // Send the data to the server
        let res = await postData({ url: '/login', data });
        if (res.data.status === 'error') {
            throw res.data.message;
        } else {
            // Redirect on success
            let username = jq('#loign-email').val();
            let rememberMe = jq('#remember-me').is(':checked');
            Storage.set('rememberMe', rememberMe ? username : null);
            window.location.href = '/apps';
        }
    } catch (error) {
        // Display errors
        log(error);
        jq('div.error').removeClass('d-none').text(error);
    }
}
