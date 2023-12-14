const cds = require('@sap/cds')
const { Client } = require('@sap/hana-client');
const { PassThrough } = require('stream');
const XLSX = require('xlsx');
cds.env.features.fetch_csrf = true

module.exports = srv => {

    srv.on('PUT', "ExcelUpload", async (req, next) => {
        if (req.data.excel) {
            var entity = req.headers.slug;
            const stream = new PassThrough();
            var buffers = [];
            req.data.excel.pipe(stream);
            await new Promise((resolve, reject) => {
                stream.on('data', dataChunk => {
                    buffers.push(dataChunk);
                });
                stream.on('end', async () => {
                    var buffer = Buffer.concat(buffers);
                    var workbook = XLSX.read(buffer, { type: "buffer", cellText: true, cellDates: true, dateNF: 'dd"."mm"."yyyy', cellNF: true, rawNumbers: false });
                    let data = []
                    const sheets = workbook.SheetNames
                    for (let i = 0; i < sheets.length; i++) {
                        const temp = XLSX.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[i]], { cellText: true, cellDates: true, dateNF: 'dd"."mm"."yyyy', rawNumbers: false })
                        temp.forEach((res, index) => {
                            if (index === 0) return;
                            data.push(JSON.parse(JSON.stringify(res)))
                        })
                    }
                    if (data) {
                            const responseCall = await CallEntity(entity, data);
                            if (responseCall == -1)
                                reject(req.error(400, JSON.stringify(data)));
                            else {
                                resolve(req.notify({
                                    message: 'Upload Successful',
                                    status: 200
                                }));   
                        }
                    }
                });
            });
        } else {
            return next();
        }
    });

 srv.before('POST', 'Students', async (req) => {
       //Custom validations can be put, if required before upload
 });
 srv.on('POST', 'Students', async (req) => {
     //return reponse to excel upload entity .
     var sam = req.data;
    });

 async function CallEntity(entity, data) {
    if (entity === 'Students') {
      //If any custom handling required for a particular entity
    }entity = 'STUDENTS';

// NEw code for hdb procedure inserted*****************************
    // Call the database procedure using the parsed input
  // const result = await InsertRecords(data);
  const ltt = `#ltt_${cds.utils.uuid().replace(/-/g, '')}`

  await cds.run(`CREATE LOCAL TEMPORARY TABLE ${ltt} (STUDENTID NVARCHAR(5000), FIRSTNAME NVARCHAR(5000) , LASTNAME NVARCHAR(5000) ,  ADDRESS NVARCHAR(5000))`)


  var sam = await cds.run(`INSERT INTO ${ltt} VALUES (?, ?, ?, ?)`,  data.map(item => [
      item.STUDENTID,
      item.FIRSTNAME,
      item.LASTNAME,
      item.ADDRESS
    ]));
    const query1 = `CALL EXCEPTION_EXAMPLE4(DATATOINSERT => ${ltt}, ERRORLOG => ?)`
        data  = await cds.run(query1); // Change BESTSELLER to errorlog

        console.log(data);

      


        
        await cds.run(`DROP TABLE ${ltt}`)
//End of new code for hdb procedure*************************

    // const insertQuery = INSERT.into(entity).entries(data); 
    // // This calls the service handler of respective entity. It can be used if any custom 
    // // validations need to be performed. or else custom handlers can be skipped. 
    
    // let srv = await cds.connect.to('CatalogService');
    // // const { Students } = srv.entities;
    // const insertResult = await srv.run(insertQuery);
    // // await cds.transaction.run(INSERT.into(Students).entries(data))    ;
    let query = SELECT.from(entity);
    await srv.run(query);
    return insertResult; //returns response to excel upload entity
   
};

function InsertRecords(inputEntity) {
// Connection details
const dbHost = '3fe612e8-749c-4b42-b7f5-67b5a996f13f.hana.trial-us10.hanacloud.ondemand.com';
const dbPort = 443; // Default HANA port
const dbName = 'students-hdistudents-db-deployer-ws-w2wnz';
const dbUser = 'STUDENTS_HDI_STUDENTS_DB_DEPLOYER_2_6Q7SJOI14KJMF8IOW1S7VP13Z_RT';
const dbPassword = 'Jc3J6AZKY95U-AKvcj1Lb4T0Jqqnz8hFZeS9Q6GJD9zfQtiB0hqxXnBL.9mnWNkLwlqPHzj5NV325ImgrupOSk6FalthN4CVBSmwoNZQ5SWI5GJS.tj9HlHto2yrb8Ah';


var hana = require('@sap/hana-client');
var conn = hana.createConnection();
var conn_params = {
  serverNode: '3fe612e8-749c-4b42-b7f5-67b5a996f13f.hana.trial-us10.hanacloud.ondemand.com:443',
  uid: 'DBADMIN',
  pwd: 'Far!1234',
  sslHostNameInCertificate: "*",
  sslValidateCertificate: false,
 
};
conn.connect(conn_params, function (err) {
  if (err) throw err;
  conn.disconnect();
});

// var conn_params = {
//   serverNode  : '3fe612e8-749c-4b42-b7f5-67b5a996f13f.hana.trial-us10.hanacloud.ondemand.com:443',
//   uid         : 'DBADMIN',
//   pwd         : 'Welcome123$'
// };

// Connect to the database
// connection.connect();
    
    // const connection = new Client(/* connection details */);
    // connection.connect();
    
    // Call the database procedure with the inputEntity values
    const jsonString = JSON.stringify(inputEntity);
     // Call the stored procedure with the JSON parameter
  const sql = `
  CALL "STUDENTS_HDI_STUDENTS_DB_DEPLOYER_2"."INSERTRECORDS"(?)`;
     conn.exec(sql, [jsonString], (queryErr, results) =>{
        if (queryErr) {
          console.error('Error calling stored procedure:', queryErr);
        } else {
          console.log('Stored procedure results:', results);
        }
    
        // Close the connection when you're done
        connection.disconnect();
      });
    
    // return result;
  }

}