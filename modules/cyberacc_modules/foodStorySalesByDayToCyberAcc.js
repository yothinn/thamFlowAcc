/**
 * Read salesbyday file of foddstory to cyberacc
 * Author: Yothin Setthachatanan
 * Created: 18/11/2020
 * Updated: 19/11/2020
 */

const FoodStorySalesByDay = require("../../libs/foodstory/foodstorySalesByDay");
const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const cyberaccUtils  = require("../../libs/cyberacc/cyberaccUtils");
const accountChart = require("./accoutChart.json");
const { VATRATE , loadFrom, foodStoryBranchName } = require("../thaminfo_config.json");
const cyberaccLog = require("./cyberaccLog");
const { cyberAccDbConnect } = require("../connect-service");

/**
 * Read salesbyday file of foodstory to cyberacc
 */
class FoodStorySalesByDayToCyberAcc {
    _shopName = null; 
    _cyberAccConfig = null;
    // _productFile = null;
    // _productMap = null;

    _cyberAccDb = null;
    
    /**
     * 
     * @param {string} shopName
     *  
     * @param {*} cyberAccConfig 
      * {
     *  username:
     *  password:
     *  server:
     *  database:
     *  instance
     * }
     * @param {*} productFile 
     * {
     *  fileName: product filename,
     *  sheetName: product sheetname
     * } 
     */
    // constructor(shopName, cyberAccConfig) {
    // // constructor(shopName, cyberAccConfig, productFile) {
    //     this._shopName = shopName;
    //     this._cyberAccConfig = cyberAccConfig;
    //     //this._productFile = productFile;
    // }

    // async init() {
    //     try {
    //         this._cyberAccDb = new CyberAccDatabase();
    //         await this._cyberAccDb.connect(
    //             this._cyberAccConfig.username,
    //             this._cyberAccConfig.password,
    //             this._cyberAccConfig.server,
    //             this._cyberAccConfig.database,
    //             this._cyberAccConfig.instance
    //         );

    //         // load product map
    //         // this._productMap = new ProductMap();
    //         // await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
            
    //     } catch(error) {
    //         throw error;
    //     }
    // }

    constructor(shopName, cyberAccDbConnect) {
        this._shopName = shopName;
        this._cyberAccDb = cyberAccDbConnect;
        //this._productFile = productFile;
    }
    
 

    /**
     * create cyberacc GLMain
     * @param {date} orderDate : Date object 
     */
    async createCyberAccGLMain(orderDate) {
        try {
            // check valid date
            if (!(orderDate instanceof Date)) {
                throw "orderDate require date object";
            }

            let d = orderDate.getDate();
            let m = orderDate.getMonth()+1;
            // convert to พ.ศ.
            let y = orderDate.getFullYear()+543;
            
            // console.log(startDay.getMonth()+1);
            // console.log(startDay.getFullYear()+543);
            // create GLMain
            let glMainId = await this._cyberAccDb.getNewGLMainId(cyberaccUtils.ACCOUNTTYPE_ABBR.AR, m.toString(), y.toString());

            if (glMainId) {
            // FORMAT (พ.ศ.) : day/month/year
                let dateStr = `${d}/${m}/${y}`;
                let desp = loadFrom.foodStoryName;

                await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

                cyberaccLog.info(`GLMain: success created ${glMainId}`);
                //console.log(`GLMain : success created ${glMainId}`);
            }

            return glMainId;
        } catch(error) {
            throw error;
        }
    }

    async createCyberAccGLDebit(glMainId, glDebit) {
        try {
            for (let debit of glDebit) {

                let id = await this._cyberAccDb.getNewIdGLDebit();
                if (!id) {
                    throw "Can't generate id of GLDebit";
                }

                await this._cyberAccDb.insertToGLDebit(glMainId, id, debit.accountCode, debit.desp, debit.amount);

                cyberaccLog.info(`GLDebit: success create ${glMainId} ${id} ${debit.accountCode} ${debit.desp} ${debit.amount}`);
                //console.log(`GLDebit : success create ${glMainId} ${id} ${debit.accountCode} ${debit.desp} ${debit.amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    async createCyberAccGLCredit(glMainId, glCredit) {
        try {
            for (let credit of glCredit) {

                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }

                await this._cyberAccDb.insertToGLCredit(glMainId, id, credit.accountCode, credit.desp, credit.amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${credit.accountCode} ${credit.desp} ${credit.amount}`);
                // console.log(`GLCredit : success create ${glMainId} ${id} ${credit.accountCode} ${credit.desp} ${credit.amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    // Assume all product is include vat
    async downloadToCyberAccByFile(fileName, sheetName) {
        try {
            const fs = new FoodStorySalesByDay();

            let totalRow = await fs.readFile(fileName, sheetName);

            for (let i=0; i<=totalRow; i++) {
                let dateStr = fs.getDate(i);
                if (!dateStr) {
                    continue;
                }

                let billDate = new Date(dateStr);
                let d = billDate.getDate();
                let m = billDate.getMonth()+1;
                let y = billDate.getFullYear()+543;

                let glMainId = await this.createCyberAccGLMain(billDate);
                
                // let totalBeforeDiscount = fs.getTotalBeforeDiscount(i);
                // let discountInItem = fs.getDiscountInItem(i);
                // let discountEndBill = fs.getDiscountEndBill(i);
                // let rounding = fs.getRounding(i);
                // let branchName = fs.getBranchName(i);
                let total = fs.getTotal(i) - fs.getRefund(i);
                
                let debitAccountCode, creditAccountCode;
                let desp;
                switch (this._shopName) {
                    case foodStoryBranchName.chomphon:
                        debitAccountCode = accountChart.CUSTOMER_RESTCHOMPHON.code;
                        desp = `รายได้ขายอาหารและเครื่องดื่ม(ชุมพรคาบาน่า) ${d}/${m}/${y.toString().slice(-2)}`;
                        creditAccountCode = accountChart.RESTCHOMPHON_INCOME.code;
                        break;
                    case foodStoryBranchName.thaphae:
                        debitAccountCode = accountChart.CUSTOMER_RESTTHAPHAE.code;
                        desp = `รายได้ขายอาหารและเครื่องดื่ม(ท่าแพ) ${d}/${m}/${y.toString().slice(-2)}`;
                        creditAccountCode = accountChart.RESTTHAPHAE_INCOME.code;
                        break;
                }


                let vat = (total * VATRATE) / (100 + VATRATE);
                let glDebit = [
                    {
                        accountCode: debitAccountCode,
                        desp: desp,
                        amount: total,
                    }
                ];
                let glCredit = [
                    {
                        accountCode: creditAccountCode,
                        desp: desp,
                        amount: total - vat
                    },
                    {
                        accountCode: accountChart.salesTax.code,
                        desp: accountChart.salesTax.name,
                        amount: vat
                    }
                ];

                // console.log(glDebit);
                // console.log(glCredit);

                await this.createCyberAccGLDebit(glMainId, glDebit);
                await this.createCyberAccGLCredit(glMainId, glCredit);

            }

        } catch(error) {
            throw error;
        }
    }

}

module.exports = FoodStorySalesByDayToCyberAcc;