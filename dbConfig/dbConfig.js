module.exports = {

    HOST: process.env.HOST,    
    DB: process.env.DB,
    PORT: process.env.DB_PORT,
  
  dialect: process.env.dialect,
  url: process.env.url,
  trustServerCertificate: true,
    authentication: {
      type: process.env.type,  
      options: {
        userName: process.env.user,
        password: process.env.password     
      }, 
    }, 
  
    pool: {
  
      max: 5,
  
      min: 0,
  
      acquire: 30000,
  
      idle: 10000
  
    }  
  }
