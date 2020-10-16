const ProductMap = require("../product/productmap");
const FlowAccount = require("../flowacc/flowacc");
const flowBankAcc = require("../flowacc/flowbankaccount");
const Page365 = require("./page365");
const page365Tools = require("./page365Tools");

const SALESNAME = "page365";
const PRODUCTNAME_DELIVERY = "ค่าขนส่ง";
const VATRATE = 7;

/**
 * convert data from Page365 to flowaccount
 */
class Page365ToFlowAcc {
    _page365User = null;
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;
    // _flowBankAcc = null;

    _flowAcc = null;
    _page365 = null;

    /**
     * 
     * @param {json} page365User
     * {
     *  username: page365 username,
     *  password: page365 password
     * } 
     * @param {json} flowAccCredentails 
     * {
     *  clientId: client id,
     *  clientSecret: client secret,
     *  grantType: grant type,
     *  scope: scope
     * } 
     * @param {*} productFile : product map from page365 to flow
     * {
     *  fileName: product filename,
     *  sheetName: product sheetname
     * } 
     */
    constructor(page365User, flowAccCredentail, productFile) {
        this._page365User = page365User;
        this._flowAccCredentail = flowAccCredentail;
        this._productFile = productFile;
    }

    /**
     * Initial product and authorize page365, flow account 
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

            // this._flowBankAcc = await this._flowAcc.getAllBankAccount();
            // if (!this._flowBankAcc) {
            //     throw "Get flow bank account error";
            // }

            // login page365
            this._page365 = new Page365();
            await this._page365.connect(
                this._page365User.username,
                this._page365User.password
            );

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
        } catch(error) {
            throw error;
        }
    }

    /**
     * create tax invoice that load from page365 every bill no between start time and end time
     * @param {*} startTime 
     * @param {*} endTime 
     */
    async createTaxInvoiceInlineByDate(startTime, endTime) {
        try {
            // Not initial
            if (!this._page365 || !this._flowAcc) {
                throw "!! Page365ToFlowAcc not initail";
            }
        
            // load page365
            let orders = await this._page365.getOrderDetailByDate(startTime, endTime);

            for (let order of orders) {
                try {
                    // Check state if void not send to flowaccount
                    if (order.stage === page365Tools.PAGE365_ORDER_STAGE.VOIDED)  {
                        // console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
                        throw `!! No create order bill no :${order.no} stage: ${order.stage}`;
                    }

                    // create tax invoice inline body
                    let inv = this.toTaxInvoiceInline(order);
                    if (inv) {
                        // send to flow account
                        let res = await this._flowAcc.createTaxInvoiceInline(inv);
                        if (res.status) {
                            // console.log(res);
                            console.log(`Success create PAGE365 no ${order.no} : , FLOW no : ${res.data.documentSerial}`);
                        } else {
                            throw `!! Can't create invoice inline from flow account, PAGE365 BILLNO ${order.no} error: ${res.message}`;                            
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
     * create tax invoice inline of flow account by load page365 data by bill id
     * @param {*} billno : page365 bill no
     * @return response when sucess
     * if error throw error
     */
    async createTaxInvoiceInlineByBill(billNo) {
        try {
            // Not initial
            if (!this._page365 || !this._flowAcc) {
                throw "!! Page365ToFlowAcc not initail";
            }
        
            // load page365
            let order = await this._page365.getOrderDetailByBillNo(billNo); 
            // console.log(order);

             // Check state if void not send to flowaccount
            if (order.stage === page365Tools.PAGE365_ORDER_STAGE.VOIDED)  {
                // console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
                throw `!! No create order bill no :${order.no} stage: ${order.stage}`;
            }

            // create tax invoice inline body
            let inv = this.toTaxInvoiceInline(order);
            if (inv) {
                // send to flow account
                let res = await this._flowAcc.createTaxInvoiceInline(inv);
                if (res.status) {
                    console.log(`Success create PAGE365 no ${order.no} : , FLOW no : ${res.data.documentSerial}`);
                    return res;
                } else {
                    // console.log(res);
                    throw `!! Can't create invoice inline from flow account, PAGE365 BILLNO: ${order.no} error: ${res.message}`;
                }
            } 
        } catch(error) {
            throw error;
        }
    }

    async createTaxInvoiceInlineWithPaymentByBill(billNo) {
        try {
            // Not initial
            if (!this._page365 || !this._flowAcc) {
                throw "!! Page365ToFlowAcc not initail";
            }
        
            // load page365
            let order = await this._page365.getOrderDetailByBillNo(billNo); 
            console.log(order);

             // Check state if void not send to flowaccount
            if (order.stage === page365Tools.PAGE365_ORDER_STAGE.VOIDED)  {
                // console.log(`Not Create Order :${ord.no} stage: ${ord.stage}`);
                throw `!! No create order bill no :${order.no} stage: ${order.stage}`;
            }

            if (!order.paid_date) {
                throw `!! Can't create tax invoice with payment bill no : ${order.no} stage: ${order.stage}`;
            }
            // create tax invoice inline body
            let inv = this.toTaxInvoiceInlineWithPayment(order);
            // console.log(inv);
            if (inv) {
                // send to flow account
                // let res = await this._flowAcc.createTaxInvoiceInline(inv);
                //inv.reference = res.data.documentSerial;

                let res = await this._flowAcc.createTaxInvoiceInlineWithPayment(inv);

                // console.log(res);
                if (res.status) {
                    console.log(`Success create PAGE365 no ${order.no} : , FLOW no : ${res.data.documentSerial}`);
                    return res;
                } else {
                    // console.log(res);
                    throw `!! Can't create invoice inline from flow account, PAGE365 BILLNO: ${order.no} error: ${res.message}`;
                }
            } 
        } catch(error) {
            throw error;
        }     
    }

    /**
     * convert page365 order detail data to tax invoice inline of flowaccount data
     * @param {string} contactName
     * @param {json} orderDetail : page365 format 
     * @returns flowaccount data
     */
    toTaxInvoiceInline(orderDetail) {
        if (!this._productMap) {
            throw "!! You must first initial before call this";
        }

        try {

            let billDate = this.p2fDate(orderDetail.created_at);
            let shipCost = orderDetail.shipping_cost ? orderDetail.shipping_cost : 0;
            // Subtotal ของ Flowaccount ต้องรวม รายการสินค้าทั้งหมด + ค่าขนส่ง  ของ page365
            let subTotal = orderDetail.subtotal + shipCost;
            // orderDetail.discount ตอนใส่ 0 จะส่งเป็น null มาบ้างหรือ 0 บ้าง
            let discount = orderDetail.discount ? orderDetail.discount : 0;      

            let inv = {
                recordId: 0,
                // -- Not use ---
                // contactCode: "",
                // contactTaxId: "",
                // contactPerson: "",
                // contactZipCode: "",
                //contactBranch: "สำนักงาน",
                contactName: this.cleanString(orderDetail.customer_name),
                contactAddress: this.cleanString(orderDetail.customer_address),
                contactEmail: this.cleanString(orderDetail.email),
                contactNumber: this.cleanString(orderDetail.customer_phone),
                contactGroup: 1,                                            // 1 = บุคคลธรรมดา
                publishedOn: billDate,
                creditType: 1,                                              // 1 = เครดิต(วัน)
                creditDays: 0,                                              // จำนวนวันเครดิต
                dueDate: billDate,
                salesName: SALESNAME,                                       // Fix from page365
                // projectName:,
                reference: orderDetail.no,                                  // page365 bill no.
                isVatInclusive: true,
                useReceiptDeduction: true,            
                subTotal: subTotal, 
                // discountPercentage: ,
                discountAmount: discount,
                totalAfterDiscount: orderDetail.total,
                isVat: true,                     
                vatAmount: 0,                 
                grandTotal: orderDetail.total,

                remarks: orderDetail.note,
                internalNotes: "",
                documentStructureType: "InlineDocument",
                discountType: 3,                                            // 3 ส่วนลดเป็นจำนวนเงิน
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

            let vatAmount = 0.00;
            let exemptAmount = 0;
            let vatableAmount = 0;
            let flowProduct;
            for (let item of orderDetail.items) {
                // Find product map to flow account product
                flowProduct = this._productMap.findProduct(item.name, item.variant.selected);

                if (!flowProduct) {
                    throw `!! PAGE365 BILLNO : ${orderDetail.no} Can't find product map : ${item.name}, option: ${item.variant.selected}`;
                }

                // console.log(flowProduct);
                // รวมยอดขายที่คำนวณภาษี และ ที่ไม่รวมภาษี
                let total = item.quantity * item.price;
                if (flowProduct.vatRate === 7) {
                    vatableAmount += total;
                    // (price * 7)/107 = ถอด vat 7%
                    // Move to calculate after discount
                    // vatAmount += ((total * flowProduct.vatRate ) / (100 + flowProduct.vatRate));
                } else {
                    exemptAmount += total;
                }

                inv.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: item.note,
                    quantity: item.quantity,
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: item.price,
                    total: total,
                    discountAmount: 0,
                    vatRate: flowProduct.vatRate,
                });
            }

            // push shipping cost
            if (orderDetail.shipping_cost !== 0) {
                flowProduct = this._productMap.findProduct(PRODUCTNAME_DELIVERY);

                if (!flowProduct) {
                    throw `!! Can't find product : ${PRODUCTNAME_DELIVERY}`;
                }

                exemptAmount += orderDetail.shipping_cost;

                inv.items.push({
                    type: flowProduct.type,
                    name: flowProduct.flowProductName,
                    description: "",
                    quantity: 1,
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: orderDetail.shipping_cost,
                    total: orderDetail.shipping_cost,
                    discountAmount: 0,
                    vatRate: flowProduct.vatRate,
                });
            }

            // !! MARK IMPORTANT :
            // กรณีมีส่วนลด ปัญหาจะเอาส่วนลดไปลดที่สินค้าประเภท VAT หรือ ไม่ VAT
            // ถ้ามีประเภทเดียว ก็เอาไปลดประเภทนั้น
            // แต่ถ้ามี 2 ประเภท ก็จะเอาไปลดประเภท ที่มีค่ามากกว่า
            if (discount > 0) {
                if (exemptAmount > vatableAmount) {
                    exemptAmount = exemptAmount - discount;
                } else {
                    vatableAmount = vatableAmount - discount;
                }
            }
        
            if (vatableAmount > 0) {
                vatAmount = ((vatableAmount * VATRATE) / (100 + VATRATE));
            }
            
            inv.vatAmount = (Math.round(vatAmount * 100) / 100);
            inv.exemptAmount = exemptAmount;
            inv.vatableAmount = vatableAmount;

            return inv;
        } catch (error) {
            throw error;
        }
    }

    /**
     * convert page365 order detail data to tax invoice inline with payment of flowaccount data
     * @param {string} contactName
     * @param {json} orderDetail : page365 format 
     * @returns flowaccount data
     */
    toTaxInvoiceInlineWithPayment(orderDetail) {
        if (!this._productMap) {
            throw "!! You must first initial before call this";
        }

        try {
            let inv = this.toTaxInvoiceInline(orderDetail);

            inv.documentPaymentStructureType = "InlineDocumentWithPaymentReceivingTransfer";
            inv.paymentMethod = 5;
            inv.paymentDate = orderDetail.paid_date;
            inv.collected = orderDetail.paid_amount;
            [inv.transferBankAccountId, inv.bankAccountId] = this.toFlowBankAcc(orderDetail);

            // Not use filed
            //paymentDeductionType
            //paymentDeductionAmount
            //withheldPercentage
            //withheldAmount 
            //paymentRemarks
            //remainingCollectedType
            //remainingCollected
            
            return inv;
        } catch (error) {
            throw error;
        }
    }

    toFlowBankAcc(orderDetail) {
        let fBankAcc = flowBankAcc.FLOW_BANKACC;
        let pageNo = orderDetail.bank.bank_no.trim();
        let bankId;
        let bankAccountId;
        switch (pageNo) {
            case page365Tools.PAGE365_BANKACC_NO.KBANK_2309:
                bankId = fBankAcc.accno_2309.bankId;
                bankAccountId = fBankAcc.accno_2309.bankAccountId;
                break;
            case page365Tools.PAGE365_BANKACC_NO.BBL_9919:
            case page365Tools.PAGE365_BANKACC_NO.promtpay:
                bankId = fBankAcc.accno_9919.bankId,
                bankAccountId = fBankAcc.accno_9919.bankAccountId;
            case page365Tools.PAGE365_BANKACC_NO.riceInAdv:
                bankId = fBankAcc.accno_riceInAdv.bankId;
                bankAccountId = fBankAcc.accno_riceInAdv.bankAccountId;
                break;
            default:
                bankId = -1;
                bankAccountId = -1;
                break;
        }
        return [bankId, bankAccountId];
    }
    
    /**
     * convert page365 date to flow account date
     * Page365 date : date format : yyyy-mm-ddTHH:MM:SS.sss+07.00
     * Flow account date : yyyy-mm-dd
     * @param {string} pDate : page365 date string 
     */
    p2fDate(pDate) {
        let d = new Date(pDate);
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }

    /**
     * clean zero width space
     * @param {string} txt : text before clean
     * @returns clean text
     */
    cleanString(txt) {
        if (txt) {
            return txt.trim().replace("/(\u200b|\r\n|\n|\t)/g", "");
        }
        return txt;
    }
}

module.exports = Page365ToFlowAcc;