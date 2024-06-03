const express = require('express')
const router = express.Router()
const UserController = require('../controllers/users')


router.get('/list',UserController.UserList)


module.exports = router