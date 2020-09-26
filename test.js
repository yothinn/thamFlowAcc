const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");
const ProductMap = require("./libs/productmap");

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

    let productMap = new ProductMap();
    productMap.readProduct("product.xlsx", "ocha_rest_chomphon");

    console.log(productMap._product[231]);
    let product = productMap._product[231];
    let name = "ใบเหลียงผัดไข่Stir-fried local vegetable with eggs";
    console.log(product.productName === name);
    console.log(product.productName.length);
    console.log(name.length);
    let res = productMap.findProduct("ใบเหลียงผัดไข่Stir-fried local vegetable with eggs", "ราคา");
    console.log(res);

})();