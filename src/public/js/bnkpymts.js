import { doc, fetchTable, getSettings, jq, log, Months, pageHead, parseData, parseLocal, popListInline, queryData, viewOrder, viewOrderA4 } from "./help.js";
import 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
import { _viewOrderDetails, viewArticles, viewPayments } from "./module.js";
// import 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
// import 'https://unpkg.com/dompurify@3.0.6/dist/purify.min.js';

const XLSX = window.XLSX;

// const DOMPurify = window.DOMPurify;
// const { jsPDF } = window.jspdf;


doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'Bank Payments', viewSearch: false });
    viewDetails();
})

async function viewDetails() {
    try {
        jq('div.process').addClass('d-none');
        let fys = await queryData({ key: 'pymtfys' });
        if (!fys.length) { jq('#root').html(`<span class="fs-2 text-secondary">No Records Found</span>`); return; }
        let [selectbank] = jq('<select></select>').addClass('form-select form-select-sm me-auto w-md-25').attr('id', 'bank_id');
        let [selectmonth] = jq('<select></select>').addClass('form-select form-select-sm w-md-10').prop('title', 'Select Month')
        let [selectYear] = jq('<select></select').addClass('form-select form-select-sm w-md-10').prop('title', 'Financial Year')
        let [apply] = jq('<button></button>').addClass('btn btn-sm btn-primary apply').text('Apply').prop('title', 'Click to Fetch/Pull Details');
        let [print] = jq('<button></button>').addClass('btn btn-sm btn-primary print disabled').text('Print').click(function () { window.print() }).prop('title', 'Print Data');
        let [downlaod] = jq('<button></button>').addClass('btn btn-sm btn-primary export-excel disabled').text('Excel').prop('title', 'Export Excel File')
        let [btn_group] = jq('<div></div>').addClass('btn-group mw-md-100').append(apply, print, downlaod);
        let [headrow] = jq('<div></div>').addClass('d-flex flex-column flex-md-row jcb aic gap-2 p-2 rounded d-print-none').append(selectbank, selectmonth, selectYear, btn_group)
        let [tablesdiv] = jq('<div></div>').addClass('p-2');
        let [container] = jq('<div></div>').addClass('container-md d-flex flex-column gap-2 px-0').append(headrow, tablesdiv);
        let fyplaceholder = new Option('Year', '');
        selectYear.add(fyplaceholder);

        fys.forEach(y => { selectYear.add(new Option(y.year)) });
        let monthPlaceholder = new Option('Month', '');
        selectmonth.add(monthPlaceholder);
        Months.forEach(m => { selectmonth.add(new Option(m.full, m.month)); })

        let bankPlaceholder = new Option('Bank', '');
        selectbank.add(bankPlaceholder);
        let banks = await queryData({ key: 'banksList' });
        if (banks.length) { banks.forEach(b => { selectbank.add(new Option(b.bank_name, b.id)) }) }
        let settings = getSettings();
        let default_bank = settings.default_bank;
        if (default_bank) jq(selectbank).val(default_bank);

        let cDate = new Date();
        jq(selectmonth).val(cDate.getMonth() + 1);
        jq(selectYear).val(cDate.getFullYear());


        jq(apply).click(async function () {
            let bank = jq(selectbank).val();
            let month = jq(selectmonth).val();
            let fy = jq(selectYear).val();
            if (!bank || !month || !fy) return;
            let res = await fetchTable({ key: 'statement', values: [bank, fy, month, bank, fy, month] });
            if (!res) {
                jq(tablesdiv).html('');
                return
            };
            parseData({ tableObj: res, colsToTotal: ['amount'], colsToRight: ['amount'], hideBlanks: ['purch_id'] });
            let { table, tbody } = res;
            jq(tbody).find(`[data-key='cr/dr']`).each(function (i, e) { if (e.textContent.toLowerCase() == 'debit') jq(e).closest('tr').find('td').addClass('text-danger'); });
            jq(tbody).find(`[data-key="order_id"]`).addClass('text-primary role-btn').each((i, e) => {
                jq(e).click(() => {
                    let { order_id } = res.data[i];
                    popListInline({
                        el: e, li: [
                            { key: 'View', id: 'viewOrder' },
                            { key: 'View A4', id: 'viewOrderA4' },
                            { key: 'View Details', id: 'viewDetails' },
                            { key: 'View Articles', id: 'viewArticles' },
                            { key: 'View Payments', id: 'viewPymts' },
                            { key: 'Cancel' }
                        ]
                    });
                    jq('#viewOrder').click(() => { viewOrder(order_id); })
                    jq('#viewOrderA4').click(() => { viewOrderA4(order_id); })
                    jq('#viewDetails').click(() => { _viewOrderDetails(order_id); })
                    jq('#viewArticles').click(() => { viewArticles(order_id); })
                    jq('#viewPymts').click(() => { viewPayments(order_id); })
                })
            })
            jq(tablesdiv).html(table);
            jq(print).toggleClass('disabled', !res.data.length);
            jq(downlaod).toggleClass('disabled', !res.data.length);
            jq(downlaod).click(async function () { exportToExcel(res.data, 'Statement') })
            // jq(downlaod).click(async function () { log(doc.body.innerHTML) })
        });

        jq('#root').html(container);

    } catch (error) {
        log(error);
    }
}


