const Ocha = require("../../libs/ocha/ocha");
const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const ProductMap = require("../../libs/product/productmap");
const accountChart = require("../social_accountChart.json");
// const ochaShopName = require("../../libs/ocha/ochaShopName.json");
const { ochaShopName, VATRATE, loadFrom } = require("../thaminfo_config.json");
const cyberaccUtils = require("../../libs/cyberacc/cyberaccUtils");
const cyberaccLog = require("./cyberaccLog");

// const OCHANAME = "ocha";
// const VATRATE = 7;

class OchaToCyberAcc {
    _ochaUser = null;
    _cyberAccConfig = null;
    _productFile = null;
    _productMap = null;

    _cyberAccDb = null;
    _ocha = null;

    _shopId = null;
    _shopName = null;
    
    /**
     * 
     * @param {json} ochaUser
     * {
     *  mobileNo: mobile number
     *  username: ocha username,
     *  password: ocha password
     * } 
     * @param {json} cyberAccConfig
     * {
     *  username:
     *  password:
     *  server:
     *  database:
     *  instance
     * }
     */
    // constructor(ochaUser, cyberAccConfig) {
    //     this._ochaUser = ochaUser;
    //     this._cyberAccConfig = cyberAccConfig;
    // }

    // async init() {
    //     try {
    //         this._ocha = new Ocha();
    //         await this._ocha.connect(
    //             this._ochaUser.mobileNo,
    //             this._ochaUser.username,
    //             this._ochaUser.password
    //         );

    //         console.log(this._cyberAccConfig);
    //         this._cyberAccDb = new CyberAccDatabase();
    //         await this._cyberAccDb.connect(
    //             this._cyberAccConfig.username,
    //             this._cyberAccConfig.password,
    //             this._cyberAccConfig.server,
    //             this._cyberAccConfig.database,
    //             this._cyberAccConfig.instance
    //         );

    //     } catch(error) {
    //         throw error;
    //     }

    // }

    constructor(ochaConnect, cyberAccDbConnect) {
        this._ocha = ochaConnect;
        this._cyberAccDb = cyberAccDbConnect;
    }

