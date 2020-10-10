const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");
const ProductMap = require("./libs/productmap");
const FoodStory = require("./libs//foodstory/foodstory");
const foodStoryUrl = require("./libs/foodstory/foodstoryUrl");
const XLSX = require("xlsx");

(async() => {

    // let fa = new FlowAccount();

    // await fa.authorize(
    //     process.env.FA_CLIENT_ID,
    //     process.env.FA_CLIENT_SECRET,
    //     process.env.FA_GRANT_TYPE,
    //     process.env.FA_SCOPE
    // );

    //let res = await fa.getAllProduct();
    
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

    // --------------------------FoodStory part ----------------------
    let fd = new FoodStory();
    await fd.connect(process.env.FOODSTORY_USERNAME, process.env.FOODSTORY_PASSWORD);

    // await new Promise(resolve => {
    //     console.log("Wait 3000");
    //     setTimeout(resolve, 10000);
    // }); 
    
    // console.log("start load");
    let res = await fd.sendSetDate("2020-10-08", "2020-10-08");
    // res = await fd.sendSetBranch(6969);

    // await new Promise(resolve => {
    //     console.log("Waiting");
    //     setTimeout(resolve, 60000);
    // })
    // console.log("start load");
    res = await fd.getBillByDate(6969, "2020-10-08", "2020-10-08");
    // let res = await fd.getBillDetailByPayment(45409940);
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