const ProductMap = require("../productmap");
const FlowAccount = require("../flowacc");
const Ocha = require("./ocha");

const SALESNAME = "ocha";
const VATRATE = 7;


// FIX : ราคาจะต้องรวมภาษีแล้วเท่านั้น
// ถ้าราคาไม่รวมภาษี จะมีปัญหาทันที

class OchaToFlowAcc {
    _ochaUser = null;
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;

    _flowAcc = null;
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
     * @param {json} flowAccCredentails 
     * {
     *  clientId: client id,
     *  clientSecret: client secret,
     *  grantType: grant type,
     *  scope: scope
     * } 
     */
    constructor(ochaUser, flowAccCredentail) {
        this._ochaUser = ochaUser;
        this._flowAccCredentail = flowAccCredentail;
    }

    /**
     * Initial product and authorize ocha, flow account 
     */
    async init() {
        try {
            // authorize flow account
            this._flowAcc = new FlowAccount();
            await this._flowAcc.authorize(
                this._flowAccCredentail.clientId,
                this._flowAccCredentail.clientSecret,
                this._flowAccCredentail.grantType,
                this._flowAccCredentail.scope
            );

            // login page365
            this._ocha = new Ocha();
            await this._ocha.connect(
                this._ochaUser.mobileNo,
                this._ochaUser.username,
                this._ochaUser.password
            );
        } catch(error) {
            throw error;
        }
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
            this._shopName = shopName
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


    /**
     * create tax invoice of flowaccount that load from ocha by shop that selected
     * between start time and end time
     * @param {*} startTime 
     * @param {*} endTime 
     */
    async createTaxInvoiceInlineByDate(startTime, endTime) {
        try {
            // Not initial
            if (!this._ocha || !this._flowAcc) {
                throw "!! OchaToFlowAcc not initail";
            }

            if (!this._shopId) {
                throw "!! OchaToFlowAcc: selectShopByName first";
            }

            // load ocha
            let orders = await this._ocha.getDailyOrdersByShop(this._shopId, startTime, endTime);

            for (let order of orders) {
                try {

                    let refNo = order.payments.receipt_number_v2;

                    // Check state if void not send to flowaccount
                    if (order.order.status !== 0)  {
                        // console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
                        throw `!! No create order ref no :${refNo} stage: ${order.order.status}`;
                    }

                    // create tax invoice inline body
                    let inv = this.toTaxInvoiceInline(this._shopName, order);
                    if (inv) {
                        // send to flow account
                        let res = await this._flowAcc.createTaxInvoiceInline(inv);
                        if (res.status) {
                            // console.log(res);
                            console.log(`Success create OCHA ref ${refNo} : , FLOW no : ${res.data.documentSerial}`);
                        } else {
                            throw `!! Can't create invoice inline from flow account, OCHA ref : ${refNo} error: ${res.message}`;
                        }
                    }
                } catch(error) {
                    console.log(error);
                }
            } 
   
        } catch(error) {
            throw error;
        }
    }

    /**
     * create tax invoice inline of flow account by load ocha data by reference no
     * @param {*} billno : ocha reference no
     * @return response when sucess
     * if error throw error
     */
    async createTaxInvoiceInlineByBill(billNo) {
        try {
            // Not initial
            if (!this._ocha || !this._flowAcc) {
                throw "!! OchaToFlowAcc not initail";
            }

            if (!this._shopId) {
                throw "!! OchaToFlowAcc: selectShopByName first";
            }

            // load ocha
            let orders = await this._ocha.getBillOrderByShop(this._shopId ,billNo);
            let order = orders[0];
            let refNo = order.payments[0].receipt_number_v2;

            // Check state if void not send to flowaccount
            if (order.order.status !== 0)  {
                // console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
                throw `!! No create order ref no :${refNo} stage: ${order.order.status}`;
            }

            // create tax invoice inline body
            let inv = this.toTaxInvoiceInline(this._shopName, order);
            if (inv) {
                // send to flow account
                // console.log(inv);
                let res = await this._flowAcc.createTaxInvoiceInline(inv);
                if (res.status) {
                    console.log(`Success create OCHA ref ${refNo} : , FLOW no : ${res.data.documentSerial}`);
                    return res;
                } else {
                    // console.log(res);
                    throw `!! Can't create invoice inline from flow account, OCHA ref : ${refNo} error: ${res.message}`;
                }
            } 
        } catch(error) {
            throw error;
        }
    }

    /**
     * convert ocha order detail data to tax invoice inline of flowaccount data
     * @param {string} shopName
     * @param {json} orderDetail : ocha format 
     * @returns flowaccount data
     */
    toTaxInvoiceInline(shopName, orderDetail) {
        if (!this._productMap) {
            throw "!! You must first initial before call this";
        }

        try {
            let billDate = this.o2fDate(orderDetail.order.add_time);
            let refNo = orderDetail.payments[0].receipt_number_v2;

            // Subtotal ของ Flowaccount ต้องรวม รายการสินค้าทั้งหมด + ค่าขนส่ง  ของ page365
            // let subTotal = orderDetail.subtotal + shipCost;
            // orderDetail.discount ตอนใส่ 0 จะส่งเป็น null มาบ้างหรือ 0 บ้าง
            // let discount = orderDetail.discount ? orderDetail.discount : 0;      

            // TODO Shop info to contact ?
            let inv = {
                recordId: 0,
                // -- Not use ---
                // contactCode: "",
                // contactTaxId: "",
                // contactPerson: "",
                // contactZipCode: "",
                //contactBranch: "สำนักงาน",
                // contactAddress: ,
                // contactEmail: ,
                // contactNumber: ,
                
                contactName: shopName,                
                contactGroup: 1,                                            // 1 = บุคคลธรรมดา
                publishedOn: billDate,
                creditType: 1,                                              // 1 = เครดิต(วัน)
                creditDays: 0,                                              // จำนวนวันเครดิต
                dueDate: billDate,
                salesName: SALESNAME,                                      // Fix from page365
                // projectName:,
                reference: refNo,          // ocha reference
                isVatInclusive: true,
                useReceiptDeduction: true,            
                subTotal: 0, 
                // discountPercentage: ,
                discountAmount: 0,
                totalAfterDiscount: 0,
                isVat: true,                     
                vatAmount: 0,                 
                grandTotal: 0,
                remarks: orderDetail.order.note,
                internalNotes: orderDetail.detail.note,                     // REMARK : ไม่รู้บันทึกอยู่ส่วนไหนของ ocha แต่ก็ใส่ไว้ก่อน
                documentStructureType: "InlineDocument",
                discountType: 3,                                            // 3 = ส่วนลดเป็นจำนวนเงิน
                useInlineDiscount: true,
                useInlineVat: true,
                exemptAmount: 0,               
                vatableAmount: 0,              
                items: [],

                // -- Not use --
                // documentShowWithholdingTax:,
                // documentWithholdingTaxPercentage:,
                // documentWithholdingTaxAmount:,
                // documentDeductionType:,
                // documentDeductionAmount:,
                // showSignatureOrStamp:,
                // documentReference:,

            };

            let discountAmount = 0.00;
            if (orderDetail.discounts) {
                for (let discount of orderDetail.discounts) {
                    discountAmount += parseFloat(discount.discounted_value);
                }
            }

            // console.log(discountAmount);
            let vatAmount = 0.00;
            let exemptAmount = 0;
            let vatableAmount = 0;
            let flowProduct;
            let subtotal = 0;

            for (let item of orderDetail.items) {
                // Find product map to flow account product
                let itemName = item.item_name;
                let itemOpt = item.item_price.price_name;
                let quantity = (item.item_type === 1) ? item.quantity : parseFloat(item.weight);
                
                // ต้องใช้แบบนี้ แทนการใช้การ item.item_price.unit_price เพราะมีกรณีของเมนูย่อยเข้ามา
                // unit_price จะไม่ตรง
                let unitPrice = parseFloat(item.money_nominal) / quantity;

                flowProduct = this._productMap.findProduct(itemName, itemOpt);

                if (!flowProduct) {
                    throw `!! OCHA REF : ${refNo} Can't find product map : ${itemName}, option: ${itemOpt}`;
                }

                // console.log(flowProduct);
                // รวมยอดขายที่คำนวณภาษี และ ที่ไม่รวมภาษี
                let itemTotal = quantity * unitPrice;
                if (flowProduct.vatRate === 7) {
                    vatableAmount += itemTotal;
                    // (price * 7)/107 = ถอด vat 7%
                    // Move to calculate after discount
                    // vatAmount += ((itemTotal * flowProduct.vatRate ) / (100 + flowProduct.vatRate));
                } else {
                    exemptAmount += itemTotal;
                }
                // รวมมูลค่าสินค้าทั้งหมด
                subtotal += itemTotal;

                inv.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: "",
                    quantity: quantity,
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: unitPrice,
                    total: itemTotal,
                    discountAmount: 0,
                    vatRate: flowProduct.vatRate,
                });
            }

            // !! MARK IMPORTANT :
            // กรณีมีส่วนลด ปัญหาจะเอาส่วนลดไปลดที่สินค้าประเภท VAT หรือ ไม่ VAT
            // ถ้ามีประเภทเดียว ก็เอาไปลดประเภทนั้น
            // แต่ถ้ามี 2 ประเภท ก็จะเอาไปลดประเภท ที่มีค่ามากกว่า
            if (discountAmount > 0) {
                if (exemptAmount > vatableAmount) {
                    exemptAmount = exemptAmount - discountAmount;
                } else {
                    vatableAmount = vatableAmount - discountAmount;
                }
            }

            if (vatableAmount > 0) {
                vatAmount = ((vatableAmount * VATRATE) / (100 + VATRATE));
            }

            inv.subTotal = Math.round(subtotal * 100) / 100;
            inv.discountAmount = Math.round(discountAmount * 100) / 100;
            inv.totalAfterDiscount = inv.subTotal - inv.discountAmount;
            inv.vatAmount = Math.round(vatAmount * 100) / 100;
            inv.exemptAmount = exemptAmount;
            inv.vatableAmount = vatableAmount;
            inv.grandTotal = inv.totalAfterDiscount;

            return inv;
        } catch (error) {
            throw error;
        }
    }

    /**
     * convert ocha time to flow account date
     * ocha time : time in milliseconds
     * Flow account date : yyyy-mm-dd
     * @param {string} time : ocha time 
     */
    o2fDate(time) {
        let d = new Date(time);
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }
}

module.exports = OchaToFlowAcc;