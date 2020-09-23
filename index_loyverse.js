const dotenv = require("dotenv").config();
const csvtojson = require('csvtojson');
//const FlowAccount = require('./libs/flowacc');
//const LoyverseData = require("./libs/loyverse/loyverseData");
//const ProductMap = require("./libs/productmap");
const LoyverseToFlowAcc = require("./libs/loyverse/loyverseToFlowAcc");
const glob = require("glob");

const PRODUCTMAP_FILE = "product.xlsx";
const PRODUCTMAP_LOYVERSE_SHEET = "loyverse";

const flowAccCredentail = {
    clientId: process.env.FA_CLIENT_ID,
    clientSecret: process.env.FA_CLIENT_SECRET,
    grantType: process.env.FA_GRANT_TYPE,
    scope: process.env.FA_SCOPE
};

const productFile = {
    fileName: PRODUCTMAP_FILE,
    sheetName: PRODUCTMAP_LOYVERSE_SHEET,
};

exports.loadLoyverseFromFile = async(shopName, fileName) => {
    try {
        const l2fa = new LoyverseToFlowAcc(shopName, flowAccCredentail, productFile);
            
        await l2fa.init();
            
        await l2fa.createTaxInvoiceInlineByFile(fileName);

    } catch(error) {
        throw error;
    }
}