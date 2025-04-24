import { setupIndexDB } from './_localdb.js';
import help, { jq, log, doc, fetchTable, parseNumber, parseLocal, advanceQuery, pageHead, displayDatatable, searchData, parseData, createStuff, createEL, myIndexDBName, xdb, storeId, createTable, showErrors, postData, getSettings, queryData, isRestricted } from './help.js';
import { _delStock, _loadSrchstock, editInlineStock, stockSubMenu } from './module.js';
import temp from "./temps.js";

doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'stock' });
    loadData();
    sowInsits();

    help.controlBtn({
        buttons: [
            {
                title: 'Add Stock',
                cb: async () => {
                    if (await isRestricted('gibIeSGN')) return;
                    let res = await createStuff({
                        title: 'Add Stock',
                        table: 'stock',
                        url: '/api/crud/create/stock',
                        focus: '#product',
                        applyCallback: loadData,
                        cb: async () => {
                            let { data } = await advanceQuery({ key: 'getstockby_maxid' });
                            let db = new xdb(storeId, 'stock');
                            await db.put(data);
                            loadData();
                        },
                        hideFields: [],
                    });

                    let mb = res.mb;

                    setbody(mb);
                    function setbody(mb) {
                        jq(mb).find('div.pcode').after('<div class="d-flex jcb aic gap-3 odd size-group w-100"></div>');
                        jq(mb).find('div.size, div.size_group').appendTo(jq(mb).find('div.size-group'));
                        jq(mb).find('div.size_group, div.size').addClass('w-50');

                        jq(mb).find('div.size-group').after('<div class="d-flex jcb aic gap-3 odd qty-cost"></div>');
                        jq(mb).find('div.qty, div.cost').appendTo(jq(mb).find('div.qty-cost'));

                        jq(mb).find('div.qty-cost').after('<div class="d-flex jcb aic gap-3 odd price-gst"></div>');
                        jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.price-gst'));

                        jq(mb).find('div.price-gst').after('<div class="d-flex jcb aic gap-3 odd wsp-mrp"></div>');
                        jq(mb).find('div.wsp, div.mrp').appendTo(jq(mb).find('div.wsp-mrp'));

                        jq(mb).find('div.wsp-mrp').after('<div class="d-flex jcb aic gap-3 odd disc-per w-100"></div>');
                        jq(mb).find('div.discount, div.disc_type').appendTo(jq(mb).find('div.disc-per'));
                        jq(mb).find('div.discount, div.disc_type').addClass('w-50');

                        jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-3 even sec-sea"></div>');
                        jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

                        jq(mb).find('div.sec-sea').after('<div class="d-flex jcb aic gap-3 even cat-col"></div>');
                        jq(mb).find('div.category, div.colour').appendTo(jq(mb).find('div.cat-col'));

                        jq(mb).find('div.cat-col').after('<div class="d-flex jcb aic gap-3 even upc-label"></div>');
                        jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));

                        jq(mb).find('div.upc-label').after('<div class="d-flex jcb aic gap-3 even hsn-unit"></div>');
                        jq(mb).find('div.hsn, div.unit').appendTo(jq(mb).find('div.hsn-unit'));
                    }

                    let settigns = getSettings();
                    let cs = settigns.customSizes;
                    cs.forEach(size => { jq(mb).find('#size_group').append(new Option(size.group_name, size.size_group)); })

                    let cover = createEL('div');
                    jq('#size_group').change(function () {
                        try {
                            cover.style.width = jq(mb).find('form').width();
                            jq(mb).find('div.row').append(cover);
                            cover.innerHTML = '';

                            let val = this.value;
                            if (val) {
                                jq(mb).find('button.apply').val('2')
                                jq('#size, #qty').prop('disabled', true);
                            } else {
                                jq(mb).find('button.apply').val('1');
                                jq('#size, #qty').prop('disabled', false);
                                return;
                            }

                            let sizes = val.split(',');
                            cover.className = 'd-flex jcb aic flex-wrap gap-2 my-3';

                            sizes.forEach(size => {
                                let input = createEL('input');
                                input.type = 'text';
                                input.name = size;
                                input.className = 'form-control';
                                input.placeholder = size;
                                input.style.width = '80px';
                                input.title = size;
                                let label = jq('<label></label>').addClass('form-label').text(size);
                                let div = jq('<div></div>').addClass('form-floating').append(input, label);
                                jq(cover).append(div);
                            })
                        } catch (error) {
                            log(error);
                        }
                    })

                    jq(mb).find('button.apply').click(async function () {
                        try {
                            if (this.value == '1') return;
                            let proceed = true;
                            let obj = res.obj
                            jq(obj.form).find('input:not([type="hidden"]), textarea:not([type="hidden"])').each(function () {
                                if (this.hasAttribute('required')) {
                                    if (this.value == '' || this.value == '0') {
                                        jq(this).addClass('is-invalid');
                                        proceed = false;
                                    }
                                }
                            })
                            if (!proceed) return;

                            jq(this).addClass('disabled');
                            jq('div.p-status').removeClass('d-none');
                            jq('div.error-msg').addClass('d-none').text('');
                            let data = fd2json({ form: obj.form });

                            let val = data.size_group;
                            let sizes = val.split(',').map(size => size.trim()).filter(Boolean);
                            let resArr = []
                            delete data.size_groups;
                            for (let size of sizes) {
                                data.qty = data[size];
                                if (data.qty) {
                                    let obj = { ...data, size: size, qty: data[size] };
                                    let res = await postData({ url: '/api/crud/create/stock', data: { data: obj } });
                                    resArr.push(res?.data?.insertId);
                                }
                            }

                            if (resArr.length) {
                                jq('span.success').removeClass('d-none');
                                jq('span.fail, div.p-status').addClass('d-none');
                            } else {
                                throw 'Stock data not saved.';
                            }

                            jq(this).removeClass('disabled');
                        } catch (error) {
                            log(error);
                            jq('span.success, div.p-status').addClass('d-none');
                            jq('span.fail').removeClass('d-none');
                            jq('div.error-msg').removeClass('d-none').text(error);
                            log(error);
                        }
                    })
                }
            },
            // {
            //     title: 'Hard Reset',
            //     icon: '<i class="bi bi-arrow-clockwise"></i>',
            //     cb: async () => {
            //         jq('div.process').removeClass('d-none');
            //         let data = await queryData({ key: 'stock' }); //log(data)
            //         let db = new xdb(storeId, 'stock');
            //         if (data.length) {
            //             db.clear();
            //             await db.add(data);
            //             jq('div.process').addClass('d-none');
            //             loadData();
            //         } else {
            //             db.clear();
            //             return;
            //         }
            //     }
            // }
        ]
    });

    jq('#search').keyup(async function () {
        try {
            let key = this.value;
            
            // let db = new xdb(storeId, 'stock');
            // let arr = await db.getColumns({
            //     key,
            //     indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
            //     columns: [`id`, `sku`, `hsn`, `product`, `pcode`, `mrp`, `price`, `wsp`, `gst`, `size`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost`, `purch_price`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`,],
            //     // rename: { 'available': 'avl', 'returned': 'gr', 'discount': 'disc' },
            //     limit: 150,
            //     sortby: 'product'
            // });
            // let tbl = createTable(arr, true, true);
            if(key){
                // let res = await queryData({ key: 'search_stock', type: 'search', searchfor: key });
                let tbl = await fetchTable({ key: 'search_stock', type: 'search', searchfor: key }, true, true, null);
                if(!tbl){
                    displayDatatable(null, 'container-fluid');
                    return;
                };
                showData(tbl);
            }else(
                loadData()
            )
        } catch (error) {
            log(error);
        }
    }).on('search', function () {
        loadData();
    });

    let inputbox = jq(`<div></div>`).attr('id', 'inputbox');
    jq('body').append(inputbox);

})

