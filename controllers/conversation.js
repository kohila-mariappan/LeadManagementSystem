const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')
const request = require('request')


const SendEmail = async(req,res) =>{
    try{
        let {FromMail,ToMail,Subject,Content,CC,Bcc} = req.body
        let SendEmail = await SendEmailToUser(FromMail,ToMail,Subject,Content,CC,Bcc)
        console.log('Email',SendEmail)
        if(SendEmail === 'Success'){
            statusCode.successResponse(res,SendEmail)
            let EmailLog = await ActivityLog(FromMail,ToMail,Subject,Content,CC,Bcc,SendEmail)
        }else{
            statusCode.successResponse(res,SendEmail)
        }
    }catch(err){
        statusCode.errorResponse(res,err)
    }
}

const SendEmailToUser = async(FromMail,ToMail,Subject,Content,CC,Bcc) =>{
    try{
        const options = {
            method: 'POST',
            url: 'http://localhost:7027/api/email/azure',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic Y29tbXVuaWNhdGlvbi1zZXJ2aWNlOnJyNlA2SG9MclFJT2psM0loMU5yXw=='
            },
            body: {
                content: {
                    html: `<html><head><style>\n</style></head><body>\n ${Content} \n<p>Regards,<br>cluBITS</p>\n</body></html>`,
                    subject: `${Subject}`
                },
                recipients: {to: [{address: ToMail}]}
            },
            json: true
        };
        const response = await new Promise((resolve, reject) => {
            request(options, function (error, res, body) {
                if (error) return reject(error);
                console.log('body',body)
                resolve({ success: body.success }); // Assuming response structure
              });
        })
        const emailStatus = response.success ? 'Success' : 'Failed';
        console.log('data:', emailStatus);
        return emailStatus
        
    }catch(err){
        console.log('Email Sending Error',err)
        return err
    }
}

let ActivityLog = async (FromMail,ToMail,Subject,Content,CC,Bcc,Status) =>{
try{
    let data = await db.sequelize.query("EXEC InsertEmailActivityLog @from = '"+FromMail+"',@to = '"+ToMail+"',@sub = '"+Subject+"',@con = '"+Content+"',@cc = '"+CC+"',@bcc = '"+Bcc+"',@stat = '"+Status+"' ",{
        type: Sequelize.QueryTypes.RAW})
        return data
}catch(err){
    console.log("DB Error")
    return err
}
}

let EmailHistory = async (req,res) =>{
    try{
        let email = req.body.Email
        let data = await EmailHistoryList(email)
        if(data.length>0){
            let msg = 'Email History'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'Email conversation has been Empty'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log(err)
        statusCode.errorResponse(res,err)
    }
}

let EmailHistoryList = async(email) =>{
    try{
        let data = await db.sequelize.query("EXEC EmailHistory @email = '"+email+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error")
        return err
    }

}
 
module.exports = {
    SendEmail,
    EmailHistory
}