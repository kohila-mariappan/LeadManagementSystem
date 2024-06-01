const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')
const excelJS = require("exceljs");



const leadCreation  = async(req,res) =>{
    try{
        let {FirstName,LastName,Email,Phone,ProductId} = req.body
        let findLead = await findOldLead(Email)
        console.log('findLead',findLead,findLead.length)
        if(findLead.length == 0){
            let creationData = await newLead(FirstName,LastName,Email,Phone,ProductId)
        if(creationData.length>0){
            let msg = 'Lead Created Successfully'
            statusCode.successResponseForCreation(res,msg)
        }else{
            let msg = 'Lead Creation Failed'
            statusCode.successResponse(res,msg)
        }
        }else{
            console.log('data',findLead[0].Email)

            let msg = findLead[0].Email +"-" +'Lead already Exist!'
            statusCode.successResponse(res,msg)
        }       

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

let findOldLead = async(Email) =>{
    try{
        let data = await db.sequelize.query("EXEC FindLead @email = '"+Email+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error",err)
        return err
    }
}

let newLead = async (FirstName,LastName,Email,Phone,ProductId) =>{
    try{
        let data = await db.sequelize.query("EXEC createLeads @first = '"+FirstName+"',@last = '"+LastName+"',@email = '"+Email+"',@phne = '"+Phone+"',@prod = '"+ProductId+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data

    }catch(err){
        console.log("DB Error",err)
        return err
    }
}

let leadsList = async(req,res) =>{
    try{
        let LeadsDetails = await getAllLeads()
        if(LeadsDetails.length>0){
            let msg = "Leads List"
            statusCode.successResponseWithData(res,msg,LeadsDetails)
        }else{
            let msg = 'Leads are not Exist!'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

let getAllLeads = async()=>{
    try{
        let data = await db.sequelize.query("EXEC LeadsList ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("Error",err)
        return err
    }
}

let LeadDetails = async(req,res) =>{
    try{
        let leadId = req.body.leadId
        let data = await leadData(leadId)
        console.log('data',data,data.length)
        if(data.length>0){
            let msg = 'Lead Details'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'Invalid Lead Id'
            statusCode.successResponse(res,msg)

        }

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

let leadData = async(leadId) =>{
    try{
        let data = await db.sequelize.query("EXEC singleLeadDetails @lead = '"+leadId+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        return err
    }
}

let LeadExport = async(req,res) =>{
    try{
      let datas = await getAllLeads()
      let LeadData = datas
      console.log('lead list',LeadData )
  
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Lead List");
      let path = "public/"
      worksheet.columns = [
        { header: "S no.", key: "s_no", width: 10 }, 
        { header: "LeadId", key: "lead", width: 10 },
        { header: "FirstName", key: "first", width: 15 },
        { header: "LastName", key: "last", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phne", width: 10 },
        { header: "ProductId", key: "pid", width: 10 },
        { header: "InterestLevel", key: "level", width: 15 },
        { header: "SourceId", key: "src", width: 10 },
        { header: "StatusId", key: "stat", width: 10 },
        { header: "AssignedToUserID", key: "asn", width: 18 },
        { header: "LeadLocation", key: "loc", width: 15 },
        { header: "IPAddress", key: "ip", width: 15 },
        { header: "Referredby", key: "ref", width: 15 },
        { header: "LastContactDate", key: "con", width: 18 },
        { header: "NextStep", key: "next", width: 20 },
        { header: "NextFollowUpDate", key: "nextf", width: 20 },
        { header: "Notes", key: "note", width: 30 }
    ];
    // Looping through User data
  let counter = 1;
  LeadData.forEach((data) => {
    console.log('LeadData',data,data.LeadId)
    data.s_no = counter;
    data.lead = data.LeadId
    data.first= data.FirstName
    data.last = data.LastName
    data.email = data.Email
    data.phne = data.Phone
    data.pid= data.ProductId
    data.level = data.InterestLevel
    data.src = data.SourceId
    data.stat = data.StatusId
    data.asn= data.AssignedToUserID
    data.loc = data.LeadLocation
    data.ip = data.IPAddress
    data.ref = data.Referredby
    data.con = data.LastContactDate
    data.next = data.NextStep
    data.nextf = data.NextFollowUpDate
    data.note = data.notes
    console.log('sheeetdata',worksheet.addRow(data)); // Add data in worksheet
    counter++;
  });
  
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  
  let date = new Date()
  let currentDate = date.getTime()
  console.log('date',currentDate)
  try {
  console.log("expath",currentDate)
    const Exceldata = await workbook.xlsx.writeFile(`${path}${currentDate}.xlsx`)
     .then(() => {
       res.send({
         status: "success",
         message: "file successfully downloaded",
         path: `${path}${currentDate}.xlsx`
        });
     });
  } catch (err) {
      res.send({
      status: "error",
      message: "Something went wrong",
    });
    } 
  
    }catch(err){
      console.log("Error",err)
      statusCode.errorResponse(res,err)
    }
}

let LeadUpdate = async(req,res) =>{
    try{

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

module.exports ={
    leadCreation,
    leadsList,
    LeadDetails,
    LeadExport,
    LeadUpdate
}