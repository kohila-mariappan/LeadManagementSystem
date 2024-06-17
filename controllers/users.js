const db = require('../dbConfig/dbConnection.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')


let UserList = async(req,res) =>{
    try{
      let data = await users()
      if(typeof data !== 'string'){
        let msg = "User List"
        statusCode.successResponseWithData(res,msg,data)
  
      }else{
        let msg = `Users are Not Exist.${data}`
        statusCode.successResponse(res,msg)
      }
  
    }catch(err){
      console.log("Error",err)
      let msg = `Failed to get User List.${err}`
        statusCode.errorResponse(res,msg)
      }
  }
  
  let users = async()=>{
    try{
      let data = await db.sequelize.query("Exec UsersList ", {
        type: Sequelize.QueryTypes.RAW
       })
       console.log('data',data)
       return data[0]
    }catch(err){
      console.log("Error",err.message)
      return err.message
    }
  }

  module.exports = {
    UserList
  }