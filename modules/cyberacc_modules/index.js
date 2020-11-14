// const sql = require("mssql");
// const Page365 = require("../../libs/page365/page365");
// const dotenv = require("dotenv").config();
// const page365Tools = require("../../libs/page365/page365Utils");

// const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
// const cyberAccInfo = require("../../libs/cyberacc/cyberaccUtils");
const inquirer = require("inquirer");
const glob = require("glob");
const ochaShopName = require("../../libs/ocha/ochaShopName.json");
const thamInfo = require("../thaminfo");

const PAGE365_NAME = "page365";
const OCHA_NAME = "Ocha";
const LOYVERSE_NAME = "Loyverse";
const FOODSTORY_NAME = "FoodStory";

const LOADFROM = {
    page365: PAGE365_NAME,
    ochaRice: `${OCHA_NAME}: ${ochaShopName.riceRama9}`,
    ochaVegetable: `${OCHA_NAME}: ${ochaShopName.vegetableRama9}`,
    ochaSanpatong: `${OCHA_NAME}: ${ochaShopName.sanpatong}`,
    ochaRestChompon: `${OCHA_NAME}: ${ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `${OCHA_NAME}: ${ochaShopName.frontChomphon}`,
    loyverseThamDelivery: `${LOYVERSE_NAME}: รถธรรมธุรกิจ`,
    loyverseThamDelivery1: `${LOYVERSE_NAME}: รถร่วมธรรมธุรกิจ1`,
    foodstoryChomphon: `${FOODSTORY_NAME}: ${thamInfo.FOODSTORY_BRANCHNAME.chomphon}`,
    foodstoryThaphae: `${FOODSTORY_NAME}: ${thamInfo.FOODSTORY_BRANCHNAME.thaphae}`,
}

// const LOADDATABY = {
//     date: "date",
//     billno: "billno",
// }

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to load data from ?",
        choices: function(answers) {
            return Object.values(LOADFROM);
        }
    },
    // {
    //     type: "list",
    //     name: "loadType",
    //     message: "What do you want to load data by ?",
    //     choices: function(answers) {
    //         return Object.values(LOADDATABY);
    //     },
    //     when: function(answers) {
    //         let from = answers.loadFrom.split(":");
    //         return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME);
    //     }
    // },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
        // when: function(answers) {
        //     return (answers.loadType === LOADDATABY.date);
        // },
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        // when: function(answers) {
        //     return (answers.loadType === LOADDATABY.date);
        // },
    },
    // {
    //     type: "input",
    //     name: "startBill",
    //     message: "start bill no : ",
    //     when: function(answers) {
    //         return (answers.loadType === LOADDATABY.billno);
    //     },
    // },
    // {
    //     type: "input",
    //     name: "endBill",
    //     message: "end bill no : ",
    //     when: function(answers) {
    //         return (answers.loadType === LOADDATABY.billno);
    //     },
    // },
    // {
    //     type: "list",
    //     name: "fileLoad",
    //     message: function(answers) {
            
    //         let path = "";
    //         switch (answers.loadFrom) {
    //             case LOADFROM.loyverseThamDelivery:  
    //                 path = thamInfo.FILEINPUT_PATH.loyverseThamDelivery;
    //                 break;
    //             case LOADFROM.loyverseThamDelivery1: 
    //                 path = thamInfo.FILEINPUT_PATH.loyverseThamDelivery1;
    //                 break;
    //             case LOADFROM.foodstoryChomphon:
    //                 path = thamInfo.FILEINPUT_PATH.foodstoryChomphon;
    //                 break;
    //             case LOADFROM.foodstoryThaphae:
    //                 path = thamInfo.FILEINPUT_PATH.foodstoryThaphae;
    //                 break;
    //             default:
    //         }

    //         return msg = `Select file that you want to read ?(path:${path})`;
    //     },
    //     choices: function(answers) {
    //         let path = "";
    //         switch (answers.loadFrom) {
    //             case LOADFROM.loyverseThamDelivery: 
    //                 path = `${thamInfo.FILEINPUT_PATH.loyverseThamDelivery}/*.csv`;
    //                 break;
    //             case LOADFROM.loyverseThamDelivery1: 
    //                 path = `${thamInfo.FILEINPUT_PATH.loyverseThamDelivery1}/*.csv`;
    //                 break;
    //             case LOADFROM.foodstoryChomphon:
    //                 path = `${thamInfo.FILEINPUT_PATH.foodstoryChomphon}/*.xlsx`;
    //                 break;
    //             case LOADFROM.foodstoryThaphae:
    //                 path = `${thamInfo.FILEINPUT_PATH.foodstoryThaphae}/*.xlsx`;
    //                 break;
    //             default:
    //         }

    //         return glob.sync(path);
    //     },
    //     when: function(answers) {
    //         let from = answers.loadFrom.split(":");
    //         return (from[0] === LOYVERSE_NAME) || (from[0] === FOODSTORY_NAME);
    //     }
    // },
];


module.exports = async() => {
    try {
        console.log("******     Load data from page365, ocha, loyverse, foodstory   *******");
        console.log("******     and create tax invoice cyberacc                     ******");


        // TODO : Report connection database

        let answers = await inquirer.prompt(questions);
        console.log(answers);
        let from = answers.loadFrom.split(":");
        //console.log(from);

        console.log("************ Start loading ************");
        if (from[0] === LOADFROM.page365) {
            await loadFromPage365(answers);
        } else if (from[0] === OCHA_NAME) {
            await loadFromOcha(answers);
        } else if (from[0] === LOYVERSE_NAME) {
            // console.log(from[1].trim());
            await loadFromLoyverse(answers);
        } else if (from[0] === FOODSTORY_NAME) {
            await loadFromFoodStory(answers);
        }
        console.log("************     END       ************");

    } catch(error) {
        throw error;
    }
};


loadFromPage365 = async(answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

loadFromOcha = async(answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
}

loadFromFoodStory = async (answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
}

// var pool;

// (async() => {
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


//     try {

//         // let startDate = "2020-10-29";
//         // let endDate = "2020-11-01";
//         // let startTime = new Date(startDate)
//         // startTime.setHours(0, 0, 0, 0);
    
//         // let endTime = new Date(endDate);
//         // endTime.setHours(23, 59, 59, 0);

//         let cyberAccDb = new CyberAccDatabase();

//         await cyberAccDb.connect("sa", "yothinn", "DESKTOP-6LURV9I", "CyberAccDataSocial");

//         let res = await cyberAccDb.getGLTableAll('2020-10-01');
//         console.log(res[107]);

//         // const p365 = new Page365();
//         // await p365.connect(process.env.PAGE365_USERNAME, process.env.PAGE365_PASSWORD);

//         // console.log(`All:: start : ${startTime}, end: ${endTime}`);

//         // let startDay = new Date(startTime);
//         // startDay.setHours(0, 0, 0, 0);
//         // let endDay = new Date(startTime);
//         // endDay.setHours(23, 59, 59, 0);

//         // // loop : each day
//         // while (startDay < endTime) {
//         //     console.log(`Day start : ${startDay}, end: ${endDay}`);

//         //     let s = startDay.getTime() / 1000;
//         //     let e = endDay.getTime() / 1000;

//         //     // Request all order in one day
//         //     // let orderList = await p365.getOrderDetailByDate(s, e);

//         //     // Check hasn't order in day ?

//         //     console.log(startDay.getMonth()+1);
//         //     console.log(startDay.getFullYear()+543);
//         //     // create GLMain
//         //     let glMainId = await cyberAccDb.getNewGLMainId(
//         //                     cyberAccInfo.JOURNALTYPE_ABBR.SALES, 
//         //                     (startDay.getMonth()+1).toString(), 
//         //                     (startDay.getFullYear()+543).toString());
//         //     console.log(glMainId);

//         //     // For loop create GLDebit
//         //     // for (let order of orderList) {
//         //     //     // read order and create GLDebit

//         //     //     // calculate data for GLCredit
//         //     // }

//         //     // create GLCredit


//         //     // Calculate Next Day
//         //     startDay.setDate(startDay.getDate() + 1);
//         //     endDay.setDate(endDay.getDate() + 1);

//         //     //console.log(`Next Day start : ${startDay.getTime()}, end: ${endDay.getTime()}`);
//         // }
  
//         cyberAccDb.close();

 
//         // let accountCode = await cyberAccDb.getAccountIDByCustomerName("จอย", "ชายแสน");
//         // console.log(accountCode);

//         // let idCredit = await cyberAccDb.getNewIdGLCredit();
//         // console.log(idCredit);
//         // let glMainId = await cyberAccDb.getNewGLMainId("AR", "7", "2563");
//         // console.log(glMainId);

//         // let result = await cyberAccDb.insertToGLMain(glMainId, "12/7/2563", "Page365:8653");
//         // result = await cyberAccDb.insertToGLCredit(glMainId, idCredit, accountCode, "ทดสอบเขียน", 12.35);
//         //console.log(result);

        

        



//         // let startTime = new Date("2020-10-01");
//         // startTime.setHours(0, 0, 0, 0);

//         // let endTime = new Date("2020-10-01");
//         // endTime.setHours(23, 59, 59, 0);

//         // startTime = startTime / 1000;
//         // endTime = endTime / 1000;

//         // let order = await p365.getOrderDetailByDate(startTime, endTime);
//         // console.log(order);

//         // let res = await sql.connect("mssql://sa:yothinn@DESKTOP-6LURV9I/SQLEXPRESS/CyberAccDataSocial");

//         // console.log(res);

//         // let orderDetail = await p365.getOrderDetailByBillNo(8884);
//         // // console.log(orderDetail);
//         // let [firstName, lastName] = page365Tools.getCustomerName(orderDetail);
//         // console.log(`firstName: ${firstName}, lastName: ${lastName}`);

//         // pool = new sql.ConnectionPool(config);
    
//     } catch(error) {
//         console.log(error);
//     }

// })();

