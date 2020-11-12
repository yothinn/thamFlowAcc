const sql = require("mssql");
const Page365 = require("./libs/page365/page365");
const dotenv = require("dotenv").config();
const page365Tools = require("./libs/page365/page365Utils");

const CyberAccDatabase = require("./libs/cyberacc/cyberaccDatabase");
const cyberAccInfo = require("./libs/cyberacc/cyberaccUtils");
const Page365ToCyberAcc = require("./modules/cyberacc_modules/page365ToCyberAcc");
const { product } = require("puppeteer");

var pool;

(async() => {
//     var config = {
//         user: "sa",
//         password: "yothinn",
//         server: "DESKTOP-6LURV9I",
//         database: "CyberAccDataSocial",
//         stream: false,
//         options: {
//             encrypt: false,
//             instanceName: "SQLEXPRESS"
//         },
// //        port: 1433,
//     };


    try {

        const page365User = {
            username: process.env.PAGE365_USERNAME,
            password: process.env.PAGE365_PASSWORD,
        }

        const cyberaccConfig = {
            username: process.env.CYBERACC_THAMENTERPRISE_USERNAME,
            password: process.env.CYBERACC_THAMENTERPRISE_PASSWORD,
            server: process.env.CYBERACC_THAMENTERPRISE_SERVER,
            database: process.env.CYBERACC_THAMENTERPRISE_DB
        }

        // TODO : Change later
        const productFile = {
            fileName: "./libs/product/product.xlsx",
            sheetName: "page365",
        }

        let p2c = new Page365ToCyberAcc(page365User, cyberaccConfig, productFile);
        await p2c.init();

        await p2c.downloadToCyberAccByDate("2020-10-01", "2020-10-01");

        await p2c.close();

        // let startDate = "2020-10-29";
        // let endDate = "2020-11-01";
        // let startTime = new Date(startDate)
        // startTime.setHours(0, 0, 0, 0);
    
        // let endTime = new Date(endDate);
        // endTime.setHours(23, 59, 59, 0);

        // let cyberAccDb = new CyberAccDatabase();

        // await cyberAccDb.connect("sa", "yothinn", "DESKTOP-6LURV9I", "CyberAccDataSocial");

        // let res = await cyberAccDb.getGLTableByDate('2020-10-01');
        // console.log(res[107]);

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
  

        // cyberAccDb.close();

 
        // let accountCode = await cyberAccDb.getAccountIDByCustomerName("จอย", "ชายแสน");
        // console.log(accountCode);

        // let idCredit = await cyberAccDb.getNewIdGLCredit();
        // console.log(idCredit);
        // let glMainId = await cyberAccDb.getNewGLMainId("AR", "7", "2563");
        // console.log(glMainId);

        // let result = await cyberAccDb.insertToGLMain(glMainId, "12/7/2563", "Page365:8653");
        // result = await cyberAccDb.insertToGLCredit(glMainId, idCredit, accountCode, "ทดสอบเขียน", 12.35);
        //console.log(result);

    } catch(error) {
        console.log(error);
    }

})();

