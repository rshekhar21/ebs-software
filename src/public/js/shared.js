import h, { doc, jq, log, parseLocal, parseNumber } from "./help.js";
import { fetchBillDetails } from "./module.js";

doc.addEventListener('DOMContentLoaded', async function () {
  const orderid = h.getUrlParams().key; //log(orderid); return;
  if (orderid) {
    let res = await loadData(orderid);
    if (res) {
      jq('div.status, div.view-order').toggleClass('d-none');
      jq('div.close').click(function () { window.close() });
    } else {
      jq('div.status').addClass('d-none');
    }
  } else {
    jq('div.status').addClass('d-none');
  };

});


async function loadData(orderid) {
  try {
    let entity = 1;// await h.getActiveEntity();
    if (!entity) return;
    let res = await fetchBillDetails(orderid); //log(res);
    if (!res) return false;

    let { orderData, thermalitems, gsData, grData } = res;

    let od = orderData[0];
    let gs = gsData[0];
    let gr = grData[0];

    jq('span.party-name').text(od.party_name)
    jq('span.order-date').text(moment(od.order_date).format('DD/MM/YYYY'));
    jq('span.inv-number').text(od.inv_number);
    jq('span.subtotal').text(h.parseLocal(od.subtotal))
    jq('span.total').text(h.parseLocal(od.alltotal))
    jq('span.gs').text(h.parseLocal(gs.gs));
    if (gr.gr) jq('span.gr').text(`/ ${h.parseLocal(gr.gr)}`);


    let str = null;
    if (thermalitems && thermalitems.length > 0) {
      thermalitems.forEach(row => {
        for (let i in row) {
          let size = row['size'], disc = row['disc'], gst = row['gst'], disc_type = row['disc_type'];
          str = `
          <li class="list-group-item p-0 pt-1">
            <div class="d-flex jcb ais">
                <div class="details d-flex jcs ais flex-column flex-fill">
                  <div>
                    <span class="me-2">${row['product']}</span>
                    <span class="size">${size || ''}</span>
                  </div>
                  <div class="fw-300">
                  <span class="price">${h.parseLocal(row['price'])}</span>
                  <span class="mx-2">X</span>
                  <span class="qty">${h.parseLocal(row['qty'])}</span>
                    <div class="disc d-inline small ${!disc || disc == '0.00' ? 'd-none' : ''}">,
                      <span class="ms-1 me-2">Disc @ ${h.parseDisc(disc_type)}</span>
                      <span class="disc">${h.parseLocal(disc)}</span>
                    </div>
                    <div class="gst ${!gst || gst == '0.00' ? 'd-none' : ''}">
                      TAX @ <span class="gst">${h.parseLocal(gst)}%</span>
                      <span class="tax ms-2">${h.parseLocal(row['tax'])}</span>
                    </div>
                  </div>
                </div>
                <div class="amount text-end ms-1">${h.parseLocal(row['amount'])}</div>
              </div>
            </li>`;
        }
        jq('div.items>ul').append(str);
      })

      const mrpTotal = thermalitems.map(item => (h.parseNumber(item.price) * h.parseNumber(item.qty))).reduce((prev, curr) => prev + curr, 0); //log(mrpTotal);
      const savings = thermalitems.map(item => h.parseNumber(item?.disc)).reduce((prev, curr) => prev + curr, 0); //log(savings);
      if (savings) {
        jq('div.savings').removeClass('d-none');
        jq('span.savings').text(parseLocal(savings));
      }
    }

    if (parseNumber(od?.totaltax)) {
      jq('li.tax').removeClass('d-none');
      jq('span.tax').text(parseLocal(od.totaltax));
    }

    if (parseNumber(od?.discount)) {
      jq('li.disc').removeClass('d-none');
      jq('span.disc').text(parseLocal(od.discount));
    }

    if (parseNumber(od?.freight)) {
      jq('li.freight').removeClass('d-none');
      jq('span.freight').text(parseLocal(od.freight));
    }
    return true;
  } catch (error) {
    log(error);
  }
}