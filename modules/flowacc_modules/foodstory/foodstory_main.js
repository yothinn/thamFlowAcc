const FoodStoryBillDetail = require("../../../libs/foodstory/foodstorybilldetail");
const ProductMap = require("../../../libs/product/productmap");
const { flowAccCredentail } = require("../../thaminfo_credential.json");
const { productMap, foodstoryBranchName } = require("../../thaminfo_config.json");
const FoodStoryToFlowAcc = require("./foodstoryToFlowAcc");

const productFile = {
    chomphon : {
        fileName: productMap.fileName,
        sheetName: productMap.sheetName.foodStoryChomphon,
    },
    thaphae : {
        fileName: productMap.fileName,
        sheetName: productMap.sheetName.foodStoryThaPhae,
    }
};

exports.FOODSTORY_DEFAULTSHEET = "Sheet1";


// check product in file transcation that has product mapping
// display product that no product mappping
exports.checkProduct = async function(branchName, fileName, sheetName) {
    try {
        const productmap = new ProductMap();
        // const productMapFile = productMap.fileName;
        let productMapSheet;
        if (branchName === foodstoryBranchName.thaphae) {
            productMapSheet = productMap.sheetName.foodStoryThaPhae;
        } else {
            productMapSheet = productMap.sheetName.foodStoryChomphon;
        }
 
        await productmap.readProduct(productMap.fileName, productMapSheet);    

        const fd = new FoodStoryBillDetail();
        let totalRow = await fd.readFile(fileName, sheetName);

        for (let i = 0; i< totalRow; i++) {
            let menu = fd.getMenuName(i);
            let product = await productmap.findProduct(menu, "");
            //console.log(product);
            if (!product) {
                console.log(`No product mapping, row :${i+3}, name: ${menu}`);
            }
        }
    } catch (error) {
        throw error;
    }
};

exports.loadFoodStoryFromFile = async(branchName, fileName) => {
    try {
        let pFile = (branchName === foodstoryBranchName.chomphon) ? productFile.chomphon :
                                                                    productFile.thaphae;

        let f2fa = new FoodStoryToFlowAcc(branchName, flowAccCredentail, pFile);
        await f2fa.init();

        await f2fa.createTaxInvoiceInlineByFile(fileName, this.FOODSTORY_DEFAULTSHEET);

    } catch(error) {
        throw error;
    }
};


