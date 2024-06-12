const express = require('express')
const router = express.Router()
const ConController = require('../controllers/conversation')


router.post('/email',ConController.SendEmail)
router.post('/email/history',ConController.EmailHistory)

module.exports = router