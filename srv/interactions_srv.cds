using app.interactions from '../db/interactions';
@requires: 'authenticated-user'
service CatalogService @(path: '/catalog') {
   @cds.persistence.skip
@odata.singleton
 entity ExcelUpload {
        @Core.MediaType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        excel : LargeBinary;
    };

@cds.query.limit.max: 100000
@cds.query.limit: 0
entity Students as projection on interactions.Students;
// function InsertRecords(records: interactions.Students[]) returns Integer;
}