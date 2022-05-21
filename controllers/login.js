const jwt = require('jsonwebtoken');
const db = require('../config/db-config');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) res.json({ status: 'error',  error: 'Please enter your email and password' });
  else {
    db.query('SELECT email from users WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;
      if (!result[0] || !await bcrypt.compare(password, result[0].password)) return res.json({ status: 'err', error: 'Incorrect email or password.'});
      else {
        const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES,
          httpOnly: true
        });
        const cookieOptions = {
          expiresIn: new  Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
          httpOnly: true
        }
        res.cookie('userRegistered', token, cookieOptions);
        return res.json({ status: 'success', success: 'User has been logged in'});
      }
    });
  }  
};
