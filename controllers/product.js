const db = require('../dbConfig/dbConnection.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')

let ProductList = async (req,res) =>{
    try{
        let data = await allProducts()
        if(Array.isArray(data)){
            let msg = 'Products List'
            statusCode.successResponseWithData(res,msg,data)
        }
        else{
            let msg = `Products are Not Exist.${data}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        let msg = `Failed to get Product List.${err}`
        statusCode.errorResponse(res,msg)
    }
}

let allProducts = async()=>{
    try{
        let data = await db.sequelize.query("EXEC ProductList ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("Error",err.message)
        return err.message
    }
}

module.exports = {
    ProductList
}