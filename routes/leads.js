const express = require('express')
const router = express.Router()
const LeadController = require('../controllers/leads')


router.post('/creation',LeadController.leadCreation)
router.get('/list',LeadController.leadsList)
router.post('/leadDetails',LeadController.LeadDetails)
router.get('/export',LeadController.LeadExport)


module.exports = router