import { setupIndexDB } from "./_localdb.js";
import h, { advanceQuery, controlBtn, createStuff, displayDatatable, doc, errorMsg, fd2json, fetchTable, getForm, isAdmin, jq, log, myIndexDBName, pageHead, parseData, postData, queryData, searchData, showModal, storeId, xdb } from "./help.js";
import { createEditParty, editInlineParty, editParty, partySubMenu } from "./module.js";
import temp from "./temps.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'party list' });
    loadData();
    sowInsits();
    controlBtn({
        buttons: [
            {
                title: 'Add Party',
                cb: () => createEditParty({ callback: loadData, focus: '#party_name' }),
            },
            // {
            //     title: 'Hard Reset Data',
            //     icon: '<i class="bi bi-arrow-clockwise"></i>',
            //     cb: async () => {
            //         let data = await queryData({ key: 'party' }); //log(data); //return;
            //         let db = new xdb(storeId, 'partys');
            //         if (data.length) {
            //             await db.clear()
            //             await db.put(data);
            //             loadData();
            //         } else {
            //             await db.clear();
            //             loadData();
            //         }
            //     }
            // },
            {
                title: 'Export JSON Data',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m655.31-148.08 106.61-106.61v87.38h35.39V-315H649.62v35.38H737L630.39-173l24.92 24.92Zm-443 8.08q-29.92 0-51.12-21.19Q140-182.39 140-212.31v-535.38q0-29.92 21.19-51.12Q182.39-820 212.31-820h535.38q29.92 0 51.12 21.19Q820-777.61 820-747.69v253q-14.77-6.31-29.58-10.69-14.81-4.39-30.42-7v-235.31q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h234.31q2.23 16.61 6.61 31.42 4.39 14.81 10.69 28.58H212.31ZM200-240v40-560 247.62-3V-240Zm90-54.62h160.69q2.62-15.61 7.77-30.42 5.16-14.81 11.23-29.57H290v59.99ZM290-450h253.62q25.84-21.92 55.15-36.73 29.31-14.81 62.77-21.04V-510H290v60Zm0-155.39h380v-59.99H290v59.99Zm430 547.7q-74.92 0-127.46-52.54Q540-162.77 540-237.69q0-74.92 52.54-127.46 52.54-52.54 127.46-52.54 74.92 0 127.46 52.54Q900-312.61 900-237.69q0 74.92-52.54 127.46Q794.92-57.69 720-57.69Z"/></svg>',
                cb: async () => {
                    try {
                        let admin = await isAdmin();
                        if (!admin) return;
                        let data = await queryData({ key: 'partyToJson' });
                        let json = JSON.stringify(data);
                        let blob = new Blob([json], { type: 'application/json' });
                        let url = URL.createObjectURL(blob);
                        let a = jq('<a></a>').attr('href', url).attr('download', 'partys.json').appendTo('body');
                        a[0].click();
                        a.remove();
                    } catch (error) {
                        log(error);
                    }
                }
            },
            {
                title: 'Import JSON Data',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M398.46-290H550v-60H398.46v60Zm0-160H670v-60H398.46v60ZM290-610h380v-60H290v60Zm190 130ZM276.92-100q-74.76 0-127.38-52.42-52.62-52.43-52.62-127.2 0-55.84 30.08-99.69 30.08-43.84 78.08-64.54H100v-59.99h210.77v210.76h-60V-397q-40.85 8.77-67.35 41.46-26.5 32.69-26.5 75.54 0 50.23 35.2 85.12Q227.31-160 276.92-160v60Zm121.54-40v-60h349.23q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v156.15h-60v-156.15Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H398.46Z"/></svg>',
                cb: async () => {
                    try {
                        let admin = await isAdmin();
                        if (!admin) return;
                        let strform = `
                        <form id="uploadForm" enctype="multipart/form-data" class="mb-0">
                            <input class="form-control" type="file" name="partyFile" id="partyFile" accept=".json" required>
                        </form>
                        `;
                        let mb = showModal({
                            title: 'Upload Party Data',
                            modalSize: 'modal-md',

                        }).modal;
                        jq(mb).find('.modal-body').html(strform);
                        jq(mb).modal('show');
                        jq(mb).find('button.apply').click(async function () {
                            jq(this).addClass('disabled');
                            jq('div.error-msg').addClass('d-none').text('');
                            const formData = new FormData();
                            jq('div.p-status').removeClass('d-none');
                            const fileInput = document.getElementById('partyFile');
                            formData.append('file', fileInput.files[0]);
                            let res = await axios.post('/api/upload/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); //log(res.data);

                            if (!res.status) {
                                jq('span.fail').removeClass('d-none');
                                jq('span.success, div.p-status').addClass('d-none');
                                jq('div.error-msg').removeClass('d-none').text('Error uploading file');
                                return
                            };
                            let filename = res.data.filename; //log(filename);
                            let rsp = await postData({ url: '/api/import/partys', data: { filename } }); //log(rsp);
                            if (rsp.data.status) {
                                jq('span.success').removeClass('d-none');
                                jq('span.fail, div.p-status').addClass('d-none');
                                let data = await queryData({ key: 'party' }); //log(data); return;
                                let db = new xdb(storeId, 'partys');
                                db.clear()
                                await db.put(data);
                                loadData();
                            };
                        })
                    } catch (error) {
                        log(error);
                    }

                }
            }
        ]
    })
    searchData({ key: 'srch_party', showData, loadData, serial: true });

    let inputbox = jq(`<div></div>`).attr('id', 'inputbox');
    jq('body').append(inputbox);
})

