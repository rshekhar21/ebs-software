import { convertToDecimal, doc, getActiveEntity, getSettings, jq, log, parseCurrency, parseDecimal, parseLocal, parseLocals, realDate } from "./help.js";
import { getOrderData } from "./order.config.js";

doc.addEventListener('DOMContentLoaded', function () {
    loadEstimate();
    jq('button.close').click(function () { window.close() })
    jq('button.print').click(function () { window.print() })
})

function loadEstimate() {
    let data = getOrderData();
    let { items, subtotal, discount, tax, freight, round_off, total, order_date, notes } = data;
    if (items.length == 0) return;    
    
    let entity = getSettings().entity
    jq('span.est-date').text(realDate(order_date));
    jq('h6.entity-name').text(entity.entity_name);
    jq('div.comments').text(notes)

    items.forEach(item => {
        let str = `
            <div class="d-flex jcb aic gap-2 border-bottom">
                <div class="d-flex flex-column gap-0 flex-fill">
                    <div class="d-flex jcs aic gap-2">
                        <span class="">${item.product}</span>
                        <span class="${item.size ? '' : 'd-none'}">${item.size}</span>
                    </div>
                    <div class="d-flex jcs aic gap-2">
                        <span class="">${parseLocal(item.price)}</span>
                        <span class="fst-italic">x</span>
                        <span class="fw-bold">${item.qty}</span>
                        <div class="d-flex jcs aic gap-1 ${item.gst ? '' : 'd-none'}">
                            <span class="">GST @</span>
                            <span class="">${item.gst}%</span>
                        </div>
                        <div class="d-flex jcs aic gap-1 ${item.tax ? '' : 'd-none'}">
                            <span class="">${parseDecimal(item.tax)}</span>
                        </div>
                    </div>
                    <div class="d-flex jcs aic gap-2">
                        <div class="d-flex jcs aic gap-1 ${item.sku ? '' : 'd-none'}">
                            <span class="">SKU</span>
                            <span class="">${item.sku}</span>
                        </div>
                        <div class="d-flex jcs aic gap-1 ${item.disc ? '' : 'd-none'}">
                            <span class="">DISC</span>
                            <span class="">${parseDecimal(item.disc)}</span>
                        </div>                        
                    </div>
                </div>
                <div class="d-flex jce aic fw-bold">${parseLocal(item.total)}</div>
            </div>`;
        jq('div.show-details').append(str);
    });
    

    let str = `
            <div class="d-flex jcb aic">
                <span class="">SUB TOTAL</span>
                <span class="">${convertToDecimal(subtotal)}</span>
            </div>
            <div class="d-flex jcb aic ${discount?'':'d-none'}">
                <span class="">DISCOUNT</span>
                <span class="">${convertToDecimal(discount)}</span>
            </div>
            <div class="d-flex jcb aic ${tax?'':'d-none'}">
                <span class="">TAX</span>
                <span class="">${convertToDecimal(tax)}</span>
            </div>            
            <div class="d-flex jcb aic ${freight?'':'d-none'}">
                <span class="">SHIPPING</span>
                <span class="">${convertToDecimal(freight)}</span>
            </div>
            <div class="d-flex jcb aic ${round_off?'':'d-none'}">
                <span class="">ROUND OFF</span>
                <span class="">${convertToDecimal(round_off)}</span>
            </div>


            <div class="d-flex jcb aic mt-2 border-bottom border-top py-2">
                <span class="fw-bold">TOTAL</span>
                <span class="fw-bold">${parseCurrency(total)}</span>
            </div>`;

    jq('div.show-totals').html(str);
}