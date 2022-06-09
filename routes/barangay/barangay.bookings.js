const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect, authorize } = require('../../middleware/auth');
const sendEmail = require('../../utils/sendEmail');


/* 
==========================
    BOOKINGS
==========================
*/

// get bookings
router.get('/', protect, async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)s
  */
  let sql = `SELECT * FROM bookings `
  req.query.search ? sql += `WHERE (client_name LIKE '%${req.query.search}%' OR client_email LIKE '%${req.query.search}%') `:null

  if (req.query.sort) {
    sql += `ORDER BY ${req.query.sort} DESC `
  } else {
    sql += `ORDER BY created_at DESC `
  }

  req.query.limit ?sql += `LIMIT ${req.query.limit} `:null
  req.query.page ?sql += `OFFSET ${(req.query.page-1) * req.query.limit} `:null
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      db.query('SELECT * FROM bookings', (qErr, qResults, qFields) => {
        if(qErr){
          return res.send(qErr).status(400)
        }else{
          res.status(200).json({
            message: "SUCCESS",
            data: results,
            results: results.length,
            total: qResults.length
          })
        }
      })
    }
  })
})

// get bookings by a service staff
router.get('/service-staff/:id', protect, async (req, res) => {
/* 
  search: string
  limit: number
  page: number
  sort: string EX: (id || name)s
*/
  let sql = `SELECT * FROM bookings WHERE service_staff_id=${req.params.id} `
  req.query.search ? sql += `AND (client_name LIKE '%${req.query.search}%' OR client_email LIKE '%${req.query.search}%') `:null

  if (req.query.sort) {
    sql += `ORDER BY ${req.query.sort} DESC `
  } else {
    sql += `ORDER BY created_at DESC `
  }

  req.query.limit ?sql += `LIMIT ${req.query.limit} `:null
  req.query.page ?sql += `OFFSET ${(req.query.page-1) * req.query.limit} `:null
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      db.query('SELECT * FROM bookings', (qErr, qResults, qFields) => {
        if(qErr){
          return res.send(qErr).status(400)
        }else{
          res.status(200).json({
            message: "SUCCESS",
            data: results,
            results: results.length,
            total: qResults.length
          })
        }
      })
    }
  })
})

// get bookings by a barangay staff id
router.get('/barangay-staff/:id', protect, async (req, res) => {
/* 
  search: string
  limit: number
  page: number
  sort: string EX: (id || name)s
*/
  let sql = `SELECT * FROM bookings WHERE booked_by=${req.params.id} `
  req.query.search ? sql += `AND (client_name LIKE '%${req.query.search}%' OR client_email LIKE '%${req.query.search}%') `:null

  if (req.query.sort) {
    sql += `ORDER BY ${req.query.sort} DESC `
  } else {
    sql += `ORDER BY created_at DESC `
  }

  req.query.limit ?sql += `LIMIT ${req.query.limit} `:null
  req.query.page ?sql += `OFFSET ${(req.query.page-1) * req.query.limit} `:null

  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      db.query('SELECT * FROM bookings', (qErr, qResults, qFields) => {
        if(qErr){
          return res.send(qErr).status(400)
        }else{
          res.status(200).json({
            message: "SUCCESS",
            data: results,
            results: results.length,
            total: qResults.length
          })
        }
      })
    }
  })
})

// get bookings by a barangay id
router.get('/barangay/:id', protect, async (req, res) => {
  let sql = `SELECT * FROM bookings WHERE barangay_id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      res.status(200).json({
        message: "SUCCESS",
        data: results,
        total: results.length
      })
    }
  })
})

// GET one booking
router.get('/:id', protect, async (req, res) => {
  let sql = `SELECT * FROM bookings WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
        return res.send(err).status(403)
      }else{
          res.status(200).json({
            message: "SUCCESS",
            data: results[0]
          })
      }
  })
})

// CREATE booking
router.post('/', protect, authorize('BARANGAY'), async (req, res) => {
  const {
    serviceId,
    barangayId,
    schedId,
    serviceStaffId,
    clientName,
    clientContact,
    clientEmail
  } = req.body;

  const bookedBy = req.user.id;

  let sql = `INSERT INTO bookings (service_id, barangay_id, sched_id, booked_by, service_staff_id, client_name, client_contact, client_email) VALUES (${serviceId}, ${barangayId}, ${schedId}, ${bookedBy}, ${serviceStaffId}, "${clientName}", "${clientContact}", "${clientEmail}")`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(400)
    }else{
      db.query(`SELECT * FROM bookings WHERE id=${results.insertId}`, (error, result, fields) => {
        if(error){
          res.send(error).status(400)
        } else {
          const updated_at = moment(Date.now()).format('YYYY-MM-DD HH:mm');
          db.query(`UPDATE schedules SET is_available="${false}", updated_at="${updated_at}" WHERE id=${schedId}`, (errorSched, resultSched) => {
            if(errorSched){
              res.send(errorSched).status(400)
            } else {
              res.status(201).json({
                message: "SUCCESS",
                data: result[0]
              })
            }
          })
        }
      })
    }
  })
})

// EDIT one BOOKING
router.put('/:id', protect, authorize('BARANGAY'), async (req, res) => {
  const id = req.params.id
  const { 
    clientName,
    clientContact,
    clientEmail
  } = req.body;
  const updated_at = moment(Date.now()).format('YYYY-MM-DD HH:mm');

  let sql = `UPDATE bookings SET client_name="${clientName}", client_contact="${clientContact}", client_email="${clientEmail}", updated_at="${updated_at}" WHERE id=${id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      db.query(`SELECT * FROM bookings WHERE id=${id}`, (error, result, fields) => {
        if(err){
          return res.send(error).status(403)
        } else {
          res.status(200).json({
            message: "SUCCESS",
            data: result[0]
          })
        }
      })
    }
  })
})

// DELETE one booking
router.delete('/:id', protect, authorize('BARANGAY'), async (req, res) => {
  let sql = `DELETE FROM bookings WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
        return res.send(err).status(403)
      } else {
        res.status(200).json({
          message: "SUCCESS"
        })
      }
  })
})


module.exports = router
