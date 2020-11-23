/**
 * Page365ToCyberAcc : download data from page365 and write to cyber database (mssql)
 * Author   : Yothin Setthachatanan
 * Company  : Thamturakit Social Enterprise
 * Created  : 11 Nov 2020
 * Updated  : 19 Nov 2020
 * REMARK :
 * When change database and account chart code change
 * You must edit account chart code
 */

const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const Page365 = require("../../libs/page365/page365");
const ProductMap = require("../../libs/product/productmap");
const cyberaccUtils = require("../../libs/cyberacc/cyberaccUtils");
const page365Utils = require("../../libs/page365/page365Utils");
const { VATRATE, loadFrom } = require("../thaminfo_config.json");
const cyberaccLog = require("./cyberaccLog");

// REMARK : when change database must edit accoutChart code
const accountChart = require("../social_accountChart.json");

// const PAGE365_NAME = "page365";
const DESP_CUSTOMER_DELIVERY = "ค่าข้าวและสินค้าออนไลน์";
// const VATRATE = 7;

class Page365ToCyberAcc {
    
    // Info
    _cyberaccConfig;
    _page365User;
    _productFile;

    // class object
    _cyberAccDb = null;
    _page365 = null;
    _productMap = null;

      /**
     * 
     * @param {*} page365User 
     * {
     *  username:
     *  password:
     * }
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
     *  fileName:
     *  sheetName
     * }
     */
    // constructor(page365User, cyberAccConfig, productFile) {
    //     this._page365User = page365User;
    //     this._cyberaccConfig = cyberAccConfig;
    //     this._productFile = productFile;
    // }

    // async init() {
    //     try {
            
    //         this._page365 = new Page365();
    //         await this._page365.connect(this._page365User.username, this._page365User.password);

    //         this._cyberAccDb = new CyberAccDatabase();
    //         await this._cyberAccDb.connect(
    //             this._cyberaccConfig.username,
    //             this._cyberaccConfig.password,
    //             this._cyberaccConfig.server,
    //             this._cyberaccConfig.database,
    //             this._cyberaccConfig.instance
    //         );

    //         // load product map
    //         this._productMap = new ProductMap();
    //         await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);

    //     } catch (error) {
    //         throw error;
    //     }

    // }

    constructor(page365Connect, cyberAccDbConnect, productFile) {
        this._page365 = page365Connect;
        this._cyberAccDb = cyberAccDbConnect;
        this._productFile = productFile;
    }

    async init() {
        try {
            // this._page365 = new Page365();
            // await this._page365.connect(this._page365User.username, this._page365User.password);

            // this._cyberAccDb = new CyberAccDatabase();
            // await this._cyberAccDb.connect(
            //     this._cyberaccConfig.username,
            //     this._cyberaccConfig.password,
            //     this._cyberaccConfig.server,
            //     this._cyberaccConfig.database,
            //     this._cyberaccConfig.instance
            // );

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);

        } catch (error) {
            throw error;
        }

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
                let desp = loadFrom.page365Name;

                await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

