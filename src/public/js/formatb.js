import h, { advanceQuery, doc, getSettings, jq, log, parseNumber } from "./help.js";
import { fetchOrderData } from "./module.js";

doc.addEventListener('DOMContentLoaded', async function () {
    const orderid = h.getUrlParams().orderid; //log(orderid);
    await viewOrder(orderid);
    jq('div.status, div.view-order').toggleClass('d-none');
    jq('a.hide-bank').click(function () {
        jq('td.bank-info').text('-');
    })

    jq('button.close').click(function (e) {
        window.close();
    })

    jq('button.save-pdf').click(function () { window.print() });
})

async function viewOrder(orderid) {
    try {
        if (!orderid) return;
        let { entity } = getSettings();
        if (!entity) return;
        let res = await fetchOrderData({ folder: entity.entity_id, orderid }); //log(res);
        let { orderData, itemsData, entityData, gsData, grData, partyDues, settingsData } = res;

        // entity data  
        // let ent = entityData[0]; //log(ent); //return;
        jq('div.entity>span.name, span.entity-for').text(entity.entity_name)
        jq('div.entity>span.tagline').text(entity.tag_line);
        jq('div.entity>span.address').html(entity.address)
        jq('div.entity>div>span.city').text(entity.city);
        jq('div.entity>div>span.state').text(entity.state);
        jq('div.entity>div>span.pin').text(entity.pincode);
        jq('div.entity>span.contact').text(entity.contact)
        jq('div.entity>div>span.email').text(entity.email)
        jq('div.entity>div>span.website').text(entity.website)
        if (entity.gst_num) {
            jq('div.gstin').removeClass('d-none');
            jq('div.gstin>span.gstin').text(entity.gst_num);
        }


        // order details
        let data = orderData[0]; log(data); //return;
        let orderType = data.order_type; //log(orderType);
        document.title = data.inv_number; // doc title
        jq('span.bill-number').text(data.inv_number)
        jq('span.bill-date').text(moment(data.order_date).format('DD/MM/YYYY'))
        jq('div.notes').text(data.notes);

        // billing
        data.title && jq('span.party-title').addClass('me-2').text(data.title); //log(data.title);
        jq('span.party-name').text(data.party_name);
        jq('span.bill-address').html(h.newLineToBr(data.address));
        jq('span.bill-city').text(data.city);
        jq('span.bill-state').text(data.state);
        jq('span.bill-pin').text(data.pincode);
        jq('span.state-code').text(data.state_code)
        jq('span.party-gstin').text(data.gst_number)

        if (orderType === 'cn') {
            jq('div.bill-type').addClass('d-none');
            jq('span.doc-type').text('CREDIT NOTE');
        } else {
            if (parseNumber(data.totaltax)) {
                jq('span.doc-type').text(orderType.toUpperCase())
            } else {
                jq('span.doc-type').text('ORDER DETAILS');
            }
        }

        // shipping
        if (data.ship_id) {
            jq('span.ship-address').html(h.newLineToBr(data.ship_address));
            jq('span.ship-city').text(data.ship_city);
            jq('span.ship-state').text(data.ship_state);
            jq('span.ship-pin').text(data.ship_pincode);
        } else {
            // let res=await h.getDataAdvance({ key: 'getShipAddress', values: [data.ship_id] }); //log(res);
            jq('span.ship-address').html(h.newLineToBr(data.address));
            jq('span.ship-city').text(data.city);
            jq('span.ship-pin').text(data.pincode);
            jq('span.ship-state').text(data.state);
        }

        jq('td.subtotal').text(h.parseLocal(data.subtotal));

        let tax = h.parseNumber(data.totaltax);
        if (data.gst_type === 'igst') {
            jq('td.igst').text(h.parseLocal(tax));
        } else {
            jq('td.cgst').text(h.parseLocal(tax / 2) || '0.00')
            jq('td.sgst').text(h.parseLocal(tax / 2) || '0.00')
        }

        data.disc && jq('tr.disc').removeClass('d-none');
        data.freight && jq('tr.freight').removeClass('d-none');
        jq('td.disc').text(h.parseLocal(data.disc));
        jq('td.freight').text(h.parseLocal(data.freight));
        jq('td.total').text(h.parseLocal(data.alltotal));
        jq('div.total-inwords').text(h.titleCase(h.number2words(h.parseNumber(data.alltotal))));

        // goods sold 
        if (gsData.length > 0) {
            let gs = gsData[0].gs || 0; //log(gs);
            jq('td.gs').text(h.parseLocal(gs));
            // if (gs) {   }
        }

        // goods return
        if (grData.length > 0) {
            let gr = grData[0].gr || 0;
            jq('td.gr').text(h.parseLocal(gr))
            // if (gr) {    }
        }

        // load bank;
        // let settings = settingsData[0]; //log(settings);
        // if (settings) {
        //     let bank_id = settings.bank_id; //log(bank_id);
        //     if (bank_id) {
        //         let res = await h.advanceQuery({ key: 'getBankbyId', values: [bank_id] }); //log(res);
        //         jq('td.bank-name').text(res.bank_name);
        //         jq('td.account-number').text(res.account_number);
        //         jq('td.ifscode').text(res.ifscode);
        //     }
        // }

        // item details
        if (itemsData.length > 0) {
            let tableObj = h.createTable(itemsData, true, false);
            let { table, tbody, thead } = tableObj;
            jq(table).addClass('table table-sm css-serial').removeClass('table-hover');
            jq(thead).addClass('small border-bottom border-black');
            // jq(tbody).addClass('small');

            jq(table).find('[data-key="sku"], [data-key="pcode"]').addClass('d-print-none')
            jq(table).find('[data-key="net"]').addClass('d-none');
            // jq(table).find('[data-key="total"]').addClass('border-start border-black')

            jq(tbody).find(`
                [data-key="qty"],
                [data-key="price"],
                [data-key="tax"],
                [data-key="net"],[data-key="total"]
            `).each(function () {
                let val = this.textContent;
                jq(this).text(h.parseLocal(val));
            })

            // jq(tbody).find('[data-key="total"]').each(function () {
            //   let val=this.textContent;
            //   jq(this).text(h.parseCurrency(val));
            // })

            jq(tbody).find('[data-key="gst"]').each(function () {
                let gst = this.textContent; //log(gst)
                gst && jq(this).text(h.parseNumber(gst) + '%');
            })

            jq(table).find('[data-key="total"], [data-key="net"], [data-key="tax"]').addClass('text-end');
            jq(table).find('[data-key="qty"], [data-key="gst"]').addClass('text-center');
            jq('div.order-items').html(table);

            let cols = ['gst', 'tax', 'hsn', 'disc', 'sku', 'pcode', 'size', 'unit'];
            for (let k of cols) {
                let arr = [];
                jq(tbody).find(`[data-key=${k}]`).each(function (i, e) {
                    let val = this.textContent;
                    if (val) arr.push(val);
                })
                if (arr.length == 0) jq(table).find(`[data-key=${k}]`).addClass('d-none');
            }

            // jq(tbody).find(`[data-key="gst"]`).each(function(i,e){            })

            // hideInliners(table);
            // hideEmptyColumns(table)
            // hideNetCol({ table, orderid });
        };

        return true;

    } catch (error) {
        log(error);
    }
}


