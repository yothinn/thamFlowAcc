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
