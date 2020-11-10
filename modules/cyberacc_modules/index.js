const sql = require("mssql");
const Page365 = require("../../libs/page365/page365");
const dotenv = require("dotenv").config();
const page365Tools = require("../../libs/page365/page365Utils");

const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const cyberAccInfo = require("../../libs/cyberacc/cyberaccUtils");

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

        // let startDate = "2020-10-29";
        // let endDate = "2020-11-01";
        // let startTime = new Date(startDate)
        // startTime.setHours(0, 0, 0, 0);
    
        // let endTime = new Date(endDate);
        // endTime.setHours(23, 59, 59, 0);

        let cyberAccDb = new CyberAccDatabase();

        await cyberAccDb.connect("sa", "yothinn", "DESKTOP-6LURV9I", "CyberAccDataSocial");

        let res = await cyberAccDb.getGLTableAll('2020-10-01');
        console.log(res[107]);

        // const p365 = new Page365();
        // await p365.connect(process.env.PAGE365_USERNAME, process.env.PAGE365_PASSWORD);

        // console.log(`All:: start : ${startTime}, end: ${endTime}`);

        // let startDay = new Date(startTime);
        // startDay.setHours(0, 0, 0, 0);
        // let endDay = new Date(startTime);
        // endDay.setHours(23, 59, 59, 0);

        // // loop : each day
        // while (startDay < endTime) {
        //     console.log(`Day start : ${startDay}, end: ${endDay}`);

        //     let s = startDay.getTime() / 1000;
        //     let e = endDay.getTime() / 1000;

        //     // Request all order in one day
        //     // let orderList = await p365.getOrderDetailByDate(s, e);

        //     // Check hasn't order in day ?

        //     console.log(startDay.getMonth()+1);
        //     console.log(startDay.getFullYear()+543);
        //     // create GLMain
        //     let glMainId = await cyberAccDb.getNewGLMainId(
        //                     cyberAccInfo.JOURNALTYPE_ABBR.SALES, 
        //                     (startDay.getMonth()+1).toString(), 
        //                     (startDay.getFullYear()+543).toString());
        //     console.log(glMainId);

        //     // For loop create GLDebit
        //     // for (let order of orderList) {
        //     //     // read order and create GLDebit

        //     //     // calculate data for GLCredit
        //     // }

        //     // create GLCredit


        //     // Calculate Next Day
        //     startDay.setDate(startDay.getDate() + 1);
        //     endDay.setDate(endDay.getDate() + 1);

        //     //console.log(`Next Day start : ${startDay.getTime()}, end: ${endDay.getTime()}`);
        // }
  
        cyberAccDb.close();

 
        // let accountCode = await cyberAccDb.getAccountIDByCustomerName("จอย", "ชายแสน");
        // console.log(accountCode);

        // let idCredit = await cyberAccDb.getNewIdGLCredit();
        // console.log(idCredit);
        // let glMainId = await cyberAccDb.getNewGLMainId("AR", "7", "2563");
        // console.log(glMainId);

        // let result = await cyberAccDb.insertToGLMain(glMainId, "12/7/2563", "Page365:8653");
        // result = await cyberAccDb.insertToGLCredit(glMainId, idCredit, accountCode, "ทดสอบเขียน", 12.35);
        //console.log(result);

        

        



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
    
    } catch(error) {
        console.log(error);
    }

})();

