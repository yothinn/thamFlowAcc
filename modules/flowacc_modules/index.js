// const { program } = require("commander");
const createProduct = require("./main/createFlowProduct");
const loadDataToFlowAcc = require("./main/loaddataToflowacc");
const purchasesToFlowAcc = require("./main/purchasestoflow");
const inquirer = require("inquirer");

// const checkProduct = require("./checkproduct");

// program.version("0.0.1");

// program
//     .option("-c, --create", "create product to flowacc from product.xlsx file")
//     .option("-l, --load", "Download data from select and create to taxinvoice inline flowacc")
//     //.option("-k, --check", "check products that they are created in flowaccount yet?")
//     .option("-p, --purchases", "read data from file and create purchases flowacc");

// program.parse(process.argv);

// if (program.create) {
//     createProduct();
// } else if (program.load) {
//     loadDataToFlowAcc();
// } else if (program.purchases) {
//     purchasesToFlowAcc();
// } 
// // else if (program.check) {
// //     checkProduct();
// // }
// else {
//     console.log("type:  node index --help , for command detail");
// }

const LOADPROGRAMS = {
    createProduct: "1. Create product to flowacc",
    loadFromToFlow: "2. Download data from... to flow account",
    purchasesToFlow: "3. purchases data to cyberAcc",
};

const questions = [
    {
        type: "list",
        name: "program",
        message: "FlowAccount : What program  do you want to run ?",
        choices: function(answers) {
            return Object.values(LOADPROGRAMS);
        }
    },
];

module.exports = async() => {
    try {

        let answers = await inquirer.prompt(questions);
        console.log(answers);

        switch(answers.program) {
            case LOADPROGRAMS.createProduct:
                createProduct();
                break;
            case LOADPROGRAMS.loadFromToFlow:
                loadDataToFlowAcc();
                break;
            case LOADPROGRAMS.purchasesToFlow:
                purchasesToFlowAcc();
                break;
        }
    } catch(error) {
        console.log(error);
    }
};
