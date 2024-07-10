let main_table = document.getElementById("main_table")
let total_rows = main_table.rows.length;

let href = window.location.href
let input_month = document.getElementById('input_month')
let y_m = href.substring(href.lastIndexOf('/') + 1)
input_month.value = y_m

const update_all_da = () => {
    let da_p = document.getElementById("da_p").value;
    allrow_da_col = main_table.querySelectorAll(".da");
    for (let i = 0; i < total_rows; i++) {
        allrow_da_col[i].firstElementChild.value = da_p
        update_da(allrow_da_col[i].parentElement)
    }
}

const update_da = (cell) => {

    let da_p = parseInt(cell.querySelector(".da").firstElementChild.value)
    let pb = parseInt(cell.querySelector(".pb").value)
    let gp = parseInt(cell.querySelector(".gp").value)
    let da = cell.querySelector(".da")

    da.lastChild.textContent = Math.round(((pb + gp) / 100) * da_p);

    update_nps_ds(cell)
    update_nps_es(cell)
}

const update_hra_e = (cell) => {

    let hra_e_p = parseInt(cell.querySelector(".hra_e").firstElementChild.value)
    let pb = parseInt(cell.querySelector(".pb").value)
    let gp = parseInt(cell.querySelector(".gp").value)
    let hra_e = cell.querySelector(".hra_e")

    hra_e.lastChild.textContent = Math.round((hra_e_p / 100) * (pb + gp))

    update_ga(cell)
}

const update_all_nps_ds = () => {
    let nps_ds_p = document.getElementById("nps_ds_p").value;
    allrow_nps_ds_p_col = main_table.querySelectorAll(".nps_ds")
    for (let i = 0; i < total_rows; i++) {
        allrow_nps_ds_p_col[i].firstElementChild.value = nps_ds_p;
        update_nps_ds(allrow_nps_ds_p_col[i].parentElement)
    }
}

const update_nps_ds = (cell) => {

    let pb = parseInt(cell.querySelector(".pb").value)
    let gp = parseInt(cell.querySelector(".gp").value)
    let da = parseInt(cell.querySelector(".da").lastChild.textContent)
    let nps_ds_p = parseInt(cell.querySelector(".nps_ds").firstElementChild.value)
    let nps_ds1 = cell.getElementsByClassName("nps_ds")[0]
    let nps_ds_copy = cell.getElementsByClassName("nps_ds_copy")[0]

    nps_ds1.lastChild.textContent = Math.round((nps_ds_p / 100) * (pb + gp + da))
    nps_ds_copy.textContent = nps_ds1.lastChild.textContent;

    update_nps_total(cell)
    update_ga(cell)
}

const update_ga = (cell) => {

    let pb = parseInt(cell.querySelector(".pb").value)
    let gp = parseInt(cell.querySelector(".gp").value)
    let da = parseInt(cell.querySelector(".da").lastChild.textContent)
    let hra_e = parseInt(cell.querySelector(".hra_e").lastChild.textContent)
    let nps_ds = parseInt(cell.querySelector(".nps_ds").lastChild.textContent)
    let ga = cell.querySelector(".ga")

    ga.textContent = Math.round(pb + gp + da + hra_e + nps_ds)

    update_net_payment(cell)
}

const update_all_nps_es = () => {
    let nps_es_p = document.getElementById("nps_es_p").value;
    allrow_nps_es_p_col = main_table.querySelectorAll(".nps_es")
    for (let i = 0; i < total_rows; i++) {
        allrow_nps_es_p_col[i].firstElementChild.value = nps_es_p;
        update_nps_es(allrow_nps_es_p_col[i].parentElement)
    }
}

const update_nps_es = (cell) => {
    let pb = parseInt(cell.querySelector(".pb").value)
    let gp = parseInt(cell.querySelector(".gp").value)
    let da = parseInt(cell.querySelector(".da").lastChild.textContent)
    let nps_es = cell.querySelector(".nps_es")
    let nps_es_p = parseInt(nps_es.firstElementChild.value)

    nps_es.lastChild.textContent = Math.round((nps_es_p / 100) * (pb + gp + da))

    update_nps_total(cell)
}

const update_nps_total = (cell) => {
    let nps_es = parseInt(cell.querySelector(".nps_es").textContent)
    let nps_ds = parseInt(cell.querySelector(".nps_ds").textContent)
    let nps_total = cell.querySelector(".nps_total");

    nps_total.textContent = Math.round(nps_ds + nps_es)
    update_net_payment(cell)
}

const update_net_payment = (cell) => {
    let ga = parseInt(cell.querySelector(".ga").textContent)
    let it = parseInt(cell.querySelector(".it").value)
    let pt = parseInt(cell.querySelector(".pt").value)
    let hra_d = parseInt(cell.querySelector(".hra_d").value)
    let or = parseInt(cell.querySelector(".or").value)
    let nps_total = parseInt(cell.querySelector(".nps_total").textContent)
    let net_payment = cell.querySelector(".net_payment");

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
    for (let i = 0; i < total_rows; i++) {
        update_hra_e(allrow_hra_e[i].parentElement)
    }
})();

const submitSalary = (cell, reload=true) => {
    salary = {
        vender_id: cell.querySelector(".vender_id").textContent,
        pay_basic: cell.querySelector(".pb").value,
        grade_pay: cell.querySelector(".gp").value,
        dearness_allowance: cell.querySelector(".da").firstElementChild.value,
        hra_earning: cell.querySelector(".hra_e").firstElementChild.value,
        nps_departmentshare: cell.querySelector(".nps_ds").firstElementChild.value,
        income_tax: cell.querySelector(".it").value,
        professional_tax: cell.querySelector(".pt").value,
        hra_deduction: cell.querySelector(".hra_d").value,
        other_recovery: cell.querySelector(".or").value,
        nps_employeeshare: cell.querySelector(".nps_es").firstElementChild.value,
    }

    fetch(`/admin/add-salary/${y_m}`, {

        method: "POST",
        body: JSON.stringify(salary),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then((res) => {
        if(!res.error && res.redirect){
            if(reload){
                window.location.reload()
            }
        }
        else if(res.error){
            alert(`Some Error: ${res.error}`)
        }
    });
}

const submitAllSalary = () => {
    if (confirm("Are You literally want to submit all salary?")){
        let alltr = main_table.getElementsByTagName("tr")
        for (let i = 0; i < total_rows; i++) {
            if(alltr[i].querySelector("td:nth-child(2) input").value == "Submit"){
                submitSalary(alltr[i], reload=false)
            }
        }
        window.location.reload()
    }
}

const deleteSalary = (cell) => {
    if(confirm("Are you realy want to delete it?") == true){
        fetch(`/admin/add-salary/${y_m}`, {
            method: "DELETE",
            body: JSON.stringify({
                vender_id: cell.querySelector(".vender_id").textContent
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then((res) => {
            if(!res.error && res.redirect){
                window.location.reload()
            }
            else if(res.error){
                alert(`Some Error: ${res.error}`)
            }
        });
    }
}