const request = require("request");
const fs = require("fs");
const AccRevo = require("../../libs/accrevo/accrevo");
const accrevoInfo = require("../../libs/accrevo/accrevoUtils");
const dotenv = require("dotenv").config();
const CyberAccToAccRevo = require("./cyberaccToAccRevo");


(async() => {
    let c2r;
    try {

        accRevoUser = {
            username: process.env.ACCREVO_THAMTENTERPRISE_USERNAME,
            password: process.env.ACCREVO_THAMTENTERPRISE_PASSWORD,
            apiKey: process.env.ACCREVO_THAMTENTERPRISE_APIKEY
        }

        cyberAccConfig = {
            username: process.env.CYBERACC_THAMENTERPRISE_USERNAME, 
            password: process.env.CYBERACC_THAMENTERPRISE_PASSWORD, 
            server: process.env.CYBERACC_THAMENTERPRISE_SERVER, 
            database: process.env.CYBERACC_THAMENTERPRISE_DB
        }

        c2r = new CyberAccToAccRevo();
        await c2r.authorize(cyberAccConfig, accRevoUser);

        // For by glMainId
        //await c2r.updloadToAccRevoByMainId("SCE0091/01-63");
        //return;

        // For upload sby date
        let startDateStr = "2020-01-03";
        let endDateStr = "2020-01-03";
        let endDate = new Date(endDateStr);
        let day = new Date(startDateStr);

        console.log(`All:: start : ${startDateStr}, end: ${endDateStr}`);

        // loop : each day
        while (day <= endDate) {
            try {
                console.log(`Day start : ${day}, end: ${endDate}`);


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
                console.log(`ERROR: ${error}`);
                day.setDate(day.getDate() + 1);
                continue;
            }
        }

        c2r.close();
 
    } catch(error) {
        c2r.close();
        console.log(error);
    }
})();