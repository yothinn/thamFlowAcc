const dotenv = require("dotenv").config();
// const csvtojson = require('csvtojson');
const LoyverseToFlowAcc = require("./libs/loyverse/loyverseToFlowAcc");
// const glob = require("glob");
const thamInfo = require("./thamflowacc_info");

// const PRODUCTMAP_FILE = "product.xlsx";
// const PRODUCTMAP_LOYVERSE_SHEET = "loyverse";

// const flowAccCredentail = {
//     clientId: process.env.FA_CLIENT_ID,
//     clientSecret: process.env.FA_CLIENT_SECRET,
//     grantType: process.env.FA_GRANT_TYPE,
//     scope: process.env.FA_SCOPE
// };

const productFile = {
    fileName: thamInfo.PRODUCTMAP.fileName,
    sheetName: thamInfo.PRODUCTMAP.sheetName.loyverse,
};

exports.loadLoyverseFromFile = async(shopName, fileName) => {
    try {
        const l2fa = new LoyverseToFlowAcc(shopName, thamInfo.flowAccCredentail, productFile);
            
        await l2fa.init();
            
        await l2fa.createTaxInvoiceInlineByFile(fileName);

    } catch(error) {
        throw error;
    }
}