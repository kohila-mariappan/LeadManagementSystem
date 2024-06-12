const express = require('express');
const app = express();
require('dotenv').config()
const statusCode = require('./utils/statusCode.js')
const bodyParser = require('body-parser')
// app.use(bodyParser.json())
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

global.__basedir = __dirname + "/";



// Sample Api
app.get('/',async(req,res)=>{
     res.send('Welcome to HelpDesk')
})

//Api routes

const routes = require('./routes/index.js');
app.use('/', routes)
app.use('/public', express.static(__dirname + '/public'));


//Api Details
app.listen(process.env.API_PORT)
console.log(`Users listening at http://localhost:${process.env.API_PORT}`)

// //Db Details
 const db = require('./dbConfig/dbConnection.js')
 db.sequelize.sync()

// catch 404 and forward to error handler
app.use(function (_req, res) {
  const message = ' No such route exists'
  statusCode.notFoundResponse(res, message)
})

// error handler
app.use(function (_err, _req, res) {
  const message = 'Error Message'
  statusCode.errorResponse(res, message)
})

module.exports = app

