
const dotenv = require("dotenv").config();
const XLSX = require('xlsx');
const FlowAccount = require('./libs/flowacc');
const thamInfo = require("./thaminfo");

// const PRODUCT_FILE = "product.xlsx";
// const PRODUCT_SHEETNAME  = "allFlowProduct";


(async() => {
    try {
 
        // *************** Delete flow account from file ******************

        // Read product from file
        const wb = await XLSX.readFile(thamInfo.PRODUCTMAP.fileName);
        const ws = await wb.Sheets[thamInfo.PRODUCTMAP.sheetName.allFlowProduct];
        let productList = await XLSX.utils.sheet_to_json(ws);

        // Authorize flow account
        const flowAcc = new FlowAccount();

        await flowAcc.authorize(
            process.env.FA_CLIENT_ID,
            process.env.FA_CLIENT_SECRET,
            process.env.FA_GRANT_TYPE,
            process.env.FA_SCOPE
        );    

        // Read each product and send to delete flow account
        productList.forEach(async (item, index) => {
            try {
                
                // let product = await flowAcc.getProductByName(item.name);
                let product = await flowAcc.getProductByCode(item.code)
                if (product.data.total === 0) {
                    console.log(`!! Can't find product for delete , code : ${item.code}`);
                } else {

                    // console.log(product);
                    // สันนิษฐานว่าหาได้สินค้าตัวเดียว
                    let res = await flowAcc.deleteProductById(product.data.list[0].id);

                    if (res.status) {
                        console.log (`--- delete product index: ${index+2} , code: ${item.code}`);
                    }
                    else {
                        throw res.message;
                    }
                }
            } catch (error) {
                console.log(`!!! ${error}, index: ${index+2}, name: ${item.code}`);
            }
        });
            
    } catch(error) {
        console.log(error);
    }
})();