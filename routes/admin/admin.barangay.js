const express = require('express');
const db = require('../../config/db-config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* 
==========================
    BARANGAYS
==========================
*/
// GET barangays
router.get('/barangay', async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)
  */
  let sql = `SELECT * FROM barangay `
  req.query.search ? sql += `WHERE name LIKE '%${req.query.search}%' `:null

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
router.get('/barangay/:id', async (req, res) => {
  let sql = `SELECT * FROM barangay WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
          res.send(err).status(403)
      }else{
          res.json(results).status(200)
      }
  })
})

// EDIT one barangay
router.put('/barangay/:id', async (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const address = req.body.address

  let sql = `UPDATE barangay SET name="${name}", address="${address}" WHERE id=${id}`
  
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
router.delete('/barangay/:id', async (req, res) => {
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
