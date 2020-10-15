// const dotenv = require("dotenv").config();
const LoyverseToFlowAcc = require("./loyverseToFlowAcc");
const thamInfo = require("../thamflowacc_info");

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