
const inquirer = require("inquirer");
const glob = require("glob");
const { page365User, ochaUser, cyberAccServer } = require("../thaminfo_credential.json");
const thamInfo = require("../thaminfo_config.json");
const Page365ToCyberAcc = require("./page365ToCyberAcc");
const OchaToCyberAcc = require("./ochaToCyberAcc");
const LoyverseToCyberAcc = require("./loyverseToCyberAcc");
const FoodStorySalesByDay = require("./foodStorySalesByDayToCyberAcc")
const thamInfoUtils = require("../thaminfoUtils");
const cyberaccLog = require("./cyberaccLog");
const connectService = require("../connect-service");

var ochaConnect = null;
var page365Connect = null;
var cyberAccDbConnect = null;

const PAGE365_NAME = thamInfo.loadFrom.page365Name;
const OCHA_NAME = thamInfo.loadFrom.ochaName;
const LOYVERSE_NAME = thamInfo.loadFrom.loyverseName;
const FOODSTORY_NAME = thamInfo.loadFrom.foodStoryName;
const EXIT_STR = "exit";

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
    exit: `${EXIT_STR}`
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
            return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME) && (from[0] !== EXIT_STR);
        }
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            let from = answers.loadFrom.split(":");
            return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME) && (from[0] !== EXIT_STR);
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


        while(true) {
            // TODO : Report connection database
            // Must be resturcture connecting ocha, page365 only firsttime
            let answers = await inquirer.prompt(questions);
            console.log(answers);
            let from = answers.loadFrom.split(":");
            //console.log(from);

            if (from[0] === EXIT_STR) {
                break;
            }

            if (!cyberAccDbConnect || !cyberAccDbConnect.isConnect()) {
                cyberaccLog.info("CONNECT: Connecting to cyberacc database ...");
                cyberAccDbConnect = await connectService.cyberAccDbConnect(cyberAccServer.socialEnterprise);
            } else {
                cyberaccLog.info("CONNECT: Already Connect to cyberacc database ...");
            }

            console.log("************ Start loading ************");
            if (from[0] === LOADFROM.page365) {
                if (!page365Connect || !page365Connect.hasSession()) {
                    cyberaccLog.info("CONNECT: Connecting to page365 ...");
                    page365Connect = await connectService.page365Connect(page365User);
                } else {
                    cyberaccLog.info("CONNECT: Already connect to page365 ...");
                }

                await loadFromPage365(answers);
            } else if (from[0] === OCHA_NAME) {
                if (!ochaConnect || !ochaConnect.isConnect()) {
                    cyberaccLog.info("CONNECT: Connecting to ocha ...");
                    ochaConnect = await connectService.ochaConnect(ochaUser);
                } else {
                    cyberaccLog.info("CONNECT: Already connect to ocha ...");
                }

                await loadFromOcha(answers);
            } else if (from[0] === LOYVERSE_NAME) {
                // console.log(from[1].trim());
                await loadFromLoyverse(answers);
            } else if (from[0] === FOODSTORY_NAME) {
                await loadFromFoodStory(answers);
            } 
            console.log("************     END       ************");
        }
        
        if (cyberAccDbConnect) {
            cyberAccDbConnect.close();
        }
 
    } catch(error) {
        if (cyberAccDbConnect) {
            cyberAccDbConnect.close();
        }
        cyberaccLog.error(error);
        console.log(error);
    }
};


loadFromPage365 = async(answers) => {
    let p2c;

    try {
        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  thamInfo.productMap.sheetName.page365
        };
    
        // p2c = new Page365ToCyberAcc(page365User, cyberAccServer.socialEnterprise, productFile);
        p2c = new Page365ToCyberAcc(page365Connect, cyberAccDbConnect, productFile);
        
        cyberaccLog.info(JSON.stringify(answers, null, 3));
        cyberaccLog.info("INIT: Initial page365 ...");
        await p2c.init();

        cyberaccLog.info("LOADPAGE365: Downloading page365 and to cyberacc ... ");
        await p2c.downloadToCyberAccByDate(answers.startDate, answers.endDate);

    } catch(error) {
        throw error;
    }
};

loadFromOcha = async(answers) => {
    let p2o;
    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        let sheetName = thamInfoUtils.getOchaProductSheetName(shopName);
       
        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  sheetName
        };
        
        // console.log(ochaConnect);
        //p2o = new OchaToCyberAcc(ochaUser, cyberAccServer.socialEnterprise);
        p2o = new OchaToCyberAcc(ochaConnect, cyberAccDbConnect);

        cyberaccLog.info(JSON.stringify(answers, null, 3));
        // await p2o.init();

        cyberaccLog.info("LOADOCHA: Downloading ocha data ...");
        await p2o.selectShopByName(shopName, productFile);
        await p2o.downloadToCyberAccByDate(answers.startDate, answers.endDate);

    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    let l2c;

    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        const productFile = {
            fileName:   thamInfo.productMap.fileName,
            sheetName:  thamInfo.productMap.sheetName.loyverse
        }

        l2c = new LoyverseToCyberAcc(shopName, cyberAccDbConnect, productFile);

        cyberaccLog.info(JSON.stringify(answers, null, 3));
        cyberaccLog.info("INIT: Initial loyverse");
        await l2c.init();

        cyberaccLog.info("LOADLOYVERSE: Reading from loyverse file and to cyberacc ...");
        await l2c.downloadToCyberAccByFile(answers.fileLoad);

    } catch(error) {
        throw error;
    }
};

loadFromFoodStory = async (answers) => {
    let f2c;
    try {
        let from = answers.loadFrom.split(":");
        let shopName = from[1].trim();

        f2c = new FoodStorySalesByDay(shopName, cyberAccDbConnect);

        cyberaccLog.info(answers);
        // await f2c.init();

        cyberaccLog.info("LOADFOODSTORY: Reading from file and send to cyberacc ...");
        await f2c.downloadToCyberAccByFile(answers.fileLoad, FOODSTORYSALESBYDAY_DEFAULTSHEET);

    } catch(error) {
        throw error;
    }
};

