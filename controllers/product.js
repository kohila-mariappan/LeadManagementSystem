const db = require('../dbConfig/dbConnection.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')

let ProductList = async (req,res) =>{
    try{
        let data = await allProducts()
        if(data.length>0){
            let msg = 'Products List'
            statusCode.successResponseWithData(res,msg,data)
        }
        else{
            let msg = 'Products are Not Exist'
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

let allProducts = async()=>{
    try{
        let data = await db.sequelize.query("EXEC ProductList ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("Error",err)
        return err
    }
}

module.exports = {
    ProductList
}