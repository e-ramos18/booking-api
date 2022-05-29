const express = require('express');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect, authorize } = require('../../middleware/auth');

/* 
==========================
    SCHEDULES
==========================
*/

// get schedules
router.get('/', protect, async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)s
  */
  let sql = `SELECT * FROM schedules `
  req.query.search ? sql += `WHERE sched_date LIKE '%${req.query.search}%'`:null

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
        res.status(200).json({
          message: "SUCCESS",
          data: results,
          total: results.length
        })
    }
  })
})

// GET one schedule
router.get('/:id', protect, async (req, res) => {
  let sql = `SELECT * FROM schedules WHERE id=${req.params.id}`
  
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

// CREATE schedule
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  const { 
    serviceId,
    userId,
    schedDate,
    startTime,
    endTime
  } = req.body;

  let sql = `INSERT INTO schedules (service_id, user_id, sched_date, start_time, end_time, is_available) VALUES (${serviceId}, ${userId}, "${schedDate}", "${startTime}", "${endTime}",${true})`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(400)
    }else{
      db.query(`SELECT * FROM schedules WHERE id=${results.insertId}`, (error, result, fields) => {
        if(error){
          res.send(error).status(400)
        } else {
          res.status(201).json({
            message: "SUCCESS",
            data: result[0]
          })
        }
      })
    }
  })
})

// EDIT one schedule
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
  const id = req.params.id
  const { 
    schedDate,
    startTime,
    endTime
  } = req.body;
  const updated_at = moment(Date.now()).format('YYYY-MM-DD HH:mm');

  let sql = `UPDATE schedules SET sched_date="${schedDate}", start_time="${startTime}", end_time="${endTime}", updated_at="${updated_at}" WHERE id=${id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(403)
    }else{
      db.query(`SELECT * FROM schedules WHERE id=${id}`, (error, result, fields) => {
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

// DELETE one schedule
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  let sql = `DELETE FROM schedules WHERE id=${req.params.id}`
  
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
