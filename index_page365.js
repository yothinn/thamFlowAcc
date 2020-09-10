const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");
const Page365 = require("./libs/page365/page365");
const Page365ToFlowAcc = require("./libs/page365/page365ToFlowAcc");
const page365Tools = require("./libs/page365/page365Tools");

// TODO : move to config file
const PRODUCTMAP_FILE = "product.xlsx";
const PRODUCTMAP_PAGE365_SHEET = "page365";

(async() => {

    let flowAcc = new FlowAccount();
    let page365 = new Page365();
    let p2fa = new Page365ToFlowAcc();

    try {
        p2fa.init(PRODUCTMAP_FILE, PRODUCTMAP_PAGE365_SHEET); 

        await flowAcc.authorize(
            process.env.FA_CLIENT_ID,
            process.env.FA_CLIENT_SECRET,
            process.env.FA_GRANT_TYPE,
            process.env.FA_SCOPE,
        );

        await page365.connect(process.env.PAGE365_USERNAME, process.env.PAGE365_PASSWORD);

        // TODO: request for day or request per bills
        // let ord = await page365.getOrderDetail(17267312);
        let ord = await page365.getOrderDetailByBillNo(8585);

        // Check state if void not send to flowaccount
        if (ord.stage === page365Tools.PAGE365_ORDER_STAGE.VOIDED)  {
            console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
            return;
        }

        console.log(ord);
        try {
            let inv = p2fa.toTaxInvoiceInline(ord);
            // console.log(inv);
            if (inv) {
                let res = await flowAcc.createTaxInvoiceInline(inv);
                if (res.status) {
                    // console.log(res);
                    console.log(`Success create PAGE365 no : ${ord.no}, FLOW no : ${res.data.documentSerial}`);
                    
                }
            } 
        } catch (error) {
            console.log(`!!!Error create PAGE365 no : ${ord.no}`);
            console.log(error);
        }
        
    } 
    catch(error) {
        console.log(error);
    }

})();