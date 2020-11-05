const sql = require("mssql");
const Page365 = require("./libs/page365/page365");
const dotenv = require("dotenv").config();
const page365Tools = require("./libs/page365/page365Tools");

const CyberAccDatabase = require("./libs/cyberacc/cyberacc_database");

// // Prefix that found in page365 customer name
// const prefixReg = /(นาย|นางสาว|นส.|น.ส.|น.ส|นาง|ผู้บริจาค :|ของขวัญแด่...|คุณ|นาวาเอก|อาจารย์|อ.|รศ.ดร.|ร.อ.)/g;
// const suffixReg = /[(].*[)]/g;


// exports.getPage365CustomerName = function(str) {
//     let firstName = "";
//     let lastName = "";

//     // Replace prefix
//     let tmpStr = str.replace(prefixReg, "").trim();
//     console.log(tmpStr);

//     // Replace suffix
//     tmpStr = tmpStr.replace(suffixReg, "").trim();
//     console.log(tmpStr);

//     strArr = tmpStr.split(" ");   

//     [firstName, lastName] = strArr.filter(value => value !== "");

//     return [firstName ? firstName.trim() : ""
//             , lastName ? lastName.trim() : ""];
// };

var pool;

(async() => {
    var config = {
        user: "sa",
        password: "yothinn",
        server: "DESKTOP-6LURV9I",
        database: "CyberAccDataSocial",
        stream: false,
        options: {
            encrypt: false,
            instanceName: "SQLEXPRESS"
        },
//        port: 1433,
    };


    try {

        let cyberAccDb = new CyberAccDatabase();

        await cyberAccDb.connect("sa", "yothinn", "DESKTOP-6LURV9I", "CyberAccDataSocial");

        let accountCode = await cyberAccDb.getAccountIDByCustomerName("จอย", "ชายแสน");
        console.log(accountCode);

        let idCredit = await cyberAccDb.getNewIdGLCredit();
        console.log(idCredit);
        let glMainId = await cyberAccDb.getNewGLMainId("AR", "7", "2563");
        console.log(glMainId);

        let result = await cyberAccDb.insertToGLMain(glMainId, "12/7/2563", "Page365:8653");
        result = await cyberAccDb.insertToGLCredit(glMainId, idCredit, accountCode, "ทดสอบเขียน", 12.35);
        //console.log(result);

        

        cyberAccDb.close();

        // const p365 = new Page365();
        // await p365.connect(process.env.PAGE365_USERNAME, process.env.PAGE365_PASSWORD);

        // let startTime = new Date("2020-10-01");
        // startTime.setHours(0, 0, 0, 0);

        // let endTime = new Date("2020-10-01");
        // endTime.setHours(23, 59, 59, 0);

        // startTime = startTime / 1000;
        // endTime = endTime / 1000;

        // let order = await p365.getOrderDetailByDate(startTime, endTime);
        // console.log(order);

        // let res = await sql.connect("mssql://sa:yothinn@DESKTOP-6LURV9I/SQLEXPRESS/CyberAccDataSocial");

        // console.log(res);

        // let orderDetail = await p365.getOrderDetailByBillNo(8884);
        // // console.log(orderDetail);
        // let [firstName, lastName] = page365Tools.getCustomerName(orderDetail);
        // console.log(`firstName: ${firstName}, lastName: ${lastName}`);

        // pool = new sql.ConnectionPool(config);

        // await pool.connect();

        // let request = pool.request();
        // let result = await request.query(`select dbo.GetAccountIDByCustomerName('${firstName}', '${lastName}') as result`);
        // console.log(result.recordset[0].result);

       // let pool = await sql.connect(config);

        // const request = pool.request();
        // request.input("firstName", sql.NVarChar, "1/1/2020");
        // request.input("EndDate", sql.NVarChar, "30/9/2020");
        // request.input("AccCode", sql.NVarChar, "%");
        // request.execute("GetGL", (err, result) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     console.log(result);
        // });
        // let result = await pool.request().query("select dbo.GetAccountIDByCustomerName('รัชดาพร', 'ถาวรเลิศชัย') as result");
        //console.dir(result);

    
      
    } catch(error) {
        console.log(error);
    }

})();

