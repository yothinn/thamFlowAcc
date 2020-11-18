/**
 * Main command line : Download data from ... to xlsx
 * Author : Yothin Setthachatanan
 * Created : 14/11/2020
 * Updated : 16/11/2020
 */

const inquirer = require("inquirer");
const XLSX = require("xlsx");
const Ocha = require("../../libs/ocha/ocha");
const ochaUtils = require("../../libs/ocha/ochaUtils");
const { ochaShopName, productMap, outputfile_path, loadFrom } = require("../thaminfo_config.json");
const { ochaUser } = require("../thaminfo_credential.json");
const thamInfoUtils = require("../thaminfoUtils");
// const ochaShopName = require("../../libs/ocha/ochaShopName.json");
// const thamInfo = require("../thaminfo");

const LOADFROM = {
    ochaRice: `${loadFrom.ochaName}: ${ochaShopName.riceRama9}`,
    ochaVegetable: `${loadFrom.ochaName}: ${ochaShopName.vegetableRama9}`,
    ochaSanpatong: `${loadFrom.ochaName}: ${ochaShopName.sanpatong}`,
    ochaRestChompon: `${loadFrom.ochaName}: ${ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `${loadFrom.ochaName}: ${ochaShopName.frontChomphon}`,
}

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to load data from ?",
        choices: function(answers) {
            return Object.values(LOADFROM);
        }
    },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
    },
];

var loadXLSX = module.exports = async() => {
    try {

        // console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        // console.log("******     Load data from ocha to XLSX             *******");

        let answers = await inquirer.prompt(questions);
        // console.log(answers);

        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        let startTime = new Date(answers.startDate);
        startTime.setHours(0, 0, 0, 0);

        let endTime = new Date(answers.endDate);
        endTime.setHours(23, 59, 59, 0);

        let sheetName = thamInfoUtils.getOchaProductSheetName(shopName);

        if (!sheetName) {
            throw `Can't product sheet name for shop : ${shopName}`;
        }

        let productMapFile = {
            fileName: productMap.fileName,
            sheetName: sheetName
        }

        
        let ocha = new Ocha();

        console.log("Connecting to ocha ...");
        
        await ocha.connect(
            ochaUser.mobileNo,
            ochaUser.username,
            ochaUser.password,
        );

        console.log("Downloading from ocha ...");

        let shop = await ocha.getOchaShopIdByName(shopName);
        // console.log(shop);

        let order = await ocha.getDailyOrdersByShop(shop.shop_id, startTime.getTime()/1000, endTime.getTime()/1000);

        let d = startTime.getDate().toString().padStart(2, "0");
        let m = (startTime.getMonth()+1).toString().padStart(2, "0");
        let y = startTime.getFullYear();

        let fileName = `${outputfile_path.downloadXLSX}/${shopName}_${y}${m}${d}.xlsx`;

        console.log("Writing to xlsx file ...");

        await ochaUtils.writeOchaToXlsx(productMapFile, order, fileName);

        console.log(`Success load ocha to xlsx file : ${fileName}`);

    } catch(error) {
        throw error;
    }
};


// loadXLSX();