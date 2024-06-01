const express = require('express')
const app = express()

const LeadRoutes = require('./leads')

app.use('/leads',LeadRoutes)

module.exports = app