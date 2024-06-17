const db = require('../dbConfig/dbConnection.js')
//const config = require('../config.js/dbConfig.js')
const { default: Sequelize } = require('@sequelize/core')
const statusCode = require('../utils/statusCode.js')
const excelJS = require("exceljs");
const fs = require('fs');
const request = require('request')



const leadCreation  = async(req,res) =>{
    try{
        let {FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source,ReferredBy,Notes} = req.body
        // let findLead = await findOldLead(Email)
        // console.log('findLead',findLead,findLead.length)
        //console.log('Source',Source)
        // if((Source === 'NULL') || (Source === '') || (Source === 'null')){
        //     Source = 1 
        //     console.log('null/empty') 
        // }else{
        //     let findSource = await findSourceName(Source)
        //     if(findSource.length>0){
        //         Source = findSource[0].SourceId
        //     }else{
        //     let newSource = await insertNewSource(Source)
        //     if(newSource.length>0){
        //         let data = await getSourceId()
        //         Source = data[0].SourceId
        //     }else{
        //         let msg = 'Failed to add New Source'
        //         statusCode.successResponse(res,msg)
        //     }
        //     }       
        // }
        // let source = await insertNewSource(Source)
        // console.log('Source',source[0].sourceId)
        // let SourceId = source[0].sourceId
 
        // if(findLead.length == 0){
        let creationData = await newLead(FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source,ReferredBy,Notes)
         if(typeof creationData !== 'string'){
        //     let getId = await getnewId()
        //     if(getId.length>0){
        //         let emailId = getId[0].Email
                let msg = `Lead-${Email}-Created Successfully`
                statusCode.successResponseForCreation(res,msg)
        //         let LeadId = getId[0].LeadId
                //let LeadCreationLog = await ActivityLog(LeadId,msg)
                let sendMail = await sendEmail(Email)
            }else{
                let msg =  `Lead Creation Failed.${creationData}`
                statusCode.successResponse(res,msg)
            }           

        // }else{
        //     let msg = 'Lead Creation Failed'
        //     statusCode.successResponse(res,msg)
        // }
        // }else{
        //     console.log('data',findLead[0].Email)

        //     let msg = findLead[0].Email +"-" +'Lead already Exist!'
        //     statusCode.successResponse(res,msg)
        // }       

    }catch(err){
        console.log("Error",err)
        let msg = 'Lead creation Failed.' + "" +err
        statusCode.errorResponse(res,msg)
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
            return data[0]
    }catch(err){
        console.log("DB Error",err.message)
        return err.message
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

let newLead = async (FirstName,LastName,Email,Phone,ProductId,LeadLocation,IPAddress,Source,ReferredBy,Notes) =>{
    try{
        let data = await db.sequelize.query("EXEC createLeads @first = '"+FirstName+"',@last = '"+LastName+"',@email = '"+Email+"',@phne = '"+Phone+"',@prod = '"+ProductId+"',@loc = '"+LeadLocation+"',@ip = '"+IPAddress+"',@source = '"+Source+"',@ref = '"+ReferredBy+"',@not = '"+Notes+"' ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]

    }catch(err){
        console.log("DB Error",err.message)
        return err.message
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
        if(typeof LeadsDetails !== 'string'){
            let msg = "Leads List"
            statusCode.successResponseWithData(res,msg,LeadsDetails)
        }else{
            let msg = `Leads are not Exist!${LeadsDetails}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        let msg = `Not getting Leads List.${err}`
        statusCode.errorResponse(res,msg)
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
        console.log('data',data)
        if(typeof data !== 'string'){
            let msg = 'Lead Details'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = `Not Getting Lead Details.${data}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        let msg = `Error: Getting Lead Details. ${err}`
        statusCode.errorResponse(res,msg)
    }
}

let leadData = async(leadId) =>{
    try{
        let data = await db.sequelize.query("EXEC singleLeadDetails @lead = '"+leadId+"' ",{
            type: Sequelize.QueryTypes.RAW})
            console.log('data',data)
            return data[0]
    }catch(err){
        console.log(`DbError.${err}`)
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
        //{ header: "LeadId", key: "lead", width: 10 },
        { header: "FirstName", key: "first", width: 15 },
        { header: "LastName", key: "last", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phne", width: 20 },
        { header: "ProductName", key: "pid", width: 20 },
        //{ header: "InterestLevel", key: "level", width: 15 },
        { header: "Source", key: "src", width: 20 },
        { header: "Status", key: "stat", width: 20 },
        { header: "AssignedToUser", key: "asn", width: 18 },
        { header: "LeadLocation", key: "loc", width: 100 },
        { header: "IPAddress", key: "ip", width: 20 },
        // { header: "Referredby", key: "ref", width: 15 },
        // { header: "LastContactDate", key: "con", width: 18 },
        // { header: "NextStep", key: "next", width: 20 },
        // { header: "NextFollowUpDate", key: "nextf", width: 20 },
        // { header: "Notes", key: "note", width: 30 }
    ];
    // Looping through User data
  let counter = 1;
  LeadData.forEach((data) => {
    console.log('LeadData',data,data.LeadId)
    data.s_no = counter;
    //data.lead = data.LeadID
    data.first= data.FirstName
    data.last = data.LastName
    data.email = data.Email
    data.phne = data.Phone
    data.pid= data.ProductName
    //data.level = data.InterestLevel
    data.src = data.SourceName
    data.stat = data.StatusName
    data.asn= data.UserName
    data.loc = data.LeadLocation
    data.ip = data.IPAddress
    // data.ref = data.Referredby
    // data.con = data.LastContactDate
    // data.next = data.NextStep
    // data.nextf = data.NextFollowUpDate
    // data.note = data.notes
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
      message: "Something went wrong while Export the data",
    });
    } 
  
    }catch(err){
      console.log("Error",err)
      let msg = `Failed to Export Data. ${err}`
      statusCode.errorResponse(res,msg)
    }
}



let LeadStatusList = async (req,res) =>{
    try{
        let data = await allLeadStatus()
        if(typeof data !== 'string'){
            let msg = 'Status List'
            statusCode.successResponseWithData(res,msg,data)
        }
        else{
            let msg = `Status are Not Exist.${data}`
            statusCode.successResponse(res,msg)
        }
    }catch(err){
        console.log("Error",err)
        let msg = `Not Getting Status List. ${err}`
        statusCode.errorResponse(res,msg)
    }
}

let allLeadStatus = async()=>{
    try{
        let data = await db.sequelize.query("EXEC LeadStatusList ",{
            type: Sequelize.QueryTypes.RAW})
            return data[0]
    }catch(err){
        console.log("Error",err.message)
        return err.message
    }
}


const AssignToUser = async(req,res) =>{
    try{
      let {LeadId,UserId} = req.body      
      let update = await updateUser(LeadId,UserId)
      console.log('update',update)
      if(typeof update !== 'string'){
        let msg = `Lead Assigned To User-${update} Successfully`
        statusCode.successResponseForCreation(res,msg)
      }else{
        let msg = `User Updation Failed.${update}`
        statusCode.successResponse(res,msg)
      }
        // let userName = await updatedUserName(UserId)
        // console.log('userName',userName)
        // let msg = `Lead Assigned To User-${userName[0].FullName} Successfully`
        // let log = await ActivityLog(LeadId,msg)      
     }catch(err){
      console.log("error",err)
      let msg = `Failed To Assigned User in the lead.${err}`
      statusCode.errorResponse(res,msg)
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
      console.log('DB Error',err.message)
      return err.message
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
        let data = await updateLeadStatus(LeadId,StatusId,InteractionType,Notes)
        if(typeof data !== 'string'){
            //let data = await leadStatus(StatusId)
            console.log('data',data)
            //if(data.length>0){
                let msg = `Lead Status and Interactions Updated Successfully`
                //let statusLog = await ActivityLog(LeadId,msg)
                //let findLead = await FindLeadInteraction(LeadId)
                // console.log('findLead',findLead,findLead.length)
                // if(findLead.length>0){
                //     let interactiondata = await updateInteractionData(LeadId,InteractionType,Notes)
                //     // let logmsg = "Interaction details Updated Successfully"
                //     // let interactiondataLog = await InteractionLog(LeadId,InteractionId,logmsg)
                //     let msg = 'Lead Details Updated Successfully'
                //     statusCode.successResponseForCreation(res,msg)
    
                // }else{
                // let interactiondata = await InsertInteractionData(LeadId,InteractionType,Notes)
                // let getId = await getInteractionId()
                // console.log('getId',getId,getId.length)
                // if(getId.length>0){
                //     let InteractionId= getId[0].InteractionId
                //     let logmsg = `Interaction Type : ${getId[0].InteractionType} and Notes: ${getId[0].Notes}  Updated Successfully`
                //     let interactiondataLog = await InteractionLog(LeadId,InteractionId,logmsg)
                //     let msg = 'Lead Updated Successfully'
                //     statusCode.successResponseForCreation(res,msg)
                // }else{
                //     let msg = "Lead Interaction Updated Failed"
                //     statusCode.successResponse(res,msg)
                // }
            //}

            //     }else{
            //     let msg = 'Invalid Status'
            //     statusCode.successResponse(res,msg)
            // }     
            statusCode.successResponseForCreation(res,msg)  
        }else{
            let msg = `Lead Status Updation Failed.${data}`
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        let msg = `Lead Status Updation Failed.${err}`
        statusCode.errorResponse(res,msg)
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

  let updateLeadStatus = async (LeadId,StatusId,InteractionType,Notes) =>{
    try{
        console.log('data',LeadId,StatusId,InteractionType,Notes)
        let data = await db.sequelize.query("exec updateLeads @lead='"+LeadId+"',@stat='"+StatusId+"',@type= '"+InteractionType+"',@note = '"+Notes+"'",{ 
          type: Sequelize.QueryTypes.RAW
          })
         console.log('log',data)
         return data[0]    
      }catch(err){
          console.log("DB Error",err.message)
          return err.message
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
        if(typeof data !== 'string'){
            let msg = 'Source List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'Lead Sources are not Exist'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        let msg = `Failed to get SourceList.${err}`
        statusCode.errorResponse(res,msg)
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
          console.log("DB Error",err.message)
          return err.message
      }

  }

  let interactionTypes = async(req,res) =>{
    try{
        let data = await interactionTypeList()
        if(typeof data !== 'string'){
            let msg = 'interaction Type List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = 'interaction Types are not Exist'
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        let msg = `Failed to get Interaction List.${err}`
        statusCode.errorResponse(res,msg)
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
          console.log("DB Error",err.message)
          return err.message
      }

  }

  let HistoryList = async(req,res) =>{
    try{
        let leadId = req.body.LeadId
        let data = await history(leadId)
        if(typeof data !== 'string'){
            let msg = 'History List'
            statusCode.successResponseWithData(res,msg,data)
        }else{
            let msg = `No history for the lead.${data}`
            statusCode.successResponse(res,msg)
        }

    }catch(err){
        console.log("Error",err)
        let msg = `Failed to get Lead History.${err}`
        statusCode.errorResponse(res,msg)
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
              console.log("DB Error",err.message)
              return err.message
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
    try {
        const workbook = new excelJS.Workbook();
       let data = await workbook.xlsx.readFile(path);
        //console.log('data',data)
        const worksheet = workbook.getWorksheet('Sheet1')
        const allRows = []
        console.log('worksheet.RowCount',worksheet.rowCount,worksheet.columnCount)

        for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex);  // Get the row object
      //console.log('row',row)
            // Create an empty array to store values from the current row
            const rowValues = [];
      
            // Loop through each cell in the row and get its value
            for (let colIndex = 2; colIndex <= worksheet.columnCount; colIndex++) {
              const cellValue = worksheet.getCell(rowIndex,colIndex).value;
              //console.log('cellValue',cellValue)
              rowValues.push(cellValue);
            }
        //console.log('rowValues',rowValues)
            allRows.push(rowValues); // Add the row's values to the allRows array
          }
          //let validation = await validateData(allRows)
          console.log('length',allRows.length,allRows)
          let removeEmpty = []
          for(let i =0;i<allRows.length;i++){
            let data = allRows[i]
            console.log('686688',data)
            if((data[0] || typeof data[0] == 'string')&&(data[1] || typeof data[1] == 'string') &&
        (data[2]||typeof data[2] == 'string') && (data[3]||typeof data[3] == 'string') &&
        (data[4]||typeof data[4] == 'string') ){
            //console.log('jsgfhsdgf',data)
            removeEmpty.push(allRows[i])
            console.log('removeEmpty',removeEmpty)
        }else{
            continue
        }
            
          }
          console.log('remove',removeEmpty)
          let uniqueEmail =[]
          for(let i=0;i<removeEmpty.length;i++){
            let data = removeEmpty[i]
            console.log('email',data[2].text)
            let findLead = await findOldLead(data[2].text)
            if(findLead.length>0){
                continue
            }else{
                uniqueEmail.push(data)
            }
          }
          console.log('uniqueEmail',uniqueEmail.length)

          const allRowsString = JSON.stringify(uniqueEmail)
          console.log('allRowsString',allRowsString.length)
          if(uniqueEmail.length>0){
          let insertLeads = await insertImportData(allRowsString,ip,location)
          console.log('insertLeads',insertLeads)
          if(typeof insertLeads !== 'string'){
            let msg = 'List of Leads created Successfully'
            statusCode.successResponseForCreation(res,msg)
            fs.unlink(path, (err) => {
                if (err) {
                  console.error('Error deleting temporary file:', err);
                } else {
                  console.log('Data uploaded and temporary file deleted successfully!');
                }
              });
          }else{
            let msg = 'Failed to create List of Leads' +' '+ insertLeads.cause
            statusCode.successResponse(res,msg)
          }
        }else{
            fs.unlink(path, (err) => {
                if (err) {
                  console.error('Error deleting temporary file:', err);
                } else {
                  console.log('user already exist in the uploaded  and temporary file deleted successfully!');
                }
              });
              let msg = 'user already exist or Undefined Values in the sheets not accepted'
              statusCode.errorResponse(res,msg)
        } 
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        // Handle error appropriately
    }       
    }catch(err){
        console.log("Error",err)
        let msg = `Failed to upload a Buil data.${err}`
        statusCode.errorResponse(res,err)
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
        console.log("Db Error",err.message)
        return err.message
    }
  }

  let SampleSheet = async(req,res) =>{
    try{
        const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      let path = "public/"
      worksheet.columns = [
        { header: "S no", key: "s_no", width: 5 }, 
        { header: "FirstName", key: "first", width: 20 },
        { header: "LastName", key: "last", width: 20 },
        { header: "Email", key: "email", width: 50 },
        { header: "Phone", key: "phne", width: 20 },
        { header: "ProductName", key: "pid", width: 20 },
    ];
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
        console.log('error',err)
        let msg = `Error for downloading a Sample Sheet. ${err}`
        statusCode.errorResponse(res,msg)
    }
  }


module.exports ={
    leadCreation,
    leadsList,
    LeadDetails,
    LeadExport,
    LeadStatusList,
    AssignToUser ,
    UpdateLeadDetails,
    SourceList,
    interactionTypes,
    HistoryList,
    ImportLeads,
    SampleSheet
}