async function loadData(key = null) {
    try {
        // let db = new xdb(storeId, 'stock');
        // let data = await db.getColumns({
        //     table: 'stock',
        //     key: key || null,
        //     columns: [`id`, `sku`, `hsn`, `product`, `pcode`, `mrp`, `price`, `wsp`, `gst`, `size`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost`, `purch_price`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`,],
        //     indexes: [`sku`, `product`, `pcode`, `price`, `mrp`, `brand`, `label`, `hsn`, `upc`, `section`, `season`, `colour`, `category`, `supplier`, `unit`, `ean`],
        //     limit: '500',
        //     sortby: 'id',
        //     sortOrder: 'desc'
        // });
        let data = null;
        let res = await fetchTable({ key: 'stock', limit: '50' }, true, true, data);
        jq('div.process').addClass('d-none');
        res ? showData(res) : jq('#root').addClass('text-center').html('No Data/Records Found!');
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try {
        let { table, tbody, thead } = data
        parseData({
            tableObj: data,
            colsToShow: [`id`, `sku`, `product`, `pcode`, `mrp`, `price`, `wsp`, `gst`, `size`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `hsn`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost`, `purch_price`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`,],
            colsToParse: ['price', 'mrp', 'wsp', 'gst', 'qty', 'sold', 'returned', 'available', 'discount'],
            colsToHide: ['purch_id', 'supid', 'cost', 'purch_price', 'cost_gst', 'bill_number', 'prchd_on'],
            hideBlanks: ['wsp', 'mrp', 'gst', 'size', 'discount', 'disc_type', 'brand', 'colour', 'label', 'section', 'season', 'category', 'upc', 'ean', 'hsn', 'unit', 'purch_on', 'supplier', 'defect', 'returned'],
            alignRight: true,
            colsToRight: ['disc_type', 'ean'],
            colsTitle: [
                { col: 'wsp', title: 'Whole Sale Price' },
                { col: 'ean', title: 'Barcode Number' },
                { col: 'gr', title: 'Goods Return' },
                { col: 'pcode', title: 'Product Code' },
                { col: 'price', title: 'Selling Price' },
            ],
            colsToRename: [
                { old: 'available', new: 'avl' },
                { old: 'returned', new: 'gr' },
                { old: 'discount', new: 'disc' },
            ]
        })

        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                stockSubMenu(e, i, data.data, loadData)
            })
        })

        editInlineStock(tbody, data.data, loadData);

        displayDatatable(table, 'container-fluid');
        jq(table).find(`[data-key="sku"]`).addClass('position-sticky start-0');
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
            let res = await queryData({ key: 'stockLavels' }); //log(res);
            if (!res.length) return;
            let box = jq('<div></div>').addClass('position-absolute position-relative top-0 start-0 w-100 h-100').css('background', 'rgba(0,0,0,0.0)');
            let div = jq('<div></div>').addClass('d-flex flex-column jcc gap-4 w-100 h-100 p-3 small');
            let obj = Object.entries(res[0]);
            for (let [k, v] of obj) {
                let x = jq('<span></span>').addClass('uppercase').html(k);
                let y = jq('<span></span>').addClass('fw-bold').html(parseLocal(v));
                let entry = jq('<div></div>').addClass('d-flex jcb aic text-white').append(x, y);
                jq(div).append(entry);
            }

            // res.forEach(type => {
            //     if (type.party_type == null) return;
            //     let typ = jq('<span></span>').addClass('text-white').text(type.party_type);
            //     let cnt = jq('<span></span>').addClass('text-white fs-5').text(type.partys);
            //     let l1 = jq('<div></div').addClass('d-flex jcb aic w-100').append(typ, cnt);
            //     jq(div).append(l1)
            // });

            let btn = jq('<span></span')
                .addClass('role-btn text-white position-absolute bottom-0 end-0 p-2 mb-2 me-2')
                .html('<i class="bi bi-x-lg"></i>').click(function () { jq(crd).html(''); })
            jq(box).html(div).append(btn);
            jq(crd).html(temp.card);
            let [ecard] = jq('div.e-card');
            jq(ecard).append(box);
        });
        let div = jq('<div></div>').addClass('d-flex flex-column jce align-items-end').append(ico, crd).prop('title', 'Stock Values');
        jq(box).html(div);
        jq('body').append(box);
    } catch (error) {
        log(error);
    }
}