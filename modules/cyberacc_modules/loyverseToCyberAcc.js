/**
 * Read Loyverse data from file and send to create cyberacc databse
 * Loyverse file : ใช้ใบเสร็จรับเงินตามรายการสินค้า
 * Author: Yothin Setthachatanan
 * Created: 17/11/2020
 * Updated: 19/11/2020
 */

const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const ProductMap = require("../../libs/product/productmap");
const LoyverseData = require("../../libs/loyverse/loyverseData");
const csvtojson = require('csvtojson');
const accountChart = require("./accoutChart.json");
const cyberaccUtils = require("../../libs/cyberacc/cyberaccUtils");
const {VATRATE, loadFrom } = require("../thaminfo_config.json");
const cyberaccLog = require("./cyberaccLog");

// const LOYVERSE_NAME = "loyverse";
// const VATRATE = 7;

class LoyverseToCyberAcc {
    _shopName = null; 
    _cyberAccConfig = null;
    _productFile = null;
    _productMap = null;

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
    // constructor(shopName, cyberAccConfig, productFile) {
    //     this._shopName = shopName;
    //     this._cyberAccConfig = cyberAccConfig;
    //     this._productFile = productFile;
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
    //         this._productMap = new ProductMap();
    //         await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
            
    //     } catch(error) {
    //         throw error;
    //     }
    // }

    constructor(shopName, cyberAccDbConnect, productFile) {
        this._shopName = shopName;
        this._cyberAccDb = cyberAccDbConnect;
        this._productFile = productFile;
    }

    async init() {
        try {
            // this._cyberAccDb = new CyberAccDatabase();
            // await this._cyberAccDb.connect(
            //     this._cyberAccConfig.username,
            //     this._cyberAccConfig.password,
            //     this._cyberAccConfig.server,
            //     this._cyberAccConfig.database,
            //     this._cyberAccConfig.instance
            // );

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
            
        } catch(error) {
            throw error;
        }
    }


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
                let desp = loadFrom.loyverseName;

                await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

