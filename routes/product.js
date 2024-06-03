const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product')


router.get('/list',ProductController.ProductList)


module.exports = router