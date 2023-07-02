const express = require('express');
const sqlite3 = require('sqlite3').verbose();
let cors = require("cors");

const app = express();
const port = 2006;

const dbpath = './db/main.db';
const table_name = "students";

app.use(cors({ origin: "*" }))

app.use((req, res, next) => {
    let done = "";
    req.on("data",data=>{done += data});
    req.on("end",a=>{
      req.postBody = done;
      next();
    });
})

app.use(express.json());

//const db = new sqlite3.Database(dbpath);

app.post('/add', (req, res) => {
  const db = new sqlite3.Database(dbpath);
  // const studentData = req.body;
  const studentData = JSON.parse(req.postBody);

  if (hasSqlInjection(studentData)) {
    console.error('SQL injection attempt!');
    return res.status(403).send('unhackableLol');
  }

  const sql = `INSERT INTO students(
    name,
    reg_date,
    receipt_no,
    phone,
    class,
    ID,
    total,
    email,
    birthday,
    cash_in,
    notes
  ) values(?,?,?,?,?,?,?,?,?,?,?)`;

  const args = [
    studentData.fullname,
    studentData.registration_date,
    studentData.registration_number,
    studentData.phone_numbers,
    studentData.class,
    studentData.id,
    studentData.total,
    studentData.email !== 'NULL' ? studentData.email : null,
    studentData.birthdate !== 'NULL' ? studentData.birthdate : null,
    studentData.cashin !== 'NULL' ? studentData.cashin : null,
    studentData.notes !== 'NULL' ? studentData.notes : null
  ];

  db.run(sql, args, function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Database error');
    }

    db.get(`SELECT COUNT(*) as count FROM students`, (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Database error');
      }

      console.log("Student Added: ",studentData.fullname.split(" ")[0]);
      res.status(200).json({
        message: 'post_success',
        count: row.count
      });
    });
  });
  db.close();
});

app.post('/search', (req, res)=>{
  console.log(req.postBody);
  const db = new sqlite3.Database(dbpath);
  let postBody = JSON.parse(req.postBody);
  let sql = postBody.sql;
  db.all(sql,(err,rows) => {
    if(err){
      res.status(500).send({
        err: 1,
        msg: "err_db"
      });
    } else {
      db.get(`SELECT COUNT(*) AS count FROM ${table_name}`,(err,row)=>{
          if(err){
            res.status(500).send({
              err: 1,
              msg: "err_db"
            });
          }else{
            res.status(200).send({
              msg: "post_success",
              count: row.count,
              rows: JSON.stringify(rows)
            })
          }
      })
    }
  })
  db.close();
});

app.post('/modify', (req,res)=>{
  let postBody = JSON.parse(req.postBody);
  let sql = postBody.sql;
  let db = new sqlite3.Database(dbpath);
  db.run(sql,(err)=>{
    if(err){
      res.status(500).send("Feild Modification Failed! Error: "+err.message);
    } else {
      res.status(200).send("All Good!");
    }
  })
  db.close();
});

function hasSqlInjection(data) {
  const sqlRegex = /(--)|(\/\*)|(SELECT|DELETE|UPDATE|INSERT|DROP|TRUNCATE)|(\bUNION\b)|\.sh?e?l?l?/gi;
  return Object.values(data).some(value => sqlRegex.test(value));
}

app.get("/",(req,res)=>{
  res.status(200).send("U3VjY2VzcyEgaSBsb3ZlIHN1emllQFNUQE5ldGZsaXg%3D")
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});