async function loadData() {
    try {
        // let dbname = myIndexDBName('partyData');
        // let store = 'partys';
        // let db = new xdb(storeId, store);
        // let data = await db.getColumns({
        //     columns: [
                // `id`, `title`, `party_name`, `party_id`, `contact`,
                // `email`, `gender`, `birthday`, `opening`, `orders`,
                // `billing`, `payments`, `balance`
        //     ],
        //     rename: {
        //         'payments': 'pymts'
        //     },
        //     limit: 50,
        //     sortby: 'id',
        //     sortOrder: 'desc',
        // });

        let res = await fetchTable({ key: 'party', limit: '200' }, true, true, null); //log(res);
        jq('div.process').addClass('d-none');
        res ? showData(res) : jq('#root').addClass('text-center').html('No Data/Records Found!');

    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data;
        
        parseData({
            tableObj: data,
            colsToShow: [
                `id`, `title`, `party_name`, `party_id`, `contact`,
                `email`, `gender`, `address`, `city`, `pincode`, `state`, 
                `gst_number`, `birthday`, `opening`, `orders`,
                `billing`, `payments`, `balance`
            ],
            colsToParse: ['opening', 'billing', 'balance', 'payments', 'orders'],
            alignRight: true,
        });

        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(this).click(function () {
                partySubMenu(e, i, data.data, loadData)
            })
        })

        editInlineParty(tbody, data.data, loadData);

        displayDatatable(table, 'container-fluid');
    } catch (error) {
        log(error);
    }
}

function sowInsits() {
    try {
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#225ce2"><path d="M649.23-200v-192.31H760V-200H649.23Zm-224.61 0v-560h110.76v560H424.62ZM200-200v-367.69h110.77V-200H200Z"/></svg>';
        let box = jq('<div></div>').addClass('position-fixed top-0 end-0  me-5 me-md-3 z-4 role-btn d-none d-sm-block insight');
        let crd = jq('<div></div>');
        let ico = jq('<span></span>').addClass('role-btn').html(svg).click(async function () {
            let res = await queryData({ key: 'countPartys' });
            if (!res.length) return;
            let box = jq('<div></div>').addClass('position-absolute position-relative top-0 start-0 w-100 h-100').css('background', 'rgba(0,0,0,0.0)');
            let div = jq('<div></div>').addClass('d-flex flex-column gap-2 w-100 h-100 p-3');
            res.forEach(type => {
                if (type.party_type == null) return;
                let typ = jq('<span></span>').addClass('text-white').text(type.party_type);
                let cnt = jq('<span></span>').addClass('text-white fs-5').text(type.partys);
                let l1 = jq('<div></div').addClass('d-flex jcb aic w-100').append(typ, cnt);
                jq(div).append(l1)
            });
            let btn = jq('<span></span')
                .addClass('role-btn text-white position-absolute bottom-0 end-0 p-2 mb-2 me-2')
                .html('<i class="bi bi-x-lg"></i>').click(function () { jq(crd).html(''); })
            jq(box).html(div).append(btn);
            jq(crd).html(temp.card);
            let [ecard] = jq('div.e-card');
            jq(ecard).append(box);
        });
        let div = jq('<div></div>').addClass('d-flex flex-column jce align-items-end').append(ico, crd).prop('title', 'Show Party Insights');
        jq(box).html(div);
        jq('body').append(box);
    } catch (error) {
        log(error);
    }
}
