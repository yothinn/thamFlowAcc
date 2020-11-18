
const inquirer = require("inquirer");
const glob = require("glob");
const { page365User, ochaUser, cyberAccServer } = require("../thaminfo_credential.json");
const thamInfo = require("../thaminfo_config.json");
const Page365ToCyberAcc = require("./page365ToCyberAcc");
const OchaToCyberAcc = require("./ochaToCyberAcc");
const LoyverseToCyberAcc = require("./loyverseToCyberAcc");
const FoodStorySalesByDay = require("./foodStorySalesByDayToCyberAcc")
const thamInfoUtils = require("../thaminfoUtils");
const cyberaccLogger = require("./cyberaccLogger");


const PAGE365_NAME = thamInfo.loadFrom.page365Name;
const OCHA_NAME = thamInfo.loadFrom.ochaName;
const LOYVERSE_NAME = thamInfo.loadFrom.loyverseName;
const FOODSTORY_NAME = thamInfo.loadFrom.foodStoryName;

const FOODSTORYSALESBYDAY_DEFAULTSHEET = "Sheet1";


const LOADFROM = {
    page365: PAGE365_NAME,
    ochaRice: `${OCHA_NAME}: ${thamInfo.ochaShopName.riceRama9}`,
    ochaVegetable: `${OCHA_NAME}: ${thamInfo.ochaShopName.vegetableRama9}`,
    ochaSanpatong: `${OCHA_NAME}: ${thamInfo.ochaShopName.sanpatong}`,
    ochaRestChompon: `${OCHA_NAME}: ${thamInfo.ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `${OCHA_NAME}: ${thamInfo.ochaShopName.frontChomphon}`,
    loyverseThamDelivery: `${LOYVERSE_NAME}: รถธรรมธุรกิจ`,
    loyverseThamDelivery1: `${LOYVERSE_NAME}: รถร่วมธรรมธุรกิจ1`,
    foodstoryChomphon: `${FOODSTORY_NAME}: ${thamInfo.foodStoryBranchName.chomphon}`,
    foodstoryThaphae: `${FOODSTORY_NAME}: ${thamInfo.foodStoryBranchName.thaphae}`,
};

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
            let from = answers.loadFrom.split(":");
            return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME);
        }
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            let from = answers.loadFrom.split(":");
            return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME);
        }
    },
    {
        type: "list",
        name: "fileLoad",
        message: function(answers) {
            
            let path = "";
            let fileType = "";
            let salesByDayStr = "ยอดขายรวมตามวัน";
            let paymentItemDetailStr = "ใบเสร็จรับเงินตามรายละเอียดสินค้า";
            switch (answers.loadFrom) {
                case LOADFROM.loyverseThamDelivery:  
                    fileType = paymentItemDetailStr
                    path = thamInfo.inputfile_path.loyverseThamDelivery;
                    break;
                case LOADFROM.loyverseThamDelivery1: 
                    fileType = paymentItemDetailStr
                    path = thamInfo.inputfile_path.loyverseThamDelivery1;
                    break;
                case LOADFROM.foodstoryChomphon:
                    fileType = salesByDayStr;
                    path = thamInfo.inputfile_path.foodstoryChomphon;
                    break;
                case LOADFROM.foodstoryThaphae:
                    fileType = salesByDayStr;
                    path = thamInfo.inputfile_path.foodstoryThaphae;
                    break;
                default:
            }

            return msg = `Select file that you want to read (${fileType}) ?(path:${path})`;
        },
        choices: function(answers) {
            let path = "";
            switch (answers.loadFrom) {
                case LOADFROM.loyverseThamDelivery: 
                    path = `${thamInfo.inputfile_path.loyverseThamDelivery}/*.csv`;
                    break;
                case LOADFROM.loyverseThamDelivery1: 
                    path = `${thamInfo.inputfile_path.loyverseThamDelivery1}/*.csv`;
                    break;
                case LOADFROM.foodstoryChomphon:
                    path = `${thamInfo.inputfile_path.foodstoryChomphon}/*.xlsx`;
                    break;
                case LOADFROM.foodstoryThaphae:
                    path = `${thamInfo.inputfile_path.foodstoryThaphae}/*.xlsx`;
                    break;
                default:
            }

            return glob.sync(path);
        },
        when: function(answers) {
            let from = answers.loadFrom.split(":");
            return (from[0] === LOYVERSE_NAME) || (from[0] === FOODSTORY_NAME);
        }
    },
];


module.exports = async() => {
    try {
        console.log("******     Load data from page365, ocha, loyverse, foodstory   *******");
        console.log("******     and create tax invoice cyberacc                     ******");


        // TODO : Report connection database

        let answers = await inquirer.prompt(questions);
        console.log(answers);
        let from = answers.loadFrom.split(":");
        //console.log(from);

        console.log("************ Start loading ************");
        if (from[0] === LOADFROM.page365) {
            await loadFromPage365(answers);
        } else if (from[0] === OCHA_NAME) {
            await loadFromOcha(answers);
        } else if (from[0] === LOYVERSE_NAME) {
            // console.log(from[1].trim());
            await loadFromLoyverse(answers);
        } else if (from[0] === FOODSTORY_NAME) {
            await loadFromFoodStory(answers);
        }
        console.log("************     END       ************");

    } catch(error) {
        console.log(error);
    }
};


loadFromPage365 = async(answers) => {
    try {
        
        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  thamInfo.productMap.sheetName.page365
        };

        let p2c = new Page365ToCyberAcc(page365User, cyberAccServer.socialEnterprise, productFile);
        
        // console.log("Connecting to page365 ...");
        cyberaccLogger.info("Test Connecting to page365 ...");
        await p2c.init();

        cyberaccLogger.info("Test Downloading and to cyberacc ... ");
        // console.log("Downloading and to cyberacc ...");
        await p2c.downloadToCyberAccByDate(answers.startDate, answers.endDate);

        await p2c.close();

    } catch(error) {
        throw error;
    }
};

loadFromOcha = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        let sheetName = thamInfoUtils.getOchaProductSheetName(shopName);
        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  sheetName
        };

        let p2o = new OchaToCyberAcc(ochaUser, cyberAccServer.socialEnterprise);

        console.log("Connecting to ocha ...");
        await p2o.init();

        console.log("Downloading data ...");

        await p2o.selectShopByName(shopName, productFile);
        await p2o.downloadToCyberAccByDate(answers.startDate, answers.endDate);

        await p2o.close();

    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  thamInfo.productMap.sheetName.loyverse
        }

        const l2c = new LoyverseToCyberAcc(shopName, cyberAccServer.socialEnterprise, productFile);

        await l2c.init();

        console.log("Reading from file and to cyberacc ...");
        await l2c.downloadToCyberAccByFile(answers.fileLoad);

        l2c.close();

    } catch(error) {
        throw error;
    }
};

loadFromFoodStory = async (answers) => {
    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        const f2c = new FoodStorySalesByDay(shopName, cyberAccServer.socialEnterprise);

        console.log()
        await f2c.init();

        console.log("Reading from file and send to cyberacc ...");
        await f2c.downloadToCyberAccByFile(answers.fileLoad, FOODSTORYSALESBYDAY_DEFAULTSHEET);

        await f2c.close();
    } catch(error) {
        throw error;
    }
};

