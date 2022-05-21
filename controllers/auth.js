const express = require('express');
const db = require('../config/db-config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// bcrypt settings
const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds)
const expirationTime = "1d"

// functions
function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_KEY_TOKEN, {expiresIn: expirationTime})
}

function generateRefreshToken(user){
  return jwt.sign(user, process.env.REFRESH_KEY_TOKEN, {expiresIn: expirationTime})
}

// middlewares
const verifyJwt = (req, res, next) => {
  const token = req.headers["x-access-token"]
  if(!token) res.status(403).send("Token is required!")
  
  jwt.verify(token, process.env.access_key_token, (err, user)=>{
      if(err) res.status(403).json({
          auth: false,
          message: "Authentication failed!",
          error: err
      })
      next();
  })
}

// register user
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) res.json({ status: 'error',  error: 'Please enter email, password and role.' });
  else {
    db.query('SELECT email from users WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;
      if (result[0]) return res.json({ status: 'err', error: 'Email has already been registered'});
      else {
        const Hpassword = bcrypt.hashSync(req.body.password, salt)
        db.query('INSERT INTO users SET ?', { email: email, password: Hpassword, role: role, createdAt: new Date(Date.now()), updatedAt: new Date(Date.now()) }, (error, results) => {
          if (err) throw err;
          return res.json({ status: 'success', error: 'User has been registered'});
        });
      }
    });
  }
})

// login user
router.post('/login', async (req, res) => {
  const emailadd = req.body.email
    
  if(!req.body.password){
      res.status(403).json({
          message: "Password is required!"
      })
  }

  db.query(`SELECT * FROM users where email = '${emailadd}'`, async (err, tableres)=>{
    if(err) {
        res.status(403)
    };

    if(!tableres || tableres.length === 0) {
      res.status(404).json({
        message: "No user found."
      });
    } else{
      if(tableres.length > 1){
          res.status(402).json({
              message: "There are already an account linked to this email."
          });
      } else {
          const user = tableres[0]

          if(!await bcrypt.compare(req.body.password, user.password)) res.status(401).json({ message: "Invalid password!" });

          else {
            const accessToken = generateAccessToken({user: user})
            const refreshToken = generateRefreshToken({user: user})

            res.json({
                auth: true,
                message: "Successfully logged-in!",
                accessToken: accessToken,
                refreshToken: refreshToken,
                user
            });
          }
      }
    }
  }) 
});



module.exports = router