                cyberaccLog.info(`GLMain: success created ${glMainId}`);
                //console.log(`GLMain : success created ${glMainId}`);
            }

            return glMainId;
        } catch(error) {
            throw error;
        }
    }

    /**
     * create cyberacc GLCredit
     * @param {*} glMainId 
     * @param {*} orderDetail 
     */
    async createCyberAccGLCredit(glMainId, orderList) {
        try {
            let accountCode;
            let desp;
            let amount;
            let creditList = await this.calCreditList(orderList);

            // console.log(creditList);

            // วนลูป creditList และ insert เข้า cyberacc
            // generate id ในแต่ละลูป

            // Loop no vat
            for (let item in creditList.novat) {
                accountCode = creditList.novat[item].accountCode;
                desp = creditList.novat[item].desp;
                amount = creditList.novat[item].amount;
               
                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }
                await this._cyberAccDb.insertToGLCredit(glMainId, id, accountCode, desp, amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
                // console.log(`GLCredit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            }

            // Loop vat

            for (let item in creditList.vat) {
                accountCode = creditList.vat[item].accountCode;
                desp = creditList.vat[item].desp;
                amount = creditList.vat[item].amount;
               
                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }
                await this._cyberAccDb.insertToGLCredit(glMainId, id, accountCode, desp, amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
                // console.log(`GLCredit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            }

            // shipping cost
            if (creditList.shippingCost) {
                accountCode = creditList.shippingCost.accountCode;
                desp = creditList.shippingCost.desp;
                amount = creditList.shippingCost.amount;

                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }
                await this._cyberAccDb.insertToGLCredit(glMainId, id, accountCode, desp, amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
                // console.log(`GLCredit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            }

            // vat amount
            if (creditList.vatAmount.amount > 0) {
                accountCode = creditList.vatAmount.accountCode;
                desp = creditList.vatAmount.desp;
                amount = creditList.vatAmount.amount;

                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }
                await this._cyberAccDb.insertToGLCredit(glMainId, id, accountCode, desp, amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
                // console.log(`GLCredit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    /**
     * create credit list for insert to GLCredit
     * @param {*} orderList : orderList from page365
     * @returns creditList
     * {
     *  novat : {
     *      'เลขCode' : {
     *          accountCode:,
     *          desp:,
     *          amount:,
     *      }
     *  },
     *  vat : {
     *  },
     *  shippingCost: {
     *  },
     *  vatAmount: {
     *  }
     * }
     */
    async calCreditList(orderList) {
        try {
            let product = null;
            
            // CreditList : summary amount in same credit
            // in novat, vat include "accountCode" : {accountCode, amount, desp}
            let creditList = {
                novat: {},
                vat: {},
                // shippingCost: {},
                vatAmount: {
                    accountCode: accountChart.salesTax.code,
                    desp: `${accountChart.salesTax.name}`,
                    amount: 0,
                }
            };

            // Calculate credit table for insert to mssql
            for (let order of orderList) {

                // VOIDED bill not calculate
                if (page365Utils.isOrderVoided(order)) {
                    continue;
                }

                let createDate = new Date(order.created_at);
                let d = createDate.getDate();
                let m = createDate.getMonth()+1;
                let y = createDate.getFullYear()+543;
              
                let discountList = {
                    vatAmount: 0,
                    vatItem: [],
                    novatAmount: 0,
                    novatItem: []
                };
                // calculate each item
                for (let item of order.items) {
                    let optItem = item.variant ? item.variant.selected : "";
                    product = this._productMap.findProduct(item.name, optItem);
                    
                    let ac;
                    let vatRate;
                    // product == null หา product ไม่เจอ
                    if (!product) {
                        // Default vat and account code when can't find product
                        ac = accountChart.OTHERINCOME.code;
                        vatRate = VATRATE;
                    } else {
                        ac = product.cyberaccSellChartId;
                        vatRate = product.vatRate;
                    }

                    let total = item.price * item.quantity;

                    if (vatRate === VATRATE) {              // product include vat
                    
                        // Collect discount item for product vat
                        discountList.vatAmount += total;
                        let pos = await discountList.vatItem.indexOf(ac);
                        // Add new code in discountList
                        if (pos === -1) {
                            discountList.vatItem.push(ac);
                        }

                        // Add account code item to list
                        if (creditList.vat[ac]) {        // already in creditList
                            // include vat,  exclude later  because check discount
                            creditList.vat[ac].amount += total;
                        } else {                        // Not have in creditList                           
                            // Add new code in creditList
                            let accountName = await this._cyberAccDb.getAccountName(ac);
                            
                            creditList.vat[ac] = {
                                accountCode: ac,
                                amount: total,
                                desp: `${accountName} วันที่ ${d}/${m}/${y.toString().slice(-2)}`
                            }     
                        }   
                    } else {                                        // product not vat
                        // Collect discount item for product vat
                        discountList.novatAmount += total;
                        let pos = await discountList.novatItem.indexOf(ac);
                        // Add new code in discountList
                        if (pos === -1) {
                            discountList.novatItem.push(ac);
                        }

                        // Add account code item to list
                        if (creditList.novat[ac]) {     
                            creditList.novat[ac].amount += total;
                        } else {
                            // Add new code in creditList
                            let accountName = await this._cyberAccDb.getAccountName(ac);
    
                            creditList.novat[ac] = {
                                accountCode: ac,
                                amount: total,
                                desp: `${accountName} วันที่ ${d}/${m}/${y.toString().slice(-2)}`
                            }
                        }
                    }
                }

                // Add shipping cost
                let ac = accountChart.shippingCost.code;
                let shippingCost = order.shipping_cost ? order.shipping_cost : 0;
                if (shippingCost > 0) {
                    if (creditList.shippingCost) {
                        creditList.shippingCost.amount += shippingCost;
                    } else {
                        creditList.shippingCost = {
                            accountCode: ac,
                            amount: shippingCost,
                            desp: `${accountChart.shippingCost.name} วันที่ ${d}/${m}/${y.toString().slice(-2)}`
                        }
                    }
                }

                // console.log(creditList);

                //  Calculate discount
                // // !! MARK IMPORTANT :
                // // กรณีมีส่วนลด ปัญหาจะเอาส่วนลดไปลดที่สินค้าประเภท VAT หรือ ไม่ VAT
                // // ถ้ามีประเภทเดียว ก็เอาไปลดประเภทนั้น
                // // แต่ถ้ามี 2 ประเภท ก็จะเอาไปลดประเภท ที่มีค่ามากกว่า
                let discount = order.discount ? order.discount : 0; 
                if (discount > 0) {
                    if (discountList.novatAmount > discountList.vatAmount) {
                        // ลดส่วนลดแต่ละ accountCode
                        let len = discountList.novatItem.length;
                        let discountEach = discount / len;
                        
                        for (let code of discountList.novatItem) {
                            creditList.novat[code].amount -= discountEach;
                        }
                        // console.log(discountList);
                    } else {
                        let len = discountList.vatItem.length;
                        let discountEach = discount / len;
                        
                        for (let code of discountList.vatItem) {
                            creditList.vat[code].amount -= discountEach;
                        }
                    }
                }      
            }

            // Calculate sales tax and adjust vat amount -> exclude vat
            for (let item in creditList.vat) {
                let amount = creditList.vat[item].amount;
                // ถอด vat
                let vat = ((amount * VATRATE) / (100 + VATRATE));
                // let exVat = amount - vat;

                creditList.vat[item].amount = amount - vat;
                //creditList.vat[item].amount = (Math.round(exVat * 100) / 100);
                // vat = (Math.round(vat * 100) / 100);
                creditList.vatAmount.amount += vat;

            }

            return creditList;
        } catch(error) {
            throw error;
        }
    }

    /**
     * create cyber GLDebit in one bill (glMainId)
     * @param {*} glMainId 
     * @param {*} orderDetail
     * Table : GLMainid, id, AccountCode, Description, Amount,  
     */
    async createCyberAccGLDebit(glMainId, orderList) {
        try {
            let id;
            let accountCode;
            let desp;
            let amount;
            let pageBillNo;

            // Loop in orderList , orderList must be in same day
            for (let order of orderList) {

                // VOIDED bill not calculate
                if (page365Utils.isOrderVoided(order)) {
                    continue;
                }

                pageBillNo = order.no;
                amount = (order.paid_amount) ? order.paid_amount : 0.0;

                id = await this._cyberAccDb.getNewIdGLDebit();
                if (!id) {
                    throw "Can't generate id of GLDebit";
                }

                let [firstName, lastName] = page365Utils.getCustomerName(order);

                if (page365Utils.isOrderRiceInAdv(order)) {
                    // สังซื้อข้าวล่วงหน้า
                    accountCode = await this._cyberAccDb.getAccountIDByCustomerName(firstName, lastName);
                    desp = this.getDespRiceInAdv(order);

                    // FORMAT desp : ชื่อผู้รับ: ประเภทข้าวxถุง * ราคา (เลขบิล)
                    if (!accountCode) {
                        accountCode = accountChart.riceInAdv.code;
                        desp = `${firstName} ${lastName}: ${desp}`;
                    }
                } else {
                    // ลูกค้าออนไลน์ทั่วไป
                    accountCode = accountChart.customerDelivery.code;
                    desp = `${DESP_CUSTOMER_DELIVERY} ${firstName} ${lastName} (${pageBillNo})`;
                }

                await this._cyberAccDb.insertToGLDebit(glMainId, id, accountCode, desp, amount);

                cyberaccLog.info(`GLDebit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
                // console.log(`GLDebit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    /**
     * Download page365 data and insert to cyberacc database(mssql) by date string
     * @param {*} startDateStr 
     * @param {*} endDateStr 
     */
    async downloadToCyberAccByDate(startDateStr, endDateStr) {
        try {
            // TODO : check valid date

            console.log(`${startDateStr} : ${endDateStr}`);
            let startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
    
            let endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 0);

            let start = new Date(startDate);
            let end = new Date(startDate);
            end.setHours(23, 59, 59, 0);

            // Loop in each day
            while (start < endDate) {
                console.log(`${start} : ${end}`)

                let s = start.getTime() / 1000;
                let e = end.getTime() / 1000;

                // console.log(`${s}:${e}`);
                // download order from page365 in one day
                cyberaccLog.info(`DOWNLOAD: Download page365 at date : ${start.toString()}`);

                let orderDetails = await this._page365.getOrderDetailByDate(s, e);

                if (orderDetails.length > 0) {
                    let glMainId = await this.createCyberAccGLMain(start);
                    if (glMainId) {
                        await this.createCyberAccGLDebit(glMainId, orderDetails);
                        await this.createCyberAccGLCredit(glMainId, orderDetails);
                    } else {
                        throw "Can't generate glMainid in GLMain";
                    }

                } else {
                    cyberaccLog.info(`DOWNLOAD: No data at date : ${start.toString()}`);
                }

                // TODO: log insert to database ??
                // console.log(orderDetails.length);

                // Calculate Next Day
                start.setDate(start.getDate() + 1);
                end.setDate(end.getDate() + 1);
            }

        } catch(error) {
            throw error;
        }
    }

     /**
     * 
     * @param {*} orderDetail 
     * @returns despcrition for rice in advance
     * FORMAT : ประเภทข้าว x จำนวนถุง * ราคา (บิล)
     */
    getDespRiceInAdv(orderDetail) {
        try {
            let desp = null;
            // generate description format
            for (let item of orderDetail.items) {
                // Find keyword : ข้าวกล้อง
                let pos = item.name.indexOf("ข้าวกล้อง");
                let name = (pos >=0) ? "ข้าวกล้อง" : "ข้าวหอม";

                let productStr = `${name} ${item.quantity} ถุง*${item.price}`;
                desp = desp ? `${desp}+${productStr}` : productStr;
            }
            desp = `${desp} (${orderDetail.no})`;
            return desp;
        } catch(error) {
            throw error;
        }
    }
}

module.exports = Page365ToCyberAcc;