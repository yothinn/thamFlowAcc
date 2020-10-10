const FoodStory = require("./libs/foodstory/foodstory");
const ProductMap = require("./libs/productmap");
const thamInfo = require("./thamflowacc_info");
const foodStoryData = require("./libs/foodstory/foodstoryData");
const FoodStoryToFlowAcc = require("./libs/foodstory/foodstoryToFlowAcc");

const productFile = {
    chomphon : {
        fileName: thamInfo.PRODUCTMAP.fileName,
        sheetName: thamInfo.PRODUCTMAP.sheetName.foodStoryChomphon,
    },
    thaphae : {
        fileName: thamInfo.PRODUCTMAP.fileName,
        sheetName: thamInfo.PRODUCTMAP.sheetName.foodStoryThaPhae,
    }
};


// check product in file transcation that has product mapping
// display product that no product mappping
exports.checkProduct = async function(branchName, fileName, sheetName) {
    try {
        const productmap = new ProductMap();
        const productMapFile = thamInfo.PRODUCTMAP.fileName;
        let productMapSheet;
        if (branchName === foodStoryData.FOODSTORY_BRANCH.thaphae.name) {
            productMapSheet = thamInfo.PRODUCTMAP.sheetName.foodStoryThaPhae;
        } else {
            productMapSheet = thamInfo.PRODUCTMAP.sheetName.foodStoryChomphon;
        }
        
        await productmap.readProduct(productMapFile, productMapSheet);    

        const fd = new FoodStory();
        let totalRow = await fd.readFile(fileName, sheetName);

        for (let i = 0; i< totalRow; i++) {
            let menu = fd.getMenuName(i);
            let product = productmap.findProduct(menu, "");
            if (!product) {
                console.log(`No product mapping, row :${i+3}, name: ${menu}`);
            }
        }
    } catch (error) {
        throw error;
    }
};

(async() => {
    try {
        let branchName = foodStoryData.FOODSTORY_BRANCH.thaphae.name;
        let fileName = "./foodstory_input/รายงานยอดขายแยกตามรายละเอียดบิล.xlsx";
        let sheetName = "Sheet1";
        // const fd = new FoodStroy();
        // await fd.readFile("./foodstory_input/รายงานยอดขายแยกตามรายละเอียดบิล.xlsx", "Sheet1");
        // this.checkProduct(branchName, fileName, sheetName);

        let f2fa = new FoodStoryToFlowAcc(branchName, thamInfo.flowAccCredentail, productFile.thaphae);
        await f2fa.init();

        let invList = await f2fa.toTaxInvoiceInline(fileName, sheetName)
        console.log(invList);
   

    } catch (error) {
        console.log(error);
    }
})();


