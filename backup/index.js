const inquirer = require("inquirer");
const glob = require("glob");
const p365 = require("./libs/page365/index_page365");
const ocha = require("./libs/ocha/index_ocha");
const loy = require("./libs/loyverse/index_loyverse");
const thamInfo = require("./libs/thaminfo");

const PAGE365_NAME = "page365";
const OCHA_NAME = "Ocha";
const LOYVERSE_NAME = "Loyverse";

const LOADFROM = {
    page365: "page365",
    ochaRice: "Ocha: ข้าวแปรรูป พระราม๙",
    ochaVegetable: "Ocha: ผัก พระราม๙",
    ochaSanpatong: "Ocha: ฐานธรรมฯสันป่าตอง (ร้านยักษ์กะโจน)",
    ochaRestChompon: "Ocha: ครัวชุมพรคาบาน่า",
    ochaFrontChompon: "Ocha: Front ชุมพรคาบาน่า",
    loyverseThamDelivery: "Loyverse: รถธรรมธุรกิจ",
    loyverseThamDelivery1: "Loyverse: รถร่วมธรรมธุรกิจ1",
}

const LOADDATABY = {
    date: "date",
    billno: "billno",
}

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to load data from ?",
        choices: function(answers) {
            return Object.values(LOADFROM);
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
            let from = answers.loadFrom.split(":");
            return (from[0] !== LOYVERSE_NAME);
        }
    },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date);
        },
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date);
        },
    },
    {
        type: "input",
        name: "startBill",
        message: "start bill no : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno);
        },
    },
    {
        type: "input",
        name: "endBill",
        message: "end bill no : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno);
        },
    },
    {
        type: "list",
        name: "thamDeliveryFile",
        message: function(answers) {
            if (answers.loadFrom === LOADFROM.loyverseThamDelivery) {
                return `Select file that you want to read (path:${thamInof.loyverseThamDelivery}) ?`;
            } else {
                return `Select file that you want to read (path:${thamInof.loyverseThamDelivery1}) ?`;
            }
            
        },
        choices: function(answers) {
            if (answers.loadFrom === LOADFROM.loyverseThamDelivery) {
                return glob.sync(`${THAMDELIVERY_PATH}/*.csv`);
            } else {
                return glob.sync(`${THAMDELIVERY1_PATH}/*.csv`);
            }
            
        },
        when: function(answers) {
            let from = answers.loadFrom.split(":");
            return from[0] === LOYVERSE_NAME;
        }
    },
];


(async() => {
    try {
        console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        console.log("******     Load data from page365, ocha, loyverse  *******");
        console.log("******     and create tax invoice flow account     ******");

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
        }
        console.log("************     END       ************");
    } 
    catch(error) {
        console.log(error);
    }
})();

loadFromOcha = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        from[1] = from[1].trim();
        // console.log(from);
        if (answers.loadType === LOADDATABY.date) {
            await ocha.loadOchaByDates(from[1], answers.startDate, answers.endDate);
        } else if (answers.loadType === LOADDATABY.billno) {
            await ocha.loadOchaByBills(from[1], answers.startBill, answers.endBill);
        } else {
            throw `load data from this ${answers.loadType} not implement`;
        }
    } catch(error) {
        throw error;
    }
};


loadFromPage365 = async(answers) => {
    try {
        if (answers.loadType === LOADDATABY.date) {
            await p365.loadPage365ByDates(answers.startDate, answers.endDate);
        } else if (answers.loadType === LOADDATABY.billno) {
            await p365.loadPage365ByBills(answers.startBill, answers.endBill);
        } else {
            throw `load data from this ${answers.loadType} not implement`;    
        }
    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        from[1] = from[1].trim();
        
        await loy.loadLoyverseFromFile(from[1], answers.thamDeliveryFile);
    } catch(error) {
        throw error;
    }
}
