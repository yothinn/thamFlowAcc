// const request = require("request");
// const fs = require("fs");
// const AccRevo = require("../../libs/accrevo/accrevo");
// const accrevoInfo = require("../../libs/accrevo/accrevoUtils");
// const dotenv = require("dotenv").config();


const inquirer = require("inquirer");
const connectService = require("../connect-service");
const CyberAccToAccRevo = require("./cyberaccToAccRevo");
const accRevoLog = require("./accrevoLog");
const { accRevoUser, cyberAccServer } = require("../thaminfo_credential.json");
const { accRevoImage_path } = require("../thaminfo_config.json");

const EXIT_STR = "exit";
var accRevoConnect = null;
var cyberAccDbConnect = null;

const LOADDATABY = {
    date: "date",
    billno: "billno",
};

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to load data from ?",
        choices: function(answers) {
            let arr = Object.keys(cyberAccServer);
            arr.push(EXIT_STR);
            return arr;
        }
    },
    {
        type: "list",
        name: "loadType",
        message: "What do you want to load data by ?",
        choices: function(answers) {
            return Object.values(LOADDATABY);
        },
        when: function(answers) {
            return (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date) && (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date) && (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "startBill",
        message: "start bill no (EX.AR0001/10-63): ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno) && (answers.loadFrom !== EXIT_STR);
        },
    },
    {
        type: "input",
        name: "endBill",
        message: "end bill no (EX.AR0001/10-63): ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno) && (answers.loadFrom !== EXIT_STR);
        },
    },
];


module.exports = async() => {
    let loadFrom = null;
    try {
        while (true) {
            let answers = await inquirer.prompt(questions);

            if (answers.loadFrom === EXIT_STR) {
                break;
            }

            accRevoLog.info(JSON.stringify(answers, null, 3));
            
            // Change server to upload, new connect
            if (answers.loadFrom !== loadFrom) {
                loadFrom = answers.loadFrom;
                accRevoLog.info("CONNECT: Connecting accrevo ...");
                accRevoConnect = await connectService.accRevoConnect(accRevoUser[loadFrom]);

                accRevoLog.info("CONNECT: Connecting cyberacc server ...");
                cyberAccDbConnect = await connectService.cyberAccDbConnect(cyberAccServer[loadFrom]);
            } else {
                accRevoLog.info("CONNECT: Already connect ...");
            }

            switch (answers.loadType) {
                case LOADDATABY.date:
                    await uploadAccRevoByDate(answers);
                    break;
                case LOADDATABY.billno:
                    await uploadAccRevoByBill(answers);
                    break;
            }
        }

        if (cyberAccDbConnect) {
            cyberAccDbConnect.close();
        }
        
    } catch(error) {
        if (cyberAccDbConnect) {
            cyberAccDbConnect.close();
        }
        accRevoLog.error(error);
    }
};


uploadAccRevoByDate = async(answers) => {
    try {
        let c2r = new CyberAccToAccRevo(cyberAccDbConnect, accRevoConnect);
        c2r.setImageDir(accRevoImage_path);

        let accountChart = require(cyberAccServer[answers.loadFrom].accountChart);
        c2r.setAccountChart(accountChart);

        // console.log(accountChart);

        // For upload by date
        let endDate = new Date(answers.endDate);
        endDate.setHours(0, 0, 0, 0);
        let day = new Date(answers.startDate);
        day.setHours(0, 0, 0, 0);

        // accRevoLog.info(`All:: start : ${startDateStr}, end: ${endDateStr}`);

        // loop : each day
        while (day <= endDate) {
            try {
                accRevoLog.info(`Day start : ${day}, end: ${endDate}`);

                // Request all order in one day
    
                let y = day.getFullYear();
                let m = day.getMonth()+1;
                m = m.toString().padStart(2, "0");
                d = day.getDate().toString().padStart(2, "0");
                let dateStr = `${y}-${m}-${d}`;
                
                await c2r.uploadToAccRevoByDate(dateStr);

                // Calculate Next Day
                day.setDate(day.getDate() + 1);
                // console.log(day);
            } catch(error) {
                accRevoLog.error(`ERROR: ${error}`);
                day.setDate(day.getDate() + 1);
                continue;
            }
        }
    } catch(error) {
        throw error;
    }
}

