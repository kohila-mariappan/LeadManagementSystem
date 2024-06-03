const express = require('express')
const app = express()

const LeadRoutes = require('./leads')
const ProductRoutes = require('./product')
const UserRoutes = require('./users')

app.use('/leads',LeadRoutes)
app.use('/products',ProductRoutes)
app.use('/users',UserRoutes)

module.exports = app