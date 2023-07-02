CREATE TABLE IF NOT EXISTS students(
    [name] TEXT,
    [reg_date] TEXT,
    [receipt_no] TEXT,
    [phone] TEXT,
    [class] TEXT,
    [ID] TEXT,
    [total] DOUBLE,
    [email] TEXT,
    [birthday] TEXT,
    [cash_in] DOUBLE,
    [reminder] DOUBLE AS (total - cash_in),
    [completed] INTEGER AS (reminder == 0),
    [notes] TEXT,
    [isEjected] BOOLEAN DEFAULT 0
  );
-- INSERT INTO students(name) VALUES ('Ahmed');
-- SELECT * FROM students;