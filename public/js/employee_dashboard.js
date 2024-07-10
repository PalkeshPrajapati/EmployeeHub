//************************************************************************************************** */


let href = window.location.href
let from_month_element = document.getElementById('from_month')
let to_month_element = document.getElementById('to_month')
let from_month = href.substring(href.lastIndexOf('from=') + 5, href.lastIndexOf('from=') + 5 + 7)
let to_month = href.substring(href.lastIndexOf('to=') + 3, href.lastIndexOf('to=') + 3 + 7)
from_month_element.value = from_month
to_month_element.value = to_month


const search = (vender_id) => {
    let from_month = document.getElementById('from_month').value
    let to_month = document.getElementById('to_month').value
    window.location.replace(`?id=${vender_id}&from=${from_month}&to=${to_month}`);
}

let main_table = document.getElementById("main_table")
let total_rows = main_table.rows.length;



const update_da = (cell) => {
    if (!cell.textContent.includes("NOT SUBMITTED")){
        let da_p = parseInt(cell.querySelector(".da > .pct").textContent)
        let pb = parseInt(cell.querySelector(".pb").textContent)
        let gp = parseInt(cell.querySelector(".gp").textContent)
        let da = cell.querySelector(".da > .rs")

        da.textContent = Math.round(((pb + gp) / 100) * da_p);

        update_nps_ds(cell)
        update_nps_es(cell)
    }
}

const update_hra_e = (cell) => {

    let hra_e_p = parseInt(cell.querySelector(".hra_e > .pct").textContent)
    let pb = parseInt(cell.querySelector(".pb").textContent)
    let gp = parseInt(cell.querySelector(".gp").textContent)
    let hra_e = cell.querySelector(".hra_e > .rs")

    hra_e.textContent = Math.round((hra_e_p / 100) * (pb + gp))
    
    update_ga(cell)
}

const update_nps_ds = (cell) => {
    if (!cell.textContent.includes("NOT SUBMITTED")){
        let pb = parseInt(cell.querySelector(".pb").textContent)
        let gp = parseInt(cell.querySelector(".gp").textContent)
        let da = parseInt(cell.querySelector(".da > .rs").textContent)
        let nps_ds_p = parseInt(cell.querySelector(".nps_ds > .pct").textContent)
        let nps_ds1 = cell.getElementsByClassName("nps_ds")[0]
        let nps_ds2 = cell.getElementsByClassName("nps_ds")[1]

        let nps_ds_in_rs = Math.round((nps_ds_p / 100) * (pb + gp + da));
        nps_ds1.querySelector(".rs").textContent = nps_ds_in_rs;
        nps_ds2.querySelector(".rs").textContent = nps_ds_in_rs;
        
        update_ga(cell)
    }
}

const update_ga = (cell) => {
    let pb = parseInt(cell.querySelector(".pb").textContent)
    let gp = parseInt(cell.querySelector(".gp").textContent)
    let da = parseInt(cell.querySelector(".da > .rs").textContent)
    let hra_e = parseInt(cell.querySelector(".hra_e > .rs").textContent)
    let nps_ds = parseInt(cell.querySelector(".nps_ds > .rs").textContent)
    let ga = cell.querySelector(".ga > span")

    ga.textContent = Math.round(pb + gp + da + hra_e + nps_ds)

    update_net_payment(cell)
}

const update_nps_es = (cell) => {
    if (!cell.textContent.includes("NOT SUBMITTED")){
        let pb = parseInt(cell.querySelector(".pb").textContent)
        let gp = parseInt(cell.querySelector(".gp").textContent)
        let da = parseInt(cell.querySelector(".da > .rs").textContent)
        let nps_es_p = parseInt(cell.querySelector(".nps_es > .pct").textContent)

        let nps_es = cell.querySelector(".nps_es > .rs")

        nps_es.textContent = Math.round((nps_es_p / 100) * (pb + gp + da))

        update_nps_total(cell)
    }
}

const update_nps_total = (cell) => {
    let nps_es = parseInt(cell.querySelector(".nps_es > .rs").textContent)
    let nps_ds = parseInt(cell.querySelector(".nps_ds > .rs").textContent)
    let nps_total = cell.querySelector(".nps_total > span");

    nps_total.textContent = Math.round(nps_ds + nps_es)
    update_net_payment(cell)
}

const update_net_payment = (cell) => {
    let ga = parseInt(cell.querySelector(".ga > span").textContent)
    let it = parseInt(cell.querySelector(".it").textContent)
    let pt = parseInt(cell.querySelector(".pt").textContent)
    let hra_d = parseInt(cell.querySelector(".hra_d").textContent)
    let or = parseInt(cell.querySelector(".or").textContent)
    let nps_total = parseInt(cell.querySelector(".nps_total > span").textContent)
    let net_payment = cell.querySelector(".net_payment > span");

    let cal = Math.round(ga - it - pt - hra_d - or - nps_total)
    net_payment.textContent = cal
}

const date_change = (cell) => {
    let d = cell.value
    window.location.replace(d);
    
}

(set_da_run_once = () => {
    for (let i = 0; i < total_rows; i++) {
        update_da(main_table.children.item(i))
    }
})();
(set_npsds_run_once = () => {
    for (let i = 0; i < total_rows; i++) {
        update_nps_ds(main_table.children.item(i))
    }
})();
(set_npses_run_once = () => {
    for (let i = 0; i < total_rows; i++) {
        update_nps_es(main_table.children.item(i))
    }
})();
(set_hrae_run_once = () => {
    allrow_hra_e = main_table.querySelectorAll(".hra_e");
    allrow_hra_e.forEach(element => {
        update_hra_e(element.parentElement)
    });
})();


function exportTableToExcel(tableID, filename = '') {
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    // Specify file name
    filename = filename ? filename + '.xls' : 'excel_data.xls';

    // Create download link element
    downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
    }
}