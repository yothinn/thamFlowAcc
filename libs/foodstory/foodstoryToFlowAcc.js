const ProductMap = require("../product/productmap");
const FlowAccount = require("../flowacc/flowacc");
const FoodStory = require("./foodstory");

const SALESNAME = "foodstory";
class FoodStoryToFlowAcc {
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;
    _shopName;
    _flowAcc;
    
    /**
     * 
     * @param {string} shopName
     *  
     * @param {*} flowAccCredentail 
     * {
     *  clientId: client id,
     *  clientSecret: client secret,
     *  grantType: grant type,
     *  scope: scope
     * } 
     * @param {*} productFile 
     * {
     *  fileName: product filename,
     *  sheetName: product sheetname
     * } 
     */
    constructor(shopName, flowAccCredentail, productFile) {
        this._flowAccCredentail = flowAccCredentail;
        this._shopName = shopName;
        this._productFile = productFile;
    }

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

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
        } catch(error) {
            throw error;
        }
    }

    async toTaxInvoiceInline(fileName, sheetName) {
        try {
            // Not initial
            if (!this._productMap) {
                throw "!! Not initail";
            }

            // Flow account invoice
            let invList = [];
            let inv = null;

            let fd = new FoodStory();
            let totalRow = await fd.readFile(fileName, sheetName);

            // console.log(totalRow);
            if (totalRow <= 0) return [];

            for (let i = 0; i < totalRow; i++) {
               
                if (!fd.getMenuName(i)) continue;

                // Find new invoice when current is null or change no        
                if (!inv || inv.reference !== fd.getPaymentId(i) ) {
                    inv = await invList.find((bill) => {
                        return bill.reference === fd.getPaymentId(i);
                    });
                }
                           
                //console.log(inv);
                // Can't find bill then create new
                if (!inv) {
                    inv = {
                        recordId: 0,
                        // -- Not use ---
                        // contactCode: "",
                        // contactTaxId: "",
                        // contactPerson: "",
                        // contactZipCode: "",
                        //contactBranch: "สำนักงาน",
                        contactName: this._shopName,
                        // contactAddress: "",
                        // contactEmail: "",
                        // contactNumber: "",
                        contactGroup: 1,                                            // 1 = บุคคลธรรมดา
                        publishedOn: fd.getPaymentDate(i),
                        creditType: 1,                                              // 1 = เครดิต(วัน)
                        creditDays: 0,                                              // จำนวนวันเครดิต
                        dueDate: fd.getPaymentDate(i),
                        salesName: SALESNAME,                    
                        // projectName:,
                        reference: fd.getPaymentId(i),                              // payment id
                        isVatInclusive: true,
                        useReceiptDeduction: true,            
                        subTotal: 0.0, 
                        // discountPercentage: ,
                        discountAmount: 0.0,
                        totalAfterDiscount: 0.0,
                        isVat: true,                     
                        vatAmount: 0.0,                 
                        grandTotal: 0.0,
                        remarks: fd.getRemark(i),
                        internalNotes: "",
                        documentStructureType: "InlineDocument",
                        discountType: 3,                                            // 3 ส่วนลดเป็นจำนวนเงิน
                        useInlineDiscount: true,
                        useInlineVat: true,
                        exemptAmount: 0.0,               
                        vatableAmount: 0.0,              
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
                
                    invList.push(inv);
                }
               
                let flowProduct = await this._productMap.findProduct(fd.getMenuName(i), "");
               
                // Can't find product map !! terminate script
                if (!flowProduct) {
                    throw `Can't flow account product map payment Id : ${fd.getPaymentId(i)}, name : ${fd.getMenuName(i)}`;
                }
               
                // Add new item to invoice
                let total = fd.getUnitPrice(i) * fd.getQuantity(i);
                let discount = fd.getDiscount(i); 
                inv.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: "",
                    quantity: fd.getQuantity(i),
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: fd.getUnitPrice(i),
                    total: total,
                    discountAmount: 0,
                    vatRate: flowProduct.vatRate,
                });
               
                // Math.round( number * 100) / 100 is fix precision to 2 ex. 123.45678 = 123.46
                inv.subTotal = Math.round((inv.subTotal + total) * 100) / 100;
                inv.discountAmount = Math.round((inv.discountAmount + discount) * 100) / 100 ;
                inv.totalAfterDiscount =  inv.subTotal - inv.discountAmount;
                inv.grandTotal = inv.totalAfterDiscount;
               
                // Future bug :
                // TODO : กรณีมีส่วนลดในสินค้าที่มี VAT และ ไม่ VAT ทาง loyverse จะหารตามสัดส่วนเลย
                // ซึ่งคำนวณผิดแน่นอน
                if (flowProduct.vatRate === 7) {
                    let totalAfterDiscount = total - discount;
                    inv.vatableAmount = Math.round((inv.vatableAmount + totalAfterDiscount) * 100) / 100;
                    // (price * 7)/107 = ถอด vat 7%
                    let vat = (totalAfterDiscount * flowProduct.vatRate ) / (100 + flowProduct.vatRate);
                    inv.vatAmount = Math.round((inv.vatAmount + vat) * 100) / 100;
                    // console.log(inv.vatAmount);
                } else {
                    let totalAfterDiscount = total - discount;
                    inv.exemptAmount = Math.round((inv.exemptAmount + totalAfterDiscount) * 100) / 100;
                }
            }
            return invList;
        } catch (error) {
            throw error;
        }
    }

    async createTaxInvoiceInlineByFile(fileName, sheetName) {
        try {
            // Not initial
            if (!this._flowAcc) {
                throw "!! Not initail";
            }

            let invList = await this.toTaxInvoiceInline(fileName, sheetName);
            // console.log(invList);

            // send to flow account
            for (let inv of invList) {
                let res = await this._flowAcc.createTaxInvoiceInline(inv);
                // console.log(res);
                if (res.status) {
                    console.log(`create invoice success ${inv.reference},  FLOW no : ${res.data.documentSerial}`);
                } else {
                    throw `!! Can't create invoice ${inv.reference}, error: ${res.message}`;
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FoodStoryToFlowAcc;