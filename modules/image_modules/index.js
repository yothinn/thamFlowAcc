const inquirer = require("inquirer");
const thamInfo = require("../thaminfo_config.json");
const thamCred = require("../thaminfo_credential.json");
const connectService = require("../connect-service");
const pageUtils = require("../../libs/page365/page365Utils");
const fs = require("fs");

const EXIT_STR = "exit";

var page365Connect = null;


const LOADFROM = {
    page365: `${thamInfo.loadFrom.page365Name}`,
    exit: `${EXIT_STR}`,
};

const LOADBY = {
    billNo: "Bill No.",
    date: "Date",
};

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
        name: "loadBy",
        message: "What do you want to load data by ?",
        choices: function(answers) {
            return Object.values(LOADBY);
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
            return (answers.loadBy === LOADBY.date) && (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadBy === LOADBY.date) && (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "startBill",
        message: "start bill no: ",
        when: function(answers) {
            return (answers.loadBy === LOADBY.billNo) && (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "endBill",
        message: "end bill no:",
        when: function(answers) {
            return (answers.loadBy === LOADBY.billNo) && (answers.loadFrom !== EXIT_STR);
        }
    },
];

module.exports = async() => {
    try {

        // console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        // console.log("******     Load data from ocha to XLSX             *******");

        while(true) {
            let answers = await inquirer.prompt(questions);
            console.log(answers);

            if (answers.loadFrom === EXIT_STR) {
                break;
            }

            // Connect to page365
            if (!page365Connect || !page365Connect.hasSession()) {
                page365Connect = await connectService.page365Connect(thamCred.page365User);
                console.log("CONNECT: Connecting to page365 ...");
            } else {
                console.log("CONNECT: Already connect to page365 ...");
            }

            switch (answers.loadBy) {
                case LOADBY.date:
                    await loadPage365ToImageByDate(answers);
                    break;
                case LOADBY.billNo:
                    await loadPage365ToImageByBill(answers);
                    break;
                default:
                    break;
            }
        }

    } catch(error) {
        console.log(error);
    }
};


loadPage365ToImageByDate = async(answer) => {
    try {
        if (!page365Connect) {
            throw "You must be connect page365 before";
        }

        let startDate = new Date(answer.startDate);
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date(answer.endDate);
        endDate.setHours(23, 59, 59, 0);

        let orderList = await page365Connect.getOrderDetailByDate(startDate.getTime()/1000, endDate.getTime()/1000);

        for (let orderDetail of orderList) {
            try {
                let fileName = `${thamInfo.outputfile_path.downloadImage}/${orderDetail.no}.jpg`;

                if (!fs.existsSync(thamInfo.outputfile_path.downloadImage)) {
                    fs.mkdirSync(thamInfo.outputfile_path.downloadImage, { recursive: true});
                }

                await pageUtils.createOrderImage(fileName, orderDetail);
                console.log(`create image: ${fileName}`);

            } catch(error) {
                console.log(error);
            }
        }

    } catch (error) {
        throw error;
    }
};


loadPage365ToImageByBill = async(answers) => {
    try {
        let startBill = parseInt(answers.startBill);
        let endBill = parseInt(answers.endBill);

        if (endBill < startBill) {
            throw "end bill no less than start bill no";
        }

        if (!page365Connect) {
            throw "You must be connect page365 before";
        }

        for (let billno=startBill; billno<=endBill; billno++) {
            try {
                let orderDetail = await page365Connect.getOrderDetailByBillNo(billno);
                let fileName = `${thamInfo.outputfile_path.downloadImage}/${billno}.jpg`;

                if (!fs.existsSync(thamInfo.outputfile_path.downloadImage)) {
                    fs.mkdirSync(thamInfo.outputfile_path.downloadImage, { recursive: true});
                }

                await pageUtils.createOrderImage(fileName, orderDetail);
                console.log(`create image: ${fileName}`);

            } catch(error) {
                console.log(error);
            }
        }
    } catch (error) {
        throw error;
    }
};
