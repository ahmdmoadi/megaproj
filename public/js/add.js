let g=x=>{return document.getElementById(x)};
let add = g("#add");
let rd = g("rd");//reg_date

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
      birthdate: { value: g("bd").value.length === 0 ? "NULL" : g("bd").value },
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
  