uploadAccRevoByBill = async(answers) => {
    try {
        
        let startBill = answers.startBill;
        let endBill = answers.endBill;

        let endAbbrIndex = startBill.search(/[0-9]/);
        let startAbbr = startBill.substring(0, endAbbrIndex);
        let endNoIndex = startBill.indexOf("/");
        let startNo = parseInt(startBill.slice(endAbbrIndex + 1, endNoIndex + 1));
        let startSuffix = startBill.slice(endNoIndex);

        endAbbrIndex = endBill.search(/[0-9]/);
        endNoIndex = endBill.indexOf("/");
        let endAbbr = endBill.substring(0, endAbbrIndex);
        let endNo = parseInt(endBill.slice(endAbbrIndex + 1, endNoIndex + 1));
        let endSuffix = endBill.slice(endNoIndex);

        // console.log(`start bill ${startNo}: ${endNo}`);
        // console.log(startSuffix);
        // console.log(endSuffix);

        if (startAbbr !== endAbbr) {
            throw "Start bill and end bill isn't same abbr";
        }

        if (startSuffix !== endSuffix) {
            throw "Start and end bill suffix isn't same";
        }

        let c2r = new CyberAccToAccRevo(cyberAccDbConnect, accRevoConnect);
        c2r.setImageDir(accRevoImage_path);

        let accountChart = require(cyberAccServer[answers.loadFrom].accountChart);
        c2r.setAccountChart(accountChart);

        for (let i=startNo; i<=endNo; i++) {
            try {
                let glMainId = `${startAbbr}${i.toString().padStart(4, "0")}${startSuffix}`;
                // console.log(glMainId);
                await c2r.updloadToAccRevoByMainId(glMainId);
            } catch(error) {
                continue;
            }
        }

    } catch(error) {
        throw error;
    }
}



// (async() => {
//     let c2r;
//     try {

//         accRevoUser = {
//             username: process.env.ACCREVO_THAMTENTERPRISE_USERNAME,
//             password: process.env.ACCREVO_THAMTENTERPRISE_PASSWORD,
//             apiKey: process.env.ACCREVO_THAMTENTERPRISE_APIKEY
//         }

//         cyberAccConfig = {
//             username: process.env.CYBERACC_THAMENTERPRISE_USERNAME, 
//             password: process.env.CYBERACC_THAMENTERPRISE_PASSWORD, 
//             server: process.env.CYBERACC_THAMENTERPRISE_SERVER, 
//             database: process.env.CYBERACC_THAMENTERPRISE_DB
//         }

//         c2r = new CyberAccToAccRevo();
//         await c2r.authorize(cyberAccConfig, accRevoUser);

//         // For by glMainId
//         //await c2r.updloadToAccRevoByMainId("SCE0091/01-63");
//         //return;

//         // For upload sby date
//         let startDateStr = "2020-01-03";
//         let endDateStr = "2020-01-03";
//         let endDate = new Date(endDateStr);
//         let day = new Date(startDateStr);

//         console.log(`All:: start : ${startDateStr}, end: ${endDateStr}`);

//         // loop : each day
//         while (day <= endDate) {
//             try {
//                 console.log(`Day start : ${day}, end: ${endDate}`);


//                 // Request all order in one day
    
//                 let y = day.getFullYear();
//                 let m = day.getMonth()+1;
//                 m = m.toString().padStart(2, "0");
//                 d = day.getDate().toString().padStart(2, "0");
//                 let dateStr = `${y}-${m}-${d}`;

                
//                 await c2r.uploadToAccRevoByDate(dateStr);

//                 // Calculate Next Day
//                 day.setDate(day.getDate() + 1);
//                 // console.log(day);
//             } catch(error) {
//                 console.log(`ERROR: ${error}`);
//                 day.setDate(day.getDate() + 1);
//                 continue;
//             }
//         }

//         c2r.close();
 
//     } catch(error) {
//         c2r.close();
//         console.log(error);
//     }
// })();