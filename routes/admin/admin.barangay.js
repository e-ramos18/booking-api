const express = require('express');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect } = require('../../middleware/auth');

/* 
==========================
    BARANGAYS
==========================
*/
// GET barangays
router.get('/', protect, async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)
  */
  let sql = `SELECT * FROM barangay `
  req.query.search ? sql += `WHERE (name LIKE '%${req.query.search}% OR address LIKE '%${req.query.search}%)' `:null

  if (req.query.sort) {
    sql += `ORDER BY ${req.query.sort} DESC `
  } else {
    sql += `ORDER BY created_at DESC `
  }

  req.query.limit ?sql += `LIMIT ${req.query.limit} `:null
  req.query.page ?sql += `OFFSET ${(req.query.page-1) * req.query.limit} `:null
  
  db.query(sql, (err, results, fields) => {
    if(err){
        res.send(err).status(403)
    }else{
        res.json(results).status(200)
    }
  })
})

// GET one barangay
router.get('/:id', protect, async (req, res) => {
  let sql = `SELECT * FROM barangay WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
          res.send(err).status(403)
      }else{
          res.json(results).status(200)
      }
  })
})

// CREATE one barangay
router.post('/', protect, async (req, res) => {
  const name = req.body.name
  const address = req.body.address

  let sql = `INSERT INTO barangay (name, address) VALUES ("${name}", "${address}")`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      res.send(err).status(400)
    }else{
      db.query(`SELECT * FROM barangay WHERE id=${results.insertId}`, (error, result, fields) => {
        if(error){
          res.send(error).status(400)
        } else {
          res.status(201).json({
            message: "CREATE_SUCCESS",
            barangay: result[0]
          })
        }
      })
    }
  })
})


// EDIT one barangay
router.put('/:id', protect, async (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const address = req.body.address
  const updated_at = moment(Date.now()).format('YYYY-MM-DD');

  let sql = `UPDATE barangay SET name="${name}", address="${address}", updated_at="${updated_at}" WHERE id=${id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      res.send(err).status(403)
    }else{
      db.query(`SELECT * FROM barangay WHERE id=${id}`, (error, result, fields) => {
        if(err){
          res.send(error).status(403)
        } else {
          res.status(200).json({
            message: "EDIT_SUCCESS",
            barangay: result[0]
          })
        }
      })
    }
  })
})

// DELETE one barangay
router.delete('/:id', protect, async (req, res) => {
  let sql = `DELETE FROM barangay WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
          res.send(err).status(403)
      } else {
        res.status(200).json({
          message: "DELETE_SUCCESS",
          barangay: {}
        })
      }
  })
})


module.exports = router
