const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect, authorize } = require('../../middleware/auth');
const sendEmail = require('../../utils/sendEmail');


/* 
==========================
    BOOKINGS of a service
==========================
*/

// get bookings by a service
router.get('/:serviceStaffId/bookings', protect, async (req, res) => {
  const serviceStaffId = req.params.serviceStaffId
  let sql = `SELECT * FROM bookings WHERE service_staff_id=${serviceStaffId}`
  
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

/* 
==========================
    SCEDHULES of a service
==========================
*/

// get schedules by a service
router.get('/:serviceStaffId/schedules', protect, async (req, res) => {
  const serviceStaffId = req.params.serviceStaffId
  let sql = `SELECT * FROM schedules WHERE user_id=${serviceStaffId}`
  
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
