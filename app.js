const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 2006;

app.use(express.json());

const db = new sqlite3.Database('./db/main.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database');
  }
});

app.post('/add', (req, res) => {
  const studentData = req.body;

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

      res.status(200).json({
        message: 'Student added successfully',
        count: row.count
      });
    });
  });
});

function hasSqlInjection(data) {
  const sqlRegex = /(--)|(\/\*)|(SELECT|DELETE|UPDATE|INSERT|DROP|TRUNCATE)|(\bUNION\b)|\.sh?e?l?l?/gi;
  return Object.values(data).some(value => sqlRegex.test(value));
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});