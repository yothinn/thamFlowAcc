
const inquirer = require("inquirer");
const XLSX = require('xlsx');
const FlowAccount = require("../../../libs/flowacc/flowacc");
const thamInfo = require("../../thaminfo");

// const PRODUCT_FILE = "product.xlsx";
// const PRODUCT_SHEETNAME  = "allFlowProduct";

const questions = [
    {
        type: "confirm",
        name: "createAll",
        message: "Are you create all products in file ? ",
        default: false,
    },
    {
        type: "input",
        name: "startRow",
        message: "start row number : ",
        when: function(answers) {
            return !answers.createAll;
        },
    },
    {
        type: "input",
        name: "endRow",
        message: "end row number :",
        when: function(answers) {
            return !answers.createAll;
        },
    },
];

module.exports = async () => {
    try {
        // console.log("********** THAMTURAKIT SOCIAL ENTERPRICE **********");
        console.log("********** create product from file to flow account **********");

        let answers = await inquirer.prompt(questions);
        console.log(answers);
 
        let list;

        // Read product from file
        const wb = await XLSX.readFile(thamInfo.PRODUCTMAP.fileName);
        const ws = await wb.Sheets[thamInfo.PRODUCTMAP.sheetName.allFlowProduct];
        const productList = await XLSX.utils.sheet_to_json(ws);

        // seperate product : create all 
        if (answers.createAll) {
            list = productList;
        } else {
            list = productList.slice(parseInt(answers.startRow)-2, parseInt(answers.endRow)-1);
            // console.log(list);
        }

        // Authorize flow account
        const flowAcc = new FlowAccount();

        await flowAcc.authorize(
            process.env.FA_CLIENT_ID,
            process.env.FA_CLIENT_SECRET,
            process.env.FA_GRANT_TYPE,
            process.env.FA_SCOPE
        );    

        // console.log(list);
        // Read each product and send to create flow account
        // ใช้ For of แทน forEach เพราะ forEach เร็วไปทาง server รับข้อมูลและสร้าง product ไม่ทัน
        for (let [index, item] of list.entries()) {
        // list.forEach(async (item, index) => {
            try {
                const bodyProduct = {
                    "type": item.type,
                    "code": item.code,
                    "name": item.name,
                    "sellDescription": item.sellDescription || "",
                    "sellPrice": item.sellPrice || 0,
                    "sellVatType": item.sellVatType,
                    "unitName": item.unitName || "",
                    "categoryName": item.categoryName,
                    "barcode": "",
                    "buyDescription": item.buyDescription || "",
                    "buyPrice": item.buyPrice || 0,
                    "buyVatType": item.buyVatType,
                    "sellChartOfAccountId": item.sellChartId,
                    "buyChartOfAccountId": item.buyChartId,
                };

                // console.log(bodyProduct);
                
                let res = await flowAcc.createProduct(bodyProduct);
                // console.log(res);

                if (res.status) {
                    console.log (`--- Success create product index: ${index+2} , name: ${item.name}`);
                }
            } catch (error) {
                console.log(`!!! ${error}, index: ${index+2}, name: ${item.name}`);
            }
        //});
        }
            
    } catch(error) {
        console.log(error);
    }
};