const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect, authorize } = require('../../middleware/auth');
const sendEmail = require('../../utils/sendEmail');


/* 
==========================
    services
==========================
*/

// get users that are service staff
router.get('/users', protect, async (req, res) => {
  let sql = `SELECT * FROM users INNER JOIN services ON users.service_id = services.id;`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      res.status(200).json({
        message: "SUCCESS",
        data: results,
        results: results.length
      })
    }
  })
})

module.exports = router
