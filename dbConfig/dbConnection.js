const dbConfig = require('./dbConfig')

const  { Sequelize } = require('@sequelize/core');
const { MsSqlDialect } = require('@sequelize/mssql');
const mssql = require('mssql')
const port  = parseInt(dbConfig.PORT)

 const sequelizeInstance = new Sequelize(
   
  {
  dialect: MsSqlDialect,
  url: dbConfig.url,
  port: port,
  database: dbConfig.DB,
  trustServerCertificate: true,
  
    authentication: {
    type: dbConfig.authentication.type,

    options: {
      userName: dbConfig.authentication.options.userName,
      password: dbConfig.authentication.options.password,
   
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
   },
  
}
);

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelizeInstance

db.sequelize.sync({ force: false })
  .then(() => {
    console.log('yes re-sync done! and db connected successfully')
  })
  .catch((err)=>{
    console.log('Error:',err)
  })

module.exports = db