    /**
     * Select shop before load data 
     * @param {*} shopName 
     * @param {*} productFile : product map from ocha to flow account
     * {
     *  fileName: product filename,
     *  sheetName: product sheetname
     * } 
     */
    async selectShopByName(shopName, productFile) {
        try {
            // Find shop name
            this._shopName = shopName;
            let shop = await this._ocha.getOchaShopIdByName(shopName);
            this._shopId = shop.shop_id;
            // console.log(this._shopId);

            // load product map
            this._productFile = productFile;
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
                let desp = `${loadFrom.ochaName} ${this._shopName}`;

                await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

                cyberaccLog.info(`GLMain: success created ${glMainId}`);
                // console.log(`GLMain : success created ${glMainId}`);
            }

            return glMainId;

        } catch(error) {
            throw error;
        }
    }

    async createCyberAccGLDebit(glMainId, orderList) {
        try {
            let amount = 0;

            for (let order of orderList) {
                // status = 1 is cancel order
                if (order.order.status === 1) {
                    continue;
                }

                // status = 4 is return money to customer
                if (order.order.status === 4) {
                    amount -= parseFloat(order.order.money_payable);
                } else {
                    amount += parseFloat(order.order.money_payable);
                    amount += parseFloat(order.order.money_rounding);
                }
            }

            let orderDate = new Date(orderList[0].order.order_time * 1000);

            // console.log(orderDate.toString());
            
            let id = await this._cyberAccDb.getNewIdGLDebit();
            if (!id) {
                throw "Can't generate id of GLDebit";
            }

            let accountCode = this.convertShopNameToAccoundCode();
            let desp = this.convertShopNameToDesp(orderDate);

            // console.log(desp);
            await this._cyberAccDb.insertToGLDebit(glMainId, id, accountCode, desp, amount);

            cyberaccLog.info(`GLDebit: success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
            // console.log(`GLDebit : success create ${glMainId} ${id} ${accountCode} ${desp} ${amount}`);
        } catch(error) {
            throw error;
        }
    }

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
                    amount: 0.0,
                }
            };
   
            // Calculate credit table for insert to mssql
            for (let order of orderList) {

                // VOIDED bill not calculate
                if (order.order.status === 1)  {
                    continue;    
                }

                let orderDate = new Date(order.order.order_time * 1000);
                let d = orderDate.getDate();
                let m = orderDate.getMonth()+1;
                let y = orderDate.getFullYear()+543;
              
                let discountList = {
                    vatAmount: 0,
                    vatItem: [],
                    novatAmount: 0,
                    novatItem: []
                };

                // calculate each item
                for (let item of order.items) {

                    let itemName = item.item_name;
                    let itemOpt = item.item_price.price_name;

                    product = this._productMap.findProduct(itemName, itemOpt);
                    
                    // product == null หา product ไม่เจอ
                    let ac;
                    let vatRate;
                    if (!product){
                        // Default vat and account code when can't find product
                        ac = accountChart.OTHERINCOME.code;
                        vatRate = VATRATE;
                    } else {
                        ac = product.cyberaccSellChartId;
                        vatRate = product.vatRate;
                    }

                    let quantity = (item.item_type === 1) ? item.quantity : parseFloat(item.weight);
                
                    // ต้องใช้แบบนี้ แทนการใช้การ item.item_price.unit_price เพราะมีกรณีของเมนูย่อยเข้ามา
                    // unit_price จะไม่ตรง
                    let unitPrice = parseFloat(item.money_nominal) / quantity;

                    let total = quantity * unitPrice;
                    // status = 4 is คืนเงิน ทำให้ตัวเลขติดลบ เพื่อนำไปลบแทน
                    total = (order.order.status === 4) ? total * -1 : total;

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

                // console.log(creditList);

                //  Calculate discount
                // // !! MARK IMPORTANT :
                // // กรณีมีส่วนลด ปัญหาจะเอาส่วนลดไปลดที่สินค้าประเภท VAT หรือ ไม่ VAT
                // // ถ้ามีประเภทเดียว ก็เอาไปลดประเภทนั้น
                // // แต่ถ้ามี 2 ประเภท ก็จะเอาไปลดประเภท ที่มีค่ามากกว่า
                let discount = 0.0
                if (order.discounts) {
                    discount = order.discounts.reduce((total, value) => {
                        return total + parseFloat(value.discounted_value);
                    }, 0.0);
                }
                
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
                // creditList.vat[item].amount = (Math.round(exVat * 100) / 100);
                // vat = (Math.round(vat * 100) / 100);
                creditList.vatAmount.amount += vat;
            }

            return creditList;
        } catch(error) {
            throw error;
        }
    }

    async downloadToCyberAccByDate(startDateStr, endDateStr) {
        try {

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

                // console.log(this._shopId);
                // download order from ocha in one day
                cyberaccLog.info(`DOWNLOAD: Download ocha at date : ${start.toString()}`);

                let orderDetails = await this._ocha.getDailyOrdersByShop(this._shopId, s, e);

                if (orderDetails.length > 0) {
                    
                    // console.log(orderDetails);

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

    convertShopNameToAccoundCode() {
        try {
            switch (this._shopName) {
                case ochaShopName.riceRama9:
                    return accountChart.CUSTOMER_THAMMACHARTMARKET.code;
                case ochaShopName.vegetableRama9:
                    return accountChart.CUSTOMER_THAMMACHARTMARKET.code;
                case ochaShopName.sanpatong:
                    return accountChart.CUSTOMER_SANPATHONG.code;
                case ochaShopName.frontChomphon:
                    return accountChart.CUSTOMER_FRONTCHOMPHON.code;
                case ochaShopName.restuarantChomphon:
                default:
                    throw `Can't find account code for : ${this._shopName}`;
            }
        } catch (error) {
            throw error;
        }
    }

    convertShopNameToDesp(orderDate) {
        try {

            let desp = ""
            switch (this._shopName) {
                case ochaShopName.riceRama9:
                    desp = "รายได้ขายข้าวและสินค้าตลาดนัดธรรมชาติ";
                    break;
                case ochaShopName.vegetableRama9:
                    desp = "รายได้ขายผักและผลผลิตทางการเกษตร";
                    break;
                case ochaShopName.sanpatong:
                    desp = "รายได้ขายข้าวและสินค้าร้านยักษ์กะโจน(สันป่าตอง)";
                    break;
                case ochaShopName.restuarantChomphon:
                    desp = "รายได้ห้องพักและสินค้าชุมพรคาบาน่า";
                    break;
                case ochaShopName.frontChomphon:
                default:
                    throw `Can't find description for : ${this._shopName}`;
            }

            let d = orderDate.getDate();
            let m = orderDate.getMonth()+1;
            let y = orderDate.getFullYear()+543;

            return `${desp} วันที่ ${d}/${m}/${y.toString().slice(-2)}`;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = OchaToCyberAcc;