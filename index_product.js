
const inquirer = require("inquirer");
const dotenv = require("dotenv").config();
const XLSX = require('xlsx');
const FlowAccount = require('./libs/flowacc');

const PRODUCT_FILE = "product.xlsx";
const PRODUCT_SHEETNAME  = "allFlowProduct";

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

(async() => {
    try {
        console.log("********** THAMTURAKIT SOCIAL ENTERPRICE **********");
        console.log("********** create product from file to flow account **********");

        let answers = await inquirer.prompt(questions);
        console.log(answers);
 
        let list;

        // Read product from file
        const wb = await XLSX.readFile(PRODUCT_FILE);
        const ws = await wb.Sheets[PRODUCT_SHEETNAME];
        const productList = await XLSX.utils.sheet_to_json(ws);

        // seperate product : create all 
        if (answers.createAll) {
            list = productList;
        } else {
            list = productList.slice(parseInt(answers.startRow)-2, parseInt(answers.endRow)-1);
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
<<<<<<< HEAD
        // ใช้ For of แทน forEach เพราะ forEach เร็วไปทาง server รับข้อมูลและสร้าง product ไม่ทัน
=======
>>>>>>> 1e5fcddc37457d40d4ec582cda509a2e1792a8f6
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
})();