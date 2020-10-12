const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");
const ProductMap = require("./libs/productmap");
const XLSX = require("xlsx");

(async() => {

    let fa = new FlowAccount();

    await fa.authorize(
        process.env.FA_CLIENT_ID,
        process.env.FA_CLIENT_SECRET,
        process.env.FA_GRANT_TYPE,
        process.env.FA_SCOPE
    );

    let bankacc = await fa.getAllBankAccount();

    console.log(bankacc);
    // let productList = await fa.getAllProduct();
    
    // for (item of productList) {

    //     let res = await fa.deleteProductById(item.id);

    //     if (res.status) {
    //         console.log (`--- delete product ${item.name}`);
    //     }
    //     else {
    //         console.log (`!!! Can't delete product ${item.name}`);
    //     }
    // }
    //console.log(res.length);
    //console.log(res[1683]);

    // let productMap = new ProductMap();
    // productMap.readProduct("product.xlsx", "ocha_rest_chomphon");

    // console.log(productMap._product[231]);
    // let product = productMap._product[231];
    // let name = "ใบเหลียงผัดไข่Stir-fried local vegetable with eggs";
    // console.log(product.productName === name);
    // console.log(product.productName.length);
    // console.log(name.length);
    // let res = productMap.findProduct("ใบเหลียงผัดไข่Stir-fried local vegetable with eggs", "ราคา");
    // console.log(res);

})();


/**
 * ?? Not Test yet
 * @param {} branchId 
 * @param {*} fileName 
 */
// exports.getFoodStoryMenuToXLSX = async function(branchId, fileName) {
//     let fd = new FoodStory();
    
//     let menu = [];
//     // change number 2 to last page

//     for (let i = 1; i<=2; i++) {
//         let res = await fd.getMenuPerPage(branchId, i, 12, 1);
//         // console.log(res.data.length);
//         menu = [...menu, ...res.data];
//     }

//     //console.log(menu);
//     // console.log(menu.length);
//     let wb = XLSX.utils.book_new();
//     let ws = XLSX.utils.json_to_sheet(menu);
//     XLSX.utils.book_append_sheet(wb, ws, "menu");

//     await XLSX.writeFile(wb, fileName);

//     // console.log(JSON.stringify(res));
// }