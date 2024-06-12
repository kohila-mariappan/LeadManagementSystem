const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')
const excelJS = require("exceljs");
const fs = require('fs');
const request = require('request')



const leadCreation  = async(req,res) =>{
    try{
        let {FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source} = req.body
        let findLead = await findOldLead(Email)
        console.log('findLead',findLead,findLead.length)
        console.log('Source',Source)
        if((Source === 'NULL') || (Source === '') || (Source === 'null')){
            Source = 1 
            console.log('null/empty') 
        }else{
            let findSource = await findSourceName(Source)
            if(findSource.length>0){
                Source = findSource[0].SourceId
            }else{
            let newSource = await insertNewSource(Source)
            if(newSource.length>0){
                let data = await getSourceId()
                Source = data[0].SourceId
            }else{
                let msg = 'Failed to add New Source'
                statusCode.successResponse(res,msg)
            }
            }       
        }
        console.log('Source',Source)

        if(findLead.length == 0){
            let creationData = await newLead(FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source)
        if(creationData.length>0){
            let getId = await getnewId()
            if(getId.length>0){
                let emailId = getId[0].Email
                let msg = `Lead-${emailId}-Created Successfully`
                statusCode.successResponseForCreation(res,msg)
                let LeadId = getId[0].LeadId
                let LeadCreationLog = await ActivityLog(LeadId,msg)
                let sendMail = await sendEmail(emailId)
            }else{
                let msg = 'Lead Creation Failed'
                statusCode.successResponse(res,msg)
            }           

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

let findSourceName = async (Source) =>{
    try{
        console.log('enter find source')
        let data = await db.sequelize.query("EXEC findSourceName @src = '"+Source+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error",err)
        return err
    }

}
let insertNewSource = async (Source) =>{
    try{
        let data = await db.sequelize.query("EXEC insertSource @source = '"+Source+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data
    }catch(err){
        console.log("DB Error",err)
        return err
    }
}

let getSourceId  = async () =>{
    try{
        let data = await db.sequelize.query("EXEC getSourceId",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("DB Error",err)
        return err
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

let getnewId = async()=>{
    try{
        let data = await db.sequelize.query("EXEC getLeadId",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("db-error",err)
        return err;
    }
}

let sendEmail = async(emailId) =>{
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
                    html: `<html><head><style>\n</style></head><body>\n   Lead -${emailId}-Created Successfully \n<p>Regards,<br>cluBITS</p>\n</body></html>`,
                    subject: 'Lead Created'
                },
                recipients: {to: [{address: emailId}]}
            },
            json: true
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
        });

    }catch(err){
        console.log('Email Sending Error',err)
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
            console.log('data',data)
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
            let data = await leadStatus(StatusId)
            console.log('data',data)
            if(data.length>0){
                let msg = `Lead Status ${data[0].StatusName}Updated Successfully`
                let statusLog = await ActivityLog(LeadId,msg)
                //let findLead = await FindLeadInteraction(LeadId)
                // console.log('findLead',findLead,findLead.length)
                // if(findLead.length>0){
                //     let interactiondata = await updateInteractionData(LeadId,InteractionType,Notes)
                //     // let logmsg = "Interaction details Updated Successfully"
                //     // let interactiondataLog = await InteractionLog(LeadId,InteractionId,logmsg)
                //     let msg = 'Lead Details Updated Successfully'
                //     statusCode.successResponseForCreation(res,msg)
    
                // }else{
                let interactiondata = await InsertInteractionData(LeadId,InteractionType,Notes)
                let getId = await getInteractionId()
                console.log('getId',getId,getId.length)
                if(getId.length>0){
                    let InteractionId= getId[0].InteractionId
                    let logmsg = `Interaction Type : ${getId[0].InteractionType} and Notes: ${getId[0].Notes}  Updated Successfully`
                    let interactiondataLog = await InteractionLog(LeadId,InteractionId,logmsg)
                    let msg = 'Lead Updated Successfully'
                    statusCode.successResponseForCreation(res,msg)
                }else{
                    let msg = "Lead Interaction Updated Failed"
                    statusCode.successResponse(res,msg)
                }
            //}

            }else{
                let msg = 'Invalid Status'
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

  let FindLeadInteraction = async (LeadId) =>{
    try{
        console.log('data',LeadId)
        let data = await db.sequelize.query("exec FindLeadInteraction @lead='"+LeadId+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }
  }

  let leadStatus = async (StatusId) =>{
    try{
        let data = await db.sequelize.query("exec updatedStatus @stat='"+StatusId+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }

  }

  let updateLeadStatus = async (LeadId,StatusId) =>{
    try{
        console.log('data',LeadId,StatusId)
        let data = await db.sequelize.query("exec updateLeads @lead='"+LeadId+"',@stat='"+StatusId+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data[0]
    
      }catch(err){
          console.log("DB Error",err)
          return err
      }
  }

  let InsertInteractionData = async(LeadId,InteractionType,Notes) =>{
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

  let updateInteractionData = async(LeadId,InteractionType,Notes) =>{
    try{
        console.log('data',LeadId,InteractionType,Notes)
        let data = await db.sequelize.query("exec updateInteraction @lead='"+LeadId+"',@type='"+InteractionType+"',@note='"+Notes+"'",{ 
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
  let ImportLeads = async (req,res) =>{
    try{
        console.log('req',req)
        let {ip,location} = req.body
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
          }
                   
    let path = "public/" + req.file.filename;
    console.log('path',path)
    const workbook = new excelJS.Workbook();
    try {
       let data = await workbook.xlsx.readFile(path);
        console.log('data',data)
        const worksheet = workbook.getWorksheet('Sheet1')
        const allRows = []
        console.log('worksheet.actualRowCount',worksheet.actualRowCount,worksheet.columnCount)
        for (let rowIndex = 2; rowIndex <= worksheet.actualRowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex);  // Get the row object
      //console.log('row',row)
            // Create an empty array to store values from the current row
            const rowValues = [];
      
            // Loop through each cell in the row and get its value
            for (let colIndex = 1; colIndex <= worksheet.columnCount; colIndex++) {
              const cellValue = worksheet.getCell(rowIndex,colIndex).value;
              //console.log('cellValue',cellValue)
              rowValues.push(cellValue);
            }
      //console.log('rowValues',rowValues)
            allRows.push(rowValues); // Add the row's values to the allRows array
          }
          let validation = await validateData(allRows)
          console.log('validation',validation)
          const allRowsString = JSON.stringify(allRows)
          console.log('allRowsString',allRowsString)
          let insertLeads = await insertImportData(allRowsString,ip,location)
          console.log('insertLeads',insertLeads)
          if(insertLeads.length>0){
            let msg = 'List of Leads created Successfully'
            statusCode.successResponseForCreation(res,msg)
          }else{
            let msg = 'Failed to create List of Leads'
            statusCode.successResponse(res,msg)
          }      
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        // Handle error appropriately
      }   
    
    }catch(err){
        console.log("Error",err)
        statusCode.errorResponse(res,err)
    }
  }

  let validateData = async(data) => {
    const validRows = [];

    for (let i=0;i<data.length;i++){
        console.log('input',data[i])
        let datas = await validate(data[i])
        if(datas = "SUCCESS"){
            validRows.push(data[i])
        }else{
            continue
        }
    }    
    console.log('validRows',validRows)
  
    return validRows;
  }

  let validate = async(data)=>{
    console.log('data1',data)
    let row = data
      // Basic data type and presence validation (modify as needed)
     if(!row[0] || typeof row[0] != 'string'){
        return 'FirstName must be a Characters.not accept empty value'
     }else if(!row[1] || typeof row[1] != 'string'){
        return 'FirstName must be a Characters.not accept empty value'
     }else if(!row[2] || !/^\S+@\S+\.\S+$/.test(row[2].text)){
        return 'invalid email'
     }else if(!row[3] || typeof row[3] != 'number' || row[3].toString().length !== 10){
        return 'invalid Phone number'
     }else if(!row[4] || typeof row[4] != 'string'){
        return 'Invalid Product Name'
     }else{
        return 'validation Success'
     }
    }

  let insertImportData = async (excelDataString,ip,loc) =>{
    try{
       // console.log('data',leadId)
            let data = await db.sequelize.query("exec importleaddata @json='"+excelDataString+"',@ip = '"+ip+"',@loc='"+loc+"'",{ 
              type: Sequelize.QueryTypes.RAW
              })
             console.log('log',data)
             return data

    }
    catch(err){
        console.log("Db Error",err)
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
    HistoryList,
    ImportLeads
}