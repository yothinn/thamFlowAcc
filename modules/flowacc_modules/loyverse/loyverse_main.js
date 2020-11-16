// const dotenv = require("dotenv").config();
const csvtojson = require('csvtojson');
const LoyverseToFlowAcc = require("./loyverseToFlowAcc");
const LoyverseData = require("../../../libs/loyverse/loyverseData");
const ProductMap = require("../../../libs/product/productmap");
// const thamInfo = require("../../thaminfo");
const { flowAccCredentail } = require("../../thaminfo_credential.json");
const { productMap } = require("../../thaminfo_config.json");

const productFile = {
    fileName: productMap.fileName,
    sheetName: productMap.sheetName.loyverse,
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


// check product in file transcation that has product mapping
// display product that no product mappping
exports.checkProduct = async function(fileName) {
    try {
        const productmap = new ProductMap();

        // const productMapFile = productMap.fileName;

        await productmap.readProduct(productMap.fileName, productMap.sheetName.loyverse);    

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