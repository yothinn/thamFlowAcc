/**
 * Page365ToCyberAcc : download data from page365 and write to cyber database (mssql)
 * Author   : Yothin Setthachatanan
 * Company  : Thamturakit Social Enterprise
 * Created  : 11 Nov 2020
 * Updated  : 11 Nov 2020
 * REMARK :
 * When change database and account chart code change
 * You must edit account chart code
 */

const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
const Page365 = require("../../libs/page365/page365");
const ProductMap = require("../../libs/product/productmap");
const cyberaccUtils = require("../../libs/cyberacc/cyberaccUtils");
const page365Utils = require("../../libs/page365/page365Utils");

// REMARK : when change database must edit accoutChart code
const accountChart = require("./accoutChart.json");

const PAGE365_NAME = "page365";
const DESP_CUSTOMER_DELIVERY = "ค่าข้าวและสินค้าออนไลน์";

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
     * }
     * @param {*} productFile 
     * {
     *  fileName:
     *  sheetName
     * }
     */
    constructor(page365User, cyberAccConfig, productFile) {
        this._page365User = page365User;
        this._cyberaccConfig = cyberAccConfig;
        this._productFile = productFile;
    }

    async init() {
        try {
            
            this._page365 = new Page365();
            await this._page365.connect(this._page365User.username, this._page365User.password);

            this._cyberAccDb = new CyberAccDatabase();
            await this._cyberAccDb.connect(
                this._cyberaccConfig.username,
                this._cyberaccConfig.password,
                this._cyberaccConfig.server,
                this._cyberaccConfig.database
            );

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
            // TODO : check valid date

            let d = orderDate.getDate();
            let m = orderDate.getMonth()+1;
            // convert to พ.ศ.
            let y = orderDate.getFullYear()+543;
            
            // console.log(startDay.getMonth()+1);
            // console.log(startDay.getFullYear()+543);
            // create GLMain
            let glMainId = await this._cyberAccDb.getNewGLMainId(cyberaccUtils.ACCOUNTTYPE_ABBR.AR, m.toString(), y.toString());

            // FORMAT (พ.ศ.) : day/month/year
            let dateStr = `${d}/${m}/${y}`;
            let desp = PAGE365_NAME;

            await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

            console.log(glMainId);

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
    async createCyberGLCredit(glMainId, orderList) {
        try {
            let product;
            // ควรจะมี creditList ไว้
            // creditList ควรประกอบด้วย accountCode, desp, amount
            // ?? vat กับ ไม่ VAT แยกยังไง โดยใช้ accountCode เดียวกัน
            // let creditList = {}
            //     accountCode : {
            //            accountCode:
            //            desp:
            //            amount:
            //     },
            // };
            for (let order of orderList) {
                for (let item of order.items) {
                    product = this._productMap.findProduct(item.name, item.variant.selected);

                    // มี cyberaccSellChartId และ vatRate
                    // ถ้า vatRat = 7  ต้องถอด VAT ก่อน
                    
                    // creditList[product.cyberaccSellChartId]
                    // TODO : if find not ?
                    console.log(product);

                }

                // หัก ส่วนลดจากทั้งหมด
                // เพิ่มค่าขนส่งออนไลน์
                // เพิ่มภาษีขาย
            }

            // วนลูป creditList และ insert เข้า cyberacc
            // generate id ในแต่ละลูป
            // await this._cyberAccDb.insertToGLCredit(glMainId, id, accountCode, desp, amount);

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
    async createCyberGLDebit(glMainId, orderList) {
        try {
            let id;
            let accountCode;
            let desp;
            let amount;
            let pageBillNo;

            // Loop in orderList , orderList must be in same day
            for (let order of orderList) {
                pageBillNo = order.no;
                amount = order.paid_amount;

                id = await this._cyberAccDb.getNewIdGLDebit();
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

                console.log(`${glMainId} ${id} ${accountCode} ${desp} ${amount}`);

                await this._cyberAccDb.insertToGLDebit(glMainId, id, accountCode, desp, amount);
            }

        } catch(error) {
            throw error;
        }
    }

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

                // download order from page365 in one day
                let orderDetails = await this._page365.getOrderDetailByDate(s, e);

                let glMainId;
                // let glMainId = await this.createCyberAccGLMain(start);
                // await this.createCyberGLDebit(glMainId, orderDetails);
                await this.createCyberGLCredit(glMainId, orderDetails);
                

                console.log(orderDetails.length);

                // Calculate Next Day
                start.setDate(start.getDate() + 1);
                end.setDate(end.getDate() + 1);
            }

            // TODO : Remove later
            this._cyberAccDb.close();
        } catch(error) {
            throw error;
        }
    }

    async downloadToCyberAccByBill(billNo) {

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
            for (let item of orderDetail.items) {
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