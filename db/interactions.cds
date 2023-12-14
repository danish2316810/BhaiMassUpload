namespace app.interactions;
using { cuid } from '@sap/cds/common';
entity Employee {

  key  id:       Integer;
    Name:     String(50);
    Salary:    Decimal(15, 2);
    Location:  String(100);
    
}

entity Students  {
  key StudentId: String;
 FirstName: String;
 LastName: String;
 DOB: String;
 Address: String;
  
}

entity ERROR_LOG  {
 ERROR_CODE: String;
 ERROR_MSG: String;
}

