let g=x=>{return document.getElementById(x)};
let add = g("add");
let fill = g("fill");
let fullname = g("fullname");
let rn = g("rn");//receipt_no
let rd = g("rd");//reg_date
let id = g("id");//reg_date
let p1 = g("p1");//reg_date
let p2 = g("p2");//reg_date
let p3 = g("p3");//reg_date
let bd = g("bd");//reg_date
let total = g("total");//reg_date
let serverAddress = "http://localhost:2006";

let job = (async ()=>{



})();

add.addEventListener("click", e => {
    const fields = {
      fullname: { value: fullname.value, required: true, errorMessage: "!Student name missing!\n" },
      registration_date: { value: g("rd").value.length === 0 ? get_date(0) : g("rd").value },
      registration_number: { value: rn.value.length === 0 ? get_date(1) : rn.value },
      phone_numbers: { value: `${p1.value}${p2.value.length === 0 ? "" : "," + p2.value}${p3.value.length === 0 ? "" : "," + p3.value}`, required: true, errorMessage: "!Phone number missing!\n" },
      email: { value: email.value.length === 0 ? "NULL" : email.value },
      class: { value: `${cls.value}-${cs.value}` },
      birthdate: { value: g("bd").value, required: true, errorMessage: "!BirthDate missing!\n" },
      total: { value: total.value, required: true, errorMessage: "!Total fees missing!\n" },
      cashin: { value: cashin.value.length === 0 ? "NULL" : cashin.value },
      notes: { value: notes.value.length === 0 ? "NULL" : notes.value },
      id: { value: id.value, required: true, errorMessage: "!Identity Card number missing!\n" }
    };
  
    let hasError = false;
    Object.entries(fields).forEach(([name, field]) => {
      if (field.required && !field.value) {
        hasError = true;
        alert(field.errorMessage);
      }
    });
    if (hasError) return;
  
    const fbody = Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value]));

    // console.log("FBODY\n",fbody);
  
    fetch(`${serverAddress}/add`, {
      method: "POST",
      body: JSON.stringify(fbody)
    })
      .then(res => res.json())
      .then(res => {
        if (res.message === "post_success") {
          process_table(fbody, res.count);
        }
      })
      .catch(err => {
        console.error("SERVER ERROR!", err.message);
      });
  });

function process_table(fetch_body, count) {
  localStorage.setItem("mp_data",JSON.stringify(fetch_body));
  localStorage.setItem("mp_count",count);
  location.replace("added.html");
}
  
function get_date(timestamp) {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth().toString().padStart(2,"0");
    let date = d.getDate().toString().padStart(2,"0");
    let hours = d.getHours().toString().padStart(2,"0");
    let minutes = d.getMinutes().toString().padStart(2,"0");
    let seconds = d.getSeconds().toString().padStart(2,"0");

    if(timestamp){
      return `${year}${month}${date}${hours}${minutes}${seconds}`
    }
    else {return `${year}-${month}-${date}`}
}

let url = new URL(location.href);
let sp = url.searchParams;

if(sp.has("d")){
  fill.style.display="inline-block";
}
fill.addEventListener("click",e=>{
  fullname.value="Ahmed Khaled Alamoodi";
  id.value="2254161470";
  p1.value="+966549120542";
  bd.value="2006-12-21";
  total.value="5000"
});