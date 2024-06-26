const express = require('express')
const app = express()

const LeadRoutes = require('./leads')
const ProductRoutes = require('./product')
const UserRoutes = require('./users')
const ConversationRoutes = require('./conversation')
const CommentRoutes = require('./comments')

app.use('/leads',LeadRoutes)
app.use('/products',ProductRoutes)
app.use('/users',UserRoutes)
app.use('/send',ConversationRoutes)
app.use('/comment',CommentRoutes)

module.exports = app