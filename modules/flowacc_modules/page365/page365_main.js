const Page365ToFlowAcc = require("./page365ToFlowAcc");
const thamInfo = require("../../thaminfo");

const productFile = {
    fileName: thamInfo.PRODUCTMAP.fileName,
    sheetName: thamInfo.PRODUCTMAP.sheetName.page365,
}

var loadPage365ByDates = exports.loadPage365ByDates = async (startDate, endDate) => {
    try {
        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate);
        end.setHours(23, 59, 59, 0);
        let startTime = start / 1000;
        let endTime = end / 1000;

        let p2fa = new Page365ToFlowAcc(thamInfo.page365User, thamInfo.flowAccCredentail, productFile);
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

        let p2fa = new Page365ToFlowAcc(thamInfo.page365User, thamInfo.flowAccCredentail, productFile);
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