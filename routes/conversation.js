const express = require('express')
const router = express.Router()
const ConController = require('../controllers/conversation')


router.post('/email',ConController.SendEmail)
router.post('/email/history',ConController.EmailHistory)
router.post('/sms',ConController.SendSms)
router.post('/sms/history',ConController.SMSHistory)

module.exports = router