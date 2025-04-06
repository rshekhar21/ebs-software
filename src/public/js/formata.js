import help, { doc, jq, log, parseCurrency, getSettings } from "./help.js";
import { fetchOrderData } from "./module.js";

doc.addEventListener('DOMContentLoaded', async function () {
    const orderid = help.getUrlParams().orderid; //log(orderid);
    await loadData(orderid);
    jq('div.status, div.view-order').toggleClass('d-none');
    jq('#close').click(function () { window.close() });
    jq('#print').click(function () { window.print() });
})

async function loadData(orderid) {
    try {
        if (!orderid) return;
        let {entity} = getSettings(); //log(entity);
        if (!entity) return;
        let res = await fetchOrderData({ folder: entity.entity_id, orderid }); log(res); //return;
        let { orderData, itemsData, entityData, gsData, grData, partyDues, settingsData } = res;
        let od = orderData[0]; log(od);
        jq('div.entity_name').text(entity.entity_name)
        jq('div.city').text(entity.city)
        jq('div.state').text(entity.state)
        jq('div.pincode').text(entity.pincode)
        jq('div.party_name').text(od.party_name)
        jq('div.notes').text(od?.notes);


        jq('td.discount').text(parseCurrency(od.discount))
        jq('td.freight').text(parseCurrency(od.freight))
        jq('td.total').text(parseCurrency(od.alltotal))

        // items data
        let tbl = await help.setTable({ 
            rs: itemsData, alignRight: true, 
            colsToTotal: ['qty', 'tax', 'net', 'total'], 
            colsToParse: ['price', 'tax', 'disc', 'gst'],
            colsToHide: ['disc_val', 'disc_per', 'disc_type'],
            hideBlanks: ['size', 'unit', 'hsn', 'gst', 'tax'] }); //log(tbl);
            jq(tbl.table).addClass('mb-0')
            jq(tbl.tbody).find(`[data-key="gst"]`).each(function(i,e){
                if(this.textContent){
                    jq(this).text(`${this.textContent}%`)
                }
            })
        jq(tbl.table).find(`[data-key="net"]`).addClass('d-none');
        if(od.totaltax) jq(tbl.table).find(`[data-key="net"]`).removeClass('d-none');
        jq('div.data-table').html(tbl.table);

    } catch (error) {
        log(error);
    }
}
