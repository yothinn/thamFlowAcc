const ProductMap = require("../productmap");
const FlowAccount = require("../flowacc");
const csvtojson = require('csvtojson');
const LoyverseData = require("./loyverseData");

const SALESNAME = "loyverse";

class LoyverseToFlowAcc {
    _shopName = null;
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;

    _flowAcc = null;

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
        this._shopName = shopName;
        this._flowAccCredentail = flowAccCredentail;
        this._productFile = productFile;
    }

    /**
     * initial flowaccount and product map
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

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);
        } catch(error) {
            throw error;
        }
    }

    /**
     * Convert all transaction loyverse to tax invoice
     * @param {*} trans : transaction loyverse list
     * @returns : tax invoice list of flow account
     */
    async toTaxInvoiceInline(trans) {
        try {
            // Flow account invoice
            let invList = [];
            let inv = null;

            for (let row of trans) {
                // Create loyverse data
                let loyData = new LoyverseData(row);

                // Find new invoice when current is null or change no        
                if (!inv || inv.reference !== loyData.paymentNo ) {
                    inv = await invList.find((bill) => {
                        return bill.reference === loyData.paymentNo;
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
                        publishedOn: loyData.l2fDate(),
                        creditType: 1,                                              // 1 = เครดิต(วัน)
                        creditDays: 0,                                              // จำนวนวันเครดิต
                        dueDate: loyData.l2fDate(),
                        salesName: SALESNAME,                    
                        // projectName:,
                        reference: loyData.paymentNo,                               // loyverse payment no.
                        isVatInclusive: true,
                        useReceiptDeduction: true,            
                        subTotal: 0.0, 
                        // discountPercentage: ,
                        discountAmount: 0.0,
                        totalAfterDiscount: 0.0,
                        isVat: true,                     
                        vatAmount: 0.0,                 
                        grandTotal: 0.0,
                        remarks: "",
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

                let flowProduct = await this._productMap.findProduct(loyData.productName, "");

                // Can't find product map !! terminate script
                if (!flowProduct) {
                    throw `Can't flow account product map bill No : ${loyData.paymentNo}, name : ${loyData.productName}`;
                }

                // Add new item to invoice
                inv.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: "",
                    quantity: loyData.quantity,
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: Math.round((loyData.total / loyData.quantity) * 100) / 100,
                    total: loyData.total,
                    discountAmount: loyData.discount,
                    vatRate: flowProduct.vatRate,
                });

                // Math.round( number * 100) / 100 is fix precision to 2 ex. 123.45678 = 123.46
                inv.subTotal = Math.round((inv.subTotal + loyData.total) * 100) / 100;
                inv.discountAmount = Math.round((inv.discountAmount + loyData.discount) * 100) / 100 ;
                inv.totalAfterDiscount =  inv.subTotal - inv.discountAmount;
                inv.grandTotal = inv.totalAfterDiscount;

                if (flowProduct.vatRate === 7) {
                    inv.vatableAmount = Math.round((inv.vatableAmount + loyData.total) * 100) / 100;
                    // (price * 7)/107 = ถอด vat 7%
                    let vat = (loyData.total * flowProduct.vatRate ) / (100 + flowProduct.vatRate);
                    inv.vatAmount = Math.round((inv.vatAmount + vat) * 100) / 100;
                    // console.log(inv.vatAmount);
                } else {
                    inv.exemptAmount = Math.round((inv.exemptAmount + loyData.total) * 100) / 100;
                }
            }
            return invList;
        } catch (error) {
            throw error;
        }
    }

    /**
     * create tax invoice in flow account  from all tranction in filename
     * @param {filename} fileName 
     */
    async createTaxInvoiceInlineByFile(fileName) {
        try {
            // Not initial
            if (!this._flowAcc) {
                throw "!! Not initail";
            }

            const trans = await csvtojson().fromFile(fileName);
            let invList = await this.toTaxInvoiceInline(trans);

            //invList = invList.slice(0, 1);

            // send to flow account
            for (let inv of invList) {
                let res = await this._flowAcc.createTaxInvoiceInline(inv);
                if (res.status) {
                    console.log(`create invoice success ${inv.reference}`);
                } else {
                    throw `!! Can't create invoice ${inv.reference}, error: ${res.message}`;
                }
            }

        } catch (error) {
            throw error;
        }
    }

}

module.exports = LoyverseToFlowAcc;