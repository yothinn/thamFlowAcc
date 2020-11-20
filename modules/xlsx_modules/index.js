/**
 * Main command line : Download data from ... to xlsx
 * Author : Yothin Setthachatanan
 * Created : 14/11/2020
 * Updated : 16/11/2020
 */

const inquirer = require("inquirer");
const fs = require("fs");
const Ocha = require("../../libs/ocha/ocha");
const ochaUtils = require("../../libs/ocha/ochaUtils");
const { ochaShopName, productMap, outputfile_path, loadFrom } = require("../thaminfo_config.json");
const { ochaUser } = require("../thaminfo_credential.json");
const thamInfoUtils = require("../thaminfoUtils");
const xlsxLog = require("./xlsxLog");
const connectService = require("../connect-service");
// const ochaShopName = require("../../libs/ocha/ochaShopName.json");
// const thamInfo = require("../thaminfo");

const EXIT_STR = "exit";

const LOADFROM = {
    ochaRice: `${loadFrom.ochaName}: ${ochaShopName.riceRama9}`,
    ochaVegetable: `${loadFrom.ochaName}: ${ochaShopName.vegetableRama9}`,
    ochaSanpatong: `${loadFrom.ochaName}: ${ochaShopName.sanpatong}`,
    ochaRestChompon: `${loadFrom.ochaName}: ${ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `${loadFrom.ochaName}: ${ochaShopName.frontChomphon}`,
    exit: `${EXIT_STR}`,
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
        when: function(answers) {
            return (answers.loadFrom !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadFrom !== EXIT_STR);
        }
    },
];

var ocha = null;

var loadXLSX = module.exports = async() => {
    try {

        // console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        // console.log("******     Load data from ocha to XLSX             *******");

        while(true) {
            let answers = await inquirer.prompt(questions);
            // console.log(answers);

            if (answers.loadFrom === EXIT_STR) {
                break;
            }

            xlsxLog.info(JSON.stringify(answers, null, 3));

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

            
            if (!ocha || !ocha.isConnect()) {
                xlsxLog.info("CONNECT: Connecting to ocha ...");
                ocha = await connectService.ochaConnect(ochaUser);
            } else {
                xlsxLog.info("CONNECT: Already connect ocha ...")
            }

            // // let ocha = new Ocha();
            // await ocha.connect(
            //     ochaUser.mobileNo,
            //     ochaUser.username,
            //     ochaUser.password,
            // );

            xlsxLog.info("DOWNLOAD: Downloading from ocha ...")
            let shop = await ocha.getOchaShopIdByName(shopName);
            // console.log(shop);

            let order = await ocha.getDailyOrdersByShop(shop.shop_id, startTime.getTime()/1000, endTime.getTime()/1000);

            let d = startTime.getDate().toString().padStart(2, "0");
            let m = (startTime.getMonth()+1).toString().padStart(2, "0");
            let y = startTime.getFullYear();

            if (!fs.existsSync(outputfile_path.downloadXLSX)) {
                fs.mkdirSync(outputfile_path.downloadXLSX, { recursive: true});
            }

            let fileName = `${outputfile_path.downloadXLSX}/${shopName}_${y}${m}${d}.xlsx`;

            xlsxLog.info("XLSX: Writing to xlsx file ...");

            await ochaUtils.writeOchaToXlsx(productMapFile, order, fileName);

            xlsxLog.info(`XLSX: Success load ocha to xlsx file : ${fileName}`);
        }

    } catch(error) {
        xlsxLog.error(error);
    }
};


// loadXLSX();