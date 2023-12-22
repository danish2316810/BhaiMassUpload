const cds = require('@sap/cds');
const { Client } = require('@sap/hana-client');
const { PassThrough } = require('stream');
const XLSX = require('xlsx');

cds.env.features.fetch_csrf = true;



module.exports = srv => {
  srv.on('PUT', 'ExcelUpload', async (req, next) => {
    try {
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
            var workbook = XLSX.read(buffer, {
              type: 'buffer',
              cellText: true,
              cellDates: true,
              dateNF: 'dd"."mm"."yyyy',
              cellNF: true,
              rawNumbers: false
            });

            let data = [];
            const sheets = workbook.SheetNames;

            for (let i = 0; i < sheets.length; i++) {
              const temp = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]], {
                cellText: true,
                cellDates: true,
                dateNF: 'dd"."mm"."yyyy',
                rawNumbers: false
              });

              temp.forEach((res, index) => {
                if (index === 0) return;
                data.push(JSON.parse(JSON.stringify(res)));
              });
            }

            if (data) {
              const responseCall = await CallEntity(entity, data);

              if (responseCall === -1) {
                reject(req.error(400, JSON.stringify(data)));

                const errorLogEntry = {
                  ERROR_CODE: 'CUSTOM_VALIDATION_ERROR',
                  ERROR_MSG: 'Custom validation failed'
                };

                await cds.run(INSERT.into(ERROR_LOG).entries(errorLogEntry));
              } else {
                resolve(
                  req.notify({
                    message: 'Upload Successful',
                    status: 200
                  })
                );
              }
            }
          });
        });
      } else {
        return next();
      }
    } catch (error) {
      console.error('Error in PUT operation:', error);
      reject(req.error(500, 'Internal Server Error'));

      const errorLogEntry = {
        ERROR_CODE: 'INTERNAL_SERVER_ERROR',
        ERROR_MSG: 'Internal Server Error'
      };

      await cds.run(INSERT.into(ERROR_LOG).entries(errorLogEntry));
    }
  });
};

async function CallEntity(entity, data) {
  try {
    if (entity === 'Students') {
      const ltt = `#ltt_${cds.utils.uuid().replace(/-/g, '')}`;

      await cds.run(`CREATE LOCAL TEMPORARY TABLE ${ltt} (StudentId NVARCHAR(5000), FIRSTNAME NVARCHAR(5000) , LASTNAME NVARCHAR(5000) , DOB NVARCHAR(5000) , ADDRESS NVARCHAR(5000))`);

      await cds.run(`INSERT INTO ${ltt} VALUES (?, ?, ?, ?, ?)`, data.map(item => [item.StudentId, item.FirstName, item.LastName, item.DOB, item.Address]));

      const query = `CALL INSERTDATAANDLOGERROR(DATATOINSERT => ${ltt}, ERRORLOG => ?)`;
      data = await cds.run(query);

      await cds.run(`DROP TABLE ${ltt}`);

      const insertResult = [];
      let query1 = SELECT.from(entity);
      await cds.run(query1);
      return insertResult;
    }
  } catch (error) {
    console.error('Error in CallEntity:', error);
    throw error; // Rethrow the error to be caught in the main service logic
  }
}
