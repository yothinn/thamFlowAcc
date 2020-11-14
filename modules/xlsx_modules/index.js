const inquirer = require("inquirer");
const XLSX = require("xlsx");
const Ocha = require("../../libs/ocha/ocha");
const ochaUtils = require("../../libs/ocha/ochaUtils");
const ochaShopName = require("../../libs/ocha/ochaShopName.json");
const thamInfo = require("../thaminfo");

const LOADFROM = {
    ochaRice: `Ocha: ${ochaShopName.riceRama9}`,
    ochaVegetable: `Ocha: ${ochaShopName.vegetableRama9}`,
    ochaSanpatong: `Ocha: ${ochaShopName.sanpatong}`,
    ochaRestChompon: `Ocha: ${ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `Ocha: ${ochaShopName.frontChomphon}`,
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

        let sheetName = thamInfo.getOchaProductSheetName(shopName);

        if (!sheetName) {
            throw `Can't product sheet name for shop : ${shopName}`;
        }

        let productMapFile = {
            fileName: thamInfo.PRODUCTMAP.fileName,
            sheetName: sheetName
        }

        
        let ocha = new Ocha();

        await ocha.connect(
            thamInfo.ochaUser.mobileNo,
            thamInfo.ochaUser.username,
            thamInfo.ochaUser.password,
        );

        console.log("Downloading from ocha ...");

        let shop = await ocha.getOchaShopIdByName(shopName);
        // console.log(shop);

        let order = await ocha.getDailyOrdersByShop(shop.shop_id, startTime.getTime()/1000, endTime.getTime()/1000);

        let d = startTime.getDate().toString().padStart(2, "0");
        let m = (startTime.getMonth()+1).toString().padStart(2, "0");
        let y = startTime.getFullYear();

        let fileName = `${thamInfo.OUTPUTFILE_PATH.xlsx}/${shopName}_${y}${m}${d}.xlsx`;

        console.log("Writing to xlsx file ...");

        await ochaUtils.writeOchaToXlsx(productMapFile, order, fileName);

        console.log(`Success load ocha to xlsx file : ${fileName}`);

    } catch(error) {
        throw error;
    }
};


// loadXLSX();