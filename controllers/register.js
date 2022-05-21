const db = require('../config/db-config');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  const { email, password: Npassword } = req.body;
  if (!email || !Npassword) res.json({ status: 'error',  error: 'Please enter your email and password' });
  else {
    db.query('SELECT email from users WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;
      if (!result[0]) return res.json({ status: 'err', error: 'Email has already been registered'});
      else {
        const password = bcrypt.hash(Npassword, 8);
        db.query('INSERT INTO users SET ?', { email: email, password: password }, (error, results) => {
          if (err) throw err;
          return res.json({ status: 'success', error: 'User has been registered'});
        });
      }
    });
  }
};

module.exports = register;
