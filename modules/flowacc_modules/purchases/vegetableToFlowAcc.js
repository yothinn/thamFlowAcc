const VegetableData = require("../../../libs/purchase/vegetable/vegetableData");
const ProductMap = require("../../../libs/product/productmap");
const FlowAccount = require("../../../libs/flowacc/flowacc");


const PAYMENTTYPE_CASH = "เงินสด";
const SALESNAME = "Vegetable";

class VegetableToFlowAcc {
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;

    _flowAcc = null;
    _vegData = null;
    _ggSheetCred = null;

    /**
     * 
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
    constructor(flowAccCredentail, ggSheetCred, productFile) {
        this._flowAccCredentail = flowAccCredentail;
        this._productFile = productFile;
        this._ggSheetCred = ggSheetCred;
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

    /**
     * 
     * @param {*} workbookId 
     * @param {*} worksheetId 
     * @param {*} startRow  : row index from google sheet
     * @param {*} endRow : row index from google sheet
     */
    async toPurchases(workbookId, worksheetId, startRow, endRow) {
        try {

            // Initail and read google worksheet
            let vegData = new VegetableData();
            await vegData.authorize(this._ggSheetCred, workbookId);

            await vegData.readSheet(worksheetId);

            let purchasesList = [];
            let purchases = null;
            
            for (let i=startRow; i<=endRow; i++) {

                // Read only product that payment type is cash
                if (vegData.getPaymentType(i) !== PAYMENTTYPE_CASH ) {
                    continue;
                }

                // Find new invoice when current is null or change no        
                if (!purchases || (vegData.getSupplier(i) !== purchases.contactName) ||
                    (vegData.getDate !== purchases.publishedOn)) {
                    purchases = await purchasesList.find((bill) => {
                        return (bill.contactName === vegData.getSupplier(i)) &&
                                (bill.publishedOn === vegData.getDate(i));
                    });
                }

                // Can't find bill then create new
                if (!purchases) {
                    purchases = {
                        recordId: 0,
                        // contactCode: "",
                        // contactAddress: "",
                        // contactTaxId: "",
                        //contactBranch: "",
                        // contactPerson: "",
                        // contactEmail: "",
                        // contactNumber: "",
                        // contactZipCode: "",
                        contactName: vegData.getSupplier(i),
                        contactGroup: 1,
                        publishedOn: vegData.getDate(i),
                        creditType: 1,
                        creditDays: 0,
                        dueDate: vegData.getDate(i),
                        salesName: SALESNAME,
                        // projectName: "",
                        reference: i,                           // reference is row in google sheet
                        // isVatInclusive: false,
                        // useReceiptDeduction: false,
                        subTotal: 0,
                        discountPercentage: 0,
                        discountAmount: 0,
                        totalAfterDiscount: 0,
                        isVat: false,
                        vatAmount: 0,
                        grandTotal: 0,
                        // documentShowWithholdingTax: false,
                        // documentWithholdingTaxPercentage: 0,
                        // documentWithholdingTaxAmount: 0,
                        // documentDeductionType: 0,
                        // documentDeductionAmount: 0,
                        // showSignatureOrStamp: true,
                        remarks: "",
                        internalNotes: "",
                        documentStructureType: "SimpleDocument",
                        // discountType: 3,
                        // useInlineDiscount: true,
                        // useInlineVat: true,
                        // exemptAmount: 0,
                        // vatableAmount: 0,
                        items: [],
                        documentReference: "",
                    };
                    purchasesList.push(purchases);
                }

                let flowProduct = this._productMap.findProduct(vegData.getProductName(i), "");

                // Can't find product map !! terminate script
                if (!flowProduct) {
                    throw `Can't flow account product map name : ${vegData.getProductName(i)}`;
                }
                // console.log(vegData.getQuantity(i));
                // console.log(vegData.getUnitPrice(i));
                // console.log(vegData.getTotal(i));
                
                let total = vegData.getTotal(i);
                purchases.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: vegData.getRemark(i),
                    quantity: vegData.getQuantity(i),
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: vegData.getUnitPrice(i),
                    total: total,
                    // sellChartOfAccountCode: "string",
                    // buyChartOfAccountCode: "string"
                });

                // console.log(purchases.subTotal);
                purchases.subTotal = Math.round((purchases.subTotal + total) * 100 ) / 100;
                purchases.totalAfterDiscount = purchases.subTotal;
                purchases.grandTotal = purchases.subTotal;
            }

            return purchasesList;
        } catch(error) {
            throw error;
        }
    }

    async createPurchasesByIndex(workbookId, worksheetId, startRow, endRow) {
        try {
            let purchasesList = await this.toPurchases(workbookId, worksheetId, startRow, endRow);

            // console.log(purchasesList);
            for (let purchases of purchasesList) {
                let res = await this._flowAcc.createPurchases(purchases);
                if (res.status) {
                    console.log(`create purchases success ${purchases.reference}`);
                } else {
                    throw `!! Can't create purchases ${purchases.reference}, error : ${res.message}`;
                }
            }
        } catch(error) {
            throw error;
        }
    }

    // /**
    //  * 
    //  * @param {*} ggSheet
    //  * {
    //  *  ggSheetCred : crendentail google format
    //  *  workbookId:
    //  *  worksheetId:
    //  * } 
    //  * @param {*} dateStr : format : yyyy-mm-dd 
    //  */
    // async createPurchasesByDate(ggSheet, dateStr) {
 
    // }
}

module.exports = VegetableToFlowAcc;