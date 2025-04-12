import { controlBtn, createEL, doc, jq, log, pageHead, popConfirm } from "./help.js";

doc.addEventListener('DOMContentLoaded', function(){
    pageHead({ title: 'settings', viewSearch: false, spinner: false });
    controlBtn({});
    loadSettings();
})

async function loadSettings(){
    try {
        let arr = [
            { head: 'LOCAL', form: 'local_settings'},
            { head: 'REMOTE', form: {
                service_email: { label: 'Service Email', type: 'email', title: 'This email is used to send Invoice to your customers' },
                email_pwd: { label: 'Email Password', type: 'password', title: 'This password will be stored in your computer only' },
                enable_rewards: { label: 'Enable Rewards', type: 'select', select: ['', 'Yes', 'No'] },
            }}
        ];

        arr.forEach(s=>{
            let container = createEL('div');
            jq(container).addclass('container');
            let types = createEL('div');
            jq(types).addclass('div d-flex flex-column flex-md-row jcb aic gap-2').append(s.head);



        })
    } catch (error) {
        log(error);
    }
}