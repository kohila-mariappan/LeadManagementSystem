const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')

let CreateComment = async(req,res) =>{
    try{
        let {LeadId,Comments} = req.body
        let create = await createNewComment(LeadId,Comments)
        console.log('create',create)
        if(create.length>0){
            let msg = 'Comments created Successfully'
            statusCode.successResponseForCreation(res,msg)
        }else{
            let msg = 'Failed to Comments creation'
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("error",err)
        statusCode.errorResponse(res,err)
    }
}

let createNewComment = async (LeadId,Comments) =>{
    try{
        let data = await db.sequelize.query("EXEC insertComments @lead = '"+LeadId+"',@cmt = '"+Comments+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data
    }catch(err){
        console.log("DB Error",err.message)
        return err.message
    }
}

let CommentHistory = async(req,res) =>{
    try{
        let LeadId = req.body.LeadId
        let history = await LeadCommentHistory(LeadId)
        if(history.length>0){
            let msg = 'User Comments List'
            statusCode.successResponseWithData(res,msg,history)
        }else{
            let msg = 'Comments are not Exist'
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log('error',err)
        statusCode.errorResponse(res,err)
    }
}

let LeadCommentHistory = async(LeadId) =>{
    try{
        console.log(typeof LeadId)
        let data = await db.sequelize.query("EXEC CommentHistory @lead = '"+LeadId+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error",err.message)
        return err.message
    }

}

module.exports = {
    CreateComment,
    CommentHistory
}