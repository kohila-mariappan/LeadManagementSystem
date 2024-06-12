const express = require('express')
const router = express.Router()
const LeadController = require('../controllers/leads')
const multer = require('multer')
const upload = require("../middleware/upload");
//const upload = multer({ dest: "puplic/" });
let type = upload.single('file');



router.post('/creation',LeadController.leadCreation)
router.get('/list',LeadController.leadsList)
router.post('/leadDetails',LeadController.LeadDetails)
router.get('/export',LeadController.LeadExport)
router.get('/status/list',LeadController.LeadStatusList)
router.post('/assignto/user',LeadController.AssignToUser)
router.post('/update/details',LeadController.UpdateLeadDetails)
router.get('/source/list',LeadController.SourceList)
router.get('/interaction/type/list',LeadController.interactionTypes)
router.post('/history/list',LeadController.HistoryList)
router.post('/import',type,LeadController.ImportLeads)
router.get('/sample/sheet',LeadController.SampleSheet)


module.exports = router