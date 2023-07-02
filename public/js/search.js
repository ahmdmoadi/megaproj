/**@type {HTMLButtonElement} */
let btn = document.querySelector("#btn");
/**@type {HTMLInputElement} */
let fname = document.querySelector("#fname");
/**@type {HTMLInputElement} */
let phone = document.querySelector("#phone");
/**@type {HTMLInputElement} */
let email = document.querySelector("#email");
/**@type {HTMLInputElement} */
let rpp_show = document.querySelector("#rpp");
/**@type {HTMLInputElement} */
let id = document.querySelector("#id");
/**@type {HTMLDivElement} */
let out = document.querySelector("#out");
/**@type {HTMLSpanElement} */
let entry_total = document.getElementById("entry_total");
/**@type {HTMLSpanElement} */
let entry_range = document.getElementById("entry_range");
/**@type {HTMLSpanElement} */
let page_total = document.getElementById("page_total");
/**@type {HTMLInputElement} */
let page_current = document.getElementById("page_current");
/**@type {HTMLUListElement} */
let ctxmenu = document.querySelector("#ctxmenu");

let show_ejected_inp = document.querySelector("#show_ejected");
let show_ejected = 1;
show_ejected = show_ejected_inp.checked;
show_ejected_inp.addEventListener("change",e=>{
    show_ejected = show_ejected_inp.checked;
});

let table_name = "students";

let current_uid = "1.name";

let g_max_pages = 1;

let page = 1;

let url = new URL(location.href);
let p = url.searchParams.get("p");
if(p){
    page = +p;
    page_current.value = page;
}
let r = url.searchParams.get("r");
if(r){
    rpp_show.value = r;
}

let serverAddress = "http://localhost:2006";

btn.addEventListener("click", e=>{
    let isName = !!fname.value;
    let isPhone = !!phone.value;
    let isEmail = !!email.value;
    let isID = !!id.value;

    let column_array = ["rowid","*"];
    let personal_columns = ["receipt_no", "name", "ID", "birthday", "phone", "email", "notes"];
    let classroom_columns = ["receipt_no", "name", "class"];
    let financial_columns = ["receipt_no", "name", "total", "reminder", "cash_in"];

    // #flag

    let value_array = [];

    isName ? value_array.push(`name LIKE '%${fname.value}%'`):null;
    isPhone ? value_array.push(`phone LIKE '%${phone.value}%'`):null;
    isEmail ? value_array.push(`email='${email.value}'`):null;
    isID ? value_array.push(`id='${id.value}'`):null;

    let sql = `SELECT ${column_array.join(",")} FROM ${table_name}${!!(value_array.join(" AND "))?" WHERE ":""}${value_array.join(" AND ")} LIMIT ${rpp_show.value} OFFSET ${+rpp_show.value * (page-1)}`;

    console.log(sql);

    fetch(`${serverAddress}/search`,{
        method: "POST",
        body: JSON.stringify({
            sql: sql
        })
    })
    .then(response=>{
        return response.json();
    })
    .then(data=>{
        page_current.disabled = 0;
        until_fetched.style.display="block";
        // console.log(data);
        //aah mind so blurry~
        //can't think of failsafe againt idk maybe if there is no table or
        //there is no rows
        //taken care of broooo #flag
        if(data.rows==="[]")return noresults();
        /**@type {Array} */
        let rows = JSON.parse(data.rows);

        let col_range = `${rows[0].rowid}-${rows[rows.length-1].rowid}`;
        entry_range.textContent=col_range;
        let col_total = data.count;
        entry_total.textContent=col_total;
        let t= +col_total;
        let r = +col_total % +rpp_show.value;
        let rp = +rpp_show.value;
        let max_pages = t < rp ? 1 : Math.ceil(t / rp);
        page_total.textContent= max_pages;
        g_max_pages = max_pages;
        out.innerHTML="";
        // mek a tybl
        let table = document.createElement("table");
        table.id="results"
        // apnd tybl
        out.appendChild(table);
        // extract column names from first row
        let first_row = rows[0];
        let entries = Object.entries(first_row);
        let col_names = entries.map(a=>a[0]).map(a=>{
            return replace_colnames(a);
        });
        let first_tr = document.createElement("tr");
        table.appendChild(first_tr);
        col_names.forEach(neme=>{
            let td = document.createElement("td");
            first_tr.appendChild(td);
            td.innerText = neme;
        })
        // console.log(col_names);
        rows.forEach(row=>{
            if(row.isEjected == 1 && !show_ejected) return;
            // mek tybl ro
            let tr = document.createElement("tr");
            tr.dataset.shown = 1;
            // apnd tybl ro 2 tybl
            table.appendChild(tr);
            let values = Object.entries(row);
            values.forEach(value=>{
                // mek tybl data cyl
                let td = document.createElement("td");
                // apnd 2 tr
                tr.appendChild(td);
                // 0=key 1=value
                td.innerText=value[1];
                // identify using ROWID
                //  if(col is = rowid then skip)
                //if(value[0] !== "rowid"){
                if(!["rowid","reminder","completed"].includes(value[0]) || (value[0]==="isEjected" && show_ejected)){
                    td.dataset.unique=`${values[0][1]}.${value[0]}`;
                    td.addEventListener("contextmenu",e=>{
                        e.preventDefault();
                        // console.log(e);
                        summonCtxMenuAt(e);
                    });
                }
            })
        });
        if(!document.querySelectorAll("[data-shown]").length){noresults()}
    })
});

