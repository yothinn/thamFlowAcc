const inquirer = require("inquirer");
const glob = require("glob");
const VegetableToFlowAcc = require("./libs/purchase/vegetable/vegetableToFlowAcc");
const thamInfo = require("./libs/thamflowacc_Info");
const SeaFoodToFlowAcc = require("./libs/purchase/seafood/seafoodToFlowAcc");

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
        message: `Select file that you want to read ?(path:${thamInfo.FILEINPUT_PATH.purchasesSeafood})`,
        choices: function(answers) {
            let path = `${thamInfo.FILEINPUT_PATH.purchasesSeafood}/*.xlsx`;
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
        console.log("******     THAMTURAKIT SOCIAL ENTERPRICE           *******");
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
        fileName: thamInfo.PRODUCTMAP.fileName,
        sheetName: thamInfo.PRODUCTMAP.sheetName.purchasesSeafood,
    };

    const CONTACTNAME = "ซื้ออาหารทะเล";

    try {
        const s2fa= new SeaFoodToFlowAcc(CONTACTNAME, thamInfo.flowAccCredentail, productFile);

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
        fileName: thamInfo.PRODUCTMAP.fileName,
        sheetName: thamInfo.PRODUCTMAP.sheetName.purchasesVegetable,
    };
    
    try {
        const v2fa = new VegetableToFlowAcc(thamInfo.flowAccCredentail, thamInfo.GGSHEET_CRED, productFile);
    
        await v2fa.init();
    
        let workbookId = thamInfo.VEGETABLE_GGSHEET_DATA.workbookId;
        let worksheetId = thamInfo.VEGETABLE_GGSHEET_DATA.worksheetId;
        await v2fa.createPurchasesByIndex(workbookId, worksheetId, answers.startRow, answers.endRow);
    
    } catch(error) {
        throw error;
    }
}


