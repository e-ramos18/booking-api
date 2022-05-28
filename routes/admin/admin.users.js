const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db-config');
const router = express.Router();
const moment = require('moment');
const { protect, authorize } = require('../../middleware/auth');
// bcrypt settings
const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds)

/* 
==========================
    USERS
==========================
*/
// GET USERS
router.get('/', protect, authorize('admin'), async (req, res) => {
  /* 
    search: string
    limit: number
    page: number
    sort: string EX: (id || name)
  */
  let sql = `SELECT id, service_id, barangay_id, email, full_name, role, contact, type, created_at, updated_at FROM users `
  req.query.search ? sql += `WHERE (full_name LIKE '%${req.query.search}% OR email LIKE '%${req.query.search}%)' `:null

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
        res.status(200).json({
          message: "SUCCESS",
          data: results,
          total: results.length
        })
    }
  })
})

// GET one user
router.get('/:id', protect, async (req, res) => {
  let sql = `SELECT * FROM users WHERE id=${req.params.id}`
  
  db.query(sql, (err, results, fields) => {
      if(err){
        return res.send(err).status(400)
      }else{
        res.status(200).json({
          message: "SUCCESS",
          data: results[0]
        })
      }
  })
})

// CREATE one USER
router.post('/', protect, authorize('admin'), async (req, res) => {
  const password = '1234567';
  const  {
    serviceId,
    barangayId,
    email,
    fullName,
    role,
    contact,
    type,
  } = req.body;

  if (barangayId && serviceId) {
    return res.send({
      status: "BAD REQUEST",
      message: "Cannot have both service_id and barangay_id."
    }).status(400)
  }

  if (serviceId && role !== "SERVICE") {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be role SERVICE."
    }).status(400)
  }

  if (barangayId && role !== "BARANGAY") {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be role BARANGAY."
    }).status(400)
  }

  if (!barangayId && !serviceId && role !== "ADMIN") {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be role ADMIN."
    }).status(400)
  }

  if (barangayId && role === "BARANGAY" && (type !== null && type !== "BARANGAY_STAFF")) {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be type BARANGAY_STAFF."
    }).status(400)
  }

  if (serviceId !== null && role === "SERVICE" && (type !== null && type !== "SERVICE_STAFF")) {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be type SERVICE_STAFF."
    }).status(400)
  }

  if (barangayId === null && serviceId === null && role === "ADMIN" && type !== null) {
    return res.send({
      status: "BAD REQUEST",
      message: "Should be type null."
    }).status(400)
  }


  const Hpassword = bcrypt.hashSync(password, salt)
  let sql = `INSERT INTO users (service_id, barangay_id, email, full_name, password, role, contact, type) VALUES (${serviceId}, ${barangayId}, "${email}", "${fullName}", "${password}", "${role}", "${contact}", "${type}")`

  db.query('SELECT email from users WHERE email = ?', [email], async (err, result) => {
    if (err) {
      return res.send({
        status: "BAD REQUEST",
        message: "Should be type null."
      }).status(400)
    }
    if (result[0]) {
      return res.send({
        status: "BAD REQUEST",
        message: "Email already is already registered."
      }).status(400)
    }
    else {
      db.query(sql, (err, results, fields) => {
        if(err){
          return res.send(err).status(400)
        }else{
          db.query(`SELECT * FROM users WHERE id=${results.insertId}`, (error, result, fields) => {
            if(error){
              return res.send(error).status(400)
            } else {
              const user = result[0];
              delete user.password;
              
              return res.status(201).json({
                message: "SUCCESS",
                data: result[0]
              })
            }
          })
        }
      })
    }
  });
})

// EDIT one user
router.put('/:id', protect, async (req, res) => {
  const id = req.params.id
  const  {
    fullName,
    contact
  } = req.body;
  const updated_at = moment(Date.now()).format('YYYY-MM-DD');

  let sql = `UPDATE users SET full_name="${fullName}", contact="${contact}", updated_at="${updated_at}" WHERE id=${id}`
  
  db.query(sql, (err, results, fields) => {
    if(err){
      return res.send(err).status(400)
    }else{
      db.query(`SELECT * FROM users WHERE id=${id}`, (error, result, fields) => {
        if(err){
          return res.send(error).status(400)
        } else {
          const user = result[0];
          delete user.password;
          res.status(200).json({
            message: "SUCCESS",
            data: result[0]
          })
        }
      })
    }
  })
})

// DELETE one user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  let sql = `DELETE FROM users WHERE id=${req.params.id}`
  
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
