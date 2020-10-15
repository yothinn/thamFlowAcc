const { program } = require("commander");
const createProduct = require("./createproduct");
const loadDataToFlowAcc = require("./loaddatatoflow");
const checkProduct = require("./checkproduct");

program.version("0.0.1");

program
    .option("-c, --create", "create product to flowacc from product.xlsx file")
    .option("-l, --load", "Download data from select and create to taxinvoice inline flowacc")
    .option("-s, --seafood", "read purchase seadfood file and create to purchases flowacc")
    .option("-v, --vegetable", "read vegetable google sheet and create to purchases flowacc")
    .option("-k, --check", "check products that they are created in flowaccount yet?");

program.parse(process.argv);

if (program.create) {
    createProduct();
} else if (program.load) {
    loadDataToFlowAcc();
} else if (program.seafood) {
    console.log('seafood not yet implement');
} else if (program.vegetable) {
    console.log('vegetable not yet implement');
} else if (program.check) {
    checkProduct();
} else {
    console.log("type:  node index --help , for command detail");
}
