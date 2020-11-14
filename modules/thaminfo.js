/**
 * Thamturakit infomation for account program
 */

const dotenv = require("dotenv").config();
const ochaShopName = require("../libs/ocha/ochaShopName.json");

// TODO : Move to config
exports.PRODUCTMAP = {
    fileName: "./libs/product/product.xlsx",
    sheetName: {
        allFlowProduct: "allFlowProduct",
        foodStoryChomphon: "foodstory_chomphon",
        foodStoryThaPhae: "foodstory_thaphae",
        loyverse: "loyverse",
        page365: "page365",
        ochaRiceRama9: "ocha_rice_rama9",
        ochaVegetableRama9: "ocha_vegetable_rama9",
        ochaFrontChomphon: "ocha_front_chomphon",
        ochaRestChomphon: "ocha_rest_chomphon",
        ochaSanpatong: "ocha_rice_sanpatong", 
        purchasesVegetable: "purchases_vegetable",
        purchasesSeafood: "purchases_seafood",
    }
};

exports.flowAccCredentail = {
    clientId: process.env.FA_CLIENT_ID,
    clientSecret: process.env.FA_CLIENT_SECRET,
    grantType: process.env.FA_GRANT_TYPE,
    scope: process.env.FA_SCOPE
};

exports.page365User = {
    username: process.env.PAGE365_USERNAME,
    password: process.env.PAGE365_PASSWORD,
};

exports.ochaUser = {
    mobileNo: process.env.OCHA_MOBILE,
    username: process.env.OCHA_USERNAME,
    password: process.env.OCHA_PASSWORD,
};

exports.getOchaProductSheetName = (shopName) => {
    switch(shopName) {
        case ochaShopName.riceRama9:
            return this.PRODUCTMAP.sheetName.ochaRiceRama9;
        case ochaShopName.vegetableRama9:
            return this.PRODUCTMAP.sheetName.ochaVegetableRama9;
        case ochaShopName.sanpatong:
            return this.PRODUCTMAP.sheetName.ochaSanpatong;
        case ochaShopName.restuarantChomphon:
            return this.PRODUCTMAP.sheetName.ochaRestChomphon;
        case ochaShopName.frontChomphon:
            return this.PRODUCTMAP.sheetName.ochaFrontChomphon;
        default:
            return "";
    }
}

// TODO : change to ochaProductSheetName
// exports.ochaShop = [
//     {
//         shopName: "ข้าวแปรรูป พระราม๙",
//         productSheetName: this.PRODUCTMAP.sheetName.ochaRiceRama9,
//     },
//     {   
//         shopName: "ผัก พระราม๙",
//         productSheetName: this.PRODUCTMAP.sheetName.ochaVegetableRama9,
//     },
//     {
//         shopName: "ฐานธรรมฯสันป่าตอง (ร้านยักษ์กะโจน)",
//         productSheetName: this.PRODUCTMAP.sheetName.ochaSanpatong,
//     },
//     {
//         shopName: "ครัวชุมพรคาบาน่า",
//         productSheetName: this.PRODUCTMAP.sheetName.ochaRestChomphon,
//     },
//     {
//         shopName: "Front ชุมพรคาบาน่า",
//         productSheetName: this.PRODUCTMAP.sheetName.ochaFrontChomphon,
//     },
// ];

exports.FOODSTORY_BRANCHNAME = { 
    chomphon: "ยักษ์กะโจน@ชุมพร คาบาน่า",
    thaphae: "ยักษ์กะโจน@ท่าแพ",
};


exports.FILEINPUT_PATH = {
    loyverseThamDelivery: "./inputFile/loyverse/thamdelivery",
    loyverseThamDelivery1: "./inputFile/loyverse/thamdelivery1",
    foodstoryChomphon: "./inputFile/foodstory/chomphon",
    foodstoryThaphae: "./inputFile/foodstory/thaphae",
    purchasesSeafood: "./inputFile/purchases/seafood"
};

exports.OUTPUTFILE_PATH = {
    xlsx : "./output/xlsx"
};


exports.GGSHEET_CRED = require("./thamturakit-data-center-credential.json");

exports.VEGETABLE_GGSHEET_DATA = {
    workbookId: "1qcraNqiQpqNa5SlTVvwYhOrflh9gRLzS-jj7d5zlwi4",
    worksheetId: 233438306,
}