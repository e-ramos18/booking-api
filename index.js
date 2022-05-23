const express = require('express');
const cors = require('cors')
const db = require('./config/db-config');
const app = express();
const cookie = require('cookie-parser');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(cookie());
app.use(express.json());
db.connect((err) => {
  if (err) throw err;
});

app.use('/api/auth', require('./controllers/auth'));
app.use('/api/admin/barangay', require('./routes/admin/admin.barangay'));

app.listen(
  PORT,
  console.log(
    `Server running in mode on PORT ${PORT}`
  ),
);