                cyberaccLog.info(`GLMain: success created ${glMainId}`);
                // console.log(`GLMain : success created ${glMainId}`);
            }

            return glMainId;
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
                //console.log(`GLCredit : success create ${glMainId} ${id} ${credit.accountCode} ${credit.desp} ${credit.amount}`);
            }

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
                // console.log(`GLDebit : success create ${glMainId} ${id} ${debit.accountCode} ${debit.desp} ${debit.amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    /**
     * Read loyverse data file (csv) to cyberacc database(GLMain, GLCredit, GLDebit)
     * loyverse file : ใช้ใบเสร็จรับเงินตามรายการสินค้า
     * @param {*} fileName : csv file
     */
    async downloadToCyberAccByFile(fileName) {
        try {

            // let glList = await this.calGLList(fileName);
            const trans = await csvtojson().fromFile(fileName);

            // convert transcation to bill list
            let billList = await this.transToBillList(trans);
            
            // calculate glList from bill list
            let glList = await this.calGLList(billList);

            // console.log(JSON.stringify(glList, null, 3));

            for (let gl of glList) {
                let glMainId = await this.createCyberAccGLMain(gl.date);
                if (glMainId) {
                    await this.createCyberAccGLDebit(glMainId, gl.debit);
                    await this.createCyberAccGLCredit(glMainId, gl.credit);
                } else {
                    throw "Can't generate glMainid in GLMain";
                }
            }
            
        } catch(error) {
            throw error;
        }
    }

    /**
     * calculate glList from billList
     * @param {Array of Object} billList 
     * @returns glList : array of gl
     * {
     *  date:
     *  credit: []
     *  {
     *      accountCode:
     *      desp:
     *      amount:
     *  }
     *  debit: []
     *  : same as credit
     * }
     */
    async calGLList(billList) {
        try {
            let glList = [];
            let gl = null;

            for (let bill of billList) {
                // --- Add to gl list part ---
                
                // console.log(bill.date);
                if (!gl || gl.date.getTime() !== bill.date.getTime()) {
                    gl = await glList.find((item) => {
                        // console.log(`${item.date.getTime()} : ${loyData.billDate.getTime()}`);
                        return item.date.getTime() === bill.date.getTime();
                    });
                    // console.log(gl);
                }

                let d = bill.date.getDate();
                let m = bill.date.getMonth()+1;
                let y = bill.date.getFullYear()+543;

                if (!gl) {
                    gl = {
                        date: bill.date,
                        credit: [],
                        debit: [],
                    }
                    glList.push(gl);         
                }

                // --- Calculate debit part ---
                let glDebit = gl.debit.find((debit) => {
                    return debit.accountCode === accountChart.CUSTOMER_THAMDELIVERY.code;
                });

                if (!glDebit) {
                    glDebit = {
                        accountCode: accountChart.CUSTOMER_THAMDELIVERY.code ,
                        desp: `${accountChart.CUSTOMER_THAMDELIVERY.name} ${d}/${m}/${y.toString().slice(-2)}`,
                        amount: 0.0,
                    }
                    gl.debit.push(glDebit);
                } 

                glDebit.amount += bill.vatAmount + bill.novatAmount - bill.discount;

                // --- Calculate GLCredit part ---
                // glCredit from vat item
                for (let v of bill.itemVat) {
                    let glCredit = gl.credit.find((credit) => {
                        return (credit.accountCode === v.accountCode) ;
                    });

                    if (!glCredit) {
                        
                        glCredit = {
                            accountCode: v.accountCode,
                            desp: v.desp,
                            amount: 0.0,
                            vatRate: v.vatRate,
                        };
    
                        gl.credit.push(glCredit);
                    }
    
                    glCredit.amount += v.amount;
                }

                // glCredit from no vat item
                for (let nv of bill.itemNoVat) {
                    let glCredit = gl.credit.find((credit) => {
                        return (credit.accountCode === nv.accountCode) ;
                    });

                    if (!glCredit) {
                        
                        glCredit = {
                            accountCode: nv.accountCode,
                            desp: nv.desp,
                            amount: 0.0,
                            vatRate: nv.vatRate
                        };
    
                        gl.credit.push(glCredit);
                    }
    
                    glCredit.amount += nv.amount;
                }
            }

            return this.calVatGLList(glList);
        } catch(error) {
            throw error;
        }
    }

    /**
     * calculate vat amount and calculate item vat amount from include to exclude vat
     * @param {*} glList 
     * @retrun glList after calculate
     */
    async calVatGLList(glList) {
        try {
            for (let gl of glList) {
                let creditList = gl.credit;

                let vatAmount = 0.0;
                for (let credit of creditList) {
                    // No vat
                    if (credit.vatRate !== VATRATE) {
                        continue;
                    }

                    // Vat
                    let v = (credit.amount * VATRATE) / (100 + VATRATE);
                    credit.amount -= v;

                    vatAmount += v;
                }

                creditList.push({
                    accountCode: accountChart.salesTax.code,
                    desp: accountChart.salesTax.name,
                    amount: vatAmount
                })
            }
            return glList;
        } catch(error) {
            throw error;
        }
    }

    /**
     * convert transaction from file to bill list by payment no
     * @param {*} trans 
     * @return billList
     * {
     *  paymentNo :
     *  date :
     *  discount:
     *  vatAmount:
     *  novatAmout:
     *  itemVat: [] 
     *  {
     *      accountCode:
     *      desp:
     *      amount:
     *      vatRate:
     *  }
     *  itemNoVat: []
     *  : same as itemVat
     * }
     */
    async transToBillList(trans) {
        try {
            let billList = [];
            let bill = null;
            let row;
            let len = trans.length;

            // convert transaction to bill list
            for (let i = len-1; i >=0; i--) {
                row = trans[i];

                let loyData = new LoyverseData(row);

                loyData.billDate.setHours(0, 0, 0, 0);
                // Find new gl when current is null or change date
                if (!bill || bill.paymentNo !== loyData.paymentNo) {
                    bill = await billList.find((item) => {
                        // console.log(`${item.paymentNo} : ${loyData.paymentNo}`);
                        return item.paymentNo === loyData.paymentNo;
                    });
                }

                if (!bill) {
                    bill = {
                        paymentNo: loyData.paymentNo,
                        date: loyData.billDate,
                        discount: 0.0,
                        vatAmount: 0.0,
                        novatAmount: 0.0,
                        itemVat: [],
                        itemNoVat: [],
                    }

                    billList.push(bill);
                }

                bill.discount += loyData.discount;

                let product = await this._productMap.findProduct(loyData.productName, "");
                let sellChartId;
                let vatRate;
                if (!product) {
                    sellChartId = accountChart.OTHERINCOME.code;
                    vatRate = 7;
                } else {
                    sellChartId = product.cyberaccSellChartId;
                    vatRate = product.vatRate;
                }

                let d = loyData.billDate.getDate();
                let m = loyData.billDate.getMonth()+1;
                let y = loyData.billDate.getFullYear()+543;

                let accountName = await this._cyberAccDb.getAccountName(sellChartId);

                let itemList;
                // Select List vat or no vat
                if (vatRate === VATRATE) {
                    bill.vatAmount += loyData.total;
                    itemList = bill.itemVat;
                } else {
                    bill.novatAmount += loyData.total;
                    itemList = bill.itemNoVat;
                }

                let item = itemList.find((item) => {
                    return item.accountCode === sellChartId;
                });

                if (!item) {
                    item = {
                        accountCode: sellChartId,
                        desp: `${accountName} ${d}/${m}/${y.toString().slice(-2)}`,
                        amount: 0.0,
                        vatRate: vatRate,
                    }
                    itemList.push(item);
                }

                item.amount += loyData.total;

            }

            // Calculate decrease discount
            for (let bill of billList) {
                // ถ้ามีรายการไม่คิด vat ให้เอาส่วนลดไปหักที่รายการไม่คิด vat
                let discountItemList = (bill.itemNoVat.length > 0) ? bill.itemNoVat : bill.itemVat;

                // หาว่ามี accountcode ของ รายได้ผัก ไหม ถ้ามี หักส่วนลดที่นี้ที่เดียว
                // แต่ถ้าไม่มี ให้หารทุกส่วน
                let vegetableItem = discountItemList.find((item) => {
                    return item.accountCode === accountChart.vegetableIncomeRama9;
                });

                if (vegetableItem) {
                    vegatableItem.amount -= bill.discount;
                    continue;
                }

                // ไม่มีรายการสินค้าประเภทผัก หักส่วนลดเท่าๆกันในรายการไม่คิด vat
                let discountEach = bill.discount / discountItemList.length;

                for (let item of discountItemList) {
                    item.amount -= discountEach;
                }
            }

            return billList;
        } catch(error) {
            throw error;
        }
    }

}

module.exports = LoyverseToCyberAcc;