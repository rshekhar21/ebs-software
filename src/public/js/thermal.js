import h, { advanceQuery, doc, jq, log, parseLocal, parseNumber, getSettings, parseDecimal, parseCurrency, Storage } from "./help.js";
import { fetchOrderData } from "./module.js";

doc.addEventListener('keypress', async function (e) {
  if (e.key === 'Enter') {
    if (window?.app?.node()) {
      let printer = Storage.get('POSPrinter');
      if (printer) {
        let status = await window?.app?.printPage(printer);
        if (status) window.close();
      }
    }
  };
})

doc.addEventListener('DOMContentLoaded', async function () {
  const orderid = h.getUrlParams().orderid;
  const app = window?.app?.node() || null;

  await loadData(orderid);
  jq('div.status, div.view-order').toggleClass('d-none');

  jq('button.close').click(function () { window.close() })
  jq('#printPage').click(async function () {
    if (app) {
      let printer = Storage.get('POSPrinter') || null;
      if (!printer) {
        let printer = await window?.app?.showPrinters();
        Storage.set('POSPrinter', printer);
        window?.app?.printPage(printer);
        return;
      };
      window?.app?.printPage(printer);
    } else {
      window.print();
    }
  });


  if (app) {
    jq('#setPrinter').removeClass('d-none').click(async function () {
      jq('#loading').removeClass('d-none');
      let printer = await window?.app?.showPrinters();
      jq('#loading').addClass('d-none');
      Storage.set('POSPrinter', printer);
    })
  }
  // makeElementDraggable('close-page')
})

