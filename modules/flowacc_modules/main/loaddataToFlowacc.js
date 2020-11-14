const inquirer = require("inquirer");
const glob = require("glob");
const p365 = require("../page365/page365_main");
const ocha = require("../ocha/ocha_main");
const loy = require("../loyverse/loyverse_main");
const thamInfo = require("../../thaminfo");
const foodstory = require("../foodstory/foodstory_main");
const ochaShopName = require("../../../libs/ocha/ochaShopName.json");

const PAGE365_NAME = "page365";
const OCHA_NAME = "Ocha";
const LOYVERSE_NAME = "Loyverse";
const FOODSTORY_NAME = "FoodStory";

const LOADFROM = {
    page365: PAGE365_NAME,
    ochaRice: `${OCHA_NAME}: ${ochaShopName.riceRama9}`,
    ochaVegetable: `${OCHA_NAME}: ${ochaShopName.vegetableRama9}`,
    ochaSanpatong: `${OCHA_NAME}: ${ochaShopName.sanpatong}`,
    ochaRestChompon: `${OCHA_NAME}: ${ochaShopName.restuarantChomphon}`,
    ochaFrontChompon: `${OCHA_NAME}: ${ochaShopName.frontChomphon}`,
    loyverseThamDelivery: `${LOYVERSE_NAME}: รถธรรมธุรกิจ`,
    loyverseThamDelivery1: `${LOYVERSE_NAME}: รถร่วมธรรมธุรกิจ1`,
    foodstoryChomphon: `${FOODSTORY_NAME}: ${thamInfo.FOODSTORY_BRANCHNAME.chomphon}`,
    foodstoryThaphae: `${FOODSTORY_NAME}: ${thamInfo.FOODSTORY_BRANCHNAME.thaphae}`,
}

const LOADDATABY = {
    date: "date",
    billno: "billno",
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
        type: "list",
        name: "loadType",
        message: "What do you want to load data by ?",
        choices: function(answers) {
            return Object.values(LOADDATABY);
        },
        when: function(answers) {
            let from = answers.loadFrom.split(":");
            return (from[0] !== LOYVERSE_NAME) && (from[0] !== FOODSTORY_NAME);
        }
    },
    {
        type: "input",
        name: "startDate",
        message: "start date(yyyy-mm-dd) : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date);
        },
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.date);
        },
    },
    {
        type: "input",
        name: "startBill",
        message: "start bill no : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno);
        },
    },
    {
        type: "input",
        name: "endBill",
        message: "end bill no : ",
        when: function(answers) {
            return (answers.loadType === LOADDATABY.billno);
        },
    },
    {
        type: "list",
        name: "fileLoad",
        message: function(answers) {
            
            let path = "";
            switch (answers.loadFrom) {
                case LOADFROM.loyverseThamDelivery:  
                    path = thamInfo.FILEINPUT_PATH.loyverseThamDelivery;
                    break;
                case LOADFROM.loyverseThamDelivery1: 
                    path = thamInfo.FILEINPUT_PATH.loyverseThamDelivery1;
                    break;
                case LOADFROM.foodstoryChomphon:
                    path = thamInfo.FILEINPUT_PATH.foodstoryChomphon;
                    break;
                case LOADFROM.foodstoryThaphae:
                    path = thamInfo.FILEINPUT_PATH.foodstoryThaphae;
                    break;
                default:
            }

            return msg = `Select file that you want to read ?(path:${path})`;
        },
        choices: function(answers) {
            let path = "";
            switch (answers.loadFrom) {
                case LOADFROM.loyverseThamDelivery: 
                    path = `${thamInfo.FILEINPUT_PATH.loyverseThamDelivery}/*.csv`;
                    break;
                case LOADFROM.loyverseThamDelivery1: 
                    path = `${thamInfo.FILEINPUT_PATH.loyverseThamDelivery1}/*.csv`;
                    break;
                case LOADFROM.foodstoryChomphon:
                    path = `${thamInfo.FILEINPUT_PATH.foodstoryChomphon}/*.xlsx`;
                    break;
                case LOADFROM.foodstoryThaphae:
                    path = `${thamInfo.FILEINPUT_PATH.foodstoryThaphae}/*.xlsx`;
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

module.exports = async () => {
    try {
        // console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        console.log("******     Load data from page365, ocha, loyverse  *******");
        console.log("******     and create tax invoice flow account     ******");

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
    } 
    catch(error) {
        console.log(error);
    }
};

loadFromOcha = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        from[1] = from[1].trim();
        // console.log(from);
        if (answers.loadType === LOADDATABY.date) {
            await ocha.loadOchaByDates(from[1], answers.startDate, answers.endDate);
        } else if (answers.loadType === LOADDATABY.billno) {
            await ocha.loadOchaByBills(from[1], answers.startBill, answers.endBill);
        } else {
            throw `load data from this ${answers.loadType} not implement`;
        }
    } catch(error) {
        throw error;
    }
};


loadFromPage365 = async(answers) => {
    try {
        if (answers.loadType === LOADDATABY.date) {
            await p365.loadPage365ByDates(answers.startDate, answers.endDate);
        } else if (answers.loadType === LOADDATABY.billno) {
            await p365.loadPage365ByBills(answers.startBill, answers.endBill);
        } else {
            throw `load data from this ${answers.loadType} not implement`;    
        }
    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        from[1] = from[1].trim();
        
        await loy.loadLoyverseFromFile(from[1], answers.fileLoad);
    } catch(error) {
        throw error;
    }
}

loadFromFoodStory = async(answers) => {
    try {
        let from = answers.loadFrom.split(":");
        from[1] = from[1].trim();

        await foodstory.loadFoodStoryFromFile(from[1], answers.fileLoad);
    } catch (error) {
        throw error;
    }
}