const db = require('../dbConfig/dbConnection.js')
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
            let EmailLog = await ActivityLog(FromMail,ToMail,Subject,Content,CC,Bcc,SendEmail)
        }
    }catch(err){
        let msg = err + " " + 'Failed to send Email'
        statusCode.errorResponse(res,msg)
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

let SendSms = async(req,res) =>{
    try{
    let {SenderNo,ReceiverNo,Content} = req.body
    let SmsStatus = await sendSmsToUser(SenderNo,ReceiverNo,Content)
    if(SmsStatus === 'Success'){
        statusCode.successResponse(res,SmsStatus)
        let log = await SMSActivityLog(SenderNo,ReceiverNo,Content,SmsStatus)
        //let EmailLog = await ActivityLog(FromMail,ToMail,Subject,Content,CC,Bcc,SendEmail)
    }else{
        statusCode.successResponse(res,SmsStatus)
        let log = await SMSActivityLog(SenderNo,ReceiverNo,Content,SmsStatus)
    }
    }catch(err){
        let msg = err + " " + 'Failed To Send SMS'
        statusCode.errorResponse(res,msg)
    }
}

let sendSmsToUser = async(SenderNo,ReceiverNo,Content) =>{
    try{
        const request = require('request');
        const options = {
            method: 'POST',
            url: 'http://localhost:7027/api/sms/twilio',
            headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic Y29tbXVuaWNhdGlvbi1zZXJ2aWNlOnJyNlA2SG9MclFJT2psM0loMU5yXw=='
                },
                body: {body: `${Content}`, to: `${ReceiverNo}`},
                json: true
            };
            const response = await new Promise((resolve, reject) => {
                request(options, function (error, res, body) {
                    if (error) {
                        console.log('error',error)
                        return reject(error);
                    }
                    console.log('success body',body)
                    resolve(body); // Assuming response structure
                  });
            })
            const SmsStatus = !response.sid ? 'Failed' :'Success'  ;
            //console.log('data:', SmsStatus);
            return SmsStatus
    }catch(err){
        return err
    }
}

let SMSActivityLog= async(SenderNo,ReceiverNo,Content,SmsStatus) =>{
    try{
        let data = await db.sequelize.query("EXEC InsertSMSActivityLog @send = '"+SenderNo+"', @rec = '"+ReceiverNo+"', @con = '"+Content+"', @stat = '"+SmsStatus+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data
    }catch(err){
        console.log("DB Error")
        return err
    }

}

let SMSHistory = async(req,res) =>{
    try{
        let {ReceiverNo} = req.body
        let data = await UserSMSHistory(ReceiverNo)
        if(data.length>0){
            let msg = " SMS History"
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'SMS History Not Exist For this Receiver'
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        let msg = err + " " +'Error from view SMS History List'
        statusCode.errorResponse(res,err)
    }
}

let UserSMSHistory = async(Recevier) =>{
    try{
        let data = await db.sequelize.query("EXEC SMSHistroy @rec = '"+Recevier+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error")
        return err
    }
}
module.exports = {
    SendEmail,
    EmailHistory,
    SendSms,
    SMSHistory
}