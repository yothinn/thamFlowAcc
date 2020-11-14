const XLSX = require("xlsx");
const Ocha = require("./libs/ocha/ocha");
const ochaUtils = require("./libs/ocha/ochaUtils");
const ochaShopName = require("./libs/ocha/ochaShopName.json");
const dotenv = require("dotenv").config();
const thamInfo = require("./modules/thaminfo");

(async()=> {
   
    try {
        let ocha = new Ocha();

        await ocha.connect(
            process.env.OCHA_MOBILE,
            process.env.OCHA_USERNAME,
            process.env.OCHA_PASSWORD
        );

        let productMapFile = {
            fileName: "./libs/product/product.xlsx",
            sheetName: "ocha_rice_rama9"
        }

        let dateStr = "2020-10-03";
        let startTime = new Date(dateStr);
        startTime.setHours(0, 0, 0, 0);

        let endTime = new Date(dateStr) ;
        endTime.setHours(23, 59, 59, 0);

        let shop = await ocha.getOchaShopIdByName(ochaShopName.riceRama9);
        // console.log(shop);
        let order = await ocha.getDailyOrdersByShop(shop.shop_id, startTime.getTime()/1000, endTime.getTime()/1000);

        ochaUtils.writeOchaToXlsx(productMapFile, order, `${dateStr}.xlsx`);

    } catch(error) {
        console.log(error);
    }

})();