function exportToExcelBasic(data, fileName) {
    // Check if data is not empty
    if (!data || !data.length) {
        console.error("No data available to export");
        return;
    }

    // Create a worksheet from the data array
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, `${fileName || "export"}.xlsx`);
}

function exportToExcel(data, fileName) {
    if (!data || !data.length) {
        console.error("No data available to export");
        return;
    }

    // Prepare a copy of the data with type conversions
    const formattedData = data.map((row) => ({
        ...row,
        // dated: new Date(row.dated.split("/").reverse().join("-")), // Convert date to JavaScript Date object
        amount: parseFloat(row.amount), // Convert amount to number
    }));

    // Create headers with uppercase keys
    const headers = Object.keys(formattedData[0]).reduce((acc, key) => {
        acc[key] = key.toUpperCase(); // Convert each key to uppercase
        return acc;
    }, {});

    // Add the headers to the data
    const dataWithHeaders = [headers, ...formattedData];

    // Create a worksheet from the formatted data with headers
    const worksheet = XLSX.utils.json_to_sheet(dataWithHeaders, {
        skipHeader: true, // Skip auto-generated headers as we're adding custom ones
    });

    // Define column widths and number/date formatting
    const colWidths = [
        { wch: 10 }, // "DATED"
        { wch: 20 }, // "PARTY"
        { wch: 15 }, // "PYMT_FOR"
        { wch: 10 }, // "CR/DR"
        { wch: 10 }, // "MODE"
        { wch: 15 }, // "METHOD"
        { wch: 25 }, // "NOTES"
        { wch: 10 }, // "AMOUNT"
    ];
    worksheet["!cols"] = colWidths;

    // Loop through cells to set types (dates and numbers)
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // const dateCell = XLSX.utils.encode_cell({ r: row, c: 0 }); // "DATED" column
        const amountCell = XLSX.utils.encode_cell({ r: row, c: 7 }); // "AMOUNT" column

        // if (worksheet[dateCell]) {
        //     worksheet[dateCell].t = "d"; // Set cell type to date
        // }

        if (worksheet[amountCell]) {
            worksheet[amountCell].t = "n"; // Set cell type to number
        }
    }

    // Apply bold styling to header cells
    for (let col = 0; col <= range.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[headerCell]) {
            worksheet[headerCell].s = {
                font: { bold: true }, // Set font to bold
                alignment: { horizontal: "center", vertical: "center" }, // Optional: Center align headers
            };
        }
    }

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, `${fileName || "export"}.xlsx`);
}




