const inquirer = require("inquirer");
const p365 = require("./index_page365");
const ocha = require("./index_ocha");

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to load data from ?",
        choices: [
            "page365", 
            "Ocha: ข้าวแปรรูป พระราม๙", 
            "Ocha: ผัก พระราม๙", 
            "Ocha: ฐานธรรมฯสันป่าตอง (ร้านยักษ์กะโจน)",
            "Ocha: ครัวชุมพรคาบาน่า",
            "Ocha: Front ชุมพรคาบาน่า",
            "Loyverse: รถธรรมธุรกิจ",
            "Loyverse: รถร่วมธรรมธุรกิจ1",
        ],
    },
    {
        type: "list",
        name: "loadType",
        message: "What do you want to load data by ?",
        choices: ["date", "billno"],
    },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
        when: function(answers) {
            return (answers.loadType === "date");
        },
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadType === "date");
        },
    },
    {
        type: "input",
        name: "startBill",
        message: "start bill no : ",
        when: function(answers) {
            return (answers.loadType === "billno");
        },
    },
    {
        type: "input",
        name: "endBill",
        message: "end bill no : ",
        when: function(answers) {
            return (answers.loadType === "billno");
        },
    }
];


(async() => {
    try {
        console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        console.log("******     Load data from page365, ocha, loyverse  *******");
        console.log("******     and create tax invoice flow account     ******");

        let answers = await inquirer.prompt(questions);
        // console.log(answers);
        let from = answers.loadFrom.split(":");
        //console.log(from);

        console.log("************ Start loading ************");
        if (from[0] === "page365") {
            await loadFromPage365(answers);
        } else if (from[0] === "Ocha") {
            await loadFromOcha(answers);
        } else if (from[0] === "Loyverse") {
            // TODO:
            console.log("Not implement TODO Later");
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
        if (answers.loadType === "date") {
            await ocha.loadOchaByDates(from[1], answers.startDate, answers.endDate);
        } else if (answers.loadType === "billno") {
            await ocha.loadOchaByBills(from[1], answers.startBill, answers.endBill);
        }
    } catch(error) {
        throw error;
    }
};


loadFromPage365 = async(answers) => {
    try {
        if (answers.loadType === "date") {
            await p365.loadPage365ByDates(answers.startDate, answers.endDate);
        } else if (answers.loadType === "billno") {
            await p365.loadPage365ByBills(answers.startBill, answers.endBill);
        }
    } catch(error) {
        throw error;
    }
};
