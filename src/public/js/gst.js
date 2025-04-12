import { controlBtn, doc, fetchTable, jq, log, Months, pageHead, parseData, queryData } from "./help.js";
import 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const XLSX = window.XLSX;

let arr = []
doc.addEventListener('DOMContentLoaded', function () {
    pageHead({ title: 'GST Report', viewSearch: false });

    appenedFrame();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    createReport(month, year);

    controlBtn({});

    let excel = jq('<button></button>').addClass('btn btn-sm disabled btn-success').html('<i class="bi bi-file-earmark-spreadsheet"></i>').click(function () {
        exportToExcel(arr);
    }).prop('title', 'Export as Excel file')

    let json = jq('<button></button>').addClass('btn btn-sm disabled btn-secondary').html('<i class="bi bi-braces"></i>').click(function () {
        exportToJsonFile(arr);
    }).prop('title', 'Export as JSON File')

    let print = jq('<button></button>').addClass('btn btn-sm btn-primary').html('<i class="bi bi-printer"></i>').click(function () { window.print() }).prop('title', 'Print Page');

    jq('div.quick-btns').append(print, json, excel);

    jq('button.apply-filter').click(function(){
        let month = jq('#selectMonth').val();
        let year = jq('#selectYear').val();
        createReport(month, year);
    })

    jq('#myTab button').click(function(){
        jq('#myTab button').addClass('d-print-none');
        jq(this).removeClass('d-print-none')
    })


})

async function loadReport_() {
    try {
        let str = `
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link gstr-wise active " aria-current="page" href="#gstWise">GST Report</a>
            </li>
            <li class="nav-item">
                <a class="nav-link date-wise" aria-current="page" href="#dateWise">Date Wise</a>
            </li>
            <li class="nav-item">
                <a class="nav-link bill-wise" aria-current="page" href="#billWise">Bill Wise</a>
            </li>            
        </ul>
        `;

        let gstrWise = jq('<div></div>').attr('id', 'gstrWise').addClass('report p-2').html('gstr')
        let dateWise = jq('<div></div>').attr('id', 'dateWise').addClass('report p-2 d-none').html('date')
        let billWise = jq('<div></div>').attr('id', 'billWise').addClass('report p-2 d-none').html('bill')

        let [container] = jq('<div></div>').addClass('container-md mt-4').append(str, gstrWise, dateWise, billWise); //log(container);
        jq('#root').html(container);

        jq('a.gstr-wise').click(function () {
            jq('div.report').addClass('d-none');
            jq('#gstrWise').removeClass('d-none');
            jq('a.nav-link').removeClass('active');
            jq(this).addClass('active');
        })

        jq('a.date-wise').click(function () {
            jq('div.report').addClass('d-none');
            jq('#dateWise').removeClass('d-none')
            jq('a.nav-link').removeClass('active');
            jq(this).addClass('active');
        })

        jq('a.bill-wise').click(function () {
            jq('div.report').addClass('d-none');
            jq('#billWise').removeClass('d-none')
            jq('a.nav-link').removeClass('active');
            jq(this).addClass('active');
        })
    } catch (error) {
        log(error);
    }
}


function appenedFrame() {

    let body = `
  <div class="container-md d-flex flex-column gap-2">
    <div class="d-flex justify-content-between align-items-center py-2">
      <ul class="nav nav-tabs " id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#panel-one" type="button" role="tab" aria-controls="panel-one" aria-selected="true">GST Report</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link d-print-none" id="profile-tab" data-bs-toggle="tab" data-bs-target="#panel-two" type="button" role="tab" aria-controls="panel-two" aria-selected="false">Date Wise</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link d-print-none" id="contact-tab" data-bs-toggle="tab" data-bs-target="#panel-three" type="button" role="tab" aria-controls="panel-three" aria-selected="false">Bill Wise</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link d-print-none" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#panel-four" type="button" role="tab" aria-controls="panel-four" aria-selected="false">HSN Wise</button>
        </li>
      </ul>

      <div class="d-flex jcb aic gap-2 d-print-none">
        <span class="me-3">FILTER</span>
        <select class="form-select form-select-sm" id="selectMonth" style="width: 125px;"></select>
        <input class="form-control form-control-sm" id="selectYear" value="${new Date().getFullYear()}" style="width: 100px;" />
        <button class="btn btn-sm btn-primary apply-filter" title="Filter Data">Apply</button>
      </div>
    </div>

    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="panel-one" role="tabpanel" aria-labelledby="home-tab" tabindex="0"></div>
      <div class="tab-pane fade" id="panel-two" role="tabpanel" aria-labelledby="profile-tab" tabindex="0"></div>
      <div class="tab-pane fade" id="panel-three" role="tabpanel" aria-labelledby="contact-tab" tabindex="0"></div>
      <div class="tab-pane fade" id="panel-four" role="tabpanel" aria-labelledby="disabled-tab" tabindex="0"></div>
    </div>
  </div>`;

    jq('#root').html(body);

    Months.forEach(m => { jq('#selectMonth')[0].add(new Option(m.full, m.month)); });
    jq('#selectMonth').val(new Date().getMonth() + 1);

}


async function createReport(month, year) {
    try {
        jq('#panel-one, #panel-two, #panel-three, #panel-four').html('');

        let res = await Promise.all([
            fetchTable({ key: 'getReport', values: [month, year] }),
            fetchTable({ key: 'gstRepDateWise', values: [month, year] }),
            fetchTable({ key: 'gstRepBillWise', values: [month, year] }),
            fetchTable({ key: 'gstRepByHSN', values: [month, year] }),
        ]); 

        let [a, b, c, d] = res;
        arr = [a.data, b.data, c.data, d.data]; 
        if (a.data.length) jq('div.quick-btns button').removeClass('disabled');

        parseData({
            tableObj: a,
            colsToRight: ['sales', 'tax'],
            colsToTotal: ['sales', 'tax']
        });
    
        parseData({
            tableObj: b,
            colsToRight: ['total', 'tax'],
            colsToTotal: ['total', 'tax'],
        });
    
        parseData({
            tableObj: c,
            colsToRight: ['price', 'gst', 'tax', 'net', 'gross'],
            colsToParse: ['qty', 'price', 'gst'],
            colsToTotal: ['qty', 'tax', 'net', 'gross']
        })
    
        parseData({
            tableObj: d,
            colsToRight: ['sale', 'tax', 'net', 'gross'],
            colsToParse: ['qty', 'sale'],
            colsToTotal: ['qty', 'tax', 'net', 'gross']
        })

        jq('#panel-one').html(a.table);
        jq('#panel-two').html(b.table);
        jq('#panel-three').html(c.table);
        jq('#panel-four').html(d.table);


    } catch (error) {
        log(error);
    }
}



async function loadReport() {
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();


    let [a, b, c, d] = await Promise.all([
        fetchTable({ key: 'getReport', values: [month, year] }),
        fetchTable({ key: 'gstRepDateWise', values: [month, year] }),
        fetchTable({ key: 'gstRepBillWise', values: [month, year] }),
        fetchTable({ key: 'gstRepByHSN', values: [month, year] }),
    ]); //log(res);

    arr = [a.data, b.data, c.data, d.data]; //log(arr);
    // let json = JSON.stringify(arr); log(json);
    if (a.data.length) jq('div.quick-btns button').removeClass('disabled');

    parseData({
        tableObj: a,
        colsToRight: ['sales', 'tax'],
        colsToTotal: ['sales', 'tax']
    });

    parseData({
        tableObj: b,
        colsToRight: ['total', 'tax'],
        colsToTotal: ['total', 'tax'],
    });

    parseData({
        tableObj: c,
        colsToRight: ['price', 'gst', 'tax', 'net', 'gross'],
        colsToParse: ['qty', 'price', 'gst'],
        colsToTotal: ['qty', 'tax', 'net', 'gross']
    })

    parseData({
        tableObj: d,
        colsToRight: ['sale', 'tax', 'net', 'gross'],
        colsToParse: ['qty', 'sale'],
        colsToTotal: ['qty', 'tax', 'net', 'gross']
    })

    const $container = $('<div class="container-md mt-4" id="dataTables">')
        .append($('<ul class="nav nav-tabs">')
            .append($('<li class="nav-item">')
                .append($('<a class="nav-link gstr-wise active" href="#gstrWise">GST Report</a>'))
            )
            .append($('<li class="nav-item">')
                .append($('<a class="nav-link date-wise d-print-none" href="#dateWise">Date Wise</a>'))
            )
            .append($('<li class="nav-item">')
                .append($('<a class="nav-link bill-wise d-print-none" href="#billWise">Bill Wise</a>'))
            )
            .append($('<li class="nav-item">')
                .append($('<a class="nav-link hsn-wise d-print-none" href="#hsnWise">HSN Wise</a>'))
            )
        )
        .append($('<div id="gstrWise" class="report p-2">gstr</div>').html(a.table))
        .append($('<div id="dateWise" class="report p-2 d-none">date</div>').html(b.table))
        .append($('<div id="billWise" class="report p-2 d-none">bill</div>').html(c.table))
        .append($('<div id="hsnWise" class="report p-2 d-none">hsn</div>').html(d.table))

    $('#root').html($container);

    let inputMonth = jq('<select></select>').addClass('form-select form-select-sm').attr('id', 'selectMonth').css('width', '125px');
    let inputYear = jq('<input></input>').addClass('form-control form-control-sm').attr('id', 'selectYear').css('width', '100px').val(year);
    let span = jq('<span></span>').addClass('small fw-bold me-auto').text('Filter Data')
    let applyBtn = jq('<button></button>').addClass('btn btn-sm btn-primary').text('Apply').prop('title', 'Filter Data')
    let div = jq('<div></div>').addClass('d-flex jcb aic gap-2 border-bottom my-2 container-md p-2').append(span, inputMonth, inputYear, applyBtn);


    jq('#dataTables').before(div);
    Months.forEach(m => { inputMonth.add(new Option(m.full, m.month)); })

    $('.nav-link').click(function () {
        $('.report').addClass('d-none');
        $(`#${$(this).attr('href').substr(1)}`).removeClass('d-none');
        $('.nav-link').removeClass('active').addClass('d-print-none');
        $(this).addClass('active').removeClass('d-print-none');
    });
}

function exportToJsonFile(data) {
    const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON string
    const blob = new Blob([jsonData], { type: "application/json" }); // Create a Blob with JSON data
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    // Create a temporary <a> element
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json"; // Set the file name for the download
    a.click(); // Trigger the download

    // Clean up
    URL.revokeObjectURL(url);
}

function exportToExcel(data) {
    const workbook = XLSX.utils.book_new(); // Create a new workbook

    data.forEach((sheetData, index) => {
        const sheetName = `Sheet${index + 1}`; // Create a sheet name

        // Convert the data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // Format headers to be uppercase and bold
        const headers = Object.keys(sheetData[0] || {});
        const uppercaseHeaders = headers.map(header => header.toUpperCase()); //log(uppercaseHeaders);
        const headerRow = XLSX.utils.aoa_to_sheet([uppercaseHeaders]);
        const range = XLSX.utils.decode_range(headerRow['!ref']);

        // Style headers as bold
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (headerRow[cellAddress]) {
                headerRow[cellAddress].s = {
                    font: { bold: true },
                };
            }
        }

        // Merge the styled header row with the data
        XLSX.utils.sheet_add_json(headerRow, sheetData, {
            skipHeader: true,
            origin: -1,
        });

        // Adjust column widths dynamically
        const columnWidths = headers.map(header => {
            const maxLength = Math.max(
                header.length, // Header length
                ...sheetData.map(row => String(row[header] || "").length) // Longest cell content
            );
            return { wch: maxLength + 2 }; // Add padding for better spacing
        });

        worksheet['!cols'] = columnWidths; // Set column widths in the worksheet

        // Format numeric cells
        const dataRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = dataRange.s.r + 1; R <= dataRange.e.r; ++R) { // Skip header row
            for (let C = dataRange.s.c; C <= dataRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];

                if (cell) {
                    // Check if the cell contains a numeric value
                    const value = parseFloat(cell.v);
                    if (!isNaN(value)) {
                        cell.t = 'n'; // Set type to numeric
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName); // Add sheet to workbook
    });

    // Export the workbook
    XLSX.writeFile(workbook, "data.xlsx"); // Save as data.xlsx
}



