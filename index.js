/**
 * !!! Start command line : THAMTURAKIT DATA AND ACCOUNT TOOLS
 * Author: Yothin Seethachatanan
 * Created: 16/10/2020
 * Updated: 16/10/2020
 */

// const { program } = require("commander");
// const createProduct = require("./createproduct");
// const loadDataToFlowAcc = require("./loaddatatoflow");
// const purchasesToFlowAcc = require("./purchasestoflow");
// const checkProduct = require("./checkproduct");

// program.version("0.0.1");

// program
//     .option("-c, --create", "create product to flowacc from product.xlsx file")
//     .option("-l, --load", "Download data from select and create to taxinvoice inline flowacc")
//     .option("-k, --check", "check products that they are created in flowaccount yet?")
//     .option("-p, --purchases", "read data from file and create purchases flowacc");

// program.parse(process.argv);

// if (program.create) {
//     createProduct();
// } else if (program.load) {
//     loadDataToFlowAcc();
// } else if (program.purchases) {
//     purchasesToFlowAcc();
// } else if (program.check) {
//     checkProduct();
// } else {
//     console.log("type:  node index --help , for command detail");
// }

const inquirer = require("inquirer");
const download2XLSX = require("./modules/xlsx_modules/index");
const download2Flow = require("./modules/flowacc_modules/index");
const download2CyberAcc = require("./modules/cyberacc_modules/index");
const testCyberAcc = require("./modules/cyberacc_modules/testconnection");

const LOADPROGRAMS = {
    downloadDataToXLSX: "1. Download data to xlsx",
    downloadDataToFlowAcc: "2. Download data to flow account",
    downloadDataToCyberAcc: "3. Download data to cyberAcc",
    uploadCyberAccToAccRevo: "4. Upload cyberAcc to AccRevo",
    checkProduct: "5. check product mapping",
    testCyberAccConnect: "6. Test Cyberacc connect"
};

const questions = [
    {
        type: "list",
        name: "program",
        message: "What program do you want to run ?",
        choices: function(answers) {
            return Object.values(LOADPROGRAMS);
        }
    },
];

(async() => {

    console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
    console.log("******     THAMTURAKIT DATA AND ACCOUNT TOOLS      *******");

    try {
        let answers = await inquirer.prompt(questions);
        // console.log(answers);

        switch(answers.program) {
            case LOADPROGRAMS.downloadDataToXLSX:
                await download2XLSX();
                break;
            case LOADPROGRAMS.downloadDataToFlowAcc:
                await download2Flow();
                break;
            case LOADPROGRAMS.downloadDataToCyberAcc:
                await download2CyberAcc();
                break;
            case LOADPROGRAMS.uploadCyberAccToAccRevo:
                console.log("accrevo");
                break;
            case LOADPROGRAMS.checkProduct:
                console.log("check product");
                break;
            case LOADPROGRAMS.testCyberAccConnect:
                await testCyberAcc();
                break;
        }
    } catch (error) {
        console.log(error);
    }
})();