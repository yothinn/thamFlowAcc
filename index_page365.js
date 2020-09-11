const dotenv = require("dotenv").config();
const Page365ToFlowAcc = require("./libs/page365/page365ToFlowAcc");

// TODO : move to config file
const PRODUCTMAP_FILE = "product.xlsx";
const PRODUCTMAP_PAGE365_SHEET = "page365";

const flowAccCredentail = {
    clientId: process.env.FA_CLIENT_ID,
    clientSecret: process.env.FA_CLIENT_SECRET,
    grantType: process.env.FA_GRANT_TYPE,
    scope: process.env.FA_SCOPE
}

const page365User = {
    username: process.env.PAGE365_USERNAME,
    password: process.env.PAGE365_PASSWORD,
}

const productFile = {
    fileName: PRODUCTMAP_FILE,
    sheetName: PRODUCTMAP_PAGE365_SHEET,
}


var loadPage365ByDates = exports.loadPage365ByDates = async (startDate, endDate) => {
    try {
        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate);
        end.setHours(23, 59, 59, 0);
        let startTime = start / 1000;
        let endTime = end / 1000;

        let p2fa = new Page365ToFlowAcc(page365User, flowAccCredentail, productFile);
        await p2fa.init();

        await p2fa.createTaxInvoiceInlineByDate(startTime, endTime);

    } catch(error) {
        console.log(error);
    }
};

var loadPage365ByBills = exports.loadPage365ByBills = async (startNo, endNo) => {
    try {
        let start = parseInt(startNo);
        let end = parseInt(endNo);

        if (end < start) {
            throw "end bill no less than start bill no";
        }

        let p2fa = new Page365ToFlowAcc(page365User, flowAccCredentail, productFile);
        await p2fa.init();

        for (let billno=start; billno<=end; billno++) {
            try {
                await p2fa.createTaxInvoiceInlineByBill(billno);
            } catch(error) {
                console.log(error);
            }
        }

    } catch(error) {
        console.log(error);
    }
};


//loadPage365ByDates("2020-08-30", "2020-08-30");
//loadPage365ByBills("8355", "8357");