const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')
const excelJS = require("exceljs");



const leadCreation  = async(req,res) =>{
    try{
        let {FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source} = req.body
        let findLead = await findOldLead(Email)
        console.log('findLead',findLead,findLead.length)
        if(findLead.length == 0){
            let creationData = await newLead(FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source)
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

let newLead = async (FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source) =>{
    try{
        let data = await db.sequelize.query("EXEC createLeads @first = '"+FirstName+"',@last = '"+LastName+"',@email = '"+Email+"',@phne = '"+Phone+"',@prod = '"+ProductId+"',@loc = '"+LeadLocation+"',@ip = '"+IPAddress+"',@src = '"+Source+"' ",{
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

let LeadStatusList = async (req,res) =>{
    try{
        let data = await allLeadStatus()
        if(data.length>0){
            let msg = 'Status List'
            statusCode.successResponseWithData(res,msg,data)
        }
        else{
            let msg = 'Status are Not Exist'
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
}

let allLeadStatus = async()=>{
    try{
        let data = await db.sequelize.query("EXEC LeadStatusList ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("Error",err)
        return err
    }
}


const AssignToUser = async(req,res) =>{
    try{
      let {LeadId,UserId} = req.body      
      let update = await updateUser(LeadId,UserId)
      console.log('update',update)
      if(update.length>0){
        let msg = 'Lead Assignned to User Successfully'
        statusCode.successResponseForCreation(res,msg)
      }else{
        let msg = 'User Updation Failed'
        statusCode.successResponse(res,msg)
      }
        let userName = await updatedUserName(UserId)
        console.log('userName',userName)
        let msg = `Lead Assigned To User-${userName[0].FullName} Successfully`
        let log = await ActivityLog(LeadId,msg)      
     }catch(err){
      console.log("error",err)
      statusCode.errorResponse(res,err)
    }
  }

  let updateUser = async(LeadId,UserId) =>{
    try{
      let data = await db.sequelize.query("Exec AssignToUser @lead = '" + LeadId+"',@usr = '"+UserId+"'", {
        type: Sequelize.QueryTypes.RAW
       })
       console.log('dataupdate',data)
       return data
    }catch(err){
      console.log('DB Error',err)
      return err
    }  
  }
 

  let updatedUserName = async(UserId) =>{
    try{
      let data = await db.sequelize.query("Exec updateUserName @usr = '"+UserId+"'", {
        type: Sequelize.QueryTypes.RAW
       })
       return data[0]
    }catch(err){
      console.log('Error',err)
      return err
    }
  
  }


  let UpdateLeadDetails = async(req,res) =>{
    try{
        let{LeadId,StatusId,InteractionType,Notes} = req.body
        let data = await updateLeadStatus(LeadId,StatusId)
        if(data.length>0){
            let msg = 'Lead Status Updated Successfully'
            let statusLog = await ActivityLog(LeadId,msg)
            let interactiondata = await updateInteractionData(LeadId,InteractionType,Notes)
            let getId = await getInteractionId()
            console.log('getId',getId,getId.length)
            if(getId.length>0){
                let InteractionId= getId[0].InteractionId
                let logmsg = "Interaction details Updated Successfully"
                let interactiondataLog = await InteractionLog(LeadId,InteractionId,logmsg)
                let msg = 'Lead Details Updated Successfully'
                statusCode.successResponseForCreation(res,msg)
            }else{
                let msg = "Lead Interaction Updated Failed"
                statusCode.successResponse(res,msg)
            }
        }else{
            let msg = "Lead Status Updation Failed"
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
  }

  let updateLeadStatus = async (LeadId,StatusId) =>{
    try{
        console.log('data',LeadId,StatusId)
        let data = await db.sequelize.query("exec updateLeads @lead='"+LeadId+"',@stat='"+StatusId+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }
  }

  let updateInteractionData = async(LeadId,InteractionType,Notes) =>{
    try{
        console.log('data',LeadId,InteractionType,Notes)
        let data = await db.sequelize.query("exec insertInteraction @lead='"+LeadId+"',@type='"+InteractionType+"',@note='"+Notes+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }

  }

  let ActivityLog = async(LeadId,msg)=>{
    try{
      console.log('data',LeadId,msg)
      let data = await db.sequelize.query("exec insertLog @lead='"+LeadId+"',@inter = Null ,@Act='"+msg+"'",{ 
        type: Sequelize.QueryTypes.RAW
        })
       console.log('log',data)
       return data
  
    }catch(err){
        console.log("DB Error",err)
        return err
    }
  }

  let getInteractionId = async()=>{
    try{
        let data = await db.sequelize.query("exec getInteractionId",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }
  }
  let InteractionLog = async(LeadId,InteractionId,logmsg)=>{
    try{
      console.log('data',LeadId,logmsg)
      let data = await db.sequelize.query("exec insertLog @lead='"+LeadId+"',@inter ='"+InteractionId+"',@Act='"+logmsg+"'",{ 
        type: Sequelize.QueryTypes.RAW
        })
       console.log('log',data)
       return data
  
    }catch(err){
        console.log("DB Error",err)
        return err
    }
  }

  let SourceList = async(req,res) =>{
    try{
        let data = await LeadSourceList()
        if(data.length>0){
            let msg = 'Source List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'Lead Sources are not Exist'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        return err
    }
  }

  let LeadSourceList = async() =>{
    try{
        let data = await db.sequelize.query("exec LeadSourceList ",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data[0])
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }

  }

  let interactionTypes = async(req,res) =>{
    try{
        let data = await interactionTypeList()
        if(data.length>0){
            let msg = 'interaction Type List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'interaction Types are not Exist'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        return err
    }
  }

  let interactionTypeList = async() =>{
    try{
        let data = await db.sequelize.query("exec InteractionTypeList ",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data[0])
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }

  }

  let HistoryList = async(req,res) =>{
    try{
        let leadId = req.body.LeadId
        let data = await history(leadId)
        if(data.length>0){
            let msg = 'History List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'No history for the lead'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
  }

  let history = async (leadId) =>
    {
        try{
            console.log('data',leadId)
            let data = await db.sequelize.query("exec history @lead='"+leadId+"'",{ 
              type: Sequelize.QueryTypes.RAW
              })
             console.log('log',data)
             return data[0]
        
          }catch(err){
              console.log("DB Error",err)
              return err
          }

  }

module.exports ={
    leadCreation,
    leadsList,
    LeadDetails,
    LeadExport,
    LeadUpdate,
    LeadStatusList,
    AssignToUser ,
    UpdateLeadDetails,
    SourceList,
    interactionTypes,
    HistoryList
}