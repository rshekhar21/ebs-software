import 'https://code.jquery.com/jquery-3.6.1.min.js';
import 'https://unpkg.com/axios/dist/axios.min.js';

const log = console.log;
const jq = jQuery;
const axios = window.axios;
const currency = localStorage.getItem('currency') || 'en-IN';

document.addEventListener('DOMContentLoaded', function () {
  let prams = getUrlParams().key;
  let arr = prams.split('-');
  laodOrder(arr);
})

function getUrlParams() {
  const url = new URL(location.href);
  const searchParams = url.searchParams;
  let params = searchParams.entries();
  return Object.fromEntries(params);
}

async function laodOrder(prams) {
  try {
    if (!prams.length) {
      return false;
    }
    let [folder, fileName] = prams;
    let res = await axios.post(`${window.location.origin}/aws/download`, { folder, fileName });
    if (!res.data) return
    jq('div.status, div.view-order').toggleClass('d-none');
    jq('div.close').click(function () { window.close() });
    let data = res.data;
    let { orderData, thermalitems: items, gsData, grData, entityData } = data;

    let od = orderData[0];
    let gs = gsData[0];
    let gr = grData[0];
    let ent = entityData[0];
    let { entity_name, tag_line, address, city, state, pincode, contact, email, gst_num } = ent;

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
        <div class="my-2 fw-500">${gst_num ? 'TAX INVOICE' : ''}</div>
        `;

    jq('div.entity').removeClass('d-none').html(entstr)

    let partystr = `
      <div class="d-flex jcb aic">
          DATE <span class="order-date">${od?.bill_date || moment(od?.order_date).format('DD-MM-YYYY')}</span>
      </div>           
      <div class="d-flex jcb aic">
          BILL <span class="fw-400"># ${od?.inv_number}</span>
      </div>
      <div class="d-flex jcb aic fw-500">
          PARTY <span class="">${od?.party_name}</span>
      </div> 
      <div class="d-flex jcb aic ${od?.address?'':'d-none'}">
          <div class="ms-auto d-flex flex-column">
            <span class="ms-auto text-end">${od?.address}</span>
            <span class="ms-auto">${od?.city}</span>
            <span class="ms-auto">${od?.pincode}</span>
            <span class="ms-auto">${od?.state}</span>
          </div>
      </div> `;

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
                        <span class="">${parseLocal(row['price'])}</span>
                        <span class="mx-2">X</span>
                        <span class="">${parseLocal(row['qty'])}</span>
                        <div class="${!disc || disc == '0.00' ? 'd-none' : ''}">
                          <span>DISC (${parseDisc(disc_type)})</span>
                          <span class="ms-1">${parseLocal(disc)}</span>
                        </div>
                        <div class="${!gst || gst == '0.00' ? 'd-none' : ''}">
                          TAX <span>(${parseLocal(gst)}%)</span>
                          <span class="ms-1">${parseLocal(row['tax'])}</span>
                        </div>
                      </div>
                    </div>
                    <div class="amount text-end ms-1 fw-500">${parseLocal(row['amount'])}</div>
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
              QTY.<span class="fw-bold">${parseDecimal(gs.gs)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic fw-500">
              SUBTTOAL <span class="subtotal">${parseDecimal(od.subtotal)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.discount) ? '' : 'd-none'}">
              DISCOUNT <span>${parseDecimal(od.discount)}</span>
          </li>
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? 'd-none' : ''}">
              CGST <span class="ms-1 me-auto ${od.tax_type=='inc'?'':'d-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax / 2)}</span>
          </li>  
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? 'd-none' : ''}">
              SGST <span class="ms-1 me-auto ${od.tax_type=='inc'?'':'d-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax / 2)}</span>
          </li>  
          <li class="list-group-item p-0 py-1 d-flex jcb aic ${parseNumber(od?.totaltax) ? '' : 'd-none'} ${od.gst_type == 'igst' ? '' : 'd-none'}">
              IGST <span class="ms-1 me-auto ${od.tax_type=='inc'?'':'d-none'}">(${od.tax_type}.)</span> <span>${parseDecimal(od.totaltax)}</span>
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

    jq('div.comments').html(od.notes || ''); 
    
  } catch (error) {
    log(error);
  }
}

function parseLocal(number) {
  let num = parseNumber(number);
  if (!num) return '';
  return num.toLocaleString(currency)
}

function parseNumber(number) {
  if (number === null) return 0;
  if (!number) return number;
  const num = typeof number === 'string' ? number.replace(/\,/g, '') : number;
  if (isNaN(num)) return 0
  let int = parseFloat(num); //log(int % 1)
  if (int % 1 === 0) {
    return parseInt(num)
  } else {
    return parseFloat(num);
  }
}

function parseDecimal(number) {
  if (!number) number = 0;
  let num = parseNumber(number);
  const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', {
      style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  let digit = indianCurrencyFormatter.format(num);
  let val = digit == '0.00' ? '0.00' : digit;
  // return val;
  return parseNumber(val);
}

function parseCurrency(number) {
  if (isNaN(number)) {
      return 0; // Or handle the error appropriately
  }
  let num = parseNumber(number);
  const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  return indianCurrencyFormatter.format(num);
}

function parseDisc(e) { if (e?.endsWith("%")) { let r = e.slice(0, -1); return parseLocal(r) + "%" } return '#' }