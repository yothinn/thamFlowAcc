const FoodStroy = require("./libs/foodstory/foodstory");
const ProductMap = require("./libs/productmap");
const thamInfo = require("./thamflowacc_info");
const foodStoryData = require("./libs/foodstory/foodstoryData");


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

        const fd = new FoodStroy();
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
        this.checkProduct(branchName, fileName, sheetName);

        //let i = 287;
        // console.log(fd.getPaymentDate(i));
        // console.log(fd.getPaymentTime(i));
        // console.log(fd.getPaymentId(i));
        // console.log(fd.getInvNo(i));
        // console.log(fd.getMenuName(i));
        // console.log(fd.getQuantity(i));
        // console.log(fd.getUnitPrice(i));
        // console.log(fd.getTotalBeforeDiscount(i));
        // console.log(fd.getDiscount(i));
        // console.log(fd.getTotal(i));
        // console.log(fd.getPaymentType(i));
        // console.log(fd.getRemark(i));
        // console.log(fd.getBranchName(i));

    } catch (error) {
        console.log(error);
    }
})();


