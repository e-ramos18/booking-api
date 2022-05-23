const express = require('express');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');

/* 
==========================
    SERVICES
==========================
*/
// GET services
router.get('/', async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)s
  */
  let sql = `SELECT * FROM services `
  req.query.search ? sql += `WHERE (name LIKE '%${req.query.search}%' OR description LIKE '%${req.query.search}%') `:null

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

// GET one service
router.get('/:id', async (req, res) => {
  let sql = `SELECT * FROM services WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
          res.send(err).status(403)
      }else{
          res.json(results).status(200)
      }
  })
})

// CREATE one services
router.post('/', async (req, res) => {
  const name = req.body.name
  const description = req.body.description

  let sql = `INSERT INTO services (name, description) VALUES ("${name}", "${description}")`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      res.send(err).status(400)
    }else{
      db.query(`SELECT * FROM services WHERE id=${results.insertId}`, (error, result, fields) => {
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

// EDIT one service
router.put('/:id', async (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const description = req.body.description
  const updated_at = moment(Date.now()).format('YYYY-MM-DD');

  let sql = `UPDATE services SET name="${name}", description="${description}", updated_at="${updated_at}" WHERE id=${id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      res.send(err).status(403)
    }else{
      db.query(`SELECT * FROM services WHERE id=${id}`, (error, result, fields) => {
        if(err){
          res.send(error).status(403)
        } else {
          res.status(200).json({
            message: "EDIT_SUCCESS",
            service: result[0]
          })
        }
      })
    }
  })
})

// DELETE one services
router.delete('/:id', async (req, res) => {
  let sql = `DELETE FROM services WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
          res.send(err).status(403)
      } else {
        res.status(200).json({
          message: "DELETE_SUCCESS",
          service: {}
        })
      }
  })
})

module.exports = router
