const OchaToFlowAcc = require("./ochaToFlowAcc");
const thamInfo = require("../thamflowacc_info");

const SHOP = thamInfo.ochaShop;
// const SHOP = [
//     {
//         shopName: "ข้าวแปรรูป พระราม๙",
//         productSheetName: "ocha_rice_rama9",
//     },
//     {   
//         shopName: "ผัก พระราม๙",
//         productSheetName: "ocha_vegetable_rama9",
//     },
//     {
//         shopName: "ฐานธรรมฯสันป่าตอง (ร้านยักษ์กะโจน)",
//         productSheetName: "ocha_rice_sanpatong",
//     },
//     {
//         shopName: "ครัวชุมพรคาบาน่า",
//         productSheetName: "ocha_rest_chomphon",
//     },
//     {
//         shopName: "Front ชุมพรคาบาน่า",
//         productSheetName: "ocha_front_chomphon",
//     },
// ];

// const flowAccCredentail = {
//     clientId: process.env.FA_CLIENT_ID,
//     clientSecret: process.env.FA_CLIENT_SECRET,
//     grantType: process.env.FA_GRANT_TYPE,
//     scope: process.env.FA_SCOPE
// }

// const ochaUser = {
//     mobileNo: process.env.OCHA_MOBILE,
//     username: process.env.OCHA_USERNAME,
//     password: process.env.OCHA_PASSWORD,
// }

const productFile = {
    fileName: thamInfo.PRODUCTMAP.fileName,
    sheetName: "",
}


setProductFile = function (shopName) {

    let shop = SHOP.find(value => {
        return value.shopName === shopName;
    });

    productFile.sheetName = shop.productSheetName;

}

exports.loadOchaByDates = async(shopName, startDate, endDate) => {
    try {
        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate);
        end.setHours(23, 59, 59, 0);
        let startTime = start / 1000;
        let endTime = end / 1000;

        // console.log(startTime);
        // console.log(endTime);
        // return;
        setProductFile(shopName);
        
        let o2fa = new OchaToFlowAcc(thamInfo.ochaUser, thamInfo.flowAccCredentail);
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

        let o2fa = new OchaToFlowAcc(thamInfo.ochaUser, thamInfo.flowAccCredentail);
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