// document.addEventListener("DOMContentLoaded",e=>{
//     btn.dispatchEvent(new MouseEvent("click"))
// }); #flag

function replace_colnames(col_name) {
    let name_map = {
        "rowid": "#",
        "name": "Full Name",
        "reg_date": "Registration Date",
        "receipt_no": "Receipt Number",
        "phone": "Phone Number/s",
        "class": "Class",
        "ID": "Identity Card Number",
        "total": "Total",
        "email": "E-mail",
        "birthday":"Birthdate",
        "cash_in": "Cash Received",
        "reminder": "Debt",
        "completed": "Fully Paid",
        "notes": "Notes"
    };
    if(!name_map[col_name]){
        return col_name;
    } else
    return name_map[col_name];
}
function noresults() {
    out.innerHTML="<h1>No Results Found</h1>";
    until_fetched.style.display="none";
}
function summonCtxMenuAt(click_event) {
    /**@type {MouseEvent} */
    let e = click_event;
    let {
        clientX: x,
        clientY: y,
        target
    } = e;
    console.log(x, y, target.dataset.unique);
    current_uid = target.dataset.unique;
    ctxmenu.style.left=x+"px";
    ctxmenu.style.top=(y+scrollY-95)+"px";
    ctxmenu.style.display="inline-block";
}
document.addEventListener("scroll",e=>{
    quitctxmenu();
});
document.addEventListener("click",quitctxmenu)
function quitctxmenu() {
    ctxmenu.style.display="none";
}quitctxmenu();

let Copy = document.querySelector("#copy");
let Edit = document.querySelector("#edit");
let Delete = document.querySelector("#delete");

Copy.addEventListener("click",e=>{
    let target = document.querySelector(`[data-unique="${current_uid}"]`);
    navigator.clipboard.writeText(target.textContent);
});
Edit.addEventListener("click",e=>{
    let target = document.querySelector(`[data-unique="${current_uid}"]`);
    let newvalue = target.textContent = prompt(`Enter desired value for: ${replace_colnames(current_uid.split(".")[1])}\n at column number ${current_uid.split(".")[0]}:`, target.textContent);
    let sql = `UPDATE ${table_name} SET ${current_uid.split(".")[1]} = "${newvalue}" WHERE rowid=${current_uid.split(".")[0]}`;
    console.log(sql);
    fetch(`${serverAddress}/modify`,{
        method: "POST",
        body: JSON.stringify({
            sql
        })
    })
});
Delete.addEventListener("click",e=>{
    let target = document.querySelector(`[data-unique="${current_uid}"]`);
    let sql = `UPDATE ${table_name} SET isEjected = 1 WHERE rowid=${current_uid.split(".")[0]}`;
    console.log(sql);
    fetch(`${serverAddress}/modify`,{
        method: "POST",
        body: JSON.stringify({
            sql
        })
    })
});

page_current.addEventListener("change",e=>{
    g_max_pages;
    let url = new URL(location.href);
    if(+url.searchParams.get("p") > g_max_pages || +page_current.value > g_max_pages) {
        url.searchParams.set("p",g_max_pages);
        location.href = url.href;
        return;
    } else if(+page_current.value < 1 || +url.searchParams.get("p") < 1) {
        url.searchParams.set("p",1);
        location.href = url.href;
    }
    url.searchParams.set("p",page_current.value);
    location.replace(url.href);
    console.log(url.href);
});
function hateNiggaCat() {
    fetch(serverAddress).then(_=>_.text()).then(a=>console.log(atob(decodeURIComponent(a))));
}