async function loadData(orderid) {
  try {
    if (!orderid) return;
    let { entity = {}, general = {} } = getSettings();
    if (!entity.entity_id) return;
    let { entity_name, tag_line, address, city, state, pincode, contact, email, gst_num, entity_id: folder } = entity;
    let res = await fetchOrderData({ folder, orderid }); //log(res);
    let { orderData, thermalitems: items, gsData: [{ gs }], grData: [{ gr }], partyDues, settingsData } = res; log(orderData);
    let otype = orderData[0].order_type; log(otype);
    let orderType = otype == "cn" ? 'CREDIT NOTE' : otype == "refund" ? 'REFUND' : gst_num ? 'TAX INVOICE' : 'BILL'; log(otype)

    let entstr = `
        <span class="fw-bold">${entity_name || ''}</span>
        <span class="fst-italic">${tag_line || ''}</span>
        <span>${address || ''}</span>
        <span>${city || ''}</span>
        <div>
            <span>${state || ''}</span>
            <span>${pincode || ''}</span>
        </div>
        <span>${contact || ''}</span>
        <span>${email || ''}</span>
        <div class="mt-2 ${gst_num ? '' : 'd-none'}">
          <span class="me-1">GSTIN-</span>
          <span class="fw-bold " style="letter-spacing: 1px;">${gst_num || ''}</span>
        </div>
        <div class="my-2 fw-bold">${orderType}</div>
        `;

    if (general?.showEntity == 'Yes') { jq('div.entity').removeClass('d-none').html(entstr) }

    let od = orderData[0]; //log(od);

    let partystr = `
      <div class="d-flex jcb aic">
          DATE <span class="order-date">${od?.bill_date || moment(od?.order_date).format('DD-MM-YYYY')}</span>
      </div>           
      <div class="d-flex jcb aic">
          BILL <span class="fw-400"># ${od?.inv_number}</span>
      </div>
      <div class="d-flex jcb aic fw-500">
          PARTY <span class="fw-bold">${od?.party_name} / ${od?.party_id}</span>
      </div> 
      <div class="d-flex jcb aic ${general?.showPartyAddress == 'Yes' ? od?.address ? '' : 'd-none' : 'd-none'}">
          <div class="ms-auto d-flex flex-column">
            <span class="ms-auto ${od?.address ? '' : 'd-none'} text-end">${od?.address || ''}</span>
            <span class="ms-auto ${od?.city ? '' : 'd-none'}">${od?.city || ''}</span>
            <span class="ms-auto ${od?.pincode ? '' : 'd-none'}">${od?.pincode || ''}</span>
            <span class="ms-auto ${od?.state ? '' : 'd-none'}">${od?.state || ''}</span>
          </div>
      </div>`;

    jq('div.party').html(partystr);

    let str = null;
    if (items && items.length > 0) {
      let tableFormat = 'Classic';
      let [ul] = jq('<ul></ul>').addClass('list-group list-group-flush')
      items.forEach(row => {
        row = JSON.parse(JSON.stringify(row));
        for (let i in row) {
          let size = row['size'], disc = row['disc'], gst = row['gst'], disc_type = row['disc_type'];
          str = `
              <li class="list-group-item p-0 pt-1">
                <div class="d-flex jcb ais">
                    <div class="d-flex jcs ais flex-column flex-fill">
                      <div>
                        <span class="me-2 fw-500">${row['product']}</span>
                        <span class="fst-italic">${size || ''}</span>
                      </div>

                      <div class="text-black">
                        <span class="">${h.parseLocal(row['price'])}</span>
                        <span class="mx-2">X</span>
                        <span class="">${h.parseLocal(row['qty'])}</span>
                        <div class="${!disc || disc == '0.00' ? 'd-none' : ''}">
                          <span>DISC (${h.parseDisc(disc_type)})</span>
                          <span class="ms-1">${h.parseLocal(disc)}</span>
                        </div>
                        <div class="${!gst || gst == '0.00' ? 'd-none' : ''}">
                          GST <span>(${h.parseLocal(gst)}%)</span>
                          <span class="ms-1">${h.parseLocal(row['tax'])}</span>
                        </div>
                      </div>
                    </div>
                    <div class="amount text-end ms-1 fw-500">${h.parseLocal(row['amount'])}</div>
                  </div>
                </li>`;
        }
        jq(ul).append(str);
      })
      jq('div.items').html(ul);
    }

    let strTotal = `
      <ul class="list-group list-group-flush">
          <li class="list-group-item p-0 py-1 d-flex jcb aic">
              QTY.<span class="fw-bold">${parseDecimal(gs)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic fw-500">
              SUBTTOAL <span class="subtotal">${parseDecimal(od.subtotal)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.discount) ? '' : 'd-none'}">
              DISCOUNT <span>${parseDecimal(od.discount)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? 'd-none' : ''}">
              CGST <span class="ms-1 me-auto ${od.tax_type == 'inc' ? '' : 'd-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax / 2)}</span>
          </li>  
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? 'd-none' : ''}">
              SGST <span class="ms-1 me-auto ${od.tax_type == 'inc' ? '' : 'd-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax / 2)}</span>
          </li>  
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? '' : 'd-none'}">
              IGST <span class="ms-1 me-auto ${od.tax_type == 'inc' ? '' : 'd-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax)}</span>
          </li>          
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.freight) ? '' : 'd-none'}">
              FREIGHT <span>${parseDecimal(od.freight)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.round_off) ? '' : 'd-none'}">
              ROUND OFF <span>${parseDecimal(od.round_off)}</span>
          </li>
          <li class="list-group-item p-0 py-2 d-flex jcb aic total fw-bold">
              TOTAL <span>${parseCurrency(od.alltotal)}</span>
          </li>
      </ul>`
      ;

    jq('div.totals').html(strTotal);

    jq('div.inv-msg').html(general.invoiceMessage); // 15-day Exchange with invoice<br/>Accessories & Imports Excluded.

    jq('div.comments').html(od.notes || '');

  } catch (error) {
    log(error);
  }
}

function makeElementDraggable(elementId) {
  const element = document.getElementById(elementId);
  let isDragging = false;
  let initialX;
  let initialY;

  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - element.getBoundingClientRect().left;
    initialY = e.clientY - element.getBoundingClientRect().top;
  });

  element.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const newX = e.clientX - initialX;
      const newY = e.clientY - initialY;
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
    }
  });

  element.addEventListener('mouseup', () => {
    isDragging = false;
  });
}