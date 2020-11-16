const { ochaShopName, productMap } = require("./thaminfo_config.json");

/**
 * Get sheet name that relate to shopName for product mapping
 * @param {*} shopName : user ochaShopName
 * @returns sheet name
 */
exports.getOchaProductSheetName = (shopName) => {
    switch(shopName) {
        case ochaShopName.riceRama9:
            return productMap.sheetName.ochaRiceRama9;
        case ochaShopName.vegetableRama9:
            return productMap.sheetName.ochaVegetableRama9;
        case ochaShopName.sanpatong:
            return productMap.sheetName.ochaSanpatong;
        case ochaShopName.restuarantChomphon:
            return productMap.sheetName.ochaRestChomphon;
        case ochaShopName.frontChomphon:
            return productMap.sheetName.ochaFrontChomphon;
        default:
            return "";
    }
};