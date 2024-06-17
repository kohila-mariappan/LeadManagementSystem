const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')

let CreateComment = async(req,res) =>{
    try{
        let {LeadId,Comments} = req.body
        let create = await createNewComment(LeadId,Comments)
        console.log('create',create)
        if(typeof create !== 'string'){
            let msg = 'Comments created Successfully'
            statusCode.successResponseForCreation(res,msg)
        }else{
            let msg = `Failed to Comments creation.${create}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("error",err)
        let msg = `Failed to add Comments.${err}`
        statusCode.errorResponse(res,msg)
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
        if(typeof history !== 'string'){
            let msg = 'User Comments List'
            statusCode.successResponseWithData(res,msg,history)
        }else{
            let msg = `Comments are not Exist.${history}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log('error',err)
        let msg = `Failed to get history List.${err}`
        statusCode.errorResponse(res,msg)
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