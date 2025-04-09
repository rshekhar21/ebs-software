import { createStuff, doc, fetchTable, jq, log, parseLocal, parseLocals, postData, queryData, storeId, xdb } from "./help.js";
import { _searchParty } from "./module.js";
import { getOrderData, updateDetails } from "./order.config.js";

doc.addEventListener('DOMContentLoaded', function () {
    showCurrentOrder();
    showButtons()

    jq('button.ebs-add-items').click(function (param) {
        jq('div.add-mobile-articles').removeClass('d-none');
    })

    jq('button.ebs-close-add-items').click(function (param) {
        jq('div.add-mobile-articles').addClass('d-none');
        jq('#ebsSearchItems').val('');
    })

    jq('button.ebs-add-stock').click(async function () {
        let res = await createStuff({
            title: 'Add Stock',
            table: 'quickStock',
            url: '/api/crud/create/stock',
            focus: '#product',
            resetBtn: true,
            applyCallback: async () => {
                let rsp = await queryData({ key: 'stock' });
                let db = new xdb(storeId, 'stock');
                await db.clear();
                await db.put(rsp);
            },
        });
        let { mb } = res;

        jq(mb).find('div.product').after('<div class="d-flex jcb aic gap-2 odd pcode-size"></div>')
        jq(mb).find('div.pcode, div.size').appendTo('div.pcode-size')

        jq(mb).find('div.pcode-size').after('<div class="d-flex jcb aic gap-2 odd qty-price"></div>')
        jq(mb).find('div.qty, div.price').appendTo('div.qty-price')
    })

    jq('button.ebs-add-manually').click(function (param) {
        jq('div.btn-group-add-manually').addClass('d-none');
        jq('div.ebs-manual-form').removeClass('d-none');
    })

    jq('button.toggle-morefields').click(function (param) {
        $('div.more-fields').toggleClass('d-none');
    })

    $('button.close-mobile').click(function (param) {
        $('div.ebs-manual-form').addClass('d-none');
        jq('div.btn-group-add-manually').removeClass('d-none');
    });

    jq('button.close-ebs-search-item-results').click(function (param) {
        jq('div.ebs-search-item-results').addClass('d-none');
    })

    jq('#ebsSearchItems').on('focus', function () {
        jq('div.btn-group-add-manually').addClass('d-none');
    })

    jq('#ebsSearchItems').on('blur', function () {
        jq('div.btn-group-add-manually').removeClass('d-none');
    })

    jq('#ebsSearchItems').on('input', async function (e) {
        let val = this.value;
        jq('div.ebs-search-item-results').toggleClass('d-none', val.trim() == '');
        jq('button.ebs-scan-sku').toggleClass('d-none', val.trim() !== '');
        let res = await searchStock(val); log(res);
        if (res?.length) {
            jq('span.ebs-entries-found').text(res?.length || 0);
            // let html = res.map((item, index) => {
            //     return `<div class="d-flex jcb aic gap-2" data-index="${index}">
            //         <div class="pcode">${item.pcode}</div>
            //         <div class="name">${item.name}</div>
            //         <div class="size">${item.size}</div>
            //         <div class="price">${item.price}</div>
            //         <div class="qty">${item.qty}</div>
            //     </div>`;
            // }).join('');
            let html = res.map((item, index) => {
                return `<div class="d-flex flex-column gap-1" data-index="${index}">
                    <div class="d-flex jcb aic gap-2">
                        
                    </div>
                </div>`;
            }).join('');

            // jq('div.ebs-search-item-results').html(html);
        } else {
            // jq('div.ebs-search-item-results').html('<div class="alert alert-danger">No item found</div>')
        }
    })

    jq('button.ebs-scan-sku').click(function (param) {
        jq('#ebsSearchItems, #ebsScanItems, div.btn-group-add-manually').toggleClass('d-none');
    })

    jq('button.reset-mobile').click(function (param) {
        jq('#ebsMobileManualForm')[0].reset();
        jq('#mobileProduct')[0].focus();
    })

    

    // jq('button.view-articles').click(function () {
    //     jq('div.billed-items, div.continue-order').toggleClass('d-none');
    // })

    jq('button.srch-party').click(function () {
        jq('div.ebs-srch-party').removeClass('d-none');
    })

    jq('button.close-add-party').click(function () {
        jq('div.srch-party').addClass('d-none');
    })

    jq('span.sync-partys').click(async function () {
        const data = await queryData({ key: 'party' });
        const db = new xdb(storeId, 'partys');
        await db.clear()
        await db.add(data);
    })

    jq('#srchParty').on('input', async function () {
        let val = this.value;
        let arr = await _searchParty(val.trim());

        let tbl = await fetchTable({}, false, true, arr);
        let { table, tbody, data } = tbl
        jq(table).find(`[data-key="email"]`).addClass('d-none');

        jq(tbody).find('tr').addClass('role-btn').each(function (i, e) {
            try {
                jq(e).click(function () {
                    let po = data[i]
                    let party = po.id;
                    let party_id = po.party_id;
                    let party_name = po.party_name;
                    let email = po.email;
                    updateDetails({ party, party_name, party_id, email });
                    jq('#srchParty').val('');
                    jq('div.srch-party').addClass('d-none');
                })
            } catch (error) {
                log(error);
            }
        })

        jq('div.party-results').toggleClass('d-none', !tbl).html(table);
    })

    jq('#ebsMobileManualForm').on('submit', function (e) {
        try {
            e.preventDefault();

        } catch (error) {
            log(error);
        }
    })


});


async function searchStock(qry) {
    try {
        if (qry.length < 2) return [];
        if (qry.trim() == '') return;
        const res = await postData({ url: '/api/search-stock', data: { query: qry } }); //log(res.data)
        return res.data;;
    } catch (error) {
        log(error);
    }
}

async function showCurrentOrder() {
    try {
        let od = getOrderData(); //log(od);

        loadViatls(od);
        loadItems(od.items);
    } catch (error) {
        log(error);
    }
}

function loadItems(items) {
    try {
        if (items.length) {
            // jq('button.ebs-add-items').removeClass('mx-auto').addClass('ms-auto w-50')
            jq('button.btn-next').removeClass('d-none')
            // log('items', items);
        }
    } catch (error) {
        log(error);
    }
}

function loadViatls(od) {
    try {
        let { qty, total } = od;
        jq('span.total-qty').text(parseLocals(qty));
        jq('span.order-amount').text(parseLocal(total));

    } catch (error) {
        log(error);
    }
}


// Function to display the specified buttons
function showButtons() {
    // Define the button sets
    const buttonSets = {
        set1: `
            <div class="btn-group w-100">
                <button class="btn btn-primary rounded-0 w-50 ebs-add-items">+ Articles</button>
                <button class="btn btn-outline-primary rounded-0 w-50 next-one" value="1">Next</button>
            </div>
        `,
        set2: `
            <div class="btn-group w-100">
                <button class="btn btn-light rounded-0 w-50 back-one" value="2">Back</button>
                <button class="btn btn-primary rounded-0 w-50 next-two" value="1">Next</button>
            </div>
        `,
        set3: `
            <div class="btn-group w-100">
                <button class="btn btn-light rounded-0 w-50 back-two" value="2">Back</button>
                <button class="btn btn-success rounded-0 w-50 execute">Execute</button>
            </div>
        `,
    };

    // Load the first button set initially
    let currentSet = 'set1';
    $('#btnSet').html(buttonSets[currentSet]);

    // Event listener for button clicks
    $('#btnSet').on('click', 'button', function () {
        const val = $(this).val();

        if (val == '1') {
            if (currentSet === 'set1') {
                currentSet = 'set2';                
            } else if (currentSet === 'set2') {
                currentSet = 'set3';
            }
        } else if (val == '2') {
            if (currentSet === 'set3') {
                currentSet = 'set2';
            } else if (currentSet === 'set2') {
                currentSet = 'set1';
            }
        }

        // Update the button container with the new set
        $('#btnSet').html(buttonSets[currentSet]);
    });

    $('#btnSet').on('click', '.next-one, .back-one', function () {
        $('div.billed-items, div.continue-order').toggleClass('d-none');
    });

    $('#btnSet').on('click', '.back-two, .next-two', function () {
        $('div.continue-order, div.finish-order').toggleClass('d-none');
    });

    $('#btnSet').on('click', '.execute', function () {
        let cnf = confirm('Execute Order?');
        if(!cnf) return;
        log('execute')
    });
}