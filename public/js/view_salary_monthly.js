//************************************************************************************************** */
let main_table = document.getElementById("main_table")
let total_rows = main_table.rows.length;

let href = window.location.href
let input_month = document.getElementById('input_month')
let y_m = href.substring(href.lastIndexOf('/') + 1)
input_month.value = y_m

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


const hide_employee_with_nosalary = (checkbox) => {
    let tr = main_table.querySelectorAll("tr")
    if (checkbox.checked){
        tr.forEach(element => {
            if(element.innerHTML.includes("NOT SUBMITTED")){
                element.style.display = "none";
            }
        });
    }
    else{
        tr.forEach(element => {
            if(element.innerHTML.includes("NOT SUBMITTED")){
                element.style.display = "";
            }
        });
    }
}

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

let d = new Date(input_month.value);
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = monthNames[d.getMonth()];
const year = d.getFullYear();
const formattedDate = `${month} ${year}`;
document.querySelector("#month_in_table").textContent = formattedDate