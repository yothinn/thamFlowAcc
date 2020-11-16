
const inquirer = require("inquirer");
const { ochaShopName, foodStoryBranchName } = require("../thaminfo_config.json");
// const thamInfo = require("../thaminfo");

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
    foodstoryChomphon: `${FOODSTORY_NAME}: ${foodStoryBranchName.chomphon}`,
    foodstoryThaphae: `${FOODSTORY_NAME}: ${foodStoryBranchName.thaphae}`,
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
    },
    {
        type: "input",
        name: "endDate",
        message: "end date(yyyy-mm-dd) :",
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
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

loadFromOcha = async(answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

loadFromLoyverse = async(answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

loadFromFoodStory = async (answers) => {
    try {
        console.log("!!Oops : Not implement yet");
    } catch(error) {
        throw error;
    }
};

