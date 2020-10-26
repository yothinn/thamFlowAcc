const inquirer = require("inquirer");
const foodStory = require("./libs/foodstory/index_foodstory");
const thamInfo = require("./libs/thamflowacc_info");
const loyverse = require("./libs/loyverse/index_loyverse");
const glob = require("glob");

const LOYVERSE_NAME = "Loyverse";
const FOODSTORY_NAME = "FoodStory";

const LOADFROM = {
    // page365: "page365",
    // ochaRice: "Ocha: ข้าวแปรรูป พระราม๙",
    // ochaVegetable: "Ocha: ผัก พระราม๙",
    // ochaSanpatong: "Ocha: ฐานธรรมฯสันป่าตอง (ร้านยักษ์กะโจน)",
    // ochaRestChompon: "Ocha: ครัวชุมพรคาบาน่า",
    // ochaFrontChompon: "Ocha: Front ชุมพรคาบาน่า",
    loyverseThamDelivery: "Loyverse: รถธรรมธุรกิจ",
    loyverseThamDelivery1: "Loyverse: รถร่วมธรรมธุรกิจ1",
    foodstoryChomphon: `FoodStory: ${thamInfo.FOODSTORY_BRANCHNAME.chomphon}`,
    foodstoryThaphae: `FoodStory: ${thamInfo.FOODSTORY_BRANCHNAME.thaphae}`,
};

const questions = [
    {
        type: "list",
        name: "loadFrom",
        message: "What do you want to check product from ?",
        choices: function(answers) {
            return Object.values(LOADFROM);
        }
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
    },
];

module.exports = async() => {
    try {
        console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        console.log("******     Check products that they are created in *******");
        console.log("******     flowaccount yet ?                       *******");

        let answers = await inquirer.prompt(questions);
        console.log(answers);
        let from = answers.loadFrom.split(":");
        //console.log(from);

        console.log("************ Start loading ************");
        if (from[0] === LOYVERSE_NAME) {
            await loyverse.checkProduct(answers.fileLoad);
        } else if (from[0] === FOODSTORY_NAME) {
            await foodStory.checkProduct(from[1].trim(), answers.fileLoad, foodStory.FOODSTORY_DEFAULTSHEET);
        }
        console.log("************     END       ************");
    } 
    catch(error) {
        console.log(error);
    }
};