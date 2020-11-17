const inquirer = require("inquirer");
const glob = require("glob");
const VegetableToFlowAcc = require("../purchases/vegetableToFlowAcc");
// const thamInfo = require("../../thaminfo");
const SeaFoodToFlowAcc = require("../purchases/seafoodToFlowAcc");
const { flowAccCredentail, ggsheet_credfile } = require("../../thaminfo_credential.json");
const { productMap, inputfile_path, ggSheet } = require("../../thaminfo_config.json");

const LOADFROM = {
    seafood: "seafood",
    vegetable: "vegetable",
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
        name: "fileLoad",
        message: `Select file that you want to read ?(path:${inputfile_path.purchasesSeafood})`,
        choices: function(answers) {
            let path = `${inputfile_path.purchasesSeafood}/*.xlsx`;
            return glob.sync(path);
        },
        when: function(answers) {
            return (answers.loadFrom === LOADFROM.seafood);
        }
    },
    {
        type: "input",
        name: "sheetName",
        message: "Sheetname : ",
        default: "purchases",
        when: function(answers) {
            return (answers.loadFrom === LOADFROM.seafood);
        }
    },
    {
        type: "input",
        name: "startRow",
        message: "start row number : ",
    },
    {
        type: "input",
        name: "endRow",
        message: "end row number :",
    },
];

module.exports = async () => {
    try {
        // console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
        console.log("******     Load purchases data from file           *******");
        console.log("******     and create purchases flow account       ******");

        let answers = await inquirer.prompt(questions);
        console.log(answers);
        //console.log(from);

        console.log("************ Start loading ************");
        if (answers.loadFrom === LOADFROM.seafood) {
            await loadFromSeaFood(answers);
        } else if (answers.loadFrom === LOADFROM.vegetable) {
            await loadFromVegetable(answers);
        } else {
            throw "error load from selected";
        }
        console.log("************     END       ************");
    } 
    catch(error) {
        console.log(error);
    }
};

loadFromSeaFood = async(answers) => {
    console.log("!!!Oop: Not implement");

    const productFile = {
        fileName: productMap.fileName,
        sheetName: productMap.sheetName.purchasesSeafood,
    };

    const CONTACTNAME = "ซื้ออาหารทะเล";

    try {
        const s2fa= new SeaFoodToFlowAcc(CONTACTNAME, flowAccCredentail, productFile);

        await s2fa.init();
        s2fa.createPurchasesByIndex(answers.fileLoad, answers.sheetName, answers.startRow, answers.endRow);

    } catch(error) {
        throw error;
    }
};


loadFromVegetable = async(answers) => {
    console.log("Load From Google sheet : รายการรับซื้อผัก_2563");
    console.log("SheetName : รายการรับเข้า");
    
    const productFile = {
        fileName: productMap.fileName,
        sheetName: productMap.sheetName.purchasesVegetable,
    };
    
    try {
        const v2fa = new VegetableToFlowAcc(flowAccCredentail, ggsheet_credfile, productFile);
    
        await v2fa.init();
    
        let workbookId = ggSheet.vegetable_ggSheet.workbookId;
        let worksheetId = ggSheet.vegetable_ggSheet.worksheetId;
        await v2fa.createPurchasesByIndex(workbookId, worksheetId, answers.startRow, answers.endRow);
    
    } catch(error) {
        throw error;
    }
}


