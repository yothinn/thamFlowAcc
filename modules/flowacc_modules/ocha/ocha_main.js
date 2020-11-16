const OchaToFlowAcc = require("./ochaToFlowAcc");
// const thamInfo = require("../../thaminfo");
const {ochaUser, flowAccCredentail} = require("../../thaminfo_credential.json");
const {productMap} = require("../../thaminfo_config.json");
const thamInfoUtils = require("../../thaminfoUtils");

exports.loadOchaByDates = async(shopName, startDate, endDate) => {
    try {
        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate);
        end.setHours(23, 59, 59, 0);
        let startTime = start / 1000;
        let endTime = end / 1000;

        let sheetName = thamInfoUtils.getOchaProductSheetName(shopName);
        const productFile = {
            fileName: productMap.fileName,
            sheetName: sheetName,
        };

        // console.log(startTime);
        // console.log(endTime);
        // return;
        //setProductFile(shopName);
        
        let o2fa = new OchaToFlowAcc(ochaUser, flowAccCredentail);
        await o2fa.init();
        await o2fa.selectShopByName(shopName, productFile);
        let res = await o2fa.createTaxInvoiceInlineByDate(startTime, endTime);

    } catch(error) {
        throw error;
    }
}

exports.loadOchaByBills = async(shopName, startNo, endNo) => {
    try {

        let start = parseInt(startNo);
        let end = parseInt(endNo);

        // console.log(`start ${start} end ${end}`);

        if (end < start) {
            throw "end bill no less than start bill no";
        }

        setProductFile(shopName);

        let o2fa = new OchaToFlowAcc(ochaUser, flowAccCredentail);
        await o2fa.init();
        await o2fa.selectShopByName(shopName, productFile);

        for (let billno=start; billno<=end; billno++) {
            try {
                let no = billno.toString().padStart(8, "0");
                await o2fa.createTaxInvoiceInlineByBill(no);
            } catch(error) {
                console.log(error);
            }
        }
        
    } catch(error) {
        throw error;
    }
}
