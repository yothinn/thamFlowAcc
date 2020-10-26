// const dotenv = require("dotenv").config();
const LoyverseToFlowAcc = require("./loyverseToFlowAcc");
const LoyverseData = require("./loyverseData");
const csvtojson = require('csvtojson');
const ProductMap = require("../product/productmap");

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


// check product in file transcation that has product mapping
// display product that no product mappping
exports.checkProduct = async function(fileName) {
    try {
        const productmap = new ProductMap();

        const productMapFile = thamInfo.PRODUCTMAP.fileName;

        await productmap.readProduct(productMapFile, thamInfo.PRODUCTMAP.sheetName.loyverse);    

        const trans = await csvtojson().fromFile(fileName);

        let totalRow = trans.length;

        for (let i = 0; i< totalRow; i++) {
            let loyData = new LoyverseData(trans[i]);
            
            let product = await productmap.findProduct(loyData.productName, "");
            //console.log(product);
            if (!product) {
                console.log(`No product mapping, row :${i+2}, name: ${loyData.productName}`);
            }
        }
    } catch (error) {
        throw error